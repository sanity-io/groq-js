import debug from 'debug'

import {
  matchAnalyzePattern,
  matchText,
  matchTokenize,
  type Pattern,
  type Token,
} from '../evaluator/matching'
import type {
  AccessAttributeNode,
  AccessElementNode,
  ArrayCoerceNode,
  ArrayNode,
  DerefNode,
  EverythingNode,
  ExprNode,
  FilterNode,
  FlatMapNode,
  MapNode,
  NotNode,
  ObjectNode,
  OpCallNode,
  ParentNode,
  ProjectionNode,
  SelectNode,
  SliceNode,
  ValueNode,
} from '../nodeTypes'
import {handleFuncCallNode} from './functions'
import {optimizeUnions} from './optimizations'
import {Context, Scope} from './scope'
import type {
  ArrayTypeNode,
  BooleanTypeNode,
  Document,
  NullTypeNode,
  NumberTypeNode,
  ObjectAttribute,
  ObjectTypeNode,
  PrimitiveTypeNode,
  Schema,
  StringTypeNode,
  TypeNode,
  UnionTypeNode,
  UnknownTypeNode,
} from './types'
import {nullUnion} from './typeHelpers'

const $trace = debug('typeEvaluator:evaluate:trace')
$trace.log = console.log.bind(console) // eslint-disable-line no-console
// log to stdout
const $debug = debug('typeEvaluator:evaluate:debug')
// log to stdout
$debug.log = console.log.bind(console) // eslint-disable-line no-console
const $warn = debug('typeEvaluator:evaluate::warn')

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
  const parsed = walk({
    node: ast,
    scope: new Scope([], undefined, new Context(schema)),
  })

  $trace('evaluateQueryType.parsed %O', parsed)
  const optimized = optimizeUnions(parsed)
  $debug('evaluateQueryType.optimized %O', optimized)

  return optimized
}

function mapDeref(base: TypeNode, scope: Scope): TypeNode {
  if (base.type === 'union') {
    return {
      type: 'union',
      of: base.of.map((node) => mapDeref(node, scope)),
    }
  }

  if (base.type === 'array') {
    return {
      type: 'array',
      of: mapDeref(base.of, scope),
    }
  }

  if (base.type === 'object' && base.dereferencesTo !== undefined) {
    return scope.context.lookupRef(base.dereferencesTo)
  }

  return {type: 'null'}
}

function handleDerefNode(node: DerefNode, scope: Scope): TypeNode {
  $trace('deref.node %O', node)
  const base = walk({node: node.base, scope})
  $trace('deref.base %O', base)

  if (base.type === 'null' || base.type === 'unknown') {
    return {type: 'null'} satisfies NullTypeNode
  }

  const derefedNode = mapDeref(base, scope)
  $trace('deref.derefedNode %O', derefedNode)

  return derefedNode
}

function mapObjectSplat(
  node: TypeNode,
  scope: Scope,
  mapper: (field: Document | ObjectTypeNode) => void,
) {
  if (node.type === 'union') {
    for (const scoped of node.of) {
      mapObjectSplat(scoped, scope, mapper)
    }
  }

  if (node.type === 'object') {
    mapper(node)
  }
}
function handleObjectNode(node: ObjectNode, scope: Scope) {
  $trace('object.node %O', node)
  $trace('object.scope %O', scope)
  const attributes: Record<string, ObjectAttribute> = {}
  for (const attr of node.attributes) {
    if (attr.type === 'ObjectAttributeValue') {
      const field = walk({node: attr.value, scope})
      attributes[attr.name] = {
        type: 'objectAttribute',
        value: field,
      }
    }

    if (attr.type === 'ObjectSplat') {
      const value = walk({node: attr.value, scope})
      $trace('object.splat.value %O', value)
      mapObjectSplat(value, scope, (node) => {
        for (const name in node.attributes) {
          if (!Object.hasOwn(node.attributes, name)) {
            continue
          }

          attributes[name] = node.attributes[name]
        }
      })
    }
    if (attr.type === 'ObjectConditionalSplat') {
      const condition = resolveCondition(attr.condition, scope)
      $trace('object.conditional.splat.condition %O', condition)
      if (condition) {
        const value = walk({node: attr.value, scope})

        mapObjectSplat(value, scope, (node) => {
          for (const name in node.attributes) {
            if (!Object.hasOwn(node.attributes, name)) {
              continue
            }

            attributes[name] = node.attributes[name]
          }
        })
      }
    }
  }
  return {
    type: 'object',
    attributes,
  } satisfies ObjectTypeNode
}

