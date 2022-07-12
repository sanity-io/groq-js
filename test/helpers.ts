import {AccessAttributeNode} from '../src/nodeTypes'

export function pathExpander(accessNode: AccessAttributeNode): string {
  let path = ''
  let node = accessNode

  while (node.base) {
    path = `.${node.name}${path}`
    node = node.base as AccessAttributeNode
  }

  path = `${node.name}${path}`

  return path
}
