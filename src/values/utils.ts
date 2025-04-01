import {type Value} from '../nodeTypes'

export function isIterable(value: Value): value is Iterable<Value> {
  return (
    typeof value === 'object' &&
    !!value &&
    Symbol.iterator in value &&
    typeof value[Symbol.iterator] === 'function'
  )
}

export function isRecord(value: Value): value is Record<string, Value> {
  return typeof value === 'object' && !!value && !isIterable(value) && !(value instanceof DateTime)
}

const RFC3339_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|([-+]\d{2}:\d{2}))$/

/**
 * @public
 */
export class DateTime {
  date: Date

  constructor(date: Date) {
    this.date = date
  }

  static from(input: Value | Date | DateTime): DateTime | null {
    if (input instanceof DateTime) return input
    if (input instanceof Date) return new DateTime(input)
    if (typeof input === 'string' && RFC3339_REGEX.test(input)) {
      return new DateTime(new Date(input))
    }
    return null
  }

  static now(): DateTime {
    return new DateTime(new Date())
  }

  getTime(): number {
    return this.date.getTime()
  }

  toString(): string {
    const year = this.date.getUTCFullYear().toString().padStart(4, '0')
    const month = (this.date.getUTCMonth() + 1).toString().padStart(2, '0')
    const day = this.date.getUTCDate().toString().padStart(2, '0')
    const hour = this.date.getUTCHours().toString().padStart(2, '0')
    const minute = this.date.getUTCMinutes().toString().padStart(2, '0')
    const second = this.date.getUTCSeconds().toString().padStart(2, '0')

    let fractionalSecond = ''
    const ms = this.date.getMilliseconds()
    if (ms != 0) {
      fractionalSecond = `.${ms.toString().padStart(3, '0')}`
    }

    return `${year}-${month}-${day}T${hour}:${minute}:${second}${fractionalSecond}Z`
  }

  toJSON(): string {
    return this.toString()
  }
}

/**
 * @public
 */
export type JSValue = string | number | boolean | null | JSValue[] | {[key: string]: JSValue}

/**
 * @public
 */
export function toJS<T extends JSValue = JSValue>(value: Value): T
export function toJS(value: Value): JSValue {
  if (typeof value !== 'object') return value
  if (value === null) return null
  if (value instanceof DateTime) return value.toJSON()
  if (isIterable(value)) return Array.from(value).map(toJS)
  return Object.fromEntries(Object.entries(value).map(([key, value]) => [key, toJS(value)]))
}
