import debug from 'debug'

import type {
  AccessAttributeNode,
  AccessElementNode,
  AndNode,
  ArrayCoerceNode,
  ArrayNode,
  DerefNode,
  EverythingNode,
  ExprNode,
  FilterNode,
  FlatMapNode,
  MapNode,
  NegNode,
  NotNode,
  ObjectConditionalSplatNode,
  ObjectNode,
  ObjectSplatNode,
  OpCall,
  OpCallNode,
  OrNode,
  ParentNode,
  PosNode,
  ProjectionNode,
  SelectNode,
  SliceNode,
  ValueNode,
} from '../nodeTypes'
import {booleanAnd, booleanInterpretationToTypeNode, booleanOr, booleanValue} from './booleans'
import {handleFuncCallNode} from './functions'
import {match} from './matching'
import {extractNarrowingAssertions, narrowNode} from './narrowing'
import {optimizeUnions} from './optimizations'
import {Context, Scope} from './scope'
import {
  arrayOf,
  booleanNode,
  containsDateTime,
  createObject as objectNode,
  dateTimeStringNode,
  isDateTime,
  isFuncCall,
  isString,
  mapNode,
  nullNode,
  nullUnion,
  numberNode,
  resolveInline,
  stringNode,
  unionOf,
  unknownNode,
} from './typeHelpers'
import {
  type ArrayTypeNode,
  type Document,
  type ObjectAttribute,
  type ObjectTypeNode,
  type PrimitiveTypeNode,
  type Schema,
  type TypeNode,
  type UnionTypeNode,
} from './types'

const $trace = debug('typeEvaluator:evaluate:trace')
$trace.log = console.log.bind(console) // eslint-disable-line no-console
// log to stdout
const $debug = debug('typeEvaluator:evaluate:debug')
// log to stdout
$debug.log = console.log.bind(console) // eslint-disable-line no-console
const $warn = debug('typeEvaluator:evaluate:warn')

/**
 * Evaluates the type of a query and schema.
 *
 * @param ast - The query ast to evaluate.
 * @param schema - The schemas to use for type evaluation.
 * @returns The type of the query.
 * @beta
 */
export function typeEvaluate(ast: ExprNode, schema: Schema): TypeNode {
  $debug('evaluateQueryType.ast %O', ast)
  $debug('evaluateQueryType.schema %O', schema)
  const parsed = walk({
    node: ast,
    scope: new Scope([], undefined, new Context(schema)),
  })

  $trace('evaluateQueryType.parsed %O', parsed)
  const optimized = optimizeUnions(parsed)
  $debug('evaluateQueryType.optimized %O', optimized)

  return optimized
}

function mapDeref(node: TypeNode, scope: Scope): TypeNode {
  return mapNode(node, scope, (base) => {
    if (base.type === 'array') {
      return arrayOf(mapDeref(base.of, scope))
    }

    if (base.type === 'object') {
      if (base.dereferencesTo !== undefined) {
        return scope.context.lookupRef(base.dereferencesTo)
      }

      if (base.rest !== undefined) {
        return mapDeref(resolveInline(base.rest, scope), scope)
      }
    }

    return nullNode()
  })
}

function handleDerefNode(node: DerefNode, scope: Scope): TypeNode {
  $trace('deref.node %O', node)
  const derefedNode = mapDeref(walk({node: node.base, scope}), scope)
  $trace('deref.derefedNode %O', derefedNode)

  return derefedNode
}

function handleObjectSplatNode(
  attr: ObjectSplatNode | ObjectConditionalSplatNode,
  scope: Scope,
): TypeNode {
  const value = walk({node: attr.value, scope})
  $trace('object.splat.value %O', value)
  return mapNode(value, scope, (node) => {
    // splatting over unknown is unknown, we can't know what the attributes are
    if (node.type === 'unknown') {
      return unknownNode()
    }
    // splatting over a non-object is a no-op
    if (node.type !== 'object') {
      return objectNode({})
    }

    const attributes: Record<string, ObjectAttribute> = {}
    for (const name in node.attributes) {
      if (!node.attributes.hasOwnProperty(name)) {
        continue
      }
      attributes[name] = node.attributes[name]
    }

    if (node.rest !== undefined) {
      // Rest is either an object, inline, or unknown - we need to resolve it if it's an inline
      const resolvedRest = resolveInline(node.rest, scope)

      // if the rest is unknown the entire object is unknown
      if (resolvedRest.type === 'unknown') {
        return unknownNode()
      }
      if (resolvedRest.type !== 'object') {
        return nullNode()
      }
      for (const name in resolvedRest.attributes) {
        // eslint-disable-next-line
        if (!resolvedRest.attributes.hasOwnProperty(name)) {
          continue
        }
        attributes[name] = resolvedRest.attributes[name]
      }
    }
    return objectNode(attributes)
  })
}

