import type {Value} from '../nodeTypes'
import {DateTime} from './DateTime'

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

type JSValue = string | number | boolean | null | JSValue[] | {[key: string]: JSValue}

export function toJS(value: Value): JSValue {
  if (typeof value !== 'object') return value
  if (value === null) return null
  if (value instanceof DateTime) return value.toJSON()
  if (isIterable(value)) return Array.from(Iterator.from(value).map(toJS))
  return Object.fromEntries(Object.entries(value).map(([key, value]) => [key, toJS(value)]))
}
