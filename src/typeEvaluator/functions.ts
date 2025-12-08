/* eslint-disable max-statements */
import type {FuncCallNode} from '../nodeTypes'
import {optimizeUnions} from './optimizations'
import type {Scope} from './scope'
import {walk} from './typeEvaluate'
import {createGeoJson, mapNode, nullUnion} from './typeHelpers'
import {STRING_TYPE_DATETIME, type NullTypeNode, type TypeNode} from './types'

function unionWithoutNull(unionTypeNode: TypeNode): TypeNode {
  if (unionTypeNode.type === 'union') {
    return {
      type: 'union',
      of: unionTypeNode.of.filter((type) => type.type !== 'null'),
    }
  }
  return unionTypeNode
}

// eslint-disable-next-line complexity
export function handleFuncCallNode(node: FuncCallNode, scope: Scope): TypeNode {
  switch (`${node.namespace}.${node.name}`) {
    case 'array.compact': {
      const arg = walk({node: node.args[0], scope})

      return mapNode(arg, scope, (arg) => {
        if (arg.type === 'unknown') {
          return nullUnion({type: 'array', of: {type: 'unknown'}})
        }
        if (arg.type !== 'array') {
          return {type: 'null'}
        }

        const of = mapNode(arg.of, scope, (of) => of)
        return {
          type: 'array',
          of: unionWithoutNull(of),
        }
      })
    }

    case 'array.join': {
      const arrayArg = walk({node: node.args[0], scope})
      const sepArg = walk({node: node.args[1], scope})

      return mapNode(arrayArg, scope, (arrayArg) =>
        mapNode(sepArg, scope, (sepArg) => {
          if (arrayArg.type === 'unknown' || sepArg.type === 'unknown') {
            return nullUnion({type: 'string'})
          }
          if (arrayArg.type !== 'array' || sepArg.type !== 'string') {
            return {type: 'null'}
          }

          return mapNode(arrayArg.of, scope, (of) => {
            if (of.type === 'unknown') {
              return nullUnion({type: 'string'})
            }
            // we can only join strings, numbers, and booleans
            if (of.type !== 'string' && of.type !== 'number' && of.type !== 'boolean') {
              return {type: 'null'}
            }

            return {type: 'string'}
          })
        }),
      )
    }

    case 'array.unique': {
      const arg = walk({node: node.args[0], scope})

      return mapNode(arg, scope, (arg) => {
        if (arg.type === 'unknown') {
          return nullUnion({type: 'array', of: {type: 'unknown'}})
        }
        if (arg.type !== 'array') {
          return {type: 'null'}
        }

        return arg
      })
    }

    case 'array.intersects': {
      const arg1 = walk({node: node.args[0], scope})
      const arg2 = walk({node: node.args[1], scope})

      return mapNode(arg1, scope, (arg1) =>
        mapNode(arg2, scope, (arg2) => {
          if (arg1.type !== 'array') {
            return {type: 'null'}
          }

          if (arg2.type !== 'array') {
            return {type: 'null'}
          }

          return {type: 'boolean'}
        }),
      )
    }

    case 'global.lower': {
      const arg = walk({node: node.args[0], scope})

      return mapNode(arg, scope, (arg) => {
        if (arg.type === 'unknown') {
          return nullUnion({type: 'string'})
        }

        if (arg.type !== 'string') {
          return {type: 'null'}
        }
        if (arg.value !== undefined) {
          return {
            type: 'string',
            value: arg.value.toLowerCase(),
          }
        }
        return {type: 'string'}
      })
    }
    case 'global.upper': {
      const arg = walk({node: node.args[0], scope})

      return mapNode(arg, scope, (arg) => {
        if (arg.type === 'unknown') {
          return nullUnion({type: 'string'})
        }
        if (arg.type !== 'string') {
          return {type: 'null'}
        }
        if (arg.value !== undefined) {
          return {
            type: 'string',
            value: arg.value.toUpperCase(),
          }
        }
        return {type: 'string'}
      })
    }
    case 'dateTime.now': {
      return {type: 'string', [STRING_TYPE_DATETIME]: true}
    }
    case 'global.now': {
      return {type: 'string', [STRING_TYPE_DATETIME]: true}
    }
    case 'global.defined': {
      const arg = walk({node: node.args[0], scope})
      return mapNode(arg, scope, (node) => {
        if (node.type === 'unknown') {
          return {type: 'boolean'}
        }

        return {type: 'boolean', value: node.type !== 'null'}
      })
    }
    case 'global.path': {
      const arg = walk({node: node.args[0], scope})
      return mapNode(arg, scope, (arg) => {
        if (arg.type === 'unknown') {
          return nullUnion({type: 'string'})
        }

        if (arg.type === 'string') {
          return {type: 'string'}
        }

        return {type: 'null'}
      })
    }
    case 'global.coalesce': {
      if (node.args.length === 0) {
        return {type: 'null'} satisfies NullTypeNode
      }
      const typeNodes: TypeNode[] = []
      let canBeNull = true
      for (const arg of node.args) {
        const argNode = optimizeUnions(walk({node: arg, scope}))

        // Check if all types are null
        const allNull =
          argNode.type === 'null' ||
          (argNode.type === 'union' && argNode.of.every((t) => t.type === 'null'))

        // Can the argument be null, if all is null, unknown, or if its a union with at least one null or unknown
        canBeNull =
          allNull ||
          argNode.type === 'unknown' ||
          (argNode.type === 'union' &&
            argNode.of.some((t) => t.type === 'null' || t.type === 'unknown'))

        // As long as some type is not null or unknown, we add it to the union, but skip nulls
        if (!allNull) {
          typeNodes.push(unionWithoutNull(argNode))
        }

        // If we have a type that can't be null, we can break.
        if (!canBeNull) {
          break
        }
      }

      // If the last argument can be null, we add null to the union
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

      return mapNode(arg, scope, (arg) => {
        if (arg.type === 'unknown') {
          return nullUnion({type: 'string'})
        }

        if (arg.type === 'array') {
          return {type: 'number'}
        }

        return {type: 'null'} satisfies NullTypeNode
      })
    }

    case 'global.dateTime': {
      const arg = walk({node: node.args[0], scope})

      return mapNode(arg, scope, (arg) => {
        if (arg.type === 'unknown') {
          return nullUnion({type: 'string', [STRING_TYPE_DATETIME]: true})
        }

        if (arg.type === 'string') {
          // we don't know whether the string is a valid date or not, so we return a [null, string]-union
          return nullUnion({type: 'string', [STRING_TYPE_DATETIME]: true})
        }

        return {type: 'null'} satisfies NullTypeNode
      })
    }

    case 'global.length': {
      const arg = walk({node: node.args[0], scope})

      return mapNode(arg, scope, (arg) => {
        if (arg.type === 'unknown') {
          return nullUnion({type: 'number'})
        }
        if (arg.type === 'array' || arg.type === 'string') {
          return {type: 'number'}
        }

        return {type: 'null'}
      })
    }

    case 'global.references': {
      return {type: 'boolean'}
    }

    case 'global.round': {
      const numNode = walk({node: node.args[0], scope})

      return mapNode(numNode, scope, (num) => {
        if (num.type === 'unknown') {
          return nullUnion({type: 'number'})
        }

        if (num.type !== 'number') {
          return {type: 'null'}
        }
        if (node.args.length === 2) {
          const precisionNode = walk({node: node.args[1], scope})
          return mapNode(precisionNode, scope, (precision) => {
            if (precision.type === 'unknown') {
              return nullUnion({type: 'number'})
            }

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
      return mapNode(arg, scope, (node) => {
        if (node.type === 'unknown') {
          return nullUnion({type: 'string'})
        }

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
      // use mapNode to get concrete resolved value, it will also handle cases where the value is a union
      return mapNode(values, scope, (node) => {
        if (node.type === 'unknown') {
          return nullUnion({type: 'number'})
        }

        // Aggregate functions can only be applied to arrays
        if (node.type !== 'array') {
          return {type: 'null'}
        }

        // Resolve the concrete type of the array elements
        return mapNode(node.of, scope, (node) => {
          if (node.type === 'unknown') {
            return nullUnion({type: 'number'})
          }

          // Math functions can only be applied to numbers, but we should also ignore nulls
          if (node.type === 'number' || node.type === 'null') {
            return {type: 'number'}
          }
          return {type: 'null'}
        })
      })
    }

    case 'math.avg': {
      const values = walk({node: node.args[0], scope})
      // use mapNode to get concrete resolved value, it will also handle cases where the value is a union
      return mapNode(values, scope, (node) => {
        if (node.type === 'unknown') {
          return nullUnion({type: 'number'})
        }

        // Aggregate functions can only be applied to arrays
        if (node.type !== 'array') {
          return {type: 'null'}
        }
        // Resolve the concrete type of the array elements
        return mapNode(node.of, scope, (node) => {
          if (node.type === 'unknown') {
            return nullUnion({type: 'number'})
          }

          // Math functions can only be applied to numbers
          if (node.type === 'number') {
            return {type: 'number'}
          }
          return {type: 'null'}
        })
      })
    }

    case 'math.max':
    case 'math.min': {
      const values = walk({node: node.args[0], scope})
      // use mapNode to get concrete resolved value, it will also handle cases where the value is a union
      return mapNode(values, scope, (node) => {
        if (node.type === 'unknown') {
          return nullUnion({type: 'number'})
        }

        // Aggregate functions can only be applied to arrays
        if (node.type !== 'array') {
          return {type: 'null'}
        }

        // Resolve the concrete type of the array elements
        return mapNode(node.of, scope, (node) => {
          if (node.type === 'unknown') {
            return nullUnion({type: 'number'})
          }

          // Math functions can only be applied to numbers
          if (node.type === 'number') {
            return node
          }
          return {type: 'null'}
        })
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
      return mapNode(strTypeNode, scope, (strNode) => {
        return mapNode(prefixTypeNode, scope, (prefixNode) => {
          if (strNode.type === 'unknown' || prefixNode.type === 'unknown') {
            return nullUnion({type: 'boolean'})
          }

          if (strNode.type !== 'string' || prefixNode.type !== 'string') {
            return {type: 'null'}
          }

          return {type: 'boolean'}
        })
      })
    }
    case 'string.split': {
      const strTypeNode = walk({node: node.args[0], scope})
      const sepTypeNode = walk({node: node.args[1], scope})
      return mapNode(strTypeNode, scope, (strNode) => {
        return mapNode(sepTypeNode, scope, (sepNode) => {
          if (strNode.type === 'unknown' || sepNode.type === 'unknown') {
            return nullUnion({type: 'array', of: {type: 'string'}})
          }

          if (strNode.type !== 'string' || sepNode.type !== 'string') {
            return {type: 'null'}
          }

          return {type: 'array', of: {type: 'string'}}
        })
      })
    }
    case 'geo.latLng': {
      const latTypeNode = walk({node: node.args[0], scope})
      const lngTypeNode = walk({node: node.args[1], scope})
      return mapNode(latTypeNode, scope, (latNode) => {
        return mapNode(lngTypeNode, scope, (lngNode) => {
          if (latNode.type == 'unknown' || lngNode.type == 'unknown') {
            return nullUnion(createGeoJson())
          }
          if (latNode.type !== 'number' || lngNode.type !== 'number') {
            return {type: 'null'}
          }

          return nullUnion(createGeoJson())
        })
      })
    }
    case 'geo.contains': {
      return nullUnion({type: 'boolean'})
    }
    case 'geo.intersects': {
      return nullUnion({type: 'boolean'})
    }
    case 'geo.distance': {
      return nullUnion({type: 'number'})
    }
    case 'sanity.versionOf': {
      const typeNode = walk({node: node.args[0], scope})
      return mapNode(typeNode, scope, (typeNode) => {
        if (typeNode.type === 'unknown') {
          return nullUnion({type: 'boolean'})
        }
        if (typeNode.type !== 'string') {
          return {type: 'null'}
        }
        return {type: 'boolean'}
      })
    }
    case 'sanity.partOfRelease': {
      const typeNode = walk({node: node.args[0], scope})
      return mapNode(typeNode, scope, (typeNode) => {
        if (typeNode.type === 'unknown') {
          return nullUnion({type: 'boolean'})
        }

        if (typeNode.type !== 'string') {
          return {type: 'null'}
        }
        return {type: 'boolean'}
      })
    }
    case 'documents.get': {
      const typeNode = walk({node: node.args[0], scope})
      return mapNode(typeNode, scope, (typeNode) => {
        if (typeNode.type === 'unknown') {
          return typeNode
        }

        if (typeNode.type !== 'object') {
          return {type: 'null'}
        }

        return {type: 'unknown'}
      })
    }
    case 'documents.incomingRefCount': {
      return {type: 'number'}
    }
    case 'documents.incomingGlobalDocumentReferenceCount': {
      return {type: 'number'}
    }
    case 'media.aspect': {
      return mapNode(walk({node: node.args[0], scope}), scope, (fieldNode) => {
        if (fieldNode.type === 'null') {
          return {type: 'null'}
        }

        return mapNode(walk({node: node.args[1], scope}), scope, (aspectNode) => {
          if (aspectNode.type !== 'string') {
            return {type: 'null'}
          }

          return {type: 'unknown'}
        })
      })
    }
    default: {
      return {type: 'unknown'}
    }
  }
}
