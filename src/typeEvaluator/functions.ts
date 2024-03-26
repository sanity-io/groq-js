import type {FuncCallNode} from '../nodeTypes'
import {Scope} from './scope'
import {walk} from './typeEvaluate'
import {resolveUnionType} from './typeHelpers'
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
      if (node.args.length === 0) {
        return {type: 'null'} satisfies NullTypeNode
      }

      const arg = walk({node: node.args[0], scope})

      return resolveUnionType(arg, (arg) => {
        if (arg.type === 'array') {
          return {type: 'number'}
        }

        return {type: 'null'} satisfies NullTypeNode
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
    default: {
      return {type: 'unknown'}
    }
  }
}
