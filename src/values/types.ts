import {type Path} from './Path'
import {type StreamValue} from './StreamValue'
import {type DateTime, type StaticValue} from './utils'

/**
 * A type of a value in GROQ.
 * @public
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
 * The result of an expression evaluation in GROQ.
 * Can be either a static value or a stream.
 * @public
 */
export type Value = AnyStaticValue | StreamValue

/**
 * Represents a string value in GROQ.
 * @public
 */
export type StringValue = StaticValue<string, 'string'>

/**
 * Represents a numeric value in GROQ.
 * @public
 */
export type NumberValue = StaticValue<number, 'number'>

/**
 * Represents a null value in GROQ.
 * @public
 */
export type NullValue = StaticValue<null, 'null'>

/**
 * Represents a boolean value in GROQ.
 * @public
 */
export type BooleanValue = StaticValue<boolean, 'boolean'>

/**
 * Represents a datetime value in GROQ.
 * @public
 */
export type DateTimeValue = StaticValue<DateTime, 'datetime'>

/**
 * Represents a path value in GROQ.
 * @public
 */
export type PathValue = StaticValue<Path, 'path'>

/**
 * Represents an object value in GROQ.
 * @public
 */
export type ObjectValue = StaticValue<Record<string, unknown>, 'object'>

/**
 * Represents an array value in GROQ.
 * @public
 */
export type ArrayValue = StaticValue<unknown[], 'array'>

/**
 * Union of all possible static value types in GROQ.
 * @public
 */
export type AnyStaticValue =
  | StringValue
  | NumberValue
  | NullValue
  | BooleanValue
  | DateTimeValue
  | ObjectValue
  | ArrayValue
  | PathValue
