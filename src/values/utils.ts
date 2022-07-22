import {parseRFC3339, formatRFC3339} from './dateHelpers'
import {Path} from './Path'
import {StreamValue} from './StreamValue'
import {BooleanValue, GroqType, NullValue, Value} from './types'

export class StaticValue<P, T extends GroqType> {
  data: P
  type: T

  constructor(data: P, type: T) {
    this.data = data
    this.type = type
  }

  isArray(): boolean {
    return this.type === 'array'
  }

  // eslint-disable-next-line require-await
  async get(): Promise<any> {
    return this.data
  }

  [Symbol.asyncIterator](): Generator<Value, void, unknown> {
    if (Array.isArray(this.data)) {
      return (function* (data) {
        for (const element of data) {
          yield fromJS(element)
        }
      })(this.data)
    }
    throw new Error(`Cannot iterate over: ${this.type}`)
  }
}

export const NULL_VALUE: NullValue = new StaticValue(null, 'null')
export const TRUE_VALUE: BooleanValue = new StaticValue(true, 'boolean')
export const FALSE_VALUE: BooleanValue = new StaticValue(false, 'boolean')

export class DateTime {
  date: Date

  constructor(date: Date) {
    this.date = date
  }

  static parseToValue(str: string): Value {
    const date = parseRFC3339(str)
    if (date) {
      return new StaticValue(new DateTime(date), 'datetime')
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
    return new StaticValue(num, 'number')
  }
  return NULL_VALUE
}

export function fromString(str: string): Value {
  return new StaticValue(str, 'string')
}

export function fromDateTime(dt: DateTime): Value {
  return new StaticValue(dt, 'datetime')
}

export function fromPath(path: Path): Value {
  return new StaticValue(path, 'path')
}

function isIterator(obj?: Iterator<any>) {
  return obj && typeof obj.next === 'function'
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function fromJS(val: any): Value {
  if (isIterator(val)) {
    return new StreamValue(async function* () {
      for await (const value of val) {
        yield fromJS(value)
      }
    })
  } else if (val === null || val === undefined) {
    return NULL_VALUE
  }
  return new StaticValue(val, getType(val)) as any
}

/**
 * Returns the type of the value.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getType(data: any): GroqType {
  if (data === null || typeof data === 'undefined') {
    return 'null'
  }
  if (Array.isArray(data)) {
    return 'array'
  }
  if (data instanceof Path) {
    return 'path'
  }
  if (data instanceof DateTime) {
    return 'datetime'
  }
  return typeof data as GroqType
}
