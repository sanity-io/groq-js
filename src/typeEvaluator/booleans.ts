import type {Scope} from './scope'
import {nullUnion, resolveInline} from './typeHelpers'
import type {TypeNode} from './types'

type BooleanInterpretation = {
  canBeTrue: boolean
  canBeFalse: boolean
  canBeNull: boolean
}

/**
 * booleanValue takes a TypeNode and returns a BooleanInterpretation.
 * BooleanInterpretation is a matrix of three booleans:
 * - canBeTrue: whether the TypeNode can resolve to true
 * - canBeFalse: whether the TypeNode can resolve to false
 * - canBeNull: whether the TypeNode can resolve to null
 * This is a helper method intended to determine the possible values of a boolean expression.
 * When resolving a boolean expression, we might not be able to determine the exact value of the expression,
 * but we can determine the possible values of the expression, Multiple values can be true at the same time.
 *
 * @param node - The TypeNode to evaluate
 * @returns BooleanInterpretation
 * @internal
 */
export function booleanValue(node: TypeNode, scope: Scope): BooleanInterpretation {
  switch (node.type) {
    case 'unknown': {
      return {canBeTrue: true, canBeFalse: true, canBeNull: true}
    }
    case 'boolean': {
      if (node.value === true) {
        return {canBeTrue: true, canBeFalse: false, canBeNull: false}
      }
      if (node.value === false) {
        return {canBeTrue: false, canBeFalse: true, canBeNull: false}
      }

      return {canBeTrue: true, canBeFalse: true, canBeNull: false}
    }
    case 'union': {
      const value = {canBeTrue: false, canBeFalse: false, canBeNull: false}
      for (const sub of node.of) {
        const match = booleanValue(sub, scope)
        if (match.canBeNull) {
          value.canBeNull = true
        }
        if (match.canBeTrue) {
          value.canBeTrue = true
        }
        if (match.canBeFalse) {
          value.canBeFalse = true
        }
      }
      return value
    }
    case 'inline': {
      const resolved = resolveInline(node, scope)
      return booleanValue(resolved, scope)
    }
    case 'null':
    case 'string':
    case 'number':
    case 'object':
    case 'array': {
      return {canBeTrue: false, canBeFalse: false, canBeNull: true}
    }
    default: {
      // @ts-expect-error - we should have handled all cases
      throw new Error(`unknown node type ${node.type}`)
    }
  }
}

export function booleanOr(
  left: BooleanInterpretation,
  right: BooleanInterpretation,
): BooleanInterpretation {
  // If either side can only be true, the expression can only be true, so we short-circuit
  if (left.canBeTrue && !left.canBeFalse && !left.canBeNull) return left
  if (right.canBeTrue && !right.canBeFalse && !right.canBeNull) return right

  return {
    // Either side can be true for the expression to be true
    canBeTrue: left.canBeTrue || right.canBeTrue,
    // Both sides must be false for the expression to be false
    canBeFalse: left.canBeFalse && right.canBeFalse,
    // if either side can be null, the expression can be null if the other side can't only be true
    canBeNull: left.canBeNull || right.canBeNull,
  }
}

export function booleanAnd(
  left: BooleanInterpretation,
  right: BooleanInterpretation,
): BooleanInterpretation {
  // If either side can only be fales, the expression can only be false, so we short-circuit
  if (left.canBeFalse && !left.canBeTrue && !left.canBeNull) return left
  if (right.canBeFalse && !right.canBeTrue && !right.canBeNull) return right

  return {
    // Both sides must be true for the expression to be true
    canBeTrue: left.canBeTrue && right.canBeTrue,
    // if either side can be false, the expression can be false
    canBeFalse: left.canBeFalse || right.canBeFalse,
    // if either side can be null, the expression can be null
    canBeNull: left.canBeNull || right.canBeNull,
  }
}

export function booleanInterpretationToTypeNode(bool: BooleanInterpretation): TypeNode {
  if (bool.canBeTrue) {
    if (bool.canBeFalse) {
      if (bool.canBeNull) {
        return nullUnion({type: 'boolean'})
      }
      return {type: 'boolean'}
    }
    if (bool.canBeNull) {
      return nullUnion({type: 'boolean', value: true})
    }
    return {type: 'boolean', value: true}
  }

  if (bool.canBeFalse) {
    if (bool.canBeNull) {
      return nullUnion({type: 'boolean', value: false})
    }
    return {type: 'boolean', value: false}
  }
  return {type: 'null'}
}
