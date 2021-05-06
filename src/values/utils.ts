import {DateTime} from './DateTime'
import {Path} from './Path'
import {StaticValue} from './StaticValue'
import {StreamValue} from './StreamValue'
import {BooleanValue, GroqType, NullValue, Value} from './types'

export const NULL_VALUE: NullValue = new StaticValue(null, 'null')
export const TRUE_VALUE: BooleanValue = new StaticValue(true, 'boolean')
export const FALSE_VALUE: BooleanValue = new StaticValue(false, 'boolean')

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
