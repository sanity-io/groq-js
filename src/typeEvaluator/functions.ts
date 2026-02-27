/* eslint-disable max-statements */
import type {FuncCallNode} from '../nodeTypes'
import {optimizeUnions} from './optimizations'
import type {Scope} from './scope'
import {walk} from './typeEvaluate'
import {
  arrayOf,
  booleanNode,
  createGeoJson,
  dateTimeStringNode,
  isString,
  mapNode,
  nullNode,
  nullUnion,
  numberNode,
  stringNode,
  unionOf,
  unknownNode,
} from './typeHelpers'
import {type TypeNode} from './types'

function unionWithoutNull(unionTypeNode: TypeNode): TypeNode {
  if (unionTypeNode.type === 'union') {
    return unionOf(...unionTypeNode.of.filter((type) => type.type !== 'null'))
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
          return nullUnion(arrayOf(unknownNode()))
        }
        if (arg.type !== 'array') {
          return nullNode()
        }

        const of = mapNode(arg.of, scope, (of) => of)
        return arrayOf(unionWithoutNull(of))
      })
    }

    case 'array.join': {
      const arrayArg = walk({node: node.args[0], scope})
      const sepArg = walk({node: node.args[1], scope})

      return mapNode(arrayArg, scope, (arrayArg) =>
        mapNode(sepArg, scope, (sepArg) => {
          if (arrayArg.type === 'unknown' || sepArg.type === 'unknown') {
            return nullUnion(stringNode())
          }
          if (arrayArg.type !== 'array' || !isString(sepArg)) {
            return nullNode()
          }

          return mapNode(arrayArg.of, scope, (of) => {
            if (of.type === 'unknown') {
              return nullUnion(stringNode())
            }
            // we can only join strings, numbers, and booleans
            if (of.type !== 'string' && of.type !== 'number' && of.type !== 'boolean') {
              return nullNode()
            }

            return stringNode()
          })
        }),
      )
    }

    case 'array.unique': {
      const arg = walk({node: node.args[0], scope})

      return mapNode(arg, scope, (arg) => {
        if (arg.type === 'unknown') {
          return nullUnion(arrayOf(unknownNode()))
        }
        if (arg.type !== 'array') {
          return nullNode()
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
            return nullNode()
          }

          if (arg2.type !== 'array') {
            return nullNode()
          }

          return booleanNode()
        }),
      )
    }

    case 'global.lower': {
      const arg = walk({node: node.args[0], scope})

      return mapNode(arg, scope, (arg) => {
        if (arg.type === 'unknown') {
          return nullUnion(stringNode())
        }
        if (!isString(arg)) {
          return nullNode()
        }
        if (arg.value !== undefined) {
          return stringNode(arg.value.toLowerCase())
        }
        return stringNode()
      })
    }
    case 'global.upper': {
      const arg = walk({node: node.args[0], scope})

      return mapNode(arg, scope, (arg) => {
        if (arg.type === 'unknown') {
          return nullUnion(stringNode())
        }
        if (!isString(arg)) {
          return nullNode()
        }
        if (arg.value !== undefined) {
          return stringNode(arg.value.toUpperCase())
        }
        return stringNode()
      })
    }
    case 'dateTime.now': {
      return dateTimeStringNode()
    }
    case 'global.now': {
      return stringNode()
    }
    case 'global.defined': {
      const arg = walk({node: node.args[0], scope})
      return mapNode(arg, scope, (node) => {
        if (node.type === 'unknown') {
          return booleanNode()
        }

        return booleanNode(node.type !== 'null')
      })
    }
    case 'global.path': {
      const arg = walk({node: node.args[0], scope})
      return mapNode(arg, scope, (arg) => {
        if (arg.type === 'unknown') {
          return nullUnion(stringNode())
        }

        if (arg.type === 'string') {
          return stringNode()
        }

        return nullNode()
      })
    }
    case 'global.coalesce': {
      if (node.args.length === 0) {
        return nullNode()
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
        typeNodes.push(nullNode())
      }

      return unionOf(...typeNodes)
    }

    case 'global.count': {
      const arg = walk({node: node.args[0], scope})

      return mapNode(arg, scope, (arg) => {
        if (arg.type === 'unknown') {
          return nullUnion(stringNode())
        }

        if (arg.type === 'array') {
          return numberNode()
        }

        return nullNode()
      })
    }

    case 'global.dateTime': {
      const arg = walk({node: node.args[0], scope})

      return mapNode(arg, scope, (arg) => {
        if (arg.type === 'unknown') {
          return nullUnion(dateTimeStringNode())
        }

        if (arg.type === 'string') {
          // we don't know whether the string is a valid date or not, so we return a [null, string]-union
          return nullUnion(dateTimeStringNode())
        }

        return nullNode()
      })
    }

    case 'global.length': {
      const arg = walk({node: node.args[0], scope})

      return mapNode(arg, scope, (arg) => {
        if (arg.type === 'unknown') {
          return nullUnion(numberNode())
        }
        if (arg.type === 'array' || isString(arg)) {
          return numberNode()
        }

        return nullNode()
      })
    }

    case 'global.references': {
      return booleanNode()
    }

    case 'global.round': {
      const numNode = walk({node: node.args[0], scope})

      return mapNode(numNode, scope, (num) => {
        if (num.type === 'unknown') {
          return nullUnion(numberNode())
        }

        if (num.type !== 'number') {
          return nullNode()
        }
        if (node.args.length === 2) {
          const precisionNode = walk({node: node.args[1], scope})
          return mapNode(precisionNode, scope, (precision) => {
            if (precision.type === 'unknown') {
              return nullUnion(numberNode())
            }

            if (precision.type !== 'number') {
              return nullNode()
            }

            return numberNode()
          })
        }

        return numberNode()
      })
    }

    case 'global.string': {
      const arg = walk({node: node.args[0], scope})
      return mapNode(arg, scope, (node) => {
        if (node.type === 'unknown') {
          return nullUnion(stringNode())
        }

        if (node.type === 'string' || node.type === 'number' || node.type === 'boolean') {
          if (node.value) {
            return stringNode(node.value.toString())
          }

          return stringNode()
        }

        return nullNode()
      })
    }

    case 'math.sum': {
      const values = walk({node: node.args[0], scope})
      // use mapNode to get concrete resolved value, it will also handle cases where the value is a union
      return mapNode(values, scope, (node) => {
        if (node.type === 'unknown') {
          return nullUnion(numberNode())
        }

        // Aggregate functions can only be applied to arrays
        if (node.type !== 'array') {
          return nullNode()
        }

        // Resolve the concrete type of the array elements
        return mapNode(node.of, scope, (node) => {
          if (node.type === 'unknown') {
            return nullUnion(numberNode())
          }

          // Math functions can only be applied to numbers, but we should also ignore nulls
          if (node.type === 'number' || node.type === 'null') {
            return numberNode()
          }
          return nullNode()
        })
      })
    }

    case 'math.avg': {
      const values = walk({node: node.args[0], scope})
      // use mapNode to get concrete resolved value, it will also handle cases where the value is a union
      return mapNode(values, scope, (node) => {
        if (node.type === 'unknown') {
          return nullUnion(numberNode())
        }

        // Aggregate functions can only be applied to arrays
        if (node.type !== 'array') {
          return nullNode()
        }
        // Resolve the concrete type of the array elements
        return mapNode(node.of, scope, (node) => {
          if (node.type === 'unknown') {
            return nullUnion(numberNode())
          }

          // Math functions can only be applied to numbers
          if (node.type === 'number') {
            return numberNode()
          }
          return nullNode()
        })
      })
    }

    case 'math.max':
    case 'math.min': {
      const values = walk({node: node.args[0], scope})
      // use mapNode to get concrete resolved value, it will also handle cases where the value is a union
      return mapNode(values, scope, (node) => {
        if (node.type === 'unknown') {
          return nullUnion(numberNode())
        }

        // Aggregate functions can only be applied to arrays
        if (node.type !== 'array') {
          return nullNode()
        }

        // Resolve the concrete type of the array elements
        return mapNode(node.of, scope, (node) => {
          if (node.type === 'unknown') {
            return nullUnion(numberNode())
          }

          // Math functions can only be applied to numbers
          if (node.type === 'number') {
            return node
          }
          return nullNode()
        })
      })
    }

    case 'pt.text': {
      if (node.args.length === 0) {
        return nullNode()
      }
      return stringNode()
    }

    case 'string.startsWith': {
      const strTypeNode = walk({node: node.args[0], scope})
      const prefixTypeNode = walk({node: node.args[1], scope})
      return mapNode(strTypeNode, scope, (strNode) => {
        return mapNode(prefixTypeNode, scope, (prefixNode) => {
          if (strNode.type === 'unknown' || prefixNode.type === 'unknown') {
            return nullUnion(booleanNode())
          }

          if (strNode.type !== 'string' || prefixNode.type !== 'string') {
            return nullNode()
          }

          return booleanNode()
        })
      })
    }
    case 'string.split': {
      const strTypeNode = walk({node: node.args[0], scope})
      const sepTypeNode = walk({node: node.args[1], scope})
      return mapNode(strTypeNode, scope, (strNode) => {
        return mapNode(sepTypeNode, scope, (sepNode) => {
          if (strNode.type === 'unknown' || sepNode.type === 'unknown') {
            return nullUnion(arrayOf(stringNode()))
          }

          if (strNode.type !== 'string' || sepNode.type !== 'string') {
            return nullNode()
          }

          return arrayOf(stringNode())
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
            return nullNode()
          }

          return nullUnion(createGeoJson())
        })
      })
    }
    case 'geo.contains': {
      return nullUnion(booleanNode())
    }
    case 'geo.intersects': {
      return nullUnion(booleanNode())
    }
    case 'geo.distance': {
      return nullUnion(numberNode())
    }
    case 'sanity.versionOf': {
      const typeNode = walk({node: node.args[0], scope})
      return mapNode(typeNode, scope, (typeNode) => {
        if (typeNode.type === 'unknown') {
          return nullUnion(booleanNode())
        }
        if (typeNode.type !== 'string') {
          return nullNode()
        }
        return booleanNode()
      })
    }
    case 'sanity.partOfRelease': {
      const typeNode = walk({node: node.args[0], scope})
      return mapNode(typeNode, scope, (typeNode) => {
        if (typeNode.type === 'unknown') {
          return nullUnion(booleanNode())
        }

        if (typeNode.type !== 'string') {
          return nullNode()
        }
        return booleanNode()
      })
    }
    case 'documents.get': {
      const typeNode = walk({node: node.args[0], scope})
      return mapNode(typeNode, scope, (typeNode) => {
        if (typeNode.type === 'unknown') {
          return typeNode
        }

        if (typeNode.type !== 'object') {
          return nullNode()
        }

        return unknownNode()
      })
    }
    case 'documents.incomingRefCount': {
      return numberNode()
    }
    case 'documents.incomingGlobalDocumentReferenceCount': {
      return numberNode()
    }
    case 'media.aspect': {
      return mapNode(walk({node: node.args[0], scope}), scope, (fieldNode) => {
        if (fieldNode.type === 'null') {
          return nullNode()
        }

        return mapNode(walk({node: node.args[1], scope}), scope, (aspectNode) => {
          if (aspectNode.type !== 'string') {
            return nullNode()
          }

          return unknownNode()
        })
      })
    }
    case 'user.attributes': {
      return unknownNode()
    }
    default: {
      return unknownNode()
    }
  }
}