// eslint-disable-next-line max-statements, complexity
function handleObjectNode(node: ObjectNode, scope: Scope): TypeNode {
  $trace('object.node %O', node)

  if (node.attributes.length === 0) {
    return objectNode({})
  }

  // let attributes we a entry of [name, value] or null. We need to keep track of nulls to handle conditional splats
  // since we care about the order of the attributes. Later attribute keys will overwrite earlier ones.
  const objectAttributes: [number, string, ObjectAttribute][] = []

  const splatVariants: [number, ObjectTypeNode | UnionTypeNode<ObjectTypeNode>][] = []

  // We keep track of conditional splats separately, since we need to merge them into an object or an union of objects at the end.
  // keep track of the index of the conditional splat to be able to merge the attributes correctly.
  const conditionalVariants: [number, UnionTypeNode<ObjectTypeNode>][] = []

  for (const [idx, attr] of node.attributes.entries()) {
    if (attr.type === 'ObjectAttributeValue') {
      const attributeNode = walk({node: attr.value, scope})
      objectAttributes.push([
        idx,
        attr.name,
        {
          type: 'objectAttribute',
          value: attributeNode,
        },
      ])
      continue
    }

    if (attr.type === 'ObjectSplat') {
      const attributeNode = handleObjectSplatNode(attr, scope)
      $trace('object.splat.result %O', attributeNode)
      switch (attributeNode.type) {
        case 'object': {
          splatVariants.push([idx, attributeNode])
          continue
        }
        case 'union': {
          for (const node of attributeNode.of) {
            // if one of the nodes is unknown we mark the entire object as unknown as we can't infer the type of the object
            // eslint-disable-next-line max-depth
            if (node.type === 'unknown') {
              return node
            }
          }
          splatVariants.push([idx, attributeNode as UnionTypeNode<ObjectTypeNode>])
          continue
        }
        default: {
          return unknownNode()
        }
      }
    }

    if (attr.type === 'ObjectConditionalSplat') {
      const condition = booleanValue(walk({node: attr.condition, scope}), scope)
      $trace('object.conditional.splat.condition %O', condition)
      // condition is never met, skip this attribute
      if (condition.canBeTrue === false) {
        continue
      }

      const attributeNode = handleObjectSplatNode(attr, scope)
      $trace('object.conditional.splat.result %O', attributeNode)
      // condition is always met, we can treat this as a normal splat
      if (condition.canBeFalse === false && condition.canBeNull === false) {
        switch (attributeNode.type) {
          case 'object': {
            splatVariants.push([idx, attributeNode])
            continue
          }
          case 'union': {
            // eslint-disable-next-line max-depth
            for (const node of attributeNode.of) {
              // eslint-disable-next-line max-depth
              if (node.type !== 'object') {
                return unknownNode()
              }
            }
            splatVariants.push([idx, attributeNode as UnionTypeNode<ObjectTypeNode>])
            continue
          }
          default: {
            return unknownNode()
          }
        }
      }

      const variant = mapNode(attributeNode, scope, (attributeNode) => {
        $trace('object.conditional.splat.result.concrete %O', attributeNode)
        if (attributeNode.type !== 'object') {
          return unknownNode()
        }

        return objectNode(attributeNode.attributes)
      })

      if (variant.type === 'union') {
        for (const node of variant.of) {
          // We can only splat objects, so we bail out if we encounter a non-object node.
          // eslint-disable-next-line max-depth
          if (node.type !== 'object') {
            return unknownNode()
          }
        }
        variant.of.push(objectNode({})) // add an empty object to the union, since it's conditional
        conditionalVariants.push([idx, variant as UnionTypeNode<ObjectTypeNode>])
        continue
      }
      // If the variant is not an object or a union of objects, we bail out early.
      if (variant.type !== 'object') {
        return unknownNode()
      }

      conditionalVariants.push([
        idx,
        {
          type: 'union',
          of: [objectNode({}), variant],
        },
      ])
      continue
    }

    // @ts-expect-error - we should have handled all cases of ObjectAttributeNode
    throw new Error(`Unknown object attribute type: ${attr.type}`)
  }

  const guaranteedAttributes: [number, string, ObjectAttribute<TypeNode>][] = []
  guaranteedAttributes.push(...objectAttributes)

  for (const [idx, splatNode] of splatVariants) {
    if (splatNode.type === 'object') {
      for (const name in splatNode.attributes) {
        if (!splatNode.attributes.hasOwnProperty(name)) {
          continue
        }
        const attribute = splatNode.attributes[name]
        guaranteedAttributes.push([idx, name, attribute])
      }
      continue
    }

    // it's a union of objects, so we keep this as a conditional variant
    conditionalVariants.push([idx, splatNode])
  }

  // make sure they are sorted from lowest index to highest, this ensures that
  // attributes with a higher index overwrite attributes with a lower index.
  guaranteedAttributes.sort(([a], [b]) => a - b)

  // If we have no conditional variants, we can just return the object with the guaranteed attributes.
  if (conditionalVariants.length === 0) {
    return objectNode(
      Object.fromEntries(guaranteedAttributes.map(([, name, attribute]) => [name, attribute])),
    )
  }

  // matrix should be a result of if given we have variants [a,b,c] this would lead to a union of [a, a|b, a|c, a|b|c, b|c, c, {EMPTY}]
  // if it's given we have variants A + [a|b|c] this would lead to a union of [Aa, Aa|Ab, Aa|Ac, Aa|Ab|Ac, Ab|Ac, Ac, A]
  const matrix: (ObjectTypeNode | UnionTypeNode<ObjectTypeNode>)[] = []

  for (const [unionIdx, union] of conditionalVariants) {
    const unionGuaranteedBefore: [number, string, ObjectAttribute][] = []
    const unionGuaranteedAfter: [number, string, ObjectAttribute][] = []

    // Collect all guaranteed attributes before and after the conditional variant.
    for (const [guaranteedIndex, name, attribute] of guaranteedAttributes) {
      if (guaranteedIndex < unionIdx) {
        unionGuaranteedBefore.push([guaranteedIndex, name, attribute])
      }
      if (guaranteedIndex > unionIdx) {
        unionGuaranteedAfter.push([guaranteedIndex, name, attribute])
      }
    }

    // build a map of variants from other conditions.
    const allVariantsAttributes: [number, Record<string, ObjectAttribute>[]][] = []
    for (const [conditionalVariantIdx, otherUnion] of conditionalVariants) {
      // We need to build a matrix of all possible combinations of the attributes of the other variants.
      // start with an empty object, since it's condtional.
      const variantAttributes: Record<string, ObjectAttribute>[] = []
      for (const node of otherUnion.of) {
        variantAttributes.push(node.attributes)
      }
      allVariantsAttributes.push([conditionalVariantIdx, variantAttributes])
    }

    /* eslint-disable max-depth */
    for (const node of union.of) {
      matrix.push(
        objectNode({
          ...Object.fromEntries(
            unionGuaranteedBefore.map(([, name, attribute]) => [name, attribute]),
          ),
          ...node.attributes,
          ...Object.fromEntries(
            unionGuaranteedAfter.map(([, name, attribute]) => [name, attribute]),
          ),
        }),
      )

      for (const [outerIdx, outerAttributes] of allVariantsAttributes) {
        for (const outer of outerAttributes) {
          for (const [innerIdx, innerAttributes] of allVariantsAttributes) {
            if (outerIdx === innerIdx) {
              continue
            }

            for (const inner of innerAttributes) {
              const _before = [...unionGuaranteedBefore]
              const _after = [...unionGuaranteedAfter]

              for (const name in outer) {
                if (!outer.hasOwnProperty(name)) {
                  continue
                }

                if (outerIdx === unionIdx) {
                  continue
                }

                if (outerIdx < unionIdx) {
                  _before.push([outerIdx, name, outer[name]])
                }

                if (outerIdx > unionIdx) {
                  _after.push([outerIdx, name, outer[name]])
                }
              }

              for (const name in inner) {
                if (!inner.hasOwnProperty(name)) {
                  continue
                }
                if (outerIdx === unionIdx) {
                  continue
                }

                if (innerIdx < unionIdx) {
                  _before.push([innerIdx, name, inner[name]])
                }

                if (innerIdx > unionIdx) {
                  _after.push([innerIdx, name, inner[name]])
                }
              }
              _before.sort(([a], [b]) => a - b)
              _after.sort(([a], [b]) => a - b)

              const before: Record<string, ObjectAttribute> = Object.fromEntries(
                _before.map(([, name, attribute]) => [name, attribute]),
              )

              const after: Record<string, ObjectAttribute> = Object.fromEntries(
                _after.map(([, name, attribute]) => [name, attribute]),
              )

              matrix.push(
                objectNode({
                  ...before,
                  ...node.attributes,
                  ...after,
                }),
              )
            }
          }
        }
      }
    }
    /* eslint-disable max-depth */
  }

  return optimizeUnions(unionOf(...matrix))
}

