import {TypeNode} from './types'

/**
 * `satifies` takes in a type and a JavaScript value and checks if the value is satisfied by the type.
 */
export function satisfies(type: TypeNode, value: unknown): boolean {
  switch (type.type) {
    case 'null':
      return value === null
    case 'boolean': {
      if (type.value !== undefined) return value === type.value
      return typeof value === 'boolean'
    }
    case 'number': {
      if (type.value !== undefined) return value === type.value
      return typeof value === 'number'
    }
    case 'string': {
      if (type.value !== undefined) return value === type.value
      return typeof value === 'string'
    }
    case 'array':
      return Array.isArray(value) && value.every((item) => satisfies(type.of, item))
    case 'union':
      return type.of.some((other) => satisfies(other, value))
    case 'optional':
      return value === null || satisfies(type.value, value)
    case 'unknown':
      return true
    case 'concatenation':
      return typeof value === 'string'
    case 'object':
      if (typeof value !== 'object' || value === null) return false
      return type.fields.every(
        ({key, value: fieldType}) =>
          value.hasOwnProperty(key) && satisfies(fieldType, (value as any)[key]),
      )
    default:
      throw new Error(`Unknown type="${type.type}"`)
  }
}
