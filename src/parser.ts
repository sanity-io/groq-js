/* eslint-disable camelcase */
import * as NodeTypes from './nodeTypes'
import {Mark, MarkProcessor, MarkVisitor} from './markProcessor'
import {GroqFunctionArity, namespaces, pipeFunctions} from './evaluator/functions'
import {parse as rawParse} from './rawParser'
import {
  TraversalResult,
  traverseArray,
  traverseElement,
  traversePlain,
  traverseProjection,
} from './traversal'
import {tryConstantEvaluate} from './evaluator'
import {ParseOptions} from './types'

type EscapeSequences = "'" | '"' | '\\' | '/' | 'b' | 'f' | 'n' | 'r' | 't'

const ESCAPE_SEQUENCE: {[key in EscapeSequences]: string} = {
  "'": "'",
  '"': '"',
  '\\': '\\',
  '/': '/',
  b: '\b',
  f: '\f',
  n: '\n',
  r: '\r',
  t: '\t',
}

function expandHex(str: string): string {
  const charCode = parseInt(str, 16)
  return String.fromCharCode(charCode)
}

class GroqQueryError extends Error {
  public name = 'GroqQueryError'
}

const EXPR_BUILDER: MarkVisitor<NodeTypes.ExprNode> = {
  group(p) {
    const inner = p.process(EXPR_BUILDER)
    return {
      type: 'Group',
      base: inner,
    }
  },

  everything() {
    return {type: 'Everything'}
  },

  this() {
    return {type: 'This'}
  },

  parent() {
    return {
      type: 'Parent',
      n: 1,
    }
  },

  dblparent(p) {
    const next = p.process(EXPR_BUILDER) as NodeTypes.ParentNode
    return {
      type: 'Parent',
      n: next.n + 1,
    }
  },

  traverse(p) {
    const base = p.process(EXPR_BUILDER)
    const traversalList: Array<(right: TraversalResult | null) => TraversalResult> = []
    while (p.getMark().name !== 'traversal_end') {
      traversalList.push(p.process(TRAVERSE_BUILDER))
    }
    p.shift()
    let traversal: TraversalResult | null = null
    for (let i = traversalList.length - 1; i >= 0; i--) {
      traversal = traversalList[i](traversal)
    }
    if (base.type === 'Everything' || base.type === 'Array' || base.type === 'PipeFuncCall') {
      traversal = traverseArray((val) => val, traversal)
    }
    if (traversal === null) throw new Error('BUG: unexpected empty traversal')
    return traversal.build(base)
  },

  this_attr(p) {
    const name = p.processString()

    if (name === 'null') {
      return {type: 'Value', value: null}
    }
    if (name === 'true') {
      return {type: 'Value', value: true}
    }
    if (name === 'false') {
      return {type: 'Value', value: false}
    }

    return {
      type: 'AccessAttribute',
      name,
    }
  },

  neg(p) {
    const base = p.process(EXPR_BUILDER)

    return {
      type: 'Neg',
      base,
    }
  },

  pos(p) {
    const base = p.process(EXPR_BUILDER)

    return {
      type: 'Pos',
      base,
    }
  },

  add(p) {
    const left = p.process(EXPR_BUILDER)
    const right = p.process(EXPR_BUILDER)
    return {
      type: 'OpCall',
      op: '+',
      left,
      right,
    }
  },

  sub(p) {
    const left = p.process(EXPR_BUILDER)
    const right = p.process(EXPR_BUILDER)
    return {
      type: 'OpCall',
      op: '-',
      left,
      right,
    }
  },

  mul(p) {
    const left = p.process(EXPR_BUILDER)
    const right = p.process(EXPR_BUILDER)
    return {
      type: 'OpCall',
      op: '*',
      left,
      right,
    }
  },

  div(p) {
    const left = p.process(EXPR_BUILDER)
    const right = p.process(EXPR_BUILDER)
    return {
      type: 'OpCall',
      op: '/',
      left,
      right,
    }
  },

  mod(p) {
    const left = p.process(EXPR_BUILDER)
    const right = p.process(EXPR_BUILDER)
    return {
      type: 'OpCall',
      op: '%',
      left,
      right,
    }
  },

  pow(p) {
    const left = p.process(EXPR_BUILDER)
    const right = p.process(EXPR_BUILDER)
    return {
      type: 'OpCall',
      op: '**',
      left,
      right,
    }
  },

  comp(p) {
    const left = p.process(EXPR_BUILDER)
    const op = p.processString() as NodeTypes.OpCall
    const right = p.process(EXPR_BUILDER)
    return {
      type: 'OpCall',
      op: op,
      left: left,
      right: right,
    }
  },

  in_range(p) {
    const base = p.process(EXPR_BUILDER)
    const isInclusive = p.getMark().name === 'inc_range'
    p.shift()
    const left = p.process(EXPR_BUILDER)
    const right = p.process(EXPR_BUILDER)
    return {
      type: 'InRange',
      base,
      left,
      right,
      isInclusive,
    }
  },

  str(p) {
    let value = ''
    // eslint-disable-next-line no-labels
    loop: while (p.hasMark()) {
      const mark = p.getMark()
      switch (mark.name) {
        case 'str_end':
          value += p.processStringEnd()
          // eslint-disable-next-line no-labels
          break loop
        case 'str_pause':
          value += p.processStringEnd()
          break
        case 'str_start':
          p.shift()
          break
        case 'single_escape': {
          const char = p.slice(1)
          p.shift()
          value += ESCAPE_SEQUENCE[char as EscapeSequences]
          break
        }
        case 'unicode_hex':
          p.shift()
          value += expandHex(p.processStringEnd())
          break
        default:
          throw new Error(`unexpected mark: ${mark.name}`)
      }
    }
    return {type: 'Value', value}
  },

  integer(p) {
    const strValue = p.processStringEnd()
    return {
      type: 'Value',
      value: Number(strValue),
    }
  },

  float(p) {
    const strValue = p.processStringEnd()
    return {
      type: 'Value',
      value: Number(strValue),
    }
  },

  sci(p) {
    const strValue = p.processStringEnd()
    return {
      type: 'Value',
      value: Number(strValue),
    }
  },

  object(p) {
    const attributes: NodeTypes.ObjectAttributeNode[] = []
    while (p.getMark().name !== 'object_end') {
      attributes.push(p.process(OBJECT_BUILDER))
    }
    p.shift()

    return {
      type: 'Object',
      attributes,
    }
  },

  array(p) {
    const elements: NodeTypes.ArrayElementNode[] = []
    while (p.getMark().name !== 'array_end') {
      let isSplat = false
      if (p.getMark().name === 'array_splat') {
        isSplat = true
        p.shift()
      }
      const value = p.process(EXPR_BUILDER)
      elements.push({
        type: 'ArrayElement',
        value,
        isSplat,
      })
    }
    p.shift()
    return {
      type: 'Array',
      elements: elements,
    }
  },

  tuple(p) {
    const members: NodeTypes.ExprNode[] = []
    while (p.getMark().name !== 'tuple_end') {
      members.push(p.process(EXPR_BUILDER))
    }
    p.shift()
    return {
      type: 'Tuple',
      members,
    }
  },

  func_call(p) {
    let namespace = 'global'
    if (p.getMark().name === 'namespace') {
      p.shift()
      namespace = p.processString()
    }

    const name = p.processString()
    if (namespace === 'global' && name === 'select') {
      const result: NodeTypes.SelectNode = {
        type: 'Select',
        alternatives: [],
      }

      while (p.getMark().name !== 'func_args_end') {
        if (p.getMark().name === 'pair') {
          if (result.fallback) throw new GroqQueryError(`unexpected argument to select()`)
          p.shift()
          const condition = p.process(EXPR_BUILDER)
          const value = p.process(EXPR_BUILDER)
          result.alternatives.push({
            type: 'SelectAlternative',
            condition,
            value,
          })
        } else {
          if (result.fallback) throw new GroqQueryError(`unexpected argument to select()`)
          const value = p.process(EXPR_BUILDER)
          result.fallback = value
        }
      }
      p.shift()
      return result
    }

    const args: NodeTypes.ExprNode[] = []

    while (p.getMark().name !== 'func_args_end') {
      if (argumentShouldBeSelector(namespace, name, args.length)) {
        // Since the diff/delta functions aren't validated yet we only want to validate the selector
        // being used. We expect the null valued arg to throw an error at evaluation time.
        p.process(SELECTOR_BUILDER)
        args.push({type: 'Selector'})
      } else {
        args.push(p.process(EXPR_BUILDER))
      }
    }

    p.shift()

    if (namespace === 'global' && (name === 'before' || name === 'after')) {
      if (p.parseOptions.mode === 'delta') {
        return {
          type: 'Context',
          key: name,
        }
      }
    }

    if (namespace === 'global' && name === 'boost' && !p.allowBoost)
      throw new GroqQueryError('unexpected boost')

    const funcs = namespaces[namespace]
    if (!funcs) {
      throw new GroqQueryError(`Undefined namespace: ${namespace}`)
    }

    const func = funcs[name]
    if (!func) {
      throw new GroqQueryError(`Undefined function: ${name}`)
    }
    if (func.arity !== undefined) {
      validateArity(name, func.arity, args.length)
    }

    if (func.mode !== undefined && func.mode !== p.parseOptions.mode) {
      throw new GroqQueryError(`Undefined function: ${name}`)
    }

    return {
      type: 'FuncCall',
      func,
      name,
      args,
    }
  },

  pipecall(p) {
    const base = p.process(EXPR_BUILDER)
    p.shift() // Remove the func_call

    let namespace = 'global'
    if (p.getMark().name === 'namespace') {
      p.shift()
      namespace = p.processString()
    }
    if (namespace !== 'global') {
      throw new GroqQueryError(`Undefined namespace: ${namespace}`)
    }

    const name = p.processString()
    const args: NodeTypes.ExprNode[] = []

    const oldAllowBoost = p.allowBoost
    if (name === 'score') {
      // Only allow boost inside a score expression
      p.allowBoost = true
    }

    for (;;) {
      const markName = p.getMark().name
      if (markName === 'func_args_end') {
        break
      }

      if (name === 'order') {
        if (markName === 'asc') {
          p.shift()
          args.push({type: 'Asc', base: p.process(EXPR_BUILDER)})
          continue
        } else if (markName === 'desc') {
          p.shift()
          args.push({type: 'Desc', base: p.process(EXPR_BUILDER)})
          continue
        }
      }

      args.push(p.process(EXPR_BUILDER))
    }
    p.shift()

    p.allowBoost = oldAllowBoost

    const func = pipeFunctions[name]
    if (!func) {
      throw new GroqQueryError(`Undefined pipe function: ${name}`)
    }
    if (func.arity) {
      validateArity(name, func.arity, args.length)
    }

    return {
      type: 'PipeFuncCall',
      func,
      base,
      name,
      args,
    }
  },

  pair(p) {
    throw new GroqQueryError(`unexpected =>`)
  },

  and(p) {
    const left = p.process(EXPR_BUILDER)
    const right = p.process(EXPR_BUILDER)
    return {
      type: 'And',
      left,
      right,
    }
  },

  or(p) {
    const left = p.process(EXPR_BUILDER)
    const right = p.process(EXPR_BUILDER)
    return {
      type: 'Or',
      left,
      right,
    }
  },

  not(p) {
    const base = p.process(EXPR_BUILDER)
    return {
      type: 'Not',
      base,
    }
  },

  asc(p) {
    throw new GroqQueryError('unexpected asc')
  },

  desc(p) {
    throw new GroqQueryError('unexpected desc')
  },

  param(p) {
    const name = p.processString()

    if (p.parseOptions.params && p.parseOptions.params.hasOwnProperty(name)) {
      return {
        type: 'Value',
        value: p.parseOptions.params[name],
      }
    }

    return {
      type: 'Parameter',
      name,
    }
  },
}