// eslint-disable-next-line max-statements
function handleOpCallNode(node: OpCallNode, scope: Scope): TypeNode {
  $trace('opcall.node %O', node)
  const lhs = walk({node: node.left, scope})
  const rhs = walk({node: node.right, scope})
  return mapNode(lhs, scope, (left) =>
    // eslint-disable-next-line complexity, max-statements
    mapNode(rhs, scope, (right) => {
      $trace('opcall.node.concrete "%s" %O', node.op, {left, right})

      switch (node.op) {
        case '==': {
          // == always returns a boolean, no matter the compared types.
          if (left.type === 'unknown' || right.type === 'unknown') {
            return booleanNode()
          }
          if (left.type !== right.type) {
            return booleanNode(false)
          }
          if (left.type === 'null') {
            return booleanNode(true)
          }
          if (!isPrimitiveTypeNode(left) || !isPrimitiveTypeNode(right)) {
            return booleanNode(false)
          }
          return booleanNode(evaluateComparison(node.op, left, right))
        }
        case '!=': {
          // != always returns a boolean, no matter the compared types.
          if (left.type === 'unknown' || right.type === 'unknown') {
            return booleanNode()
          }
          if (left.type !== right.type) {
            return booleanNode(true)
          }
          if (left.type === 'null') {
            return booleanNode(false)
          }
          if (!isPrimitiveTypeNode(left) || !isPrimitiveTypeNode(right)) {
            return booleanNode(true)
          }

          let value = evaluateComparison('==', left, right)
          if (value !== undefined) value = !value
          return booleanNode(value)
        }
        case '>':
        case '>=':
        case '<':
        case '<=': {
          if (left.type === 'unknown' || right.type === 'unknown') {
            return nullUnion(booleanNode())
          }
          if (left.type !== right.type) {
            return nullNode()
          }
          // we represent datetimes as the string type, but can only compare them if both/none are the datetime subtype
          if (left.type === 'string' && right.type === 'string') {
            if (isDateTime(left) !== isDateTime(right)) {
              return nullNode()
            }
          }
          if (!isPrimitiveTypeNode(left) || !isPrimitiveTypeNode(right)) {
            return nullNode()
          }
          return booleanNode(evaluateComparison(node.op, left, right))
        }
        case 'in': {
          if (left.type === 'unknown' || right.type === 'unknown') {
            return nullUnion(booleanNode())
          }
          if (right.type !== 'array') {
            // Special case for global::path, since it can be used with in operator, but the type returned otherwise is a string
            if (isFuncCall(node.right, 'global::path')) {
              return booleanNode()
            }
            return nullNode()
          }
          if (!isPrimitiveTypeNode(left) && left.type !== 'null') {
            return booleanNode(false)
          }
          return mapNode(right.of, scope, (arrayTypeNode) => {
            if (arrayTypeNode.type === 'unknown') {
              return nullUnion(booleanNode())
            }

            if (left.type === 'null') {
              return booleanNode(arrayTypeNode.type === 'null')
            }

            if (left.value === undefined) {
              return booleanNode()
            }
            if (isPrimitiveTypeNode(arrayTypeNode)) {
              if (arrayTypeNode.value === undefined) {
                return booleanNode()
              }

              return booleanNode(left.value === arrayTypeNode.value)
            }

            return booleanNode(false)
          })
        }
        case 'match': {
          if (left.type === 'unknown' || right.type === 'unknown') {
            // match always returns a boolean, no matter the compared types.
            return booleanNode()
          }
          // datetime values are not handled by gatherText in the evaluator,
          // so match always returns false for datetime operands
          // This includes arrays containing datetime values
          if (containsDateTime(left) || containsDateTime(right)) {
            return booleanNode(false)
          }
          return booleanNode(match(left, right))
        }
        case '+': {
          if (left.type === 'unknown' || right.type === 'unknown') {
            // + is ambiguous without the concrete types of the operands, so we return unknown and leave the excersise to the caller
            return unknownNode()
          }
          if (isDateTime(left) && right.type === 'number') {
            return dateTimeStringNode()
          }
          if (left.type === 'number' && isDateTime(right)) {
            return dateTimeStringNode()
          }
          if (isString(left) && isString(right)) {
            return stringNode(
              left.value !== undefined && right.value !== undefined
                ? left.value + right.value
                : undefined,
            )
          }
          if (left.type === 'number' && right.type === 'number') {
            return numberNode(
              left.value !== undefined && right.value !== undefined
                ? left.value + right.value
                : undefined,
            )
          }
          if (left.type === 'array' && right.type === 'array') {
            return arrayOf(unionOf(left.of, right.of))
          }
          if (left.type === 'object' && right.type === 'object') {
            return objectNode({...left.attributes, ...right.attributes})
          }
          return nullNode()
        }
        case '-': {
          if (isDateTime(left) && isDateTime(right)) {
            return numberNode()
          }
          // datetime - unknown could be datetime (if unknown is number) or number (if unknown is datetime)
          if (isDateTime(left) && right.type === 'unknown') {
            return nullUnion({
              type: 'union',
              of: [numberNode(), dateTimeStringNode()],
            })
          }
          // datetime - number -> datetime
          if (isDateTime(left) && right.type === 'number') {
            return dateTimeStringNode()
          }
          // unknown - unknown could be number (if both are datetime or number) or datetime (if datetime - number)
          if (left.type === 'unknown') {
            return nullUnion({
              type: 'union',
              of: [numberNode(), dateTimeStringNode()],
            })
          }
          if (right.type === 'unknown') {
            return nullUnion(numberNode())
          }
          if (left.type === 'number' && right.type === 'number') {
            return numberNode(
              left.value !== undefined && right.value !== undefined
                ? left.value - right.value
                : undefined,
            )
          }
          return nullNode()
        }
        case '*': {
          if (left.type === 'unknown' || right.type === 'unknown') {
            return nullUnion(numberNode())
          }
          if (left.type === 'number' && right.type === 'number') {
            return numberNode(
              left.value !== undefined && right.value !== undefined
                ? left.value * right.value
                : undefined,
            )
          }
          return nullNode()
        }
        case '/': {
          if (left.type === 'unknown' || right.type === 'unknown') {
            return nullUnion(numberNode())
          }
          if (left.type === 'number' && right.type === 'number') {
            return numberNode(
              left.value !== undefined && right.value !== undefined
                ? left.value / right.value
                : undefined,
            )
          }
          return nullNode()
        }
        case '**': {
          if (left.type === 'unknown' || right.type === 'unknown') {
            return nullUnion(numberNode())
          }
          if (left.type === 'number' && right.type === 'number') {
            return numberNode(
              left.value !== undefined && right.value !== undefined
                ? left.value ** right.value
                : undefined,
            )
          }
          return nullNode()
        }
        case '%': {
          if (left.type === 'unknown' || right.type === 'unknown') {
            return nullUnion(numberNode())
          }
          if (left.type === 'number' && right.type === 'number') {
            return numberNode(
              left.value !== undefined && right.value !== undefined
                ? left.value % right.value
                : undefined,
            )
          }
          return nullNode()
        }
        default: {
          // TS only: make sure we handle all cases
          node.op satisfies never

          return unknownNode()
        }
      }
    }),
  )
}

