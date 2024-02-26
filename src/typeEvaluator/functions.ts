import {FuncCallNode} from '../nodeTypes'
import {walk} from './evaluateQueryType'
import {Scope} from './scope'
import {NullTypeNode, TypeNode} from './types'

export function handleFuncCallNode(node: FuncCallNode, scope: Scope): TypeNode {
  switch (`${node.namespace}.${node.name}`) {
    case 'global.defined': {
      return {type: 'unknown'}
    }
    case 'global.coalesce': {
      if (node.args.length === 0) {
        return {type: 'null'} satisfies NullTypeNode
      }

      return {
        type: 'union',
        of: node.args.map((arg) => walk({node: arg, scope})),
      }
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