const OBJECT_BUILDER: MarkVisitor<NodeTypes.ObjectAttributeNode> = {
  object_expr(p) {
    if (p.getMark().name === 'pair') {
      p.shift()
      const condition = p.process(EXPR_BUILDER)
      const value = p.process(EXPR_BUILDER)

      return {
        type: 'ObjectConditionalSplat',
        condition,
        value,
      }
    }

    const value = p.process(EXPR_BUILDER)

    return {
      type: 'ObjectAttributeValue',
      name: extractPropertyKey(value),
      value,
    }
  },

  object_pair(p) {
    const name = p.process(EXPR_BUILDER)
    if (name.type !== 'Value') throw new Error('name must be string')

    const value = p.process(EXPR_BUILDER)
    return {
      type: 'ObjectAttributeValue',
      name: name.value,
      value: value,
    }
  },

  object_splat(p): NodeTypes.ObjectSplatNode {
    const value = p.process(EXPR_BUILDER)

    return {
      type: 'ObjectSplat',
      value,
    }
  },

  object_splat_this(): NodeTypes.ObjectSplatNode {
    return {
      type: 'ObjectSplat',
      value: {type: 'This'},
    }
  },
}

const TRAVERSE_BUILDER: MarkVisitor<(rhs: TraversalResult | null) => TraversalResult> = {
  square_bracket(p) {
    const expr = p.process(EXPR_BUILDER)

    const value = tryConstantEvaluate(expr)
    if (value && value.type === 'number') {
      return (right) =>
        traverseElement((base) => ({type: 'AccessElement', base, index: value.data}), right)
    }

    if (value && value.type === 'string') {
      return (right) =>
        traversePlain((base) => ({type: 'AccessAttribute', base, name: value.data}), right)
    }

    return (right) =>
      traverseArray(
        (base) => ({
          type: 'Filter',
          base,
          expr,
        }),
        right
      )
  },

  slice(p) {
    const isInclusive = p.getMark().name === 'inc_range'
    p.shift()

    const left = p.process(EXPR_BUILDER)
    const right = p.process(EXPR_BUILDER)

    const leftValue = tryConstantEvaluate(left)
    const rightValue = tryConstantEvaluate(right)

    if (!leftValue || !rightValue || leftValue.type !== 'number' || rightValue.type !== 'number') {
      throw new GroqQueryError('slicing must use constant numbers')
    }

    return (rhs) =>
      traverseArray(
        (base) => ({
          type: 'Slice',
          base,
          left: leftValue.data,
          right: rightValue.data,
          isInclusive,
        }),
        rhs
      )
  },

  projection(p) {
    const obj = p.process(EXPR_BUILDER)
    return (right) =>
      traverseProjection((base) => ({type: 'Projection', base: base, expr: obj}), right)
  },

  attr_access(p) {
    const name = p.processString()

    return (right) => traversePlain((base) => ({type: 'AccessAttribute', base, name}), right)
  },

  deref(p) {
    let attr: string | null = null

    if (p.getMark().name === 'deref_attr') {
      p.shift()
      attr = p.processString()
    }

    const wrap = (base: NodeTypes.ExprNode): NodeTypes.ExprNode =>
      attr ? {type: 'AccessAttribute', base, name: attr} : base

    return (right) =>
      traversePlain(
        (base) =>
          wrap({
            type: 'Deref',
            base,
          }),
        right
      )
  },

  array_postfix(p) {
    return (right) => traverseArray((base) => ({type: 'ArrayCoerce', base}), right)
  },
}

