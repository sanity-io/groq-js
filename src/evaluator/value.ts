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
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getType(data: any): GroqValueName {
  if (data === null || typeof data === 'undefined') {
    return 'null'
  }
  if (Array.isArray(data)) {
    return 'array'
  }
  if (data instanceof Range) {
    return 'range'
  }
  if (data instanceof Pair) {
    return 'pair'
  }
  if (data instanceof Path) {
    return 'path'
  }
  if (data instanceof DateTime) {
    return 'datetime'
  }
  return typeof data as GroqValueName
}

/**
 * The result of an expression.
 */
export type Value = StaticValue | StreamValue

export class StaticValue<P = any> {
  data: P

  constructor(data: P) {
    this.data = data
  }

  getType(): GroqValueName {
    return getType(this.data)
  }

  // eslint-disable-next-line require-await
  async get(): Promise<P> {
    return this.data
  }

  [Symbol.asyncIterator](): Generator<StaticValue<any>, void, unknown> {
    if (Array.isArray(this.data)) {
      return (function* (data) {
        for (const element of data) {
          yield new StaticValue(element)
        }
      })(this.data)
    }
    throw new Error(`Cannot iterate over: ${this.getType()}`)
  }

  getBoolean(): boolean {
    return typeof this.data === 'boolean' && this.data === true
  }
}

export function isBoolean(val: Value): val is StaticValue<boolean> {
  return val.getType() === 'boolean'
}

export function isNumber(val: Value): val is StaticValue<number> {
  return val.getType() === 'number'
}

export function isString(val: Value): val is StaticValue<string> {
  return val.getType() === 'string'
}

export function isObject(val: Value): val is StaticValue<Record<string, any>> {
  return val.getType() === 'object'
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

  // eslint-disable-next-line class-methods-use-this
  getType(): 'array' {
    return 'array'
  }

  async get(): Promise<any> {
    const result = []
    for await (const value of this) {
      result.push(await value.get())
    }
    return result
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<Value, void, unknown> {
    let i = 0
    while (true) {
      for (; i < this.data.length; i++) {
        yield this.data[i]
      }

      if (this.isDone) {
        return
      }

      await this._nextTick()
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getBoolean(): boolean {
    return false
  }

  _nextTick(): Promise<void> {
    if (this.ticker) {
      return this.ticker
    }

    let currentResolver: (value?: void | PromiseLike<void> | undefined) => void
    const setupTicker = () => {
      this.ticker = new Promise((resolve) => {
        currentResolver = resolve
      })
    }

    const tick = () => {
      currentResolver()
      setupTicker()
    }

    const fetch = async () => {
      for await (const value of this.generator()) {
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

type RangeValue = string | number | boolean

export class Range {
  static isConstructible(leftType: string, rightType: string): boolean {
    if (leftType === rightType) {
      if (leftType === 'number') {
        return true
      }
      if (leftType === 'string') {
        return true
      }
      if (leftType === 'boolean') {
        return true
      }
    }
    return false
  }

  private left: RangeValue
  private right: RangeValue
  private exclusive: boolean

  constructor(left: RangeValue, right: RangeValue, exclusive: boolean) {
    this.left = left
    this.right = right
    this.exclusive = exclusive
  }

  isExclusive(): boolean {
    return this.exclusive
  }

  toJSON(): string {
    const leftStr = JSON.stringify(this.left)
    const rightStr = JSON.stringify(this.right)
    const mid = this.exclusive ? '...' : '..'
    return `${leftStr}${mid}${rightStr}`
  }
}

export class Pair<T = any> {
  private first: T
  private second: T

  constructor(first: T, second: T) {
    this.first = first
    this.second = second
  }

  toJSON(): string {
    const firstStr = JSON.stringify(this.first)
    const secondStr = JSON.stringify(this.second)
    return `${firstStr} => ${secondStr}`
  }
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function pathRegExp(pattern: string) {
  const re = []
  for (const part of pattern.split('.')) {
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

  matches(str: string): boolean {
    return this.patternRe.test(str)
  }

  toJSON(): string {
    return this.pattern
  }
}
export class DateTime {
  date: Date

  constructor(date: Date) {
    this.date = date
  }

  static parseToValue(str: string): Value {
    const date = parseRFC3339(str)
    if (date) {
      return new StaticValue(new DateTime(date))
    }
    return NULL_VALUE
  }

  equals(other: DateTime): boolean {
    return this.date.getTime() == other.date.getTime()
  }

  add(secs: number): DateTime {
    const copy = new Date(this.date.getTime())
    copy.setTime(copy.getTime() + secs * 1000)
    return new DateTime(copy)
  }

  difference(other: DateTime): number {
    return (this.date.getTime() - other.date.getTime()) / 1000
  }

  compareTo(other: DateTime): number {
    return this.date.getTime() - other.date.getTime()
  }

  toString(): string {
    return formatRFC3339(this.date)
  }

  toJSON(): string {
    return this.toString()
  }
}

export function fromNumber(num: number): Value {
  if (Number.isFinite(num)) {
    return new StaticValue(num)
  }
  return NULL_VALUE
}

function isIterator(obj?: Iterator<any>) {
  return obj && typeof obj.next === 'function'
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function fromJS(val: any): Value {
  if (isIterator(val)) {
    return new StreamValue(async function* () {
      for await (const value of val) {
        yield new StaticValue(value)
      }
    })
  } else if (val === null || val === undefined) {
    return NULL_VALUE
  }
  return new StaticValue(val)
}
