import {isIso8601} from './evaluate'

export function isEqual(a: unknown = null, b: unknown = null): boolean {
  if (isIso8601(a) && isIso8601(b)) {
    return new Date(a).getTime() === new Date(b).getTime()
  }

  if (
    (a === null && b === null) ||
    (typeof a === 'string' && typeof b === 'string') ||
    (typeof a === 'boolean' && typeof b === 'boolean') ||
    (typeof a === 'number' && typeof b === 'number')
  ) {
    return a === b
  }

  return false
}
