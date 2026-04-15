import type {ExprNode} from './nodeTypes'
import {
  type AnyStaticValue,
  FALSE_VALUE,
  fromArray,
  fromNumber,
  fromString,
  NULL_VALUE,
  StaticValue,
  TRUE_VALUE,
} from './values'

function canConstantEvaluate(node: ExprNode): boolean {
  switch (node.type) {
    case 'Group':
      return canConstantEvaluate(node.base)
    case 'Value':
    case 'Parameter':
      return true
    case 'Pos':
    case 'Neg':
      return canConstantEvaluate(node.base)
    case 'OpCall':
      switch (node.op) {
        case '+':
        case '-':
        case '*':
        case '/':
        case '%':
        case '**':
          return canConstantEvaluate(node.left) && canConstantEvaluate(node.right)
        default:
          return false
      }
    default:
      return false
  }
}

export function tryConstantEvaluate(node: ExprNode): AnyStaticValue | null {
  if (!canConstantEvaluate(node)) {
    return null
  }
  return constantEvaluate(node)
}

function isRecord(val: object): val is Record<string, unknown> {
  return val.constructor === Object || val.constructor === undefined
}

/**
 * Converts a plain JS value to a static GROQ value.
 * Only handles types that can appear in Value nodes (no iterators/streams).
 */
function staticFromJS(val: unknown): AnyStaticValue {
  if (val === null || val === undefined) {
    return NULL_VALUE
  }
  if (typeof val === 'boolean') {
    return val ? TRUE_VALUE : FALSE_VALUE
  }
  if (typeof val === 'number') {
    return fromNumber(val)
  }
  if (typeof val === 'string') {
    return fromString(val)
  }
  if (Array.isArray(val)) {
    return fromArray(val)
  }
  if (typeof val === 'object' && isRecord(val)) {
    return new StaticValue(val, 'object')
  }
  return NULL_VALUE
}

function constantEvaluate(node: ExprNode): AnyStaticValue {
  switch (node.type) {
    case 'Value':
      return staticFromJS(node.value)
    case 'Parameter':
      // With the dummy scope, params is {} so any parameter lookup returns undefined -> null
      return NULL_VALUE
    case 'Group':
      return constantEvaluate(node.base)
    case 'Pos': {
      const base = constantEvaluate(node.base)
      if (base.type !== 'number') {
        return NULL_VALUE
      }
      return fromNumber(base.data)
    }
    case 'Neg': {
      const base = constantEvaluate(node.base)
      if (base.type !== 'number') {
        return NULL_VALUE
      }
      return fromNumber(-base.data)
    }
    case 'OpCall': {
      const left = constantEvaluate(node.left)
      const right = constantEvaluate(node.right)

      switch (node.op) {
        case '+':
          if (left.type === 'number' && right.type === 'number') {
            return fromNumber(left.data + right.data)
          }
          if (left.type === 'string' && right.type === 'string') {
            return fromString(left.data + right.data)
          }
          if (left.type === 'array' && right.type === 'array') {
            return fromArray(left.data.concat(right.data))
          }
          if (left.type === 'object' && right.type === 'object') {
            return new StaticValue({...left.data, ...right.data}, 'object')
          }
          return NULL_VALUE
        case '-':
          if (left.type === 'number' && right.type === 'number') {
            return fromNumber(left.data - right.data)
          }
          return NULL_VALUE
        case '*':
          if (left.type === 'number' && right.type === 'number') {
            return fromNumber(left.data * right.data)
          }
          return NULL_VALUE
        case '/':
          if (left.type === 'number' && right.type === 'number') {
            return fromNumber(left.data / right.data)
          }
          return NULL_VALUE
        case '%':
          if (left.type === 'number' && right.type === 'number') {
            return fromNumber(left.data % right.data)
          }
          return NULL_VALUE
        case '**':
          if (left.type === 'number' && right.type === 'number') {
            return fromNumber(Math.pow(left.data, right.data))
          }
          return NULL_VALUE
        default:
          return NULL_VALUE
      }
    }
    default:
      return NULL_VALUE
  }
}
