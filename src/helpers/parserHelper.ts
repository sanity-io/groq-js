import {AccessAttributeNode} from '../nodeTypes'
import {TraversalResult, traversePlain} from '../traversal'

type TraversalBuilder = ((right: any) => TraversalResult)[]

// We construct an array of traversals from an AccessAttributeNode that describe how to rebuild the
// node. This can be used to 'chain' the node to other traversals or access nodes.
export function buildTraversalForAccessNodes(node: AccessAttributeNode): TraversalBuilder {
  let traversals = []
  if (node.base) {
    while (node.base) {
      const traversal = buildPlainTraversalFromName(node.name)
      traversals.unshift(traversal)
      node = node.base as AccessAttributeNode
    }
  }

  // We've reached the root of our traversals, so we add this final traversal as the
  // base of our array.
  const traversal = buildPlainTraversalFromName(node.name)
  traversals.unshift(traversal)

  return traversals
}

function buildPlainTraversalFromName(name: string): (right: any) => TraversalResult {
  return (right: any) => traversePlain((base) => ({type: 'AccessAttribute', base, name}), right)
}
