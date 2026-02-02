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

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === null || b === null) return a === b
  if (typeof a === 'undefined' && typeof b === 'undefined') return true
  if (typeof a === 'function' && typeof b === 'function') return a === b
  if (isRecord(a) && isRecord(b)) {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
