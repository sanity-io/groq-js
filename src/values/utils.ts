import {formatRFC3339, parseRFC3339} from './dateHelpers'
import {Path} from './Path'
import {StreamValue} from './StreamValue'
import type {
  AnyStaticValue,
  ArrayValue,
  BooleanValue,
  DateTimeValue,
  GroqType,
  NullValue,
  PathValue,
  StringValue,
  Value,
} from './types'

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

  asStatic(): this {
    return this
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

  static parseToValue(str: string): DateTimeValue | NullValue {
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

export function fromNumber(num: number): AnyStaticValue {
  if (Number.isFinite(num)) {
    return new StaticValue(num, 'number')
  }
  return NULL_VALUE
}

export function fromString(str: string): StringValue {
  return new StaticValue(str, 'string')
}

export function fromDateTime(dt: DateTime): Value {
  return new StaticValue(dt, 'datetime')
}

export function fromPath(path: Path): PathValue {
  return new StaticValue(path, 'path')
}

function isIterator(obj?: Iterator<any>) {
  return obj && typeof obj.next === 'function'
}

export function fromArray(val: unknown[]): ArrayValue {
  return new StaticValue(val, 'array')
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
 * Returns a normalized JavaScript value. This eliminates internal values
 * such as DateTime and Path by turning them into the JSON representation.
 */
export function toJS(val: AnyStaticValue): unknown {
  const normalized = maybeNormalize(val.data)
  if (normalized === undefined) return val.data
  return normalized
}

/**
 * maybeNormalize eliminates custom values such as DateTime and Path.
 * This method returns `undefined` in the scenario where the data contains no
 * custom values and the data is already normalized.
 */
function maybeNormalize(data: unknown): unknown | undefined {
  if (data === null || typeof data === 'undefined') return

  if (Array.isArray(data)) {
    let result: undefined | unknown[]
    for (let i = 0; i < data.length; i++) {
      let normalized = maybeNormalize(data[i])
      if (normalized !== undefined && result === undefined) {
        // This is the first value which had to be converted.
        result = data.slice(0, i)
      }

      if (result !== undefined) {
        if (normalized === undefined) normalized = data[i]
        result.push(normalized)
      }
    }

    return result
  }

  if (typeof data === 'object') {
    if ('toJSON' in data && typeof data.toJSON === 'function') {
      return data.toJSON()
    }

    const entries = Object.entries(data)
    let result: undefined | Record<string, unknown>

    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i]!
      let normalized = maybeNormalize(value)
      if (normalized !== undefined && result === undefined) {
        // This is the first value which had to be converted.
        result = Object.fromEntries(entries.slice(0, i))
      }

      if (result !== undefined) {
        if (normalized === undefined) normalized = value
        result[key] = normalized
      }
    }

    return result
  }

  return
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
