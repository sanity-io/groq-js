import type {ExprNode} from './nodeTypes'

const IDENT_RE = /^[a-zA-Z_][a-zA-Z_0-9]*/
const isIdent = (s: string) => IDENT_RE.test(s)
const json = (v: unknown) => JSON.stringify(v)

/** Property accessor: `.name` if identifier-like, else `["name"]` */
const prop = (name: string) => (isIdent(name) ? `.${name}` : `[${json(name)}]`)
/** Property accessor with a custom prefix (e.g. `->`) */
const propWith = (prefix: string, name: string) =>
  `${prefix}${isIdent(name) ? `.${name}` : `[${json(name)}]`}`

/** Join args with `, ` after unparsing */
const joinArgs = (args: ExprNode[]) => args.map(unparse).join(', ')

/**
 * Converts a GROQ AST node back into a GROQ query string.
 *
 * **Limitation**: This function cannot preserve parameter references. When a query
 * is parsed with parameters (e.g., `parse(query, {params: {name: "value"}})`),
 * the parameters are resolved to their values in the AST. Unparsing such a tree
 * will produce literals instead of parameter references (e.g., `"value"` instead
 * of `$name`). This means `parse(unparse(tree))` will produce a different AST
 * when the original tree contained resolved parameters.
 */
// eslint-disable-next-line complexity
export function unparse(node: ExprNode): string {
  switch (node.type) {
    case 'AccessAttribute': {
      // Prefer dotted access for identifiers, else bracket access.
      if (isIdent(node.name)) {
        return node.base ? `${unparse(node.base)}.${node.name}` : node.name
      }
      // If there's no base, treat it like `This` for bracketed access.
      const base = node.base || {type: 'This'}
      return `${unparse(base)}[${json(node.name)}]`
    }

    case 'AccessElement':
      return `${unparse(node.base)}[${node.index}]`

    case 'Array':
      return `[${node.elements
        .map(({value, isSplat}) => (isSplat ? `...${unparse(value)}` : unparse(value)))
        .join(', ')}]`

    case 'ArrayCoerce':
      return `${unparse(node.base)}[]`

    case 'Asc':
      return `${unparse(node.base)} asc`

    case 'Desc':
      return `${unparse(node.base)} desc`

    case 'And':
      return `${unparse(node.left)} && ${unparse(node.right)}`

    case 'Or':
      return `${unparse(node.left)} || ${unparse(node.right)}`

    case 'OpCall':
      return `${unparse(node.left)} ${node.op} ${unparse(node.right)}`

    case 'Filter':
      return `${unparse(node.base)}[${unparse(node.expr)}]`

    case 'Everything':
      return '*'

    case 'This':
      return '@'

    case 'Value':
      return json(node.value)

    case 'PipeFuncCall':
      return `${unparse(node.base)}|${node.name}(${joinArgs(node.args)})`

    case 'FuncCall':
      return `${node.namespace}::${node.name}(${joinArgs(node.args)})`

    case 'Deref':
      return `${unparse(node.base)}->`

    case 'Map':
    case 'Projection':
      // Both serialize as base + map-expression
      return `${unparse(node.base)}${unparseMapExpr(node.expr)}`

    case 'FlatMap':
      return `${unparse(node.base)}${unparseFlatMapExpr(node.expr)}`

    case 'Object':
      return `{${node.attributes
        .map((attr) => {
          switch (attr.type) {
            case 'ObjectAttributeValue':
              return `${json(attr.name)}: ${unparse(attr.value)}`
            case 'ObjectConditionalSplat':
              return `${unparse(attr.condition)} => ${unparse(attr.value)}`
            case 'ObjectSplat':
              return `...${unparse(attr.value)}`
            default:
              throw new Error(`Unknown object attribute type: ${attr['type'] as string}`)
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
      return `${unparse(node.base)} in ${unparse(node.left)}${
        node.isInclusive ? '..' : '...'
      }${unparse(node.right)}`

    case 'Parent':
      return Array.from({length: node.n}, () => '^').join('.')

    case 'Parameter':
      return `$${node.name}`

    case 'Slice':
      return `${unparse(node.base)}[${node.left}${node.isInclusive ? '..' : '...'}${node.right}]`

    case 'Select': {
      const alts = node.alternatives.map(
        ({condition, value}) => `${unparse(condition)} => ${unparse(value)}`,
      )
      if (node.fallback) alts.push(unparse(node.fallback))
      return `select(${alts.join(', ')})`
    }

    case 'Tuple':
      return `(${node.members.map(unparse).join(', ')})`

    case 'SelectorFuncCall':
      return `${node.name}(${unparse(node.arg)})`

    case 'SelectorNested':
      return `${unparseSelector(node.base)}.(${unparseSelector(node.nested)})`

    default:
      throw new Error(`TODO: ${node['type'] as string}`)
  }
}

function unparseSelector(node: ExprNode): string {
  switch (node.type) {
    case 'AccessAttribute':
      return node.base ? `${unparseSelector(node.base)}.${node.name}` : node.name

    case 'Group':
      return `(${unparseSelector(node.base)})`

    case 'Tuple':
      return `(${node.members.map(unparseSelector).join(', ')})`

    case 'ArrayCoerce':
      return `${unparseSelector(node.base)}[]`

    case 'Filter':
      return `${unparseSelector(node.base)}[${unparse(node.expr)}]`

    case 'SelectorFuncCall':
      return `${node.name}(${unparse(node.arg)})`

    case 'SelectorNested':
      return `${unparseSelector(node.base)}.(${unparseSelector(node.nested)})`

    default:
      // Fall back to the general unparser when selector-specific cases don’t apply.
      return unparse(node)
  }
}

function unparseMapExpr(node: ExprNode): string {
  // AccessAttribute chains with special handling for This/Deref
  if (node.type === 'AccessAttribute') {
    // this.<name> / this["name"]
    if (node.base?.type === 'This') return prop(node.name)

    // this->.<name> / this->["name"]
    if (node.base?.type === 'Deref' && node.base.base?.type === 'This') {
      return propWith('->', node.name)
    }

    // (this.attr)->.<name> / ...->["name"]
    if (node.base?.type === 'Deref' && node.base.base?.type === 'AccessAttribute') {
      const derefBase = unparseMapExpr(node.base.base)
      return isIdent(node.name)
        ? `${derefBase}->.${node.name}`
        : `${derefBase}->[${json(node.name)}]`
    }

    // Generic attribute or element bases: append property
    if (node.base?.type === 'AccessAttribute' || node.base?.type === 'AccessElement') {
      const base = unparseMapExpr(node.base)
      return `${base}${prop(node.name)}`
    }
  }

  if (node.type === 'AccessElement') {
    const base = unparseMapExpr(node.base)
    return `${base}[${node.index}]`
  }

  if (node.type === 'Deref' && node.base?.type === 'This') {
    return '->'
  }

  if (node.type === 'ArrayCoerce') {
    return `${unparseMapExpr(node.base)}[]`
  }

  if (node.type === 'Filter') {
    return `${unparseMapExpr(node.base)}[${unparse(node.expr)}]`
  }

  if (node.type === 'Projection') {
    if (node.base?.type === 'This') return unparseMapExpr(node.expr)

    if (node.base?.type === 'Deref') {
      if (node.base.base?.type === 'This') return `->${unparse(node.expr)}`
      if (node.base.base?.type === 'AccessAttribute') {
        const derefBase = unparseMapExpr(node.base.base)
        return `${derefBase}->${unparse(node.expr)}`
      }
    }

    if (node.base?.type === 'Projection') {
      return unparseMapExpr(node.base) + unparse(node.expr)
    }
  }

  if (node.type === 'Map') return unparseMapExpr(node.expr)
  if (node.type === 'Object') return unparse(node)

  // Fallback to general unparse for anything else
  return unparse(node)
}

function unparseFlatMapExpr(node: ExprNode): string {
  if (node.type === 'AccessAttribute') {
    // this.<name> / this["name"]
    if (node.base?.type === 'This') return prop(node.name)

    if (node.base?.type === 'Deref') {
      // this->.<name> / this->["name"]
      if (node.base.base?.type === 'This') return propWith('->', node.name)

      // Deref with any base expression: <base>->.<name> / <base>->["name"]
      const derefBase = unparseFlatMapExpr(node.base.base)
      return isIdent(node.name)
        ? `${derefBase}->.${node.name}`
        : `${derefBase}->[${json(node.name)}]`
    }

    // Generic attribute/element bases
    if (node.base?.type === 'AccessAttribute' || node.base?.type === 'AccessElement') {
      const base = unparseFlatMapExpr(node.base)
      return `${base}${prop(node.name)}`
    }
  }

  if (node.type === 'AccessElement') {
    const base = unparseFlatMapExpr(node.base)
    return `${base}[${node.index}]`
  }

  if (node.type === 'ArrayCoerce') {
    return `${unparseFlatMapExpr(node.base)}[]`
  }

  if (node.type === 'Map') {
    const base = unparseFlatMapExpr(node.base)
    const expr = unparseMapExpr(node.expr)
    return `${base}${expr}`
  }

  if (node.type === 'FlatMap') {
    const base = unparseFlatMapExpr(node.base)
    const expr = unparseFlatMapExpr(node.expr)
    return `${base}${expr}`
  }

  if (node.type === 'Projection') {
    if (node.base?.type === 'This') return unparse(node.expr)
    if (node.base?.type === 'Deref' && node.base.base?.type === 'This') {
      return `->${unparse(node.expr)}`
    }
  }

  if (node.type === 'Deref' && node.base?.type === 'This') {
    return '->'
  }

  if (node.type === 'Filter') {
    const base = unparseFlatMapExpr(node.base)
    return `${base}[${unparse(node.expr)}]`
  }

  // Fallback to general unparse for anything else
  return unparse(node)
}
