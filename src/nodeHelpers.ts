import * as NodeTypes from './nodeTypes'

export function isValueNode(node: NodeTypes.SyntaxNode): node is NodeTypes.ValueNode {
  return node.type === 'Value'
}

export function isNumber(node: NodeTypes.SyntaxNode): node is NodeTypes.ValueNode<number> {
  return isValueNode(node) && typeof node.value === 'number'
}

export function isString(node: NodeTypes.SyntaxNode): node is NodeTypes.ValueNode<string> {
  return isValueNode(node) && typeof node.value === 'string'
}
