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
  Value,
  isBoolean,
  isString,
  isObject,
  isNumber,
} from './value'
import {operators} from './operators'
import {applyMapper} from './mapper'

export class Scope {
  public params: {[key: string]: any}
  public source: any
  public value: Value
  public parent: Scope | null
  public timestamp: string

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(params: {[key: string]: any}, source: any, value: Value, parent: Scope | null) {
    this.params = params
    this.source = source
    this.value = value
    this.parent = parent
    this.timestamp = parent ? parent.timestamp : new Date().toISOString()
  }

  createNested(value: Value): Scope {
    return new Scope(this.params, this.source, value, this)
  }

  rebindThis(value: Value): Scope {
    return new Scope(this.params, this.source, value, this.parent)
  }
}

export function execute(node: NodeTypes.SyntaxNode, scope: Scope): Value | PromiseLike<Value> {
  if (typeof EXECUTORS[node.type] === 'undefined') {
    throw new Error(`No executor for node.type=${node.type}`)
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
  Identifier: (node: NodeTypes.IdentifierNode, scope: Scope) => Value | PromiseLike<Value>
  Value: (node: NodeTypes.ValueNode, scope: Scope) => Value | PromiseLike<Value>
  Mapper: (node: NodeTypes.MapperNode, scope: Scope) => Value | PromiseLike<Value>
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
    const func = operators[op]
    if (!func) {
      throw new Error(`Unknown operator: ${op}`)
    }
    return func(left, right, scope, execute)
  },

  FuncCall({func, args}: NodeTypes.FuncCallNode, scope: Scope) {
    return func(args, scope, execute)
  },

  async PipeFuncCall({func, base, args}: NodeTypes.PipeFuncCallNode, scope: Scope) {
    const baseValue = await execute(base, scope)
    return func(baseValue, args, scope, execute)
  },

  async Identifier({name}: NodeTypes.IdentifierNode, scope: Scope) {
    if (scope.value.getType() === 'object') {
      const data = await scope.value.get()
      if (data.hasOwnProperty(name)) {
        return new StaticValue(data[name])
      }
    }

    return NULL_VALUE
  },

  Value({value}: NodeTypes.ValueNode) {
    return new StaticValue(value)
  },

  async Mapper({base, mapper}: NodeTypes.MapperNode, scope: Scope) {
    const baseValue = await execute(base, scope)
    return applyMapper(scope, baseValue, mapper)
  },

  Parenthesis({base}: NodeTypes.ParenthesisNode, scope: Scope) {
    return execute(base, scope)
  },

  async Object({attributes}: NodeTypes.ObjectNode, scope: Scope) {
    const result: {[key: string]: any} = {}
    for (const attr of attributes) {
      const attrType = attr.type
      switch (attr.type) {
        case 'ObjectAttribute': {
          const key = await execute(attr.key, scope)
          if (!isString(key)) {
            continue
          }

          const value = await execute(attr.value, scope)
          result[key.data] = await value.get()
          break
        }

        case 'ObjectConditionalSplat': {
          const cond = await execute(attr.condition, scope)
          if (!cond.getBoolean()) {
            continue
          }

          const value = await execute(attr.value, scope)
          if (!isObject(value)) {
            continue
          }
          Object.assign(result, value.data)
          break
        }

        case 'ObjectSplat': {
          const value = await execute(attr.value, scope)
          if (isObject(value)) {
            Object.assign(result, value.data)
          }
          break
        }

        default:
          throw new Error(`Unknown node type: ${attrType}`)
      }
    }
    return new StaticValue(result)
  },

  Array({elements}: NodeTypes.ArrayNode, scope: Scope) {
    return new StreamValue(async function* () {
      for (const element of elements) {
        const value = await execute(element.value, scope)
        if (element.isSplat) {
          if (value.getType() === 'array') {
            for await (const v of value) {
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
    const leftValue = await execute(left, scope)
    const rightValue = await execute(right, scope)

    if (!Range.isConstructible(leftValue.getType(), rightValue.getType())) {
      return NULL_VALUE
    }

    const range = new Range(await leftValue.get(), await rightValue.get(), isExclusive)
    return new StaticValue(range)
  },

  async Pair({left, right}: NodeTypes.PairNode, scope: Scope) {
    const leftValue = await execute(left, scope)
    const rightValue = await execute(right, scope)

    const pair = new Pair(await leftValue.get(), await rightValue.get())
    return new StaticValue(pair)
  },

  async Or({left, right}: NodeTypes.OrNode, scope: Scope) {
    const leftValue = await execute(left, scope)
    const rightValue = await execute(right, scope)

    if (isBoolean(leftValue)) {
      if (leftValue.data === true) {
        return TRUE_VALUE
      }
    }

    if (isBoolean(rightValue)) {
      if (rightValue.data === true) {
        return TRUE_VALUE
      }
    }

    if (!isBoolean(leftValue)) {
      return NULL_VALUE
    }
    if (!isBoolean(rightValue)) {
      return NULL_VALUE
    }

    return FALSE_VALUE
  },

  async And({left, right}: NodeTypes.AndNode, scope: Scope) {
    const leftValue = await execute(left, scope)
    const rightValue = await execute(right, scope)

    if (isBoolean(leftValue)) {
      if (leftValue.data === false) {
        return FALSE_VALUE
      }
    }

    if (isBoolean(rightValue)) {
      if (rightValue.data === false) {
        return FALSE_VALUE
      }
    }

    if (!isBoolean(leftValue)) {
      return NULL_VALUE
    }
    if (!isBoolean(rightValue)) {
      return NULL_VALUE
    }

    return TRUE_VALUE
  },

  async Not({base}: NodeTypes.NotNode, scope: Scope) {
    const value = await execute(base, scope)
    if (!isBoolean(value)) {
      return NULL_VALUE
    }
    return value.getBoolean() ? FALSE_VALUE : TRUE_VALUE
  },

  async Neg({base}: NodeTypes.NegNode, scope: Scope) {
    const value = await execute(base, scope)
    if (!isNumber(value)) {
      return NULL_VALUE
    }
    return fromNumber(-value.data)
  },

  async Pos({base}: NodeTypes.PosNode, scope: Scope) {
    const value = await execute(base, scope)
    if (value.getType() !== 'number') {
      return NULL_VALUE
    }
    return fromNumber(await value.get())
  },

  Asc() {
    return NULL_VALUE
  },

  Desc() {
    return NULL_VALUE
  },
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
export function evaluate(
  tree: NodeTypes.SyntaxNode,
  options: EvaluateOptions = {}
): Value | PromiseLike<Value> {
  const root = fromJS(options.root)
  const dataset = fromJS(options.dataset)
  const params: {[key: string]: any} = {...options.params}

  const scope = new Scope(params, dataset, root, null)
  return execute(tree, scope)
}
