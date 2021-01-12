import * as NodeTypes from './nodeTypes'
import {Mark, MarkProcessor, MarkVisitor, MarkName} from './markProcessor'
import {functions, GroqFunctionArity, pipeFunctions} from './evaluator/functions'
import {parse as rawParse} from './rawParser'
import {addMapper, switchMapState} from './mapHelpers'

function isValueNode(node: NodeTypes.SyntaxNode): node is NodeTypes.ValueNode {
  return node.type === 'Value'
}

function isNumber(node: NodeTypes.SyntaxNode): node is NodeTypes.ValueNode<number> {
  return isValueNode(node) && typeof node.value === 'number'
}

function isString(node: NodeTypes.SyntaxNode): node is NodeTypes.ValueNode<string> {
  return isValueNode(node) && typeof node.value === 'string'
}

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
  t: '\t'
}

function expandHex(str: string): string {
  let charCode = parseInt(str, 16)
  return String.fromCharCode(charCode)
}

function expandEscapeSequence(str: String): string {
  let re = /\\(['"/\\bfnrt]|u([A-Fa-f0-9]{4})|u\{([A-Fa-f0-9]+)\})/g
  return str.replace(
    re,
    (_: string, esc: EscapeSequences, u1?: string | null, u2?: string | null) => {
      if (u1) return expandHex(u1)
      if (u2) return expandHex(u2)
      return ESCAPE_SEQUENCE[esc]
    }
  )
}

export type NodeBuilder<P = NodeTypes.SyntaxNode> = (
  this: MarkVisitor,
  processor: MarkProcessor,
  mark: Mark
) => P

export type NodeBuilderArgs = [MarkProcessor, Mark]

class GroqQueryError extends Error {
  public name: 'GroqQueryError'
}

const BUILDER: {[key in MarkName]?: NodeBuilder} = {
  paren(p): NodeTypes.ParenthesisNode {
    let inner = p.process()
    return {
      type: 'Parenthesis',
      base: inner
    }
  },

  filter(p): NodeTypes.SyntaxNode {
    let base = p.process() as NodeTypes.SyntaxNode
    let prevMapState = p.prevMapState
    let query = p.process()

    if (isNumber(query)) {
      return {
        type: 'Element',
        base,
        index: query
      }
    }

    let mapState = (p.nextMapState = switchMapState(base, prevMapState, 'array'))

    if (isString(query)) {
      addMapper(mapState, {
        type: 'Attribute',
        key: query.value
      })
    } else if (query.type === 'Range') {
      addMapper(mapState, {
        type: 'Slice',
        left: query.left,
        right: query.right,
        isExclusive: query.isExclusive
      })
    } else {
      addMapper(mapState, {
        type: 'Filter',
        expr: query
      })
    }

    return mapState.base
  },

  project(p): NodeTypes.SyntaxNode {
    let base = p.process() as NodeTypes.SyntaxNode
    let prevMapState = p.prevMapState
    let expr = p.process()

    let mapState = (p.nextMapState = switchMapState(base, prevMapState, 'simple'))
    addMapper(mapState, {type: 'Projection', expr})
    return mapState.base
  },

  star(p): NodeTypes.SyntaxNode {
    let base: NodeTypes.SyntaxNode = {type: 'Star'}

    if (p.options.datasetIsArray) {
      let mapState = (p.nextMapState = switchMapState(base, undefined, 'array'))
      base = mapState.base
    }

    return base
  },

  this(): NodeTypes.ThisNode {
    return {type: 'This'}
  },

  parent(): NodeTypes.ParentNode {
    return {
      type: 'Parent',
      n: 1
    }
  },

  dblparent(p): NodeTypes.ParentNode {
    let next = p.process() as NodeTypes.ParentNode
    return {
      type: 'Parent',
      n: next.n + 1
    }
  },

  ident(p): NodeTypes.ValueNode | NodeTypes.IdentifierNode {
    let name = p.processStringEnd()

    if (name === 'null') return {type: 'Value', value: null}
    if (name === 'true') return {type: 'Value', value: true}
    if (name === 'false') return {type: 'Value', value: false}

    return {
      type: 'Identifier',
      name: name
    }
  },

  attr_ident(p): NodeTypes.SyntaxNode {
    let base = p.process() as NodeTypes.SyntaxNode
    let prevMapState = p.prevMapState
    let key = p.processString()

    let mapState = (p.nextMapState = switchMapState(base, prevMapState, 'simple'))
    addMapper(mapState, {type: 'Attribute', key})
    return mapState.base
  },

  arr_expr(p): NodeTypes.SyntaxNode {
    let base = p.process() as NodeTypes.SyntaxNode
    let prevMapState = p.prevMapState
    let mapState = (p.nextMapState = switchMapState(base, prevMapState, 'array'))
    return mapState.base
  },

  inc_range(p): NodeTypes.RangeNode {
    let left = p.process() as NodeTypes.ValueNode<number>
    let right = p.process() as NodeTypes.ValueNode<number>
    return {
      type: 'Range',
      left,
      right,
      isExclusive: false
    }
  },

  exc_range(p): NodeTypes.RangeNode {
    let left = p.process() as NodeTypes.ValueNode<number>
    let right = p.process() as NodeTypes.ValueNode<number>
    return {
      type: 'Range',
      left,
      right,
      isExclusive: true
    }
  },

  neg(p): NodeTypes.ValueNode | NodeTypes.NegNode {
    let base = p.process()

    if (base.type === 'Value' && typeof base.value === 'number') {
      return {
        type: 'Value',
        value: -base.value
      }
    }

    return {
      type: 'Neg',
      base
    }
  },

  pos(p): NodeTypes.ValueNode | NodeTypes.PosNode {
    let base = p.process()

    if (isNumber(base)) {
      return {
        type: 'Value',
        value: +base.value
      }
    }

    return {
      type: 'Pos',
      base
    }
  },

  add(p): NodeTypes.OpCallNode {
    let left = p.process()
    let right = p.process()
    return {
      type: 'OpCall',
      op: '+',
      left,
      right
    }
  },

  sub(p): NodeTypes.OpCallNode {
    let left = p.process()
    let right = p.process()
    return {
      type: 'OpCall',
      op: '-',
      left,
      right
    }
  },

  mul(p): NodeTypes.OpCallNode {
    let left = p.process()
    let right = p.process()
    return {
      type: 'OpCall',
      op: '*',
      left,
      right
    }
  },

  div(p): NodeTypes.OpCallNode {
    let left = p.process()
    let right = p.process()
    return {
      type: 'OpCall',
      op: '/',
      left,
      right
    }
  },

  mod(p): NodeTypes.OpCallNode {
    let left = p.process()
    let right = p.process()
    return {
      type: 'OpCall',
      op: '%',
      left,
      right
    }
  },

  pow(p): NodeTypes.OpCallNode {
    let left = p.process()
    let right = p.process()
    return {
      type: 'OpCall',
      op: '**',
      left,
      right
    }
  },

  deref(p): NodeTypes.SyntaxNode {
    let base = p.process()
    let prevMapState = p.prevMapState

    let nextMark = p.getMark()
    let name: string | undefined = undefined

    if (nextMark && nextMark.name === 'deref_field') {
      name = p.processString()
    }

    let mapState = (p.nextMapState = switchMapState(base, prevMapState, 'simple'))
    addMapper(mapState, {type: 'Deref'})
    if (name !== undefined) {
      addMapper(mapState, {type: 'Attribute', key: name})
    }
    return mapState.base
  },

  comp(p): NodeTypes.OpCallNode {
    let left = p.process()
    let op = p.processString() as NodeTypes.OpCall
    let right = p.process()
    return {
      type: 'OpCall',
      op: op,
      left: left,
      right: right
    }
  },

  str_begin(p): NodeTypes.ValueNode<string> {
    let value = expandEscapeSequence(p.processStringEnd())
    return {
      type: 'Value',
      value: value
    }
  },

  integer(p): NodeTypes.ValueNode<number> {
    let strValue = p.processStringEnd()
    return {
      type: 'Value',
      value: Number(strValue)
    }
  },

  float(p): NodeTypes.ValueNode<number> {
    let strValue = p.processStringEnd()
    return {
      type: 'Value',
      value: Number(strValue)
    }
  },

  sci(p): NodeTypes.ValueNode<number> {
    let strValue = p.processStringEnd()
    return {
      type: 'Value',
      value: Number(strValue)
    }
  },

  pair(p): NodeTypes.PairNode {
    let left = p.process()
    let right = p.process()
    return {
      type: 'Pair',
      left,
      right
    }
  },

  object(p): NodeTypes.ObjectNode {
    let attributes: NodeTypes.ObjectAttributeNode[] = []
    while (p.getMark().name !== 'object_end') {
      attributes.push(p.process() as NodeTypes.ObjectAttributeNode)
    }
    p.shift()

    return {
      type: 'Object',
      attributes
    }
  },

  object_expr(p): NodeTypes.ObjectConditionalSplatNode | NodeTypes.ObjectAttributeNode {
    let value = p.process()

    if (value.type === 'Pair') {
      return {
        type: 'ObjectConditionalSplat',
        condition: value.left,
        value: value.right
      }
    }

    return {
      type: 'ObjectAttribute',
      key: {
        type: 'Value',
        value: extractPropertyKey(value)
      },
      value: value as NodeTypes.ValueNode
    }
  },

  object_pair(p): NodeTypes.ObjectAttributeNode {
    let key = p.process()
    let value = p.process()
    return {
      type: 'ObjectAttribute',
      key: key as NodeTypes.ValueNode<string>,
      value: value as NodeTypes.ValueNode
    }
  },

  object_splat(p): NodeTypes.ObjectSplatNode {
    let value = p.process()

    return {
      type: 'ObjectSplat',
      value
    }
  },

  object_splat_this(): NodeTypes.ObjectSplatNode {
    return {
      type: 'ObjectSplat',
      value: {type: 'This'}
    }
  },

  array(p): NodeTypes.ArrayNode {
    let elements: NodeTypes.ArrayElementNode[] = []
    while (p.getMark().name !== 'array_end') {
      let isSplat = false
      if (p.getMark().name === 'array_splat') {
        isSplat = true
        p.shift()
      }
      let value = p.process()
      elements.push({
        type: 'ArrayElement',
        value,
        isSplat
      })
    }
    p.shift()
    return {
      type: 'Array',
      elements: elements
    }
  },

  func_call(p): NodeTypes.FuncCallNode {
    let name = p.processStringEnd()
    let args: NodeTypes.SyntaxNode[] = []
    while (p.getMark().name !== 'func_args_end') {
      args.push(p.process())
    }
    p.shift()

    let func = functions[name]
    if (!func) {
      throw new GroqQueryError(`Undefined function: ${name}`)
    }
    validateArity(name, func.arity, args.length)

    return {
      type: 'FuncCall',
      func,
      name,
      args
    }
  },

  pipecall(p): NodeTypes.PipeFuncCallNode {
    let base = p.process()
    let name = p.processString()
    let args: NodeTypes.SyntaxNode[] = []

    while (true) {
      let markName = p.getMark().name
      if (markName === 'func_args_end') break

      if (name === 'order') {
        if (markName === 'asc') {
          p.shift()
          args.push({type: 'Asc', base: p.process()})
          continue
        } else if (markName === 'desc') {
          p.shift()
          args.push({type: 'Desc', base: p.process()})
          continue
        }
      }

      args.push(p.process())
    }
    p.shift()

    let func = pipeFunctions[name]
    if (!func) {
      throw new GroqQueryError(`Undefined pipe function: ${name}`)
    }
    validateArity(name, func.arity, args.length)

    return {
      type: 'PipeFuncCall',
      func,
      base,
      name: func.name,
      args
    }
  },

  and(p): NodeTypes.AndNode {
    let left = p.process()
    let right = p.process()
    return {
      type: 'And',
      left,
      right
    }
  },

  or(p): NodeTypes.OrNode {
    let left = p.process()
    let right = p.process()
    return {
      type: 'Or',
      left,
      right
    }
  },

  not(p): NodeTypes.NotNode {
    let base = p.process()
    return {
      type: 'Not',
      base
    }
  },

  asc(p): NodeTypes.AscNode {
    throw new GroqQueryError('unexpected asc')
  },

  desc(p): NodeTypes.DescNode {
    throw new GroqQueryError('unexpected desc')
  },

  param(p): NodeTypes.ParameterNode {
    let name = p.processStringEnd()

    return {
      type: 'Parameter',
      name
    }
  }
}

type NestedPropertyType = NodeTypes.IdentifierNode | NodeTypes.MapNode | NodeTypes.ElementNode

const NESTED_PROPERTY_TYPES = ['Map', 'Element', 'Slice']

function isNestedPropertyType(node: NodeTypes.SyntaxNode): node is NestedPropertyType {
  return NESTED_PROPERTY_TYPES.includes(node.type)
}

function extractPropertyKey(node: NodeTypes.SyntaxNode): string {
  if (node.type === 'Identifier') {
    return node.name
  }

  if (isNestedPropertyType(node)) {
    return extractPropertyKey(node.base)
  }

  throw new GroqQueryError('Cannot determine property key for type: ' + node.type)
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

class GroqSyntaxError extends Error {
  public position: number
  public name = 'GroqSyntaxError'

  constructor(position: number) {
    super(`Syntax error in GROQ query at position ${position}`)
    this.position = position
  }
}

export type GroqParseOptions = {
  datasetIsArray: boolean
}

/**
 * Parses a GROQ query and returns a tree structure.
 */
export function parse(input: string, {datasetIsArray = true}: Partial<GroqParseOptions> = {}) {
  let result = rawParse(input)
  if (result.type === 'error') throw new GroqSyntaxError(result.position)
  let processor = new MarkProcessor(BUILDER, input, result.marks as Mark[], {datasetIsArray})
  return processor.process()
}
