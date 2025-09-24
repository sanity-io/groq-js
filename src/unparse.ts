import type {ExprNode} from './nodeTypes'

const IDENT_RE = /^[a-zA-Z_][a-zA-Z_0-9]*/

export function unparse(node: ExprNode): string {
  switch (node.type) {
    case 'AccessAttribute':
      if (IDENT_RE.test(node.name)) {
        return node.base ? `${unparse(node.base)}.${node.name}` : node.name
      }

      return `${unparse(node.base || {type: 'This'})}[${JSON.stringify(node.name)}]`
    case 'And':
      return `${unparse(node.left)} && ${unparse(node.right)}`
    case 'Or':
      return `${unparse(node.left)} || ${unparse(node.right)}`
    case 'AccessElement':
      return `${unparse(node.base)}[${node.index}]`
    case 'Filter':
      return `${unparse(node.base)}[${unparse(node.expr)}]`
    case 'Everything':
      return '*'
    case 'This':
      return '@'
    case 'Value':
      return JSON.stringify(node.value)
    case 'OpCall':
      return `${unparse(node.left)} ${node.op} ${unparse(node.right)}`
    case 'PipeFuncCall':
      return `${unparse(node.base)}|${node.name}(${node.args.map(unparse).join(', ')})`
    case 'Array':
      return `[${node.elements
        .map(({value, isSplat}) => {
          const inner = unparse(value)
          return isSplat ? `...${inner}` : inner
        })
        .join(', ')}]`
    case 'Asc':
      return `${unparse(node.base)} asc`
    case 'Desc':
      return `${unparse(node.base)} desc`
    case 'ArrayCoerce':
      return `${unparse(node.base)}[]`
    case 'Deref':
      return `${unparse(node.base)}->`
    case 'Map':
      return `${unparse(node.base)}${unparse(node.expr)}`
    case 'Projection':
      return `${unparse(node.base)}${unparse(node.expr)}`
    case 'Object':
      return `{${node.attributes
        .map((attr) => {
          switch (attr.type) {
            case 'ObjectAttributeValue':
              return `${JSON.stringify(attr.name)}: ${unparse(attr.value)}`
            case 'ObjectConditionalSplat':
              return `${unparse(attr.condition)} => ${unparse(attr.value)}`
            case 'ObjectSplat':
              return `...${unparse(attr.value)}`
          }
        })
        .join(', ')}}`
    case 'Pos':
      return `+${unparse(node.base)}`
    case 'Neg':
      return `-${unparse(node.base)}`
    case 'Group':
      return `(${unparse(node.base)})`
    case 'Not':
      return `!${unparse(node.base)}`
    case 'InRange':
      return `${unparse(node.base)} in ${unparse(node.left)}${node.isInclusive ? '..' : '...'}${unparse(node.right)}`
    case 'Parent':
      return Array.from({length: node.n}, () => '^').join('.')
    case 'Parameter':
      return `$${node.name}`
    case 'Slice':
      return `${unparse(node.base)}[${node.left}${node.isInclusive ? '..' : '...'}${node.right}]`
    case 'FuncCall':
      return `${node.namespace}::${node.name}(${node.args.map(unparse).join(', ')})`
    case 'FlatMap':
      return `${unparse(node.base)}${unparse(node.expr)}`
    case 'Select':
      const args = node.alternatives.map(
        ({condition, value}) => `${unparse(condition)} => ${unparse(value)}`,
      )
      if (node.fallback) args.push(unparse(node.fallback))
      return `select(${args.join(', ')})`
    case 'Tuple':
      return `(${node.members.map(unparse).join(', ')})`
    default:
      throw new Error(`TODO: ${node.type}`)
  }
}
