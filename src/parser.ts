/* eslint-disable camelcase */
import {tryConstantEvaluate} from './evaluator'
import {type GroqFunctionArity, namespaces, pipeFunctions} from './evaluator/functions'
import {MarkProcessor, type MarkVisitor} from './markProcessor'
import {
  type ArrayElementNode,
  type ExprNode,
  type FuncCallNode,
  type FunctionDeclarationNode,
  isSelectorNested,
  type ObjectAttributeNode,
  type ObjectSplatNode,
  type OpCall,
  type ParameterNode,
  type ParentNode,
  type SelectNode,
  type SelectorNode,
} from './nodeTypes'
import {type CustomFunctions, parse as rawParse} from './rawParser'
import {
  type TraversalResult,
  traverseArray,
  traverseElement,
  traversePlain,
  traverseProjection,
} from './traversal'
import type {ParseOptions} from './types'
import {walkValidateCustomFunction} from './walk'

type EscapeSequences = "'" | '"' | '\\' | '/' | 'b' | 'f' | 'n' | 'r' | 't'

const ESCAPE_SEQUENCE: {[key in EscapeSequences]: string} = {
  "'": "'",
  '"': '"',
  '\\': '\\',
  '/': '/',
  'b': '\b',
  'f': '\f',
  'n': '\n',
  'r': '\r',
  't': '\t',
}

type TraverseFunc = (right: TraversalResult | null) => TraversalResult

function expandHex(str: string): string {
  const charCode = parseInt(str, 16)
  return String.fromCharCode(charCode)
}

class GroqQueryError extends Error {
  public override name = 'GroqQueryError'
}

