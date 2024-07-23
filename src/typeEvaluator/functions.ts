/* eslint-disable max-statements */
import type {FuncCallNode} from '../nodeTypes'
import {Scope} from './scope'
import {walk} from './typeEvaluate'
import {mapConcrete} from './typeHelpers'
import type {NullTypeNode, TypeNode} from './types'

function unionWithoutNull(unionTypeNode: TypeNode): TypeNode {
  if (unionTypeNode.type === 'union') {
    return {
      type: 'union',
      of: unionTypeNode.of.filter((type) => type.type !== 'null'),
    }
  }
  return unionTypeNode
}

export function handleFuncCallNode(node: FuncCallNode, scope: Scope): TypeNode {
  switch (`${node.namespace}.${node.name}`) {
    case 'array.compact': {
      const arg = walk({node: node.args[0], scope})

      return mapConcrete(arg, scope, (arg) => {
        if (arg.type !== 'array') {
          return {type: 'null'}
        }

        const of = mapConcrete(arg.of, scope, (of) => of)
        return {
          type: 'array',
          of: unionWithoutNull(of),
        }
      })
    }

    case 'array.join': {
      const arrayArg = walk({node: node.args[0], scope})
      const sepArg = walk({node: node.args[1], scope})

      return mapConcrete(arrayArg, scope, (arrayArg) =>
        mapConcrete(sepArg, scope, (sepArg) => {
          if (arrayArg.type !== 'array') {
            return {type: 'null'}
          }
          if (sepArg.type !== 'string') {
            return {type: 'null'}
          }

          return mapConcrete(arrayArg.of, scope, (of) => {
            // we can only join strings, numbers, and booleans
            if (of.type !== 'string' && of.type !== 'number' && of.type !== 'boolean') {
              return {type: 'unknown'}
            }

            return {type: 'string'}
          })
        }),
      )
    }

    case 'array.unique': {
      const arg = walk({node: node.args[0], scope})

      return mapConcrete(arg, scope, (arg) => {
        if (arg.type !== 'array') {
          return {type: 'null'}
        }

        return arg
      })
    }

    case 'global.lower': {
      const arg = walk({node: node.args[0], scope})

      return mapConcrete(arg, scope, (arg) => {
        if (arg.type === 'string') {
          if (arg.value !== undefined) {
            return {
              type: 'string',
              value: arg.value.toLowerCase(),
            }
          }
          return {type: 'string'}
        }

        return {type: 'null'}
      })
    }
    case 'global.upper': {
      const arg = walk({node: node.args[0], scope})

      return mapConcrete(arg, scope, (arg) => {
        if (arg.type === 'string') {
          if (arg.value !== undefined) {
            return {
              type: 'string',
              value: arg.value.toUpperCase(),
            }
          }
          return {type: 'string'}
        }

        return {type: 'null'}
      })
    }
    case 'dateTime.now': {
      return {type: 'string'}
    }
    case 'global.now': {
      return {type: 'string'}
    }
    case 'global.defined': {
      return {type: 'boolean'}
    }
    case 'global.coalesce': {
      if (node.args.length === 0) {
        return {type: 'null'} satisfies NullTypeNode
      }
      const typeNodes: TypeNode[] = []
      let canBeNull = true
      for (const arg of node.args) {
        const type = walk({node: arg, scope})
        typeNodes.push(unionWithoutNull(type))
        canBeNull =
          type.type === 'null' || (type.type === 'union' && type.of.some((t) => t.type === 'null'))
      }

      if (canBeNull) {
        typeNodes.push({type: 'null'} satisfies NullTypeNode)
      }

      return {
        type: 'union',
        of: typeNodes,
      }
    }

    case 'global.count': {
      const arg = walk({node: node.args[0], scope})

      return mapConcrete(arg, scope, (arg) => {
        if (arg.type === 'array') {
          return {type: 'number'}
        }

        return {type: 'null'} satisfies NullTypeNode
      })
    }

    case 'global.references': {
      return {type: 'boolean'}
    }

    case 'global.round': {
      const numNode = walk({node: node.args[0], scope})

      return mapConcrete(numNode, scope, (num) => {
        if (num.type !== 'number') {
          return {type: 'null'}
        }
        if (node.args.length === 2) {
          const precisionNode = walk({node: node.args[1], scope})
          return mapConcrete(precisionNode, scope, (precision) => {
            if (precision.type !== 'number') {
              return {type: 'null'}
            }

            return {type: 'number'}
          })
        }

        return {type: 'number'}
      })
    }

    case 'global.string': {
      const arg = walk({node: node.args[0], scope})
      return mapConcrete(arg, scope, (node) => {
        if (node.type === 'string' || node.type === 'number' || node.type === 'boolean') {
          if (node.value) {
            return {
              type: 'string',
              value: node.value.toString(),
            }
          }

          return {
            type: 'string',
          }
        }

        return {type: 'null'}
      })
    }

    case 'math.sum': {
      const values = walk({node: node.args[0], scope})
      // use mapConcrete to get concrete resolved value, it will also handle cases where the value is a union
      return mapConcrete(values, scope, (node) => {
        // Aggregate functions can only be applied to arrays
        if (node.type === 'array') {
          // Resolve the concrete type of the array elements
          return mapConcrete(node.of, scope, (node) => {
            // Math functions can only be applied to numbers, but we should also ignore nulls
            if (node.type === 'number' || node.type === 'null') {
              return {type: 'number'}
            }
            return {type: 'null'}
          })
        }

        return {type: 'null'}
      })
    }

    case 'math.avg': {
      const values = walk({node: node.args[0], scope})
      // use mapConcrete to get concrete resolved value, it will also handle cases where the value is a union
      return mapConcrete(values, scope, (node) => {
        // Aggregate functions can only be applied to arrays
        if (node.type === 'array') {
          // Resolve the concrete type of the array elements
          return mapConcrete(node.of, scope, (node) => {
            // Math functions can only be applied to numbers
            if (node.type === 'number') {
              return {type: 'number'}
            }
            return {type: 'null'}
          })
        }

        return {type: 'null'}
      })
    }

    case 'math.max':
    case 'math.min': {
      const values = walk({node: node.args[0], scope})
      // use mapConcrete to get concrete resolved value, it will also handle cases where the value is a union
      return mapConcrete(values, scope, (node) => {
        // Aggregate functions can only be applied to arrays
        if (node.type === 'array') {
          // Resolve the concrete type of the array elements
          return mapConcrete(node.of, scope, (node) => {
            // Math functions can only be applied to numbers
            if (node.type === 'number') {
              return node
            }
            return {type: 'null'}
          })
        }

        return {type: 'null'}
      })
    }

    case 'pt.text': {
      if (node.args.length === 0) {
        return {type: 'null'} satisfies NullTypeNode
      }
      return {
        type: 'string',
      }
    }
    case 'string.startsWith': {
      const strTypeNode = walk({node: node.args[0], scope})
      const prefixTypeNode = walk({node: node.args[1], scope})
      return mapConcrete(strTypeNode, scope, (strNode) => {
        if (strNode.type !== 'string') {
          return {type: 'null'}
        }

        return mapConcrete(prefixTypeNode, scope, (prefixNode) => {
          if (prefixNode.type !== 'string') {
            return {type: 'null'}
          }

          return {type: 'boolean'}
        })
      })
    }
    case 'string.split': {
      const strTypeNode = walk({node: node.args[0], scope})
      const sepTypeNode = walk({node: node.args[1], scope})
      return mapConcrete(strTypeNode, scope, (strNode) => {
        if (strNode.type !== 'string') {
          return {type: 'null'}
        }

        return mapConcrete(sepTypeNode, scope, (sepNode) => {
          if (sepNode.type !== 'string') {
            return {type: 'null'}
          }

          return {type: 'array', of: {type: 'string'}}
        })
      })
    }
    case 'sanity.versionOf': {
      const typeNode = walk({node: node.args[0], scope})
      return mapConcrete(typeNode, scope, (typeNode) => {
        if (typeNode.type !== 'string') {
          return {type: 'null'}
        }
        return {type: 'array', of: {type: 'string'}}
      })
    }
    default: {
      return {type: 'unknown'}
    }
  }
}
