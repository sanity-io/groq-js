import {formatRFC3339, parseRFC3339} from './dateHelpers'

/**
 * A type of a value in GROQ.
 */
export type GroqValueName =
  | 'null'
  | 'boolean'
  | 'number'
  | 'string'
  | 'array'
  | 'object'
  | 'range'
  | 'pair'
  | 'path'
  | 'datetime'

/**
 * Returns the type of the value.
 */
export function getType(data: any): GroqValueName {
  if (data === null || typeof data === 'undefined') return 'null'
  if (Array.isArray(data)) return 'array'
  if (data instanceof Range) return 'range'
  if (data instanceof Pair) return 'pair'
  if (data instanceof Path) return 'path'
  if (data instanceof DateTime) return 'datetime'
  return typeof data as GroqValueName
}

/**
 * The result of an expression.
 */
export type Value = StaticValue | StreamValue | MapperValue

export class StaticValue<P = any> {
  private data: P

  constructor(data: P) {
    this.data = data
  }

  getType() {
    return getType(this.data)
  }

  async get() {
    return this.data
  }

  [Symbol.asyncIterator]() {
    if (Array.isArray(this.data)) {
      return (function*(data) {
        for (let element of data) {
          yield new StaticValue(element)
        }
      })(this.data)
    } else {
      throw new Error('Cannot iterate over: ' + this.getType())
    }
  }

  getBoolean() {
    return typeof this.data === 'boolean' && this.data === true
  }
}

export const NULL_VALUE = new StaticValue(null)
export const TRUE_VALUE = new StaticValue(true)
export const FALSE_VALUE = new StaticValue(false)

/**
 * A StreamValue accepts a generator which yields values.
 */
export class StreamValue {
  private generator: () => AsyncGenerator<Value, void, unknown>
  private ticker: Promise<void> | null
  private isDone: boolean
  private data: any[]

  constructor(generator: () => AsyncGenerator<Value, void, unknown>) {
    this.generator = generator
    this.ticker = null
    this.isDone = false
    this.data = []
  }

  getType() {
    return 'array'
  }

  async get() {
    let result = []
    for await (let value of this) {
      result.push(await value.get())
    }
    return result
  }

  async *[Symbol.asyncIterator]() {
    let i = 0
    while (true) {
      for (; i < this.data.length; i++) {
        yield this.data[i]
      }

      if (this.isDone) return

      await this._nextTick()
    }
  }

  getBoolean() {
    return false
  }

  _nextTick() {
    if (this.ticker) return this.ticker

    let currentResolver: (value?: void | PromiseLike<void> | undefined) => void
    let setupTicker = () => {
      this.ticker = new Promise(resolve => {
        currentResolver = resolve
      })
    }

    let tick = () => {
      currentResolver()
      setupTicker()
    }

    let fetch = async () => {
      for await (let value of this.generator()) {
        this.data.push(value)
        tick()
      }

      this.isDone = true
      tick()
    }

    setupTicker()
    fetch()
    return this.ticker
  }
}

export class MapperValue {
  public value: Value

  constructor(value: Value) {
    this.value = value
  }

  getType() {
    return 'array'
  }

  async get(): Promise<any> {
    return await this.value.get()
  }

  [Symbol.asyncIterator]() {
    const value = this.value as StreamValue
    const iterator = value[Symbol.asyncIterator]
    return iterator.call(this.value)
  }

  getBoolean() {
    return false
  }
}

export class Range {
  static isConstructible(leftType: string, rightType: string) {
    if (leftType === rightType) {
      if (leftType === 'number') return true
      if (leftType === 'string') return true
      if (leftType === 'boolean') return true
    }
    return false
  }

  private left: string | number
  private right: string | number
  private exclusive: boolean

  constructor(left: string | number, right: string | number, exclusive: boolean) {
    this.left = left
    this.right = right
    this.exclusive = exclusive
  }

  isExclusive() {
    return this.exclusive
  }

  toJSON() {
    let leftStr = JSON.stringify(this.left)
    let rightStr = JSON.stringify(this.right)
    let mid = this.exclusive ? '...' : '..'
    return `${leftStr}${mid}${rightStr}`
  }
}

export class Pair {
  private first: any
  private second: any

  constructor(first: any, second: any) {
    this.first = first
    this.second = second
  }

  toJSON() {
    let firstStr = JSON.stringify(this.first)
    let secondStr = JSON.stringify(this.second)
    return `${firstStr} => ${secondStr}`
  }
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function pathRegExp(pattern: string) {
  let re = []
  for (let part of pattern.split('.')) {
    if (part === '*') {
      re.push('[^.]+')
    } else if (part === '**') {
      re.push('.*')
    } else {
      re.push(escapeRegExp(part))
    }
  }

  return new RegExp(`^${re.join('.')}$`)
}

export class Path {
  private pattern: string
  private patternRe: RegExp

  constructor(pattern: string) {
    this.pattern = pattern
    this.patternRe = pathRegExp(pattern)
  }

  matches(str: string) {
    return this.patternRe.test(str)
  }

  toJSON() {
    return this.pattern
  }
}
export class DateTime {
  date: Date

  constructor(date: Date) {
    this.date = date
  }

  static parseToValue(str: string): Value {
    let date = parseRFC3339(str)
    if (date) {
      return new StaticValue(new DateTime(date))
    } else {
      return NULL_VALUE
    }
  }

  equals(other: DateTime): boolean {
    return this.date.getTime() == other.date.getTime()
  }

  add(secs: number): DateTime {
    let copy = new Date(this.date.getTime())
    copy.setTime(copy.getTime() + secs * 1000)
    return new DateTime(copy)
  }

  difference(other: DateTime): number {
    return (this.date.getTime() - other.date.getTime()) / 1000
  }

  compareTo(other: DateTime) {
    return this.date.getTime() - other.date.getTime()
  }

  toString() {
    return formatRFC3339(this.date)
  }

  toJSON() {
    return this.toString()
  }
}

export function fromNumber(num: number) {
  if (Number.isFinite(num)) {
    return new StaticValue(num)
  } else {
    return NULL_VALUE
  }
}

function isIterator(obj?: Iterator<any>) {
  return obj && typeof obj.next === 'function'
}

export function fromJS(val: any) {
  if (isIterator(val)) {
    return new StreamValue(async function*() {
      for await (let value of val) {
        yield new StaticValue(value)
      }
    })
  } else if (val === null || val === undefined) {
    return NULL_VALUE
  } else {
    return new StaticValue(val)
  }
}
