import type {ExprNode, FuncCallNode, PipeFuncCallNode} from '../nodeTypes'
import {
  FALSE_VALUE,
  fromJS,
  fromNumber,
  NULL_VALUE,
  StreamValue,
  TRUE_VALUE,
  type AnyStaticValue,
  type Value,
} from '../values'
import {operators} from './operators'
import {partialCompare} from './ordering'
import {Scope} from './scope'
import type {EvaluateOptions, Executor} from './types'

export function evaluate(node: ExprNode, scope: Scope): Value | PromiseLike<Value> {
  return executeAsync(node, scope)
}

export function executeSync(node: ExprNode, scope: Scope): AnyStaticValue {
  const exec = EXECUTORS[node.type]
  return exec.executeSync(node as any, scope)
}

export function executeAsync(node: ExprNode, scope: Scope): Promise<Value> {
  const exec = EXECUTORS[node.type]
  return exec.executeAsync(node as any, scope)
}

type NarrowNode<T, N> = T extends {type: N} ? T : never

type ExecutorMap = {
  [key in ExprNode['type']]: Executor<NarrowNode<ExprNode, key>>
}

/**
 * Defines an executor which is only valid in `evaluateAsync`.
 *
 * @deprecated This is a temporary helper. Over time we want everything to be both sync and async.
 **/
export function asyncOnlyExecutor<N = ExprNode>(
  executeAsync: (node: N, scope: Scope) => Promise<Value>,
): Executor<N> {
  return {
    executeSync() {
      throw new Error('executeSync not supported')
    },
    executeAsync,
  }
}

export function constantExecutor<N = ExprNode>(fn: (node: N, scope: Scope) => Value): Executor<N> {
  return {
    executeSync(node, scope) {
      const value = fn(node, scope)
      if (value.type === 'stream') throw new Error('Stream encountered in evaluateSync')
      return value
    },
    async executeAsync(node, scope) {
      return fn(node, scope)
    },
  }
}

export function mappedExecutor<N = ExprNode>(
  map: (node: N) => ExprNode[],
  reduce: (node: N, ...values: AnyStaticValue[]) => AnyStaticValue,
): Executor<N> {
  return {
    executeSync(node, scope) {
      const nodes = map(node)
      const values = nodes.map((node) => executeSync(node, scope))
      return reduce(node, ...values)
    },
    async executeAsync(node, scope) {
      const nodes = map(node)
      const values = await Promise.all(
        nodes.map((node) => executeAsync(node, scope).then((value) => value.asStatic())),
      )
      return reduce(node, ...values)
    },
  }
}

