import {Value} from '../values'

export function isEqual(a: Value, b: Value): boolean {
  if (
    (a.type === 'string' && b.type === 'string') ||
    (a.type === 'boolean' && b.type === 'boolean') ||
    (a.type === 'null' && b.type === 'null') ||
    (a.type === 'number' && b.type === 'number')
  ) {
    return a.data === b.data
  }

  if (a.type === 'datetime' && b.type === 'datetime') {
    return a.data.equals(b.data)
  }

  return false
}
