import type {Value} from '../values'

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

export function deepEqual(a: any, b: any): boolean {
  if (a === null || b === null) return a === b
  const typeOfA = typeof a
  const typeOfB = typeof b
  if (typeOfA === 'undefined' && typeOfB === 'undefined') return true
  if (typeOfA === 'function' && typeOfB === 'function') return a === b
  if (typeOfA === 'object' && typeOfB === 'object') {
    const keysOfA = Object.keys(a)
    const keysOfB = Object.keys(b)
    if (keysOfA.length !== keysOfB.length) return false
    for (const key of keysOfA) {
      if (!deepEqual(a[key], b[key])) return false
    }
    return true
  }
  return a === b
}