const EXECUTORS: ExecutorMap = {
  This: constantExecutor((_, scope) => {
    return scope.value
  }),

  SelectorNested: constantExecutor(() => {
    throw new Error('Unexpected node type: SelectorNested')
  }),

  SelectorFuncCall: constantExecutor(() => {
    throw new Error('Unexpected node type: SelectorFuncCall')
  }),

  Everything: constantExecutor((_, scope) => {
    return scope.source
  }),

  Parameter: constantExecutor(({name}, scope) => {
    return fromJS(scope.params[name])
  }),

  Context: constantExecutor(({key}, scope) => {
    if (key === 'before' || key === 'after') {
      const value = scope.context[key]
      return value || NULL_VALUE
    }
    throw new Error(`unknown context key: ${key}`)
  }),

  Parent: constantExecutor(({n}, scope) => {
    let current = scope
    for (let i = 0; i < n; i++) {
      if (!current.parent) {
        return NULL_VALUE
      }

      current = current.parent
    }
    return current.value
  }),

  OpCall: {
    async executeAsync({op, left, right}, scope) {
      const func = operators[op]
      if (!func) {
        throw new Error(`Unknown operator: ${op}`)
      }
      const leftValue = await executeAsync(left, scope)
      const rightValue = await executeAsync(right, scope)

      return func(leftValue, rightValue)
    },
    executeSync({op, left, right}, scope) {
      const func = operators[op]
      if (!func) {
        throw new Error(`Unknown operator: ${op}`)
      }
      const leftValue = executeSync(left, scope)
      const rightValue = executeSync(right, scope)

      const result = func(leftValue, rightValue)
      if ('then' in result || result.type === 'stream')
        throw new Error(`Operator ${op} not possible in evaluteSync`)
      return result
    },
  },

  Select: asyncOnlyExecutor(async ({alternatives, fallback}, scope) => {
    for (const alt of alternatives) {
      const altCond = await executeAsync(alt.condition, scope)
      if (altCond.type === 'boolean' && altCond.data === true) {
        return executeAsync(alt.value, scope)
      }
    }

    if (fallback) {
      return executeAsync(fallback, scope)
    }

    return NULL_VALUE
  }),

  InRange: asyncOnlyExecutor(async ({base, left, right, isInclusive}, scope) => {
    const value = await executeAsync(base, scope)
    const leftValue = await executeAsync(left, scope)
    const rightValue = await executeAsync(right, scope)

    const leftCmp = partialCompare(await value.get(), await leftValue.get())
    if (leftCmp === null) {
      return NULL_VALUE
    }
    const rightCmp = partialCompare(await value.get(), await rightValue.get())
    if (rightCmp === null) {
      return NULL_VALUE
    }

    if (isInclusive) {
      return leftCmp >= 0 && rightCmp <= 0 ? TRUE_VALUE : FALSE_VALUE
    }

    return leftCmp >= 0 && rightCmp < 0 ? TRUE_VALUE : FALSE_VALUE
  }),

  Filter: asyncOnlyExecutor(async ({base, expr}, scope) => {
    const baseValue = await executeAsync(base, scope)
    if (!baseValue.isArray()) {
      return NULL_VALUE
    }
    return new StreamValue(async function* () {
      for await (const elem of baseValue) {
        const newScope = scope.createNested(elem)
        const exprValue = await executeAsync(expr, newScope)
        if (exprValue.type === 'boolean' && exprValue.data === true) {
          yield elem
        }
      }
    })
  }),

  Projection: asyncOnlyExecutor(async ({base, expr}, scope) => {
    const baseValue = await executeAsync(base, scope)
    if (baseValue.type !== 'object') {
      return NULL_VALUE
    }

    const newScope = scope.createNested(baseValue)
    return executeAsync(expr, newScope)
  }),

  FuncCall: asyncOnlyExecutor(({func, args}: FuncCallNode, scope: Scope) => {
    return func.executeAsync(args, scope)
  }),

  PipeFuncCall: asyncOnlyExecutor(async ({func, base, args}: PipeFuncCallNode, scope: Scope) => {
    const baseValue = await executeAsync(base, scope)
    return func.executeAsync({base: baseValue, args}, scope)
  }),

  AccessAttribute: asyncOnlyExecutor(async ({base, name}, scope) => {
    let value = scope.value
    if (base) {
      value = await executeAsync(base, scope)
    }
    if (value.type === 'object') {
      if (value.data.hasOwnProperty(name)) {
        return fromJS(value.data[name])
      }
    }

    return NULL_VALUE
  }),

  AccessElement: asyncOnlyExecutor(async ({base, index}, scope) => {
    const baseValue = await executeAsync(base, scope)
    if (!baseValue.isArray()) {
      return NULL_VALUE
    }

    const data = await baseValue.get()
    const finalIndex = index < 0 ? index + data.length : index
    return fromJS(data[finalIndex])
  }),

  Slice: asyncOnlyExecutor(async ({base, left, right, isInclusive}, scope) => {
    const baseValue = await executeAsync(base, scope)

    if (!baseValue.isArray()) {
      return NULL_VALUE
    }

    // OPT: Here we can optimize when either indices are >= 0
    const array = (await baseValue.get()) as any[]

    let leftIdx = left
    let rightIdx = right

    // Handle negative index
    if (leftIdx < 0) {
      leftIdx = array.length + leftIdx
    }
    if (rightIdx < 0) {
      rightIdx = array.length + rightIdx
    }

    // Convert from inclusive to exclusive index
    if (isInclusive) {
      rightIdx++
    }

    if (leftIdx < 0) {
      leftIdx = 0
    }
    if (rightIdx < 0) {
      rightIdx = 0
    }

    // Note: At this point the indices might point out-of-bound, but
    // .slice handles this correctly.

    return fromJS(array.slice(leftIdx, rightIdx))
  }),

  Deref: asyncOnlyExecutor(async ({base}, scope) => {
    const value = await executeAsync(base, scope)

    if (!scope.source.isArray()) {
      return NULL_VALUE
    }

    if (value.type !== 'object') {
      return NULL_VALUE
    }

    const id = value.data['_ref']
    if (typeof id !== 'string') {
      return NULL_VALUE
    }

    if (scope.context.dereference) {
      return fromJS(await scope.context.dereference({_ref: id}))
    }

    for await (const doc of scope.source) {
      if (doc.type === 'object' && id === doc.data['_id']) {
        return doc
      }
    }

    return NULL_VALUE
  }),

  Value: constantExecutor(({value}) => {
    return fromJS(value)
  }),

  Group: {
    executeSync({base}, scope) {
      return executeSync(base, scope)
    },
    executeAsync({base}, scope) {
      return executeAsync(base, scope)
    },
  },

  Object: asyncOnlyExecutor(async ({attributes}, scope) => {
    const result: {[key: string]: any} = {}
    for (const attr of attributes) {
      const attrType = attr.type
      switch (attr.type) {
        case 'ObjectAttributeValue': {
          const value = await executeAsync(attr.value, scope)
          result[attr.name] = await value.get()
          break
        }

        case 'ObjectConditionalSplat': {
          const cond = await executeAsync(attr.condition, scope)
          if (cond.type !== 'boolean' || cond.data === false) {
            continue
          }

          const value = await executeAsync(attr.value, scope)
          if (value.type === 'object') {
            Object.assign(result, value.data)
          }
          break
        }

        case 'ObjectSplat': {
          const value = await executeAsync(attr.value, scope)
          if (value.type === 'object') {
            Object.assign(result, value.data)
          }
          break
        }

        default:
          throw new Error(`Unknown node type: ${attrType}`)
      }
    }
    return fromJS(result)
  }),

  Array: asyncOnlyExecutor(async ({elements}, scope) => {
    return new StreamValue(async function* () {
      for (const element of elements) {
        const value = await executeAsync(element.value, scope)
        if (element.isSplat) {
          if (value.isArray()) {
            for await (const v of value) {
              yield v
            }
          }
        } else {
          yield value
        }
      }
    })
  }),

  Tuple: constantExecutor(() => {
    throw new Error('tuples can not be evaluated')
  }),

  Or: mappedExecutor(
    ({left, right}) => [left, right],
    (_, leftValue, rightValue) => {
      if (leftValue.type === 'boolean') {
        if (leftValue.data === true) {
          return TRUE_VALUE
        }
      }

      if (rightValue.type === 'boolean') {
        if (rightValue.data === true) {
          return TRUE_VALUE
        }
      }

      if (leftValue.type !== 'boolean' || rightValue.type !== 'boolean') {
        return NULL_VALUE
      }

      return FALSE_VALUE
    },
  ),

  And: mappedExecutor(
    ({left, right}) => [left, right],
    (_, leftValue, rightValue) => {
      if (leftValue.type === 'boolean') {
        if (leftValue.data === false) {
          return FALSE_VALUE
        }
      }

      if (rightValue.type === 'boolean') {
        if (rightValue.data === false) {
          return FALSE_VALUE
        }
      }

      if (leftValue.type !== 'boolean' || rightValue.type !== 'boolean') {
        return NULL_VALUE
      }

      return TRUE_VALUE
    },
  ),

  Not: mappedExecutor(
    ({base}) => [base],
    (_, value) => {
      if (value.type !== 'boolean') {
        return NULL_VALUE
      }
      return value.data ? FALSE_VALUE : TRUE_VALUE
    },
  ),

  Neg: mappedExecutor(
    ({base}) => [base],
    (_, value) => {
      if (value.type !== 'number') {
        return NULL_VALUE
      }
      return fromNumber(-value.data)
    },
  ),

  Pos: mappedExecutor(
    ({base}) => [base],
    (_, value) => {
      if (value.type !== 'number') {
        return NULL_VALUE
      }
      return fromNumber(value.data)
    },
  ),

  Asc: constantExecutor(() => NULL_VALUE),
  Desc: constantExecutor(() => NULL_VALUE),

  ArrayCoerce: asyncOnlyExecutor(async ({base}, scope) => {
    const value = await executeAsync(base, scope)
    return value.isArray() ? value : NULL_VALUE
  }),

  Map: asyncOnlyExecutor(async ({base, expr}, scope) => {
    const value = await executeAsync(base, scope)
    if (!value.isArray()) {
      return NULL_VALUE
    }

    return new StreamValue(async function* () {
      for await (const elem of value) {
        const newScope = scope.createHidden(elem)
        yield await executeAsync(expr, newScope)
      }
    })
  }),

  FlatMap: asyncOnlyExecutor(async ({base, expr}, scope) => {
    const value = await executeAsync(base, scope)
    if (!value.isArray()) {
      return NULL_VALUE
    }

    return new StreamValue(async function* () {
      for await (const elem of value) {
        const newScope = scope.createHidden(elem)
        const innerValue = await executeAsync(expr, newScope)
        if (innerValue.isArray()) {
          for await (const inner of innerValue) {
            yield inner
          }
        } else {
          yield innerValue
        }
      }
    })
  }),
}

/**
 * Evaluates a query.
 * @internal
 */
export function evaluateQuery(
  tree: ExprNode,
  options: EvaluateOptions = {},
): Value | PromiseLike<Value> {
  return executeAsync(tree, scopeFromOptions(options))
}

/**
 * Evaluates a query synchronously.
 *
 * This currently only supports a tiny subset of the GROQ language.
 * @internal
 */
export function evaluateQuerySync(tree: ExprNode, options: EvaluateOptions = {}): AnyStaticValue {
  return executeSync(tree, scopeFromOptions(options))
}

function scopeFromOptions(options: EvaluateOptions): Scope {
  const root = fromJS(options.root)
  const dataset = fromJS(options.dataset)
  const params: {[key: string]: any} = {...options.params}

  return new Scope(
    params,
    dataset,
    root,
    {
      timestamp: options.timestamp || new Date(),
      identity: options.identity === undefined ? 'me' : options.identity,
      sanity: options.sanity,
      after: options.after ? fromJS(options.after) : null,
      before: options.before ? fromJS(options.before) : null,
      dereference: options.dereference,
    },
    null,
  )
}