function handleSelectNode(node: SelectNode, scope: Scope): TypeNode {
  const values: TypeNode[] = []
  let guaranteed = false
  for (const alternative of node.alternatives) {
    const conditionValue = walk({node: alternative.condition, scope})
    const conditionScope = resolveFilter(alternative.condition, scope)
    if (conditionScope.type === 'union' && conditionScope.of.length > 0) {
      values.push(walk({node: alternative.value, scope: scope.createHidden(conditionScope.of)}))
    }
    if (conditionValue.type === 'boolean' && conditionValue.value === true) {
      guaranteed = true
    }
  }
  if (node.fallback && !guaranteed) {
    values.push(walk({node: node.fallback, scope}))
  }
  if (values.length === 0) {
    return nullNode()
  }

  return unionOf(...values)
}

function handleArrayCoerceNode(node: ArrayCoerceNode, scope: Scope): TypeNode {
  const base = walk({node: node.base, scope})
  $trace('arrayCoerce.base %O', base)
  return mapArray(base, scope, (base) => base)
}
function handleFlatMap(node: FlatMapNode, scope: Scope): TypeNode {
  const base = walk({node: node.base, scope})
  return mapArray(base, scope, (base) => {
    const inner = walk({node: node.expr, scope: scope.createHidden([base.of])})

    return mapNode(
      inner,
      scope,
      (inner) => {
        if (inner.type === 'array') {
          return inner
        }

        return arrayOf(inner)
      },
      (nodes) => {
        const inner: TypeNode[] = []
        for (const node of nodes) {
          // Bail out early if we've detected an unknown.
          if (node.type === 'unknown') return arrayOf(node)
          // The mapper above ensures that all types returned are arrays.
          if (node.type !== 'array') throw new Error(`Unexpected type: ${node.type}`)
          inner.push(node.of)
        }
        return arrayOf(optimizeUnions(unionOf(...inner)))
      },
    )
  })
}
function handleMap(node: MapNode, scope: Scope): TypeNode {
  const base = walk({node: node.base, scope})
  $trace('map.base %O', base)

  return mapArray(base, scope, (base) => {
    return arrayOf(walk({node: node.expr, scope: scope.createHidden([base.of])}))
  })
}