function createExpressionBuilder(recursion: Set<string> = new Set()): MarkVisitor<ExprNode> {
  const exprBuilder: MarkVisitor<ExprNode> = {
    group(p) {
      const inner = p.process(exprBuilder)
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
      const next = p.process(exprBuilder) as ParentNode
      return {
        type: 'Parent',
        n: next.n + 1,
      }
    },

    traverse(p) {
      const base = p.process(exprBuilder)
      const traversalList: Array<TraverseFunc> = []
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
      const base = p.process(exprBuilder)

      return {
        type: 'Neg',
        base,
      }
    },

    pos(p) {
      const base = p.process(exprBuilder)

      return {
        type: 'Pos',
        base,
      }
    },

    add(p) {
      const left = p.process(exprBuilder)
      const right = p.process(exprBuilder)
      return {
        type: 'OpCall',
        op: '+',
        left,
        right,
      }
    },

    sub(p) {
      const left = p.process(exprBuilder)
      const right = p.process(exprBuilder)
      return {
        type: 'OpCall',
        op: '-',
        left,
        right,
      }
    },

    mul(p) {
      const left = p.process(exprBuilder)
      const right = p.process(exprBuilder)
      return {
        type: 'OpCall',
        op: '*',
        left,
        right,
      }
    },

    div(p) {
      const left = p.process(exprBuilder)
      const right = p.process(exprBuilder)
      return {
        type: 'OpCall',
        op: '/',
        left,
        right,
      }
    },

    mod(p) {
      const left = p.process(exprBuilder)
      const right = p.process(exprBuilder)
      return {
        type: 'OpCall',
        op: '%',
        left,
        right,
      }
    },

    pow(p) {
      const left = p.process(exprBuilder)
      const right = p.process(exprBuilder)
      return {
        type: 'OpCall',
        op: '**',
        left,
        right,
      }
    },

    comp(p) {
      const left = p.process(exprBuilder)
      const op = p.processString() as OpCall
      const right = p.process(exprBuilder)
      return {
        type: 'OpCall',
        op: op,
        left: left,
        right: right,
      }
    },

    in_range(p) {
      const base = p.process(exprBuilder)
      const isInclusive = p.getMark().name === 'inc_range'
      p.shift()
      const left = p.process(exprBuilder)
      const right = p.process(exprBuilder)
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
      const attributes: ObjectAttributeNode[] = []
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
      const elements: ArrayElementNode[] = []
      while (p.getMark().name !== 'array_end') {
        let isSplat = false
        if (p.getMark().name === 'array_splat') {
          isSplat = true
          p.shift()
        }
        const value = p.process(exprBuilder)
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
      const members: ExprNode[] = []
      while (p.getMark().name !== 'tuple_end') {
        members.push(p.process(exprBuilder))
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
        const result: SelectNode = {
          type: 'Select',
          alternatives: [],
        }

        while (p.getMark().name !== 'func_args_end') {
          if (p.getMark().name === 'pair') {
            if (result.fallback) throw new GroqQueryError(`unexpected argument to select()`)
            p.shift()
            const condition = p.process(exprBuilder)
            const value = p.process(exprBuilder)
            result.alternatives.push({
              type: 'SelectAlternative',
              condition,
              value,
            })
          } else {
            if (result.fallback) throw new GroqQueryError(`unexpected argument to select()`)
            const value = p.process(exprBuilder)
            result.fallback = value
          }
        }
        p.shift()
        return result
      }

      const args: ExprNode[] = []

      while (p.getMark().name !== 'func_args_end') {
        if (argumentShouldBeSelector(namespace, name, args.length)) {
          args.push(p.process(SELECTOR_BUILDER))
        } else {
          args.push(p.process(exprBuilder))
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

      const customFunction = p.customFunctions[`${namespace}::${name}`]
      if (customFunction !== undefined) {
        const FUNCTION_DECL_BUILDER = createFunctionDeclarationBuilder(recursion)

        const processor = new MarkProcessor(p.string, customFunction.marks, p.customFunctions, {})
        const funcDecl = processor.process(FUNCTION_DECL_BUILDER)
        validateArity(name, funcDecl.params.length, args.length)
        return mapCustomFunction(
          funcDecl.body,
          (body) => walkValidateCustomFunction(body),
          (parameterNode) => resolveFunctionParameter(parameterNode, funcDecl.params, args),
        )
      }

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
        namespace,
        name,
        args,
        func,
      }
    },

    pipecall(p) {
      const base = p.process(exprBuilder)
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
      const args: ExprNode[] = []

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
            args.push({type: 'Asc', base: p.process(exprBuilder)})
            continue
          } else if (markName === 'desc') {
            p.shift()
            args.push({type: 'Desc', base: p.process(exprBuilder)})
            continue
          }
        }

        args.push(p.process(exprBuilder))
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

    pair() {
      throw new GroqQueryError(`unexpected =>`)
    },

    and(p) {
      const left = p.process(exprBuilder)
      const right = p.process(exprBuilder)
      return {
        type: 'And',
        left,
        right,
      }
    },

    or(p) {
      const left = p.process(exprBuilder)
      const right = p.process(exprBuilder)
      return {
        type: 'Or',
        left,
        right,
      }
    },

    not(p) {
      const base = p.process(exprBuilder)
      return {
        type: 'Not',
        base,
      }
    },

    asc() {
      throw new GroqQueryError('unexpected asc')
    },

    desc() {
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

  const OBJECT_BUILDER: MarkVisitor<ObjectAttributeNode> = {
    object_expr(p) {
      if (p.getMark().name === 'pair') {
        p.shift()
        const condition = p.process(exprBuilder)
        const value = p.process(exprBuilder)

        return {
          type: 'ObjectConditionalSplat',
          condition,
          value,
        }
      }

      const value = p.process(exprBuilder)

      return {
        type: 'ObjectAttributeValue',
        name: extractPropertyKey(value),
        value,
      }
    },

    object_pair(p) {
      const name = p.process(exprBuilder)
      if (name.type !== 'Value') throw new Error('name must be string')

      const value = p.process(exprBuilder)
      return {
        type: 'ObjectAttributeValue',
        name: name.value,
        value: value,
      }
    },

    object_splat(p): ObjectSplatNode {
      const value = p.process(exprBuilder)

      return {
        type: 'ObjectSplat',
        value,
      }
    },

    object_splat_this(): ObjectSplatNode {
      return {
        type: 'ObjectSplat',
        value: {type: 'This'},
      }
    },
  }

  const TRAVERSE_BUILDER: MarkVisitor<TraverseFunc> = {
    square_bracket(p) {
      const expr = p.process(exprBuilder)

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
          right,
        )
    },

    slice(p) {
      const isInclusive = p.getMark().name === 'inc_range'
      p.shift()

      const left = p.process(exprBuilder)
      const right = p.process(exprBuilder)

      const leftValue = tryConstantEvaluate(left)
      const rightValue = tryConstantEvaluate(right)

      if (
        !leftValue ||
        !rightValue ||
        leftValue.type !== 'number' ||
        rightValue.type !== 'number'
      ) {
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
          rhs,
        )
    },

    projection(p) {
      const obj = p.process(exprBuilder)
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

      const wrap = (base: ExprNode): ExprNode =>
        attr ? {type: 'AccessAttribute', base, name: attr} : base

      return (right) =>
        traversePlain(
          (base) =>
            wrap({
              type: 'Deref',
              base,
            }),
          right,
        )
    },

    array_postfix() {
      return (right) => traverseArray((base) => ({type: 'ArrayCoerce', base}), right)
    },
  }

  const SELECTOR_BUILDER: MarkVisitor<SelectorNode> = {
    group(p) {
      return p.process(SELECTOR_BUILDER)
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

    dblparent() {
      throw new Error('Invalid selector syntax')
    },

    traverse(p) {
      let node: SelectorNode = p.process(SELECTOR_BUILDER)
      while (p.getMark().name !== 'traversal_end') {
        if (p.getMark().name === 'array_postfix') {
          p.shift()

          node = {type: 'ArrayCoerce', base: node}
        } else if (p.getMark().name === 'square_bracket') {
          p.shift()

          const expr = p.process(exprBuilder)

          const value = tryConstantEvaluate(expr)
          if (value && value.type === 'number') {
            throw new Error('Invalid array access expression')
          } else if (value && value.type === 'string') {
            node = {type: 'AccessAttribute', base: node, name: value.data}
          } else {
            node = {type: 'Filter', base: node, expr}
          }
        } else if (p.getMark().name === 'attr_access') {
          p.shift()
          const name = p.processString()
          node = {type: 'AccessAttribute', base: node, name}
        } else if (p.getMark().name === 'tuple' || p.getMark().name === 'group') {
          const selector = p.process(SELECTOR_BUILDER)
          if (!isSelectorNested(selector))
            throw new Error(`Unexpected result parsing nested selector: ${selector.type}`)
          node = {type: 'SelectorNested', base: node, nested: selector}
        } else {
          throw new Error('Invalid selector syntax')
        }
      }
      p.shift()
      return node
    },

    this_attr(p) {
      const name = p.processString()
      return {type: 'AccessAttribute', name}
    },

    attr_access() {
      throw new Error('Invalid selector syntax')
    },

    neg() {
      throw new Error('Invalid selector syntax')
    },

    pos() {
      throw new Error('Invalid selector syntax')
    },

    add() {
      throw new Error('Invalid selector syntax')
    },

    sub() {
      throw new Error('Invalid selector syntax')
    },

    mul() {
      throw new Error('Invalid selector syntax')
    },

    div() {
      throw new Error('Invalid selector syntax')
    },

    mod() {
      throw new Error('Invalid selector syntax')
    },

    pow() {
      throw new Error('Invalid selector syntax')
    },

    comp() {
      throw new Error('Invalid selector syntax')
    },

    in_range() {
      throw new Error('Invalid selector syntax')
    },

    str() {
      throw new Error('Invalid selector syntax')
    },

    integer() {
      throw new Error('Invalid selector syntax')
    },

    float() {
      throw new Error('Invalid selector syntax')
    },

    sci() {
      throw new Error('Invalid selector syntax')
    },

    object() {
      throw new Error('Invalid selector syntax')
    },

    array() {
      throw new Error('Invalid selector syntax')
    },

    tuple(p) {
      const selectors: Array<SelectorNode> = []
      while (p.getMark().name !== 'tuple_end') {
        selectors.push(p.process(SELECTOR_BUILDER))
      }
      p.shift()

      return {type: 'Tuple', members: selectors}
    },

    func_call(p, mark) {
      const func = exprBuilder['func_call'](p, mark) as FuncCallNode
      if (func.name === 'anywhere' && func.args.length === 1) {
        return {
          type: 'SelectorFuncCall',
          name: 'anywhere',
          arg: func.args[0],
        }
      }

      throw new Error('Invalid selector syntax')
    },

    pipecall() {
      throw new Error('Invalid selector syntax')
    },

    pair() {
      throw new Error('Invalid selector syntax')
    },

    and() {
      throw new Error('Invalid selector syntax')
    },

    or() {
      throw new Error('Invalid selector syntax')
    },

    not() {
      throw new Error('Invalid selector syntax')
    },

    asc() {
      throw new Error('Invalid selector syntax')
    },

    desc() {
      throw new Error('Invalid selector syntax')
    },

    param() {
      throw new Error('Invalid selector syntax')
    },
  }

  return exprBuilder
}

function extractPropertyKey(node: ExprNode): string {
  if (node.type === 'AccessAttribute' && !node.base) {
    return node.name
  }

  if (
    node.type === 'PipeFuncCall' ||
    node.type === 'Deref' ||
    node.type === 'Map' ||
    node.type === 'Projection' ||
    node.type === 'Slice' ||
    node.type === 'Filter' ||
    node.type === 'AccessElement' ||
    node.type === 'ArrayCoerce' ||
    node.type === 'Group'
  ) {
    return extractPropertyKey(node.base)
  }

  throw new GroqQueryError(`Cannot determine property key for type: ${node.type}`)
}

function validateArity(name: string, arity: GroqFunctionArity, count: number) {
  if (typeof arity === 'number') {
    if (count !== arity) {
      throw new GroqQueryError(
        `Incorrect number of arguments to function ${name}(). Expected ${arity}, got ${count}.`,
      )
    }
  } else if (arity) {
    if (!arity(count)) {
      throw new GroqQueryError(`Incorrect number of arguments to function ${name}().`)
    }
  }
}

function resolveFunctionParameter(parameter: ExprNode, params: ParameterNode[], args: ExprNode[]) {
  if (parameter.type !== 'Parameter') {
    throw new GroqQueryError(`Expected parameter node, got ${parameter.type}`)
  }
  const index = params.findIndex((p) => p.name === parameter.name)
  if (index === -1) {
    throw new GroqQueryError(`Missing argument for parameter ${parameter.name} in function call`)
  }
  return args[index]
}

/**
 * The function body is one of the forms:
 * - $param{…}
 * - $param->{…}
 * - $param[]{…}
 * - $param[]->{…}
 *
 * https://github.com/sanity-io/go-groq/blob/b7fb57f5aefe080becff9e3522c0b7b52a79ffd0/parser/internal/parserv2/parser.go#L975-L981
 */
function mapCustomFunction(
  body: ExprNode,
  bodyMapper: (body: ExprNode) => ExprNode,
  parameterMapper: (body: ParameterNode) => ExprNode = (n) => n,
): ExprNode {
  if (body.type === 'Projection') {
    if (body.base.type === 'Parameter') {
      return {
        type: 'Projection',
        base: parameterMapper(body.base),
        expr: bodyMapper(body.expr),
      }
    }

    if (body.base.type === 'Deref') {
      if (body.base.base.type === 'Parameter') {
        return {
          type: 'Projection',
          base: {
            type: 'Deref',
            base: parameterMapper(body.base.base),
          },
          expr: bodyMapper(body.expr),
        }
      }
    }
  }

  if (body.type === 'Map' && body.base.type === 'ArrayCoerce') {
    if (body.base.base.type === 'Parameter') {
      return {
        type: 'Map',
        base: {
          type: 'ArrayCoerce',
          base: parameterMapper(body.base.base),
        },
        expr: bodyMapper(body.expr),
      }
    }
  }
  throw new GroqQueryError(`Unexpected function body, must be a projection. Got "${body.type}"`)
}

function argumentShouldBeSelector(namespace: string, functionName: string, argCount: number) {
  const functionsRequiringSelectors = ['changedAny', 'changedOnly']

  return namespace == 'diff' && argCount == 2 && functionsRequiringSelectors.includes(functionName)
}

class GroqSyntaxError extends Error {
  public position: number
  public override name = 'GroqSyntaxError'

  constructor(position: number, detail: string) {
    super(`Syntax error in GROQ query at position ${position}${detail ? `: ${detail}` : ''}`)
    this.position = position
  }
}

/**
 * Parses a GROQ query and returns a tree structure.
 */
export function parse(input: string, options: ParseOptions = {}): ExprNode {
  const result = rawParse(input)
  if (result.type === 'error') {
    throw new GroqSyntaxError(result.position, result.message)
  }
  validateCustomFunctions(input, result.customFunctions)

  const processor = new MarkProcessor(input, result.marks, result.customFunctions, options)
  const exprBuilder = createExpressionBuilder()
  return processor.process(exprBuilder)
}

function createFunctionDeclarationBuilder(
  recursion: Set<string> = new Set(),
): MarkVisitor<FunctionDeclarationNode> {
  return {
    func_decl(p) {
      const namespace = p.processString()
      const name = p.processString()
      const functionId: string = `${namespace}::${name}`
      if (recursion.has(functionId)) {
        throw new GroqQueryError(`Recursive function definition detected for ${functionId}`)
      }

      const exprBuilder = createExpressionBuilder(new Set([...recursion, functionId]))

      const params: ParameterNode[] = []
      while (p.getMark().name !== 'func_params_end') {
        const param = p.process(exprBuilder)
        if (param.type !== 'Parameter') throw new Error('expected parameter')
        params.push(param)
      }

      if (params.length !== 1) {
        throw new GroqQueryError('Custom functions can only have one parameter')
      }

      p.shift() // func_params_end

      const body = p.process(exprBuilder)

      return {
        type: 'FuncDeclaration',
        namespace,
        name,
        params,
        body,
      } satisfies FunctionDeclarationNode
    },
  } satisfies MarkVisitor<FunctionDeclarationNode>
}
function validateCustomFunctions(query: string, customFunctions: CustomFunctions) {
  for (const functionId in customFunctions) {
    if (!customFunctions.hasOwnProperty(functionId)) continue
    const customFunction = customFunctions[functionId]
    const processor = new MarkProcessor(query, customFunction.marks, customFunctions, {})

    const FUNCTION_DECL_BUILDER = createFunctionDeclarationBuilder()
    const funcDecl = processor.process(FUNCTION_DECL_BUILDER)
    mapCustomFunction(funcDecl.body, (body) => walkValidateCustomFunction(body))
  }
}