// eslint-disable-next-line max-statements
function handleOpCallNode(node: OpCallNode, scope: Scope): TypeNode {
  const lhs = walk({node: node.left, scope})
  const rhs = walk({node: node.right, scope})
  return mapUnion(lhs, (left) =>
    // eslint-disable-next-line complexity
    mapUnion(rhs, (right) => {
      $trace('opCallNode "%s" %O', node.op, {left, right})
      if (left.type === 'unknown' || right.type === 'unknown') {
        return {type: 'unknown'} satisfies UnknownTypeNode
      }

      switch (node.op) {
        case '==':
        case '!=': {
          return {
            type: 'boolean',
            value: resolveCondition(node, scope),
          } satisfies BooleanTypeNode
        }
        case '>':
        case '>=':
        case '<':
        case '<=': {
          if (left.type !== right.type) {
            return {type: 'null'}
          }
          if (isPrimitiveTypeNode(left)) {
            const resolved = resolveCondition(node, scope)
            return {
              type: 'boolean',
              value: resolved,
            } satisfies BooleanTypeNode
          }

          return {type: 'null'}
        }
        case 'in': {
          if (right.type === 'array') {
            const resolved = resolveCondition(node, scope)
            return {
              type: 'boolean',
              value: resolved,
            } satisfies BooleanTypeNode
          }
          return {type: 'null'}
        }
        case 'match': {
          const resolved = resolveCondition(node, scope)

          return {
            type: 'boolean',
            value: resolved,
          } satisfies BooleanTypeNode
        }
        case '+': {
          if (left.type === 'string' && right.type === 'string') {
            return {
              type: 'string',
              value:
                left.value !== undefined && right.value !== undefined
                  ? left.value + right.value
                  : undefined,
            }
          }

          if (left.type === 'number' && right.type === 'number') {
            return {
              type: 'number',
              value:
                left.value !== undefined && right.value !== undefined
                  ? left.value + right.value
                  : undefined,
            }
          }
          if (left.type === 'array' && right.type === 'array') {
            return {
              type: 'array',
              of: {
                type: 'union',
                of: [left.of, right.of],
              },
            } satisfies ArrayTypeNode
          }
          if (left.type === 'object' && right.type === 'object') {
            return {
              type: 'object',
              attributes: {...left.attributes, ...right.attributes},
            } satisfies ObjectTypeNode
          }
          return {type: 'null'}
        }
        case '-': {
          if (left.type === 'number' && right.type === 'number') {
            return {
              type: 'number',
              value:
                left.value !== undefined && right.value !== undefined
                  ? left.value - right.value
                  : undefined,
            }
          }
          return {type: 'null'}
        }
        case '*': {
          if (left.type === 'number' && right.type === 'number') {
            return {
              type: 'number',
              value:
                left.value !== undefined && right.value !== undefined
                  ? left.value * right.value
                  : undefined,
            }
          }
          return {type: 'null'}
        }
        case '/': {
          if (left.type === 'number' && right.type === 'number') {
            return {
              type: 'number',
              value:
                left.value !== undefined && right.value !== undefined
                  ? left.value / right.value
                  : undefined,
            }
          }
          return {type: 'null'}
        }
        case '**': {
          if (left.type === 'number' && right.type === 'number') {
            return {
              type: 'number',
              value:
                left.value !== undefined && right.value !== undefined
                  ? left.value ** right.value
                  : undefined,
            }
          }
          return {type: 'null'}
        }
        case '%': {
          if (left.type === 'number' && right.type === 'number') {
            return {
              type: 'number',
              value:
                left.value !== undefined && right.value !== undefined
                  ? left.value % right.value
                  : undefined,
            }
          }
          return {type: 'null'}
        }
        default: {
          return {
            type: 'unknown',
          } satisfies UnknownTypeNode
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
    return {type: 'null'} satisfies NullTypeNode
  }
  return {
    type: 'union',
    of: values,
  } satisfies UnionTypeNode
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

    return mapConcrete(
      inner,
      scope,
      (inner) => {
        if (inner.type === 'array') {
          return inner
        }

        return {type: 'array', of: inner}
      },
      (nodes) => {
        const inner: TypeNode[] = []
        for (const node of nodes) {
          // Bail out early if we've detected an unknown.
          if (node.type === 'unknown') return {type: 'array', of: node}
          // The mapper above ensures that all types returned are arrays.
          if (node.type !== 'array') throw new Error(`Unexpected type: ${node.type}`)
          inner.push(node.of)
        }
        return {
          type: 'array',
          of: optimizeUnions({type: 'union', of: inner}),
        }
      },
    )
  })
}
function handleMap(node: MapNode, scope: Scope): TypeNode {
  const base = walk({node: node.base, scope})
  $trace('map.base %O', base)

  return mapArray(base, scope, (base) => {
    return {
      type: 'array',
      of: walk({node: node.expr, scope: scope.createHidden([base.of])}),
    }
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

  $trace('filter.resolving %O', base)
  const resolved = resolveFilter(node.expr, createFilterScope(base, scope))
  $trace('filter.resolved %O', resolved)

  return {
    type: 'array',
    of: resolved,
  }
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
    return {type: 'null'}
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
    if (node !== null) {
      of.push(node)
    }
  }
  return {
    type: 'array',
    of: {
      type: 'union',
      of,
    } satisfies UnionTypeNode,
  } satisfies ArrayTypeNode
}

function handleValueNode(node: ValueNode, scope: Scope): TypeNode {
  if (node.value === null) {
    return {type: 'null'} satisfies NullTypeNode
  }
  switch (typeof node.value) {
    case 'string':
      return {
        type: 'string',
        value: node.value,
      } satisfies StringTypeNode
    case 'number':
      return {
        type: 'number',
        value: node.value,
      } satisfies NumberTypeNode
    case 'boolean':
      return {
        type: 'boolean',
        value: node.value,
      } satisfies BooleanTypeNode
    case 'object':
      if (node.value === null) {
        return {type: 'null'} satisfies NullTypeNode
      }
      if (Array.isArray(node.value)) {
        return {
          type: 'array',
          of: {
            type: 'union',
            of: node.value.map((value) => walk({node: {type: 'Value', value}, scope})),
          },
        } satisfies ArrayTypeNode
      }
      return {
        type: 'object',
        attributes: Object.fromEntries(
          Object.entries(node.value).map(([key, value]) => [
            key,
            {
              type: 'objectAttribute',
              value: walk({node: {type: 'Value', value}, scope}),
            },
          ]),
        ),
      } satisfies ObjectTypeNode
    default:
      return {type: 'unknown'} satisfies UnknownTypeNode
  }
}

function handleSlice(node: SliceNode, scope: Scope): TypeNode {
  $trace('slice.node %O', node)
  const base = walk({node: node.base, scope})
  return mapArray(base, scope, (base) => base)
}

function handleParentNode({n}: ParentNode, scope: Scope): TypeNode {
  let current: Scope = scope
  for (let i = 0; i < n; i++) {
    if (!current.parent) {
      return {type: 'null'} satisfies NullTypeNode
    }
    current = current.parent
  }
  $trace('parent.scope %d %O', n, current.value)
  if (current.value.of.length === 0) {
    return {type: 'null'} satisfies NullTypeNode
  }

  return current.value
}

function handleNotNode(node: NotNode, scope: Scope): TypeNode {
  const base = walk({node: node.base, scope})
  if (base.type === 'boolean' && base.value !== undefined) {
    return {type: 'boolean', value: base.value === false}
  }
  return {type: 'boolean'}
}

function handleEverythingNode(_: EverythingNode, scope: Scope): TypeNode {
  return {
    type: 'array',
    of: {
      type: 'union',
      of: scope.context.schema
        .filter((obj): obj is Document => obj.type === 'document')
        .map((doc) => ({
          type: 'object',
          attributes: doc.attributes,
        })),
    },
  } satisfies ArrayTypeNode<UnionTypeNode<ObjectTypeNode>>
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

    case 'And':
    case 'Or': {
      return {
        type: 'boolean',
        value: resolveCondition(node, scope),
      } satisfies BooleanTypeNode
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
    // everything else
    case 'Asc':
    case 'Desc':
    case 'Neg':
    case 'Pos':
    case 'Context':
    case 'Tuple':
    case 'Selector':
    case 'InRange': {
      return {type: 'unknown'}
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

function evaluateEquality(left: TypeNode, right: TypeNode): boolean | undefined {
  $trace('evaluateEquality %O', {left, right})
  if (left.type === 'null' && right.type === 'null') {
    return true
  }

  if (
    isPrimitiveTypeNode(left) &&
    isPrimitiveTypeNode(right) &&
    left.value !== undefined &&
    right.value !== undefined
  ) {
    return left.value === right.value
  }
  if (left.type === 'union' && isPrimitiveTypeNode(right)) {
    return left.of.some((node) => {
      if (isPrimitiveTypeNode(node)) {
        return node.value === undefined || right.value === undefined || node.value === right.value
      }
      return false
    })
  }
  if (left.type !== right.type) {
    return false
  }
  return undefined
}

/**
 * Resolves the condition expression and returns a boolean value or undefined.
 * Undefined is returned when the condition can't be resolved.
 *
 * @param expr - The expression node to resolve.
 * @param scope - The scope in which the expression is evaluated.
 * @returns The resolved boolean value or undefined.
 */

// eslint-disable-next-line complexity, max-statements
function resolveCondition(expr: ExprNode, scope: Scope): boolean | undefined {
  $trace('resolveCondition.expr %O', expr)

  switch (expr.type) {
    case 'Value': {
      const value = walk({node: expr, scope})
      return value.type === 'boolean' && value.value !== false
    }
    case 'And': {
      const left = resolveCondition(expr.left, scope)
      $trace('resolveCondition.and.left %O', left)
      if (left === false) {
        return false
      }

      const right = resolveCondition(expr.right, scope)
      $trace('resolveCondition.and.right %O', right)
      if (right === false) {
        return false
      }

      if (left === undefined || right === undefined) {
        return undefined
      }

      return true
    }
    case 'Or': {
      $trace('resolveCondition.or.expr %O', expr)
      const left = resolveCondition(expr.left, scope)
      $trace('resolveCondition.or.left %O', left)
      if (left === true) {
        return true
      }

      const right = resolveCondition(expr.right, scope)
      $trace('resolveCondition.or.right %O', right)
      if (right === true) {
        return true
      }
      if (left === undefined || right === undefined) {
        return undefined
      }

      return false
    }
    case 'OpCall': {
      const left = walk({node: expr.left, scope})
      const right = walk({node: expr.right, scope})
      $trace('opcall "%s" %O', expr.op, {left, right})

      if (left.type === 'unknown' || right.type === 'unknown') {
        return undefined
      }

      switch (expr.op) {
        case '==': {
          return evaluateEquality(left, right)
        }
        case '!=': {
          const result = evaluateEquality(left, right)
          if (result === undefined) {
            return undefined
          }
          return !result
        }
        case 'in': {
          if (right.type === 'array') {
            if (left.type === 'null' && right.of.type === 'unknown') {
              return undefined
            }
            if (left.type === 'null' && right.of.type === 'null') {
              return true
            }
            if (isPrimitiveTypeNode(left)) {
              // eslint-disable-next-line max-depth
              if (right.of.type === 'unknown') {
                return undefined
              }
              // eslint-disable-next-line max-depth
              if (left.value === undefined) {
                return undefined
              }

              // eslint-disable-next-line max-depth
              if (isPrimitiveTypeNode(right.of)) {
                // eslint-disable-next-line max-depth
                if (right.of.value === undefined) {
                  return undefined
                }
                return left.value === right.of.value
              }
              // eslint-disable-next-line max-depth
              if (right.of.type === 'union') {
                // eslint-disable-next-line max-depth
                for (const node of right.of.of) {
                  // eslint-disable-next-line max-depth
                  if (node.type === 'unknown') {
                    return undefined
                  }
                  // eslint-disable-next-line max-depth
                  if (isPrimitiveTypeNode(node) && left.value === node.value) {
                    return true
                  }
                  // eslint-disable-next-line max-depth
                  if (left.type === node.type && node.value === undefined) {
                    return undefined
                  }
                }
              }
            }
          }

          return false
        }
        case 'match': {
          let tokens: Token[] = []
          let patterns: Pattern[] = []
          if (left.type === 'string') {
            if (left.value === undefined) {
              return undefined
            }
            tokens = tokens.concat(matchTokenize(left.value))
          }
          if (left.type === 'array') {
            if (left.of.type === 'unknown') {
              return undefined
            }
            if (left.of.type === 'string') {
              // eslint-disable-next-line max-depth
              if (left.of.value === undefined) {
                return undefined
              }

              tokens = tokens.concat(matchTokenize(left.of.value))
            }
            if (left.of.type === 'union') {
              // eslint-disable-next-line max-depth
              for (const node of left.of.of) {
                // eslint-disable-next-line max-depth
                if (node.type === 'string' && node.value !== undefined) {
                  tokens = tokens.concat(matchTokenize(node.value))
                }
              }
            }
          }

          if (right.type === 'string') {
            if (right.value === undefined) {
              return undefined
            }
            patterns = patterns.concat(matchAnalyzePattern(right.value))
          }
          if (right.type === 'array') {
            if (right.of.type === 'unknown') {
              return undefined
            }
            if (right.of.type === 'string') {
              // eslint-disable-next-line max-depth
              if (right.of.value === undefined) {
                return undefined
              }
              patterns = patterns.concat(matchAnalyzePattern(right.of.value))
            }
            if (right.of.type === 'union') {
              // eslint-disable-next-line max-depth
              for (const node of right.of.of) {
                // eslint-disable-next-line max-depth
                if (node.type === 'string') {
                  // eslint-disable-next-line max-depth
                  if (node.value === undefined) {
                    return undefined
                  }
                  patterns = patterns.concat(matchAnalyzePattern(node.value))
                }

                // eslint-disable-next-line max-depth
                if (node.type !== 'string') {
                  return false
                }
              }
            }
          }
          return matchText(tokens, patterns)
        }
        case '<': {
          if (isPrimitiveTypeNode(left) && isPrimitiveTypeNode(right)) {
            if (left.value === undefined || right.value === undefined) {
              return undefined
            }
            return left.value < right.value
          }

          return undefined
        }
        case '<=': {
          if (isPrimitiveTypeNode(left) && isPrimitiveTypeNode(right)) {
            if (left.value === undefined || right.value === undefined) {
              return undefined
            }
            return left.value <= right.value
          }

          return undefined
        }
        case '>': {
          if (isPrimitiveTypeNode(left) && isPrimitiveTypeNode(right)) {
            if (left.value === undefined || right.value === undefined) {
              return undefined
            }
            return left.value > right.value
          }

          return undefined
        }
        case '>=': {
          if (isPrimitiveTypeNode(left) && isPrimitiveTypeNode(right)) {
            if (left.value === undefined || right.value === undefined) {
              return undefined
            }
            return left.value >= right.value
          }

          return undefined
        }

        default: {
          return undefined
        }
      }
    }
    case 'Group': {
      return resolveCondition(expr.base, scope)
    }
    default: {
      return true
    }
  }
}

// eslint-disable-next-line complexity, max-statements
function resolveFilter(expr: ExprNode, scope: Scope): TypeNode {
  $trace('resolveFilter.expr %O', expr)
  const filtered = scope.value.of.filter(
    (node) =>
      // create a new scope with the current scopes parent as the parent. It's only a temporary scope since we only want to resolve the condition
      // check if the result is true or undefined. Undefined means that the condition can't be resolved, and we should keep the node
      resolveCondition(expr, scope.createHidden([node])) !== false,
  )
  $trace(
    `resolveFilter ${expr.type === 'OpCall' ? `${expr.type}/${expr.op}` : expr.type} %O`,
    filtered,
  )
  return {type: 'union', of: filtered}
}

function mapUnion(node: TypeNode, mapper: (node: TypeNode) => TypeNode): TypeNode {
  if (node.type === 'union') {
    return optimizeUnions({
      type: 'union',
      of: node.of.map((subNode) => mapUnion(subNode, mapper)),
    })
  }
  return mapper(node)
}

type ConcreteTypeNode =
  | BooleanTypeNode
  | NullTypeNode
  | NumberTypeNode
  | StringTypeNode
  | ArrayTypeNode
  | ObjectTypeNode

/**
 * mapConcrete extracts a _concrete type_ from a type node, applies the mapping
 * function to it and returns. Most notably, this will work through unions
 * (applying the mapping function for each variant) and inline (resolving the
 * reference).
 *
 * An `unknown` input type causes it to return `unknown` as well.
 *
 * After encountering unions the resulting types gets passed into `mergeUnions`.
 * By default this will just union them together again.
 */
function mapConcrete(
  node: TypeNode,
  scope: Scope,
  mapper: (node: ConcreteTypeNode) => TypeNode,
  mergeUnions: (nodes: TypeNode[]) => TypeNode = (nodes) =>
    optimizeUnions({type: 'union', of: nodes}),
): TypeNode {
  switch (node.type) {
    case 'boolean':
    case 'array':
    case 'null':
    case 'object':
    case 'string':
    case 'number':
      return mapper(node)
    case 'unknown':
      return node
    case 'union':
      return mergeUnions(node.of.map((inner) => mapConcrete(inner, scope, mapper), mergeUnions))
    case 'inline': {
      const resolvedInline = scope.context.lookupTypeDeclaration(node)
      return mapConcrete(resolvedInline, scope, mapper, mergeUnions)
    }
    default:
      // @ts-expect-error
      throw new Error(`Unknown type: ${node.type}`)
  }
}

function mapArray(
  node: TypeNode,
  scope: Scope,
  mapper: (node: ArrayTypeNode) => TypeNode,
): TypeNode {
  return mapConcrete(node, scope, (base) => (base.type === 'array' ? mapper(base) : {type: 'null'}))
}

function mapObject(
  node: TypeNode,
  scope: Scope,
  mapper: (node: ObjectTypeNode) => TypeNode,
): TypeNode {
  return mapConcrete(node, scope, (base) =>
    base.type === 'object' ? mapper(base) : {type: 'null'},
  )
}