function handleProjectionNode(node: ProjectionNode, scope: Scope): TypeNode {
  const base = walk({node: node.base, scope})
  $trace('projection.base %O', base)

  return mapObject(base, scope, (base) =>
    walk({node: node.expr, scope: scope.createNested([base])}),
  )
}

function createFilterScope(base: TypeNode, scope: Scope): Scope {
  if (base.type === 'array') {
    if (base.of.type === 'union') {
      return scope.createNested(base.of.of)
    }
    return scope.createNested([base.of])
  }

  return scope.createNested([base])
}
function handleFilterNode(node: FilterNode, scope: Scope): TypeNode {
  const base = walk({node: node.base, scope})
  $trace('filter.base %O', base)

  return mapNode(base, scope, (base) => {
    $trace('filter.resolving %O', base)
    if (base.type === 'null') {
      return base
    }

    const resolved = resolveFilter(node.expr, createFilterScope(base, scope))
    $trace('filter.resolved %O', resolved)

    return arrayOf(resolved)
  })
}

export function handleAccessAttributeNode(node: AccessAttributeNode, scope: Scope): TypeNode {
  let attributeBase: TypeNode = scope.value
  if (node.base) {
    attributeBase = walk({node: node.base, scope})
  }

  $trace('accessAttribute.base %s %O', node.name, attributeBase)
  return handleAccessAttributeBase(attributeBase, node.name, scope)
}

