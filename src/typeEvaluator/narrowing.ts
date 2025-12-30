import type {ExprNode} from '../nodeTypes'
import {createObjectAttribute, unionOf} from './typeHelpers'
import type {NullTypeNode, ObjectAttribute, ObjectTypeNode, TypeNode} from './types'

/**
 * Represents a narrowing assertion extracted from a condition expression.
 * - 'defined': The path must be non-null (e.g., from `defined(x)` or `x != null`)
 * - 'notDefined': The path must be null (e.g., from `!defined(x)` or `x == null`)
 * - 'equals': The path must equal a specific value (e.g., from `x == "foo"`)
 */
type NarrowingAssertion =
  | {
      path: string[]
      action: 'defined'
    }
  | {
      path: string[]
      action: 'notDefined'
    }
  | {
      path: string[]
      action: 'equals'
      value: TypeNode
    }

/**
 * Extracts an attribute path from an AccessAttribute expression.
 * Returns the path as an array of attribute names, or null if not a simple attribute access.
 */
function extractAttributePath(node: ExprNode): string[] | null {
  if (node.type === 'AccessAttribute') {
    if (node.base) {
      const basePath = extractAttributePath(node.base)
      if (basePath) {
        return [...basePath, node.name]
      }
      return null
    }
    return [node.name]
  }
  if (node.type === 'Group') {
    return extractAttributePath(node.base)
  }
  return null
}

/**
 * Extracts a literal type value from a Value node.
 */
function extractLiteralType(node: ExprNode): TypeNode | null {
  if (node.type === 'Value') {
    if (typeof node.value === 'string') {
      return {type: 'string', value: node.value}
    }
    if (typeof node.value === 'number') {
      return {type: 'number', value: node.value}
    }
    if (typeof node.value === 'boolean') {
      return {type: 'boolean', value: node.value}
    }
    if (node.value === null) {
      return {type: 'null'}
    }
  }
  return null
}

/**
 * Extracts narrowing assertions from a condition expression.
 * These assertions describe what must be true about attribute paths for the condition to be true.
 */
export function extractNarrowingAssertions(
  expr: ExprNode,
  negated: boolean = false,
): NarrowingAssertion[] {
  switch (expr.type) {
    case 'Group':
      return extractNarrowingAssertions(expr.base, negated)

    case 'Not':
      return extractNarrowingAssertions(expr.base, !negated)

    case 'And': {
      if (negated) {
        // !(A && B) doesn't give us useful assertions
        return []
      }
      // A && B: both must be true, so we can collect assertions from both
      return [
        ...extractNarrowingAssertions(expr.left, negated),
        ...extractNarrowingAssertions(expr.right, negated),
      ]
    }

    case 'Or': {
      if (!negated) {
        // A || B: either can be true, so we can't assert anything specific
        return []
      }
      // !(A || B) = !A && !B
      return [
        ...extractNarrowingAssertions(expr.left, negated),
        ...extractNarrowingAssertions(expr.right, negated),
      ]
    }

    case 'FuncCall': {
      // Handle defined() function
      if (expr.namespace === 'global' && expr.name === 'defined' && expr.args.length === 1) {
        const path = extractAttributePath(expr.args[0])
        if (path) {
          return [
            {
              path,
              action: negated ? 'notDefined' : 'defined',
            },
          ]
        }
      }
      return []
    }

    case 'OpCall': {
      const leftPath = extractAttributePath(expr.left)
      const rightPath = extractAttributePath(expr.right)
      const leftLiteral = extractLiteralType(expr.left)
      const rightLiteral = extractLiteralType(expr.right)

      if (expr.op === '==' || expr.op === '!=') {
        const isEquality = expr.op === '=='
        const effectiveEquality = negated ? !isEquality : isEquality

        // path == null or null == path
        if (leftPath && rightLiteral?.type === 'null') {
          return [
            {
              path: leftPath,
              action: effectiveEquality ? 'notDefined' : 'defined',
            },
          ]
        }
        if (rightPath && leftLiteral?.type === 'null') {
          return [
            {
              path: rightPath,
              action: effectiveEquality ? 'notDefined' : 'defined',
            },
          ]
        }

        // path == literal (where literal is not null)
        if (effectiveEquality) {
          if (leftPath && rightLiteral && rightLiteral.type !== 'null') {
            return [
              {
                path: leftPath,
                action: 'equals',
                value: rightLiteral,
              },
            ]
          }
          if (rightPath && leftLiteral && leftLiteral.type !== 'null') {
            return [
              {
                path: rightPath,
                action: 'equals',
                value: leftLiteral,
              },
            ]
          }
        }
      }
      return []
    }

    default:
      return []
  }
}

/**
 * Applies narrowing assertions to an object type.
 * @param isOptionalPath - Whether we're already within an optional path (parent was optional)
 */
