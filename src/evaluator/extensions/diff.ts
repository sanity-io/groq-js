import {ExprNode} from '../../nodeTypes'

const IDENT = /^[a-zA-Z_][a-zA-Z_0-9]*/
const INVALID_IDENTIFIERS = ['true', 'false', 'null']

export function validateSelector(node: ExprNode) {
  if (node.type !== 'Selector') throw new Error('Invalid selector')

  const paths = node.paths
  paths.forEach((path: ExprNode | undefined) => {
    while (path) {
      if (invalidPath(path)) throw new Error('Invalid selector')
      path = path?.base
    }
  })
}

function invalidPath(path: ExprNode): boolean {
  return (
    path.type !== 'AccessAttribute' ||
    !path.name.match(IDENT) ||
    INVALID_IDENTIFIERS.includes(path.name)
  )
}