function handleAccessAttributeBase(base: TypeNode, name: string, scope: Scope): TypeNode {
  return mapObject(base, scope, (base) => {
    $trace(`Looking for attribute "%s" in object %O`, name, base)

    const attribute = base.attributes[name]
    if (attribute !== undefined) {
      $debug(`accessAttribute.attribute found ${name} %O`, attribute)
      if (attribute.optional) {
        return nullUnion(attribute.value)
      }

      return attribute.value
    }

    if (base.rest) {
      return handleAccessAttributeBase(base.rest, name, scope)
    }
    $warn(`attribute "${name}" not found in object`)
    return nullNode()
  })
}

function handleAccessElementNode(node: AccessElementNode, scope: Scope): TypeNode {
  const base = walk({node: node.base, scope})
  $trace('accessElement.base %O', base)
  return mapArray(base, scope, (base) => nullUnion(base.of))
}

function handleArrayNode(node: ArrayNode, scope: Scope): TypeNode {
  const of: TypeNode[] = []
  for (const el of node.elements) {
    const node = walk({node: el.value, scope})
    if (el.isSplat) {
      // if we are splatting a non-array, we ignore it since it would result in no values
      if (node.type !== 'array') {
        continue
      }

      of.push(node.of)
    } else {
      of.push(node)
    }
  }
  return arrayOf(unionOf(...of))
}

function handleValueNode(node: ValueNode, scope: Scope): TypeNode {
  if (node.value === null) {
    return nullNode()
  }
  switch (typeof node.value) {
    case 'string':
      return stringNode(node.value)
    case 'number':
      return numberNode(node.value)
    case 'boolean':
      return booleanNode(node.value)
    case 'object':
      if (node.value === null) {
        return nullNode()
      }
      if (Array.isArray(node.value)) {
        return arrayOf(
          unionOf(...node.value.map((value) => walk({node: {type: 'Value', value}, scope}))),
        )
      }
      return objectNode(
        Object.fromEntries(
          Object.entries(node.value).map(([key, value]) => [
            key,
            {
              type: 'objectAttribute',
              value: walk({node: {type: 'Value', value}, scope}),
            },
          ]),
        ),
      )
    default:
      return unknownNode()
  }
}

function handleSlice(node: SliceNode, scope: Scope): TypeNode {
  $trace('slice.node %O', node)
  const base = walk({node: node.base, scope})
  return mapArray(base, scope, (base) => base)
}

function handleParentNode({n}: ParentNode, scope: Scope): TypeNode {
  $trace('handle.parent.currentScope %d %O', n, scope)

  let current: Scope | undefined = scope
  for (let i = 0; i < n; i++) {
    // make sure we are not in a hidden scope
    while (current?.isHidden) {
      current = current.parent
    }
    current = current?.parent
  }
  $trace('handle.parent.newScope %d %O', n, current)

  if (!current) {
    return nullNode()
  }

  if (current.value.of.length === 0) {
    return nullNode()
  }

  return current.value
}