const SELECTOR_BUILDER: MarkVisitor<null> = {
  group(p) {
    p.process(SELECTOR_BUILDER)
    return null
  },

  everything() {
    throw new Error('Invalid selector syntax')
  },

  this() {
    throw new Error('Invalid selector syntax')
  },

  parent() {
    throw new Error('Invalid selector syntax')
  },

  dblparent(p) {
    throw new Error('Invalid selector syntax')
  },

  traverse(p) {
    p.process(SELECTOR_BUILDER)
    while (p.getMark().name !== 'traversal_end') {
      p.process(TRAVERSE_BUILDER)
    }

    p.shift()
    return null
  },

  this_attr(p) {
    p.processString()
    return null
  },

  neg(p) {
    throw new Error('Invalid selector syntax')
  },

  pos(p) {
    throw new Error('Invalid selector syntax')
  },

  add(p) {
    throw new Error('Invalid selector syntax')
  },

  sub(p) {
    throw new Error('Invalid selector syntax')
  },

  mul(p) {
    throw new Error('Invalid selector syntax')
  },

  div(p) {
    throw new Error('Invalid selector syntax')
  },

  mod(p) {
    throw new Error('Invalid selector syntax')
  },

  pow(p) {
    throw new Error('Invalid selector syntax')
  },

  comp(p) {
    throw new Error('Invalid selector syntax')
  },

  in_range(p) {
    throw new Error('Invalid selector syntax')
  },

  str(p) {
    throw new Error('Invalid selector syntax')
  },

  integer(p) {
    throw new Error('Invalid selector syntax')
  },

  float(p) {
    throw new Error('Invalid selector syntax')
  },

  sci(p) {
    throw new Error('Invalid selector syntax')
  },

  object(p) {
    throw new Error('Invalid selector syntax')
  },

  array(p) {
    throw new Error('Invalid selector syntax')
  },

  tuple(p) {
    // This should only throw an error until we add support for tuples in selectors.
    throw new Error('Invalid selector syntax')
  },

  func_call(p, mark) {
    const func = EXPR_BUILDER.func_call(p, mark) as NodeTypes.FuncCallNode
    if (func.name === 'anywhere' && func.args.length === 1) return null

    throw new Error('Invalid selector syntax')
  },

  pipecall(p) {
    throw new Error('Invalid selector syntax')
  },

  pair(p) {
    throw new Error('Invalid selector syntax')
  },

  and(p) {
    throw new Error('Invalid selector syntax')
  },

  or(p) {
    throw new Error('Invalid selector syntax')
  },

  not(p) {
    throw new Error('Invalid selector syntax')
  },

  asc(p) {
    throw new Error('Invalid selector syntax')
  },

  desc(p) {
    throw new Error('Invalid selector syntax')
  },

  param(p) {
    throw new Error('Invalid selector syntax')
  },
}

