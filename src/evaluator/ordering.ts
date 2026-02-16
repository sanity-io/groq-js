import {DateTime, getType, type GroqType} from '../values'
import {parseRFC3339} from '../values/dateHelpers'

const TYPE_ORDER: {[key in GroqType]?: number} = {
  datetime: 1,
  number: 2,
  string: 3,
  boolean: 4,
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function partialCompare(a: any, b: any): null | number {
  const aType = getType(a)
  const bType = getType(b)

  if (aType !== bType) {
    if (aType === 'datetime' || bType === 'datetime') {
      return compareMixedDateTime(a, b)
    }
    return null
  }

  switch (aType) {
    case 'number':
    case 'boolean':
      return a - b
    case 'string':
      if (a < b) return -1
      if (a > b) return 1
      return 0
    case 'datetime':
      return a.compareTo(b)
    default:
      return null
  }
}

function compareMixedDateTime(a: any, b: any): null | number {
  const aType = getType(a)
  const bType = getType(b)

  if (aType === 'datetime' && bType === 'string') {
    const bDate = parseRFC3339(b.toString())
    if (bDate === null) {
      return null
    }
    return a.compareTo(new DateTime(bDate))
  }

  if (aType === 'string' && bType === 'datetime') {
    const aDate = parseRFC3339(a.toString())
    if (aDate === null) {
      return null
    }
    return new DateTime(aDate).compareTo(b)
  }

  return null
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function totalCompare(a: any, b: any): number {
  const aType = getType(a)
  const bType = getType(b)

  const aTypeOrder = TYPE_ORDER[aType] || 100
  const bTypeOrder = TYPE_ORDER[bType] || 100

  if (aTypeOrder !== bTypeOrder) {
    if (
      !(aType === 'string' && bType === 'datetime') &&
      !(aType === 'datetime' && bType === 'string')
    ) {
      return aTypeOrder - bTypeOrder
    }
  }

  let result = partialCompare(a, b)
  if (result === null) {
    result = 0
  }
  return result
}