function handleNotNode(node: NotNode, scope: Scope): TypeNode {
  const base = walk({node: node.base, scope})
  return mapNode(base, scope, (base) => {
    if (base.type === 'unknown') {
      return nullUnion(booleanNode())
    }

    if (base.type === 'boolean') {
      if (base.value !== undefined) {
        return booleanNode(base.value === false)
      }
      return booleanNode()
    }

    return nullNode()
  })
}

function handleNegNode(node: NegNode, scope: Scope): TypeNode {
  const base = walk({node: node.base, scope})
  return mapNode(base, scope, (base) => {
    if (base.type === 'unknown') {
      return nullUnion(numberNode())
    }

    if (base.type !== 'number') {
      return nullNode()
    }
    if (base.value !== undefined) {
      return numberNode(-base.value)
    }
    return base
  })
}
function handlePosNode(node: PosNode, scope: Scope): TypeNode {
  const base = walk({node: node.base, scope})
  return mapNode(base, scope, (base) => {
    if (base.type === 'unknown') {
      return nullUnion(numberNode())
    }
    if (base.type !== 'number') {
      return nullNode()
    }
    return base
  })
}

function handleEverythingNode(_: EverythingNode, scope: Scope): TypeNode {
  return arrayOf({
    type: 'union',
    of: scope.context.schema
      .filter((obj): obj is Document => obj.type === 'document')
      .map((doc) => objectNode(doc.attributes)),
  })
}

function handleAndNode(node: AndNode, scope: Scope): TypeNode {
  const left = walk({node: node.left, scope})
  const right = walk({node: node.right, scope})
  return mapNode(left, scope, (lhs) =>
    mapNode(right, scope, (rhs) => {
      const value = booleanAnd(booleanValue(lhs, scope), booleanValue(rhs, scope))

      return booleanInterpretationToTypeNode(value)
    }),
  )
}

function handleOrNode(node: OrNode, scope: Scope): TypeNode {
  const left = walk({node: node.left, scope})
  const right = walk({node: node.right, scope})
  return mapNode(left, scope, (lhs) =>
    mapNode(right, scope, (rhs) => {
      const value = booleanOr(booleanValue(lhs, scope), booleanValue(rhs, scope))

      return booleanInterpretationToTypeNode(value)
    }),
  )
}

const OVERRIDE_TYPE_SYMBOL = Symbol('groq-js.type')

/**
 * `overrideTypeForNode` overrides the inferred type for a specific node: The
 * type evaluator will ignore its built-in logic and instead _always_ return
 * this type. This is intended to be used for testing.
 * @internal - This is only exported for testing purposes.
 */
export function overrideTypeForNode(node: ExprNode, type: TypeNode): void {
  ;(node as any)[OVERRIDE_TYPE_SYMBOL] = type
}

/**
 * Walks through the AST and evaluates the type of each node.
 *
 * @param node - The AST node to evaluate.
 * @param scope - The current scope.
 * @returns The evaluated type of the node.
 * @internal
 */
// eslint-disable-next-line complexity
export function walk({node, scope}: {node: ExprNode; scope: Scope}): TypeNode {
  if (OVERRIDE_TYPE_SYMBOL in node) {
    return node[OVERRIDE_TYPE_SYMBOL] as TypeNode
  }

  switch (node.type) {
    // Filtering, traversal & projections
    case 'Map': {
      return handleMap(node, scope)
    }
    case 'Projection': {
      return handleProjectionNode(node, scope)
    }
    case 'Filter': {
      return handleFilterNode(node, scope)
    }
    case 'AccessAttribute': {
      return optimizeUnions(handleAccessAttributeNode(node, scope))
    }
    case 'AccessElement': {
      return handleAccessElementNode(node, scope)
    }
    case 'ArrayCoerce': {
      return handleArrayCoerceNode(node, scope)
    }
    case 'FlatMap': {
      return handleFlatMap(node, scope)
    }

    // Operations
    case 'OpCall': {
      return handleOpCallNode(node, scope)
    }

    case 'And': {
      return handleAndNode(node, scope)
    }

    case 'Or': {
      return handleOrNode(node, scope)
    }

    case 'Select': {
      return handleSelectNode(node, scope)
    }
    case 'PipeFuncCall': {
      return walk({node: node.base, scope})
    }

    // Values
    case 'Deref': {
      return handleDerefNode(node, scope)
    }
    case 'Object': {
      return handleObjectNode(node, scope)
    }
    case 'Value': {
      return handleValueNode(node, scope)
    }
    case 'Array': {
      return handleArrayNode(node, scope)
    }

    // Special cases
    case 'Everything': {
      return handleEverythingNode(node, scope)
    }

    case 'This': {
      $trace('this %O', scope.value)
      return scope.value
    }

    case 'Parent': {
      return handleParentNode(node, scope)
    }
    case 'FuncCall': {
      return handleFuncCallNode(node, scope)
    }
    case 'Group': {
      return walk({node: node.base, scope})
    }
    case 'Not': {
      return handleNotNode(node, scope)
    }
    case 'Parameter': {
      return {
        type: 'unknown',
      }
    }

    case 'Slice': {
      return handleSlice(node, scope)
    }
    case 'Neg': {
      return handleNegNode(node, scope)
    }
    case 'Pos': {
      return handlePosNode(node, scope)
    }
    // everything else
    case 'Asc':
    case 'Desc':
    case 'Context':
    case 'Tuple':
    case 'SelectorFuncCall':
    case 'SelectorNested':
    case 'InRange': {
      return unknownNode()
    }

    default: {
      // @ts-expect-error - we should have handled all cases
      throw new Error(`unknown node type ${node.type}`)
    }
  }
}

