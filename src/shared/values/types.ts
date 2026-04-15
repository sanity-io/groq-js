import type {Path} from './Path'
import type {StreamValue} from './StreamValue'
import type {DateTime, StaticValue} from './utils'

/**
 * A type of a value in GROQ.
 */
export type GroqType =
  | 'null'
  | 'boolean'
  | 'number'
  | 'string'
  | 'array'
  | 'object'
  | 'path'
  | 'datetime'

/**
 * The result of an expression.
 */
export type Value = AnyStaticValue | StreamValue

export type StringValue = StaticValue<string, 'string'>
export type NumberValue = StaticValue<number, 'number'>
export type NullValue = StaticValue<null, 'null'>
export type BooleanValue = StaticValue<boolean, 'boolean'>
export type DateTimeValue = StaticValue<DateTime, 'datetime'>
export type PathValue = StaticValue<Path, 'path'>
export type ObjectValue = StaticValue<Record<string, unknown>, 'object'>
export type ArrayValue = StaticValue<unknown[], 'array'>

export type AnyStaticValue =
  | StringValue
  | NumberValue
  | NullValue
  | BooleanValue
  | DateTimeValue
  | ObjectValue
  | ArrayValue
  | PathValue