function extractPropertyKey(node: NodeTypes.ExprNode): string {
  if (node.type === 'AccessAttribute' && !node.base) {
    return node.name
  }

  if (
    node.type === 'Deref' ||
    node.type === 'Map' ||
    node.type === 'Projection' ||
    node.type === 'Slice' ||
    node.type === 'Filter' ||
    node.type === 'AccessElement' ||
    node.type === 'ArrayCoerce'
  ) {
    return extractPropertyKey(node.base)
  }

  throw new GroqQueryError(`Cannot determine property key for type: ${node.type}`)
}

function validateArity(name: string, arity: GroqFunctionArity, count: number) {
  if (typeof arity === 'number') {
    if (count !== arity) {
      throw new GroqQueryError(
        `Incorrect number of arguments to function ${name}(). Expected ${arity}, got ${count}.`
      )
    }
  } else if (arity) {
    if (!arity(count)) {
      throw new GroqQueryError(`Incorrect number of arguments to function ${name}().`)
    }
  }
}

function argumentShouldBeSelector(namespace: string, functionName: string, argCount: number) {
  const functionsRequiringSelectors = ['changedAny', 'changedOnly']

  return namespace == 'diff' && argCount == 2 && functionsRequiringSelectors.includes(functionName)
}

class GroqSyntaxError extends Error {
  public position: number
  public name = 'GroqSyntaxError'

  constructor(position: number) {
    super(`Syntax error in GROQ query at position ${position}`)
    this.position = position
  }
}

/**
 * Parses a GROQ query and returns a tree structure.
 */
export function parse(input: string, options: ParseOptions = {}): NodeTypes.ExprNode {
  const result = rawParse(input)
  if (result.type === 'error') {
    throw new GroqSyntaxError(result.position)
  }
  const processor = new MarkProcessor(input, result.marks as Mark[], options)
  return processor.process(EXPR_BUILDER)
}
