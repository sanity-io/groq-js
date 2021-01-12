import * as NodeTypes from '../nodeTypes'
import {
  StaticValue,
  StreamValue,
  NULL_VALUE,
  TRUE_VALUE,
  FALSE_VALUE,
  Range,
  Pair,
  fromNumber,
  fromJS,
  Value
} from './value'
import {operators} from './operators'
import {applyMapper} from './mappers'

export class Scope {
  public params: {[key: string]: any}
  public source: any
  public value: Value
  public parent: Scope | null
  public timestamp: string

  constructor(params: {[key: string]: any}, source: any, value: Value, parent: Scope | null) {
    this.params = params
    this.source = source
    this.value = value
    this.parent = parent
    this.timestamp = parent ? parent.timestamp : new Date().toISOString()
  }

  createNested(value: Value) {
    return new Scope(this.params, this.source, value, this)
  }
}

export function execute(node: NodeTypes.SyntaxNode, scope: Scope) {
  if (typeof EXECUTORS[node.type] === 'undefined') {
    throw new Error('No executor for node.type=' + node.type)
  }

  const func = EXECUTORS[node.type]
  return func(node, scope)
}

export type Executor = (node: NodeTypes.SyntaxNode, scope: Scope) => Value | PromiseLike<Value>

export type ExecutorMap = {
  This: (node: NodeTypes.ThisNode, scope: Scope) => Value | PromiseLike<Value>
  Star: (node: NodeTypes.StarNode, scope: Scope) => Value | PromiseLike<Value>
  Parameter: (node: NodeTypes.ParameterNode, scope: Scope) => Value | PromiseLike<Value>
  Parent: (node: NodeTypes.ParentNode, scope: Scope) => Value | PromiseLike<Value>
  OpCall: (node: NodeTypes.OpCallNode, scope: Scope) => Value | PromiseLike<Value>
  FuncCall: (node: NodeTypes.FuncCallNode, scope: Scope) => Value | PromiseLike<Value>
  PipeFuncCall: (node: NodeTypes.PipeFuncCallNode, scope: Scope) => Value | PromiseLike<Value>
  Map: (node: NodeTypes.MapNode, scope: Scope) => Value | PromiseLike<Value>
  Element: (node: NodeTypes.ElementNode, scope: Scope) => Value | PromiseLike<Value>
  Identifier: (node: NodeTypes.IdentifierNode, scope: Scope) => Value | PromiseLike<Value>
  Value: (node: NodeTypes.ValueNode, scope: Scope) => Value | PromiseLike<Value>
  Parenthesis: (node: NodeTypes.ParenthesisNode, scope: Scope) => Value | PromiseLike<Value>
  Object: (node: NodeTypes.ObjectNode, scope: Scope) => Value | PromiseLike<Value>
  Array: (node: NodeTypes.ArrayNode, scope: Scope) => Value | PromiseLike<Value>
  Range: (node: NodeTypes.RangeNode, scope: Scope) => Value | PromiseLike<Value>
  Pair: (node: NodeTypes.PairNode, scope: Scope) => Value | PromiseLike<Value>
  Or: (node: NodeTypes.OrNode, scope: Scope) => Value | PromiseLike<Value>
  And: (node: NodeTypes.AndNode, scope: Scope) => Value | PromiseLike<Value>
  Not: (node: NodeTypes.NotNode, scope: Scope) => Value | PromiseLike<Value>
  Neg: (node: NodeTypes.NegNode, scope: Scope) => Value | PromiseLike<Value>
  Pos: (node: NodeTypes.PosNode, scope: Scope) => Value | PromiseLike<Value>
  Asc: (node: NodeTypes.AscNode, scope: Scope) => Value | PromiseLike<Value>
  Desc: (node: NodeTypes.DescNode, scope: Scope) => Value | PromiseLike<Value>
  [key: string]: any
}