function isPrimitiveTypeNode(node: TypeNode): node is PrimitiveTypeNode {
  return node.type === 'string' || node.type === 'number' || node.type === 'boolean'
}

function evaluateComparison(
  opcall: OpCall,
  left: PrimitiveTypeNode,
  right: PrimitiveTypeNode,
): boolean | undefined {
  if (left.value === undefined || right.value === undefined) {
    return undefined
  }
  switch (opcall) {
    case '==': {
      return left.value === right.value
    }
    case '<': {
      return left.value < right.value
    }
    case '<=': {
      return left.value <= right.value
    }
    case '>': {
      return left.value > right.value
    }
    case '>=': {
      return left.value >= right.value
    }
    default: {
      throw new Error(`unknown comparison operator ${opcall}`)
    }
  }
}

// eslint-disable-next-line complexity, max-statements
function resolveFilter(expr: ExprNode, scope: Scope): UnionTypeNode {
  $trace('resolveFilter.expr %O', expr)
  const filtered: TypeNode[] = []

  // Extract narrowing assertions from the filter expression
  const assertions = extractNarrowingAssertions(expr)

  for (const node of scope.value.of) {
    // Create a new scope with the current scopes parent as the parent.
    // It's only a temporary scope since we only want to resolve the condition
    // and check if the result can be true.
    const subScope = scope.createHidden([node])
    const cond = walk({node: expr, scope: subScope})
    const boolResult = booleanValue(cond, subScope)

    if (!boolResult.canBeTrue) {
      // Condition is definitely false for this type, filter it out
      continue
    }

    if (boolResult.canBeFalse && assertions.length > 0) {
      // Condition is uncertain (can be both true and false).
      // Apply the extracted assertions to narrow the type.
      const narrowedNode = narrowNode(node, assertions)
      const narrowedScope = scope.createHidden([narrowedNode])
      const narrowedCond = walk({node: expr, scope: narrowedScope})
      const narrowedBoolResult = booleanValue(narrowedCond, narrowedScope)

      if (narrowedBoolResult.canBeTrue && !narrowedBoolResult.canBeFalse) {
        // Narrowing makes the condition definitely true, use the narrowed type
        filtered.push(narrowedNode)
      } else {
        // Narrowing doesn't help or makes it false, keep original type
        filtered.push(node)
      }
    } else {
      // Condition is definitely true for this type, or no assertions to apply, keep it as-is
      filtered.push(node)
    }
  }

  $trace(
    `resolveFilter ${expr.type === 'OpCall' ? `${expr.type}/${expr.op}` : expr.type} %O`,
    filtered,
  )
  return {type: 'union', of: filtered}
}

function mapArray(
  node: TypeNode,
  scope: Scope,
  mapper: (node: ArrayTypeNode) => TypeNode,
): TypeNode {
  return mapNode(node, scope, (base) => {
    if (base.type === 'unknown') {
      return base
    }
    if (base.type === 'array') {
      return mapper(base)
    }
    return nullNode()
  })
}

function mapObject(
  node: TypeNode,
  scope: Scope,
  mapper: (node: ObjectTypeNode) => TypeNode,
): TypeNode {
  return mapNode(node, scope, (base) => {
    if (base.type === 'unknown') {
      return base
    }
    if (base.type === 'object') {
      return mapper(base)
    }
    return nullNode()
  })
}
