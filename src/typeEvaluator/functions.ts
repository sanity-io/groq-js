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
    default: {
      return {type: 'unknown'}
    }
  }
}