function applyAssertionsToObject(
  node: ObjectTypeNode,
  assertions: NarrowingAssertion[],
  currentDepth: number = 0,
  isOptionalPath: boolean = false,
): ObjectTypeNode | NullTypeNode {
  const narrowedAttributes: Record<string, ObjectAttribute> = {}
  let hasChanges = false

  for (const [name, attr] of Object.entries(node.attributes)) {
    // Find assertions that apply to this attribute at this depth
    const matchingAssertions = assertions.filter((a) => a.path[currentDepth] === name)

    if (matchingAssertions.length > 0) {
      // Track if this path is optional (either this attr or a parent is optional)
      const thisPathIsOptional = isOptionalPath || attr.optional === true

      // Check for terminal assertions (path ends at this attribute)
      const terminalAssertions = matchingAssertions.filter(
        (a) => a.path.length === currentDepth + 1,
      )

      // Check for deeper assertions (path continues past this attribute)
      const deeperAssertions = matchingAssertions.filter((a) => a.path.length > currentDepth + 1)

      let newAttr = attr

      let shouldRemoveAttr = false
      for (const assertion of terminalAssertions) {
        switch (assertion.action) {
          case 'defined': {
            // Remove optionality and null from union
            if (newAttr.optional) {
              newAttr = createObjectAttribute(newAttr.value)
              hasChanges = true
            }
            // Remove null from union if present
            if (newAttr.value.type === 'union') {
              const nonNullTypes = newAttr.value.of.filter((t) => t.type !== 'null')
              if (nonNullTypes.length !== newAttr.value.of.length) {
                newAttr = createObjectAttribute(unionOf(...nonNullTypes))
                hasChanges = true
              }
            }
            break
          }
          case 'notDefined': {
            // Only narrow to null if the attribute itself is optional
            // If the attribute is required (not optional), asserting it's null is impossible,
            // so we should remove it from the type entirely
            // Note: we check attr.optional, not thisPathIsOptional, because a required field
            // inside an optional parent still can't be null when the parent exists
            if (attr.optional === true) {
              newAttr = createObjectAttribute({type: 'null'})
              hasChanges = true
            } else {
              // Required field can't be null - remove it from the type
              shouldRemoveAttr = true
              hasChanges = true
            }
            break
          }
          case 'equals': {
            // Only narrow to specific value if the path is optional
            // For required fields, we just filter documents, not narrow types
            newAttr = createObjectAttribute(assertion.value)
            hasChanges = true
            break
          }
          default:
            // @ts-expect-error -- exhaustive switch
            throw new Error(`Unhandled assertion action: ${assertion.action.toString()}`)
        }
      }

      // Handle deeper assertions recursively
      if (deeperAssertions.length > 0) {
        // When we have deeper assertions (e.g., defined(optionalObject.subfield)),
        // the parent attribute must exist, so remove optionality
        if (attr.optional) {
          newAttr = createObjectAttribute(newAttr.value)
          hasChanges = true
        }

        if (newAttr.value.type === 'object') {
          const narrowedValue = applyAssertionsToObject(
            newAttr.value,
            deeperAssertions,
            currentDepth + 1,
            thisPathIsOptional,
          )
          if (narrowedValue !== newAttr.value) {
            newAttr = createObjectAttribute(narrowedValue)
            hasChanges = true
          }
        } else if (newAttr.value.type === 'union') {
          // Handle union types - narrow each object in the union
          const originalOf = newAttr.value.of
          const narrowedOf = originalOf.map((t) => {
            if (t.type === 'object') {
              return applyAssertionsToObject(
                t,
                deeperAssertions,
                currentDepth + 1,
                thisPathIsOptional,
              )
            }
            return t
          })

          // Remove nulls when narrowing nested paths (only if this path is optional)
          const nonNullTypes = narrowedOf.filter((t) => t.type !== 'null')
          if (thisPathIsOptional && nonNullTypes.length !== narrowedOf.length) {
            newAttr = createObjectAttribute(unionOf(...nonNullTypes))
            hasChanges = true
          } else if (narrowedOf.some((t, i) => t !== originalOf[i])) {
            // Some objects were narrowed
            newAttr = createObjectAttribute(unionOf(...narrowedOf))
            hasChanges = true
          }
        }
      }

      if (!shouldRemoveAttr) {
        narrowedAttributes[name] = newAttr
      }
    } else {
      narrowedAttributes[name] = attr
    }
  }

  if (!hasChanges) {
    return node
  }

  return {
    ...node,
    attributes: narrowedAttributes,
  }
}

/**
 * Applies narrowing assertions to a type node.
 */
export function narrowNode(node: TypeNode, assertions: NarrowingAssertion[]): TypeNode {
  if (assertions.length === 0) {
    return node
  }
  if (node.type === 'object') {
    return applyAssertionsToObject(node, assertions)
  }
  if (node.type === 'union') {
    return unionOf(...node.of.map((n) => narrowNode(n, assertions)))
  }
  return node
}
