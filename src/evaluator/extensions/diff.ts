import {ExprNode} from '../../nodeTypes'

const IDENT = /^[a-zA-Z_][a-zA-Z_0-9]*/
const INVALID_IDENTIFIERS = ['true', 'false', 'null']

export function validSelector(node: ExprNode): boolean {
  if (node.type !== 'Selector') return false
  const paths = node.paths

  let valid = true

  paths.forEach((path: ExprNode | undefined) => {
    while (path) {
      if (path.type !== 'AccessAttribute' || invalidAttributeName(path.name)) {
        valid = false
        break
      }

      path = path?.base
    }
  })

  return valid
}

function invalidAttributeName(name: string): boolean {
  return !name.match(IDENT) || INVALID_IDENTIFIERS.includes(name)
}