const EXECUTORS: ExecutorMap = {
  This(_: NodeTypes.ThisNode, scope: Scope) {
    return scope.value
  },

  Star(_: NodeTypes.StarNode, scope: Scope) {
    return scope.source
  },

  Parameter({name}: NodeTypes.ParameterNode, scope: Scope) {
    return fromJS(scope.params[name])
  },

  Parent(node: NodeTypes.ParentNode, scope: Scope) {
    let current = scope
    for (let i = 0; i < node.n; i++) {
      if (!current.parent) {
        return NULL_VALUE
      }

      current = current.parent
    }
    return current.value
  },

  OpCall({op, left, right}: NodeTypes.OpCallNode, scope: Scope) {
    let func = operators[op]
    if (!func) throw new Error('Unknown operator: ' + op)
    return func(left, right, scope, execute)
  },

  FuncCall({func, args}: NodeTypes.FuncCallNode, scope: Scope) {
    return func(args, scope, execute)
  },

  async PipeFuncCall({func, base, args}: NodeTypes.PipeFuncCallNode, scope: Scope) {
    let baseValue = await execute(base, scope)
    return func(baseValue, args, scope, execute)
  },

  async Map({base, mapper}, scope) {
    let baseValue = await execute(base, scope)
    return await applyMapper(scope, baseValue, mapper)
  },

  async Element({base, index}: NodeTypes.ElementNode, scope: Scope) {
    let baseValue = await execute(base, scope)

    if (baseValue.getType() !== 'array') return NULL_VALUE

    let idxValue = await execute(index, scope)
    if (idxValue.getType() !== 'number') return NULL_VALUE

    // OPT: Here we can optimize when idx >= 0
    let array = await baseValue.get()
    let idx = await idxValue.get()

    if (idx < 0) {
      idx = array.length + idx
    }

    if (idx >= 0 && idx < array.length) {
      return new StaticValue(array[idx])
    } else {
      // Make sure we return `null` for out-of-bounds access
      return NULL_VALUE
    }
  },

  async Identifier({name}: NodeTypes.IdentifierNode, scope: Scope) {
    if (scope.value.getType() === 'object') {
      let data = await scope.value.get()
      if (data.hasOwnProperty(name)) {
        return new StaticValue(data[name])
      }
    }

    return NULL_VALUE
  },

  Value({value}: NodeTypes.ValueNode) {
    return new StaticValue(value)
  },

  async Parenthesis({base}: NodeTypes.ParenthesisNode, scope: Scope) {
    return await execute(base, scope)
  },

  async Object({attributes}: NodeTypes.ObjectNode, scope: Scope) {
    let result: {[key: string]: any} = {}
    for (let attr of attributes) {
      const attrType = attr.type
      switch (attr.type) {
        case 'ObjectAttribute': {
          let key = await execute(attr.key, scope)
          if (key.getType() !== 'string') continue

          let value = await execute(attr.value, scope)
          result[key.data] = await value.get()
          break
        }

        case 'ObjectConditionalSplat': {
          let cond = await execute(attr.condition, scope)
          if (!cond.getBoolean()) continue

          let value = await execute(attr.value, scope)
          if (value.getType() !== 'object') continue
          Object.assign(result, value.data)
          break
        }

        case 'ObjectSplat': {
          let value = await execute(attr.value, scope)
          if (value.getType('object')) {
            Object.assign(result, value.data)
          }
          break
        }

        default:
          throw new Error('Unknown node type: ' + attrType)
      }
    }
    return new StaticValue(result)
  },

  Array({elements}: NodeTypes.ArrayNode, scope: Scope) {
    return new StreamValue(async function*() {
      for (let element of elements) {
        let value = await execute(element.value, scope)
        if (element.isSplat) {
          if (value.getType() === 'array') {
            for await (let v of value) {
              yield v
            }
          }
        } else {
          yield value
        }
      }
    })
  },

  async Range({left, right, isExclusive}: NodeTypes.RangeNode, scope: Scope) {
    let leftValue = await execute(left, scope)
    let rightValue = await execute(right, scope)

    if (!Range.isConstructible(leftValue.getType(), rightValue.getType())) {
      return NULL_VALUE
    }

    let range = new Range(await leftValue.get(), await rightValue.get(), isExclusive)
    return new StaticValue(range)
  },

  async Pair({left, right}: NodeTypes.PairNode, scope: Scope) {
    let leftValue = await execute(left, scope)
    let rightValue = await execute(right, scope)

    let pair = new Pair(await leftValue.get(), await rightValue.get())
    return new StaticValue(pair)
  },

  async Or({left, right}: NodeTypes.OrNode, scope: Scope) {
    let leftValue = await execute(left, scope)
    let rightValue = await execute(right, scope)

    if (leftValue.getType() === 'boolean') {
      if (leftValue.data === true) return TRUE_VALUE
    }

    if (rightValue.getType() === 'boolean') {
      if (rightValue.data === true) return TRUE_VALUE
    }

    if (leftValue.getType() !== 'boolean') return NULL_VALUE
    if (rightValue.getType() !== 'boolean') return NULL_VALUE

    return FALSE_VALUE
  },

  async And({left, right}: NodeTypes.AndNode, scope: Scope) {
    let leftValue = await execute(left, scope)
    let rightValue = await execute(right, scope)

    if (leftValue.getType() === 'boolean') {
      if (leftValue.data === false) return FALSE_VALUE
    }

    if (rightValue.getType() === 'boolean') {
      if (rightValue.data === false) return FALSE_VALUE
    }

    if (leftValue.getType() !== 'boolean') return NULL_VALUE
    if (rightValue.getType() !== 'boolean') return NULL_VALUE

    return TRUE_VALUE
  },

  async Not({base}: NodeTypes.NotNode, scope: Scope) {
    let value = await execute(base, scope)
    if (value.getType() !== 'boolean') {
      return NULL_VALUE
    }
    return value.getBoolean() ? FALSE_VALUE : TRUE_VALUE
  },

  async Neg({base}: NodeTypes.NegNode, scope: Scope) {
    let value = await execute(base, scope)
    if (value.getType() !== 'number') return NULL_VALUE
    return fromNumber(-(await value.get()))
  },

  async Pos({base}: NodeTypes.PosNode, scope: Scope) {
    let value = await execute(base, scope)
    if (value.getType() !== 'number') return NULL_VALUE
    return fromNumber(await value.get())
  },

  async Asc() {
    return NULL_VALUE
  },

  async Desc() {
    return NULL_VALUE
  }
}

interface EvaluateOptions {
  // The value that will be available as `@` in GROQ.
  root?: any

  // The value that will be available as `*` in GROQ.
  dataset?: any

  // Parameters availble in the GROQ query (using `$param` syntax).
  params?: {[key: string]: any}
}

/**
 * Evaluates a query.
 */
export async function evaluate(tree: NodeTypes.SyntaxNode, options: EvaluateOptions = {}) {
  let root = fromJS(options.root)
  let dataset = fromJS(options.dataset)
  let params: {[key: string]: any} = {...options.params}

  let scope = new Scope(params, dataset, root, null)
  return await execute(tree, scope)
}
