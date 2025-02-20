import {isIso8601} from './evaluate'

export function getTypeRank(value: unknown): number {
  if (isIso8601(value)) return 1
  if (typeof value === 'number') return 2
  if (typeof value === 'string') return 3
  if (typeof value === 'boolean') return 4
  return 100
}

export function compare(a: unknown, b: unknown): number {
  // Check if both values have the same type.
  if (typeof a !== typeof b) {
    throw new Error('Cannot compare values of different types')
  }

  // For numbers and booleans.
  if (typeof a === 'number' || typeof a === 'boolean') {
    if (a < (b as number | boolean)) return -1
    if (a > (b as number | boolean)) return 1
    return 0
  }

  // For strings.
  if (typeof a === 'string' && typeof b === 'string') {
    // If both strings are ISO 8601 datetime strings, compare as dates.
    if (isIso8601(a) && isIso8601(b)) {
      const dateA = new Date(a)
      const dateB = new Date(b)

      // Use numeric comparison on the epoch times.
      if (dateA.getTime() < dateB.getTime()) return -1
      if (dateA.getTime() > dateB.getTime()) return 1
      return 0
    }

    // Otherwise, compare as ordinary strings.
    if (a < b) return -1
    if (a > b) return 1
    return 0
  }

  // For unsupported types.
  throw new Error('Unsupported type: only numbers, booleans, and strings are supported')
}
