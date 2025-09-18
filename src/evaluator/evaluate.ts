import type {ExprNode} from '../nodeTypes'
import {
  FALSE_VALUE,
  fromArray,
  fromJS,
  fromNumber,
  NULL_VALUE,
  StreamValue,
  TRUE_VALUE,
  type AnyStaticValue,
  type ObjectValue,
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
  reduce: (node: N, ...values: AnyStaticValue[]) => Value,
): Executor<N> {
  return {
    executeSync(node, scope) {
      const nodes = map(node)
      const values = nodes.map((node) => executeSync(node, scope))
      const value = reduce(node, ...values)
      if (value.type === 'stream')
        throw new Error('Stream/iterator not supported in synchronous mode')
      return value
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

export const STOP_ITERATOR = Symbol()

/**
 * An executor for procesing an array into a single value.
 *
 * @param map Returns a set of nodes which will be executed.
 * @param init Called once to produce an internal state.
 * @param reduce Called per item in the array.
 * @param wrap Turns the state into a static value.
 */
export function arrayReducerExecutor<N = ExprNode, State = unknown>(
  map: (node: N) => {array: ExprNode; args?: ExprNode[]},
  init: (node: N, ...args: AnyStaticValue[]) => State,
  reduce: (
    node: N,
    state: State,
    item: unknown,
    ...args: AnyStaticValue[]
  ) => State | typeof STOP_ITERATOR,
  wrap: (state: State) => AnyStaticValue,
): Executor<N> {
  return {
    executeSync(node, scope) {
      const {array: arrayNode, args: argNodes = []} = map(node)
      const arr = executeSync(arrayNode, scope)
      if (arr.type !== 'array') return NULL_VALUE
      const args = argNodes.map((node) => executeSync(node, scope))
      let state = init(node, ...args)
      for (const item of arr.data) {
        const result = reduce(node, state, item, ...args)
        if (result === STOP_ITERATOR) return NULL_VALUE
        state = result
      }
      return wrap(state)
    },
    async executeAsync(node, scope) {
      const {array: arrayNode, args: argNodes = []} = map(node)
      const arr = await executeAsync(arrayNode, scope)
      if (arr.type !== 'array' && arr.type !== 'stream') return NULL_VALUE

      const args = await Promise.all(
        argNodes.map((node) => executeAsync(node, scope).then((v) => v.asStatic())),
      )

      let state = init(node, ...args)

      if (arr.type === 'stream') {
        for await (const item of arr) {
          const result = reduce(node, state, await item.get(), ...args)
          if (result === STOP_ITERATOR) return NULL_VALUE
          state = result
        }
      } else {
        for (const item of arr.data) {
          const result = reduce(node, state, item, ...args)
          if (result === STOP_ITERATOR) return NULL_VALUE
          state = result
        }
      }

      return wrap(state)
    },
  }
}

/**
 * An executor which processes an array and returns another array.
 */
export function arrayExecutor<N = ExprNode, S = undefined>(
  map: (node: N) => {array: ExprNode; inner?: ExprNode; state?: S},
  reduce: (node: N, item: unknown, inner: unknown, state?: S) => Iterable<unknown>,
  {hidden = false}: {hidden?: boolean} = {},
): Executor<N> {
  return {
    executeSync(node, scope) {
      const mapping = map(node)
      const arr = executeSync(mapping.array, scope)
      if (arr.type !== 'array') return NULL_VALUE
      const result: unknown[] = []
      for (const item of arr.data) {
        let inner: unknown
        if (mapping.inner) {
          const newScope = hidden
            ? scope.createHidden(fromJS(item))
            : scope.createNested(fromJS(item))
          inner = executeSync(mapping.inner, newScope).data
        }
        for (const entry of reduce(node, item, inner, mapping.state)) {
          result.push(entry)
        }
      }
      return fromArray(result)
    },

    async executeAsync(node, scope) {
      const mapping = map(node)
      const arr = await executeAsync(mapping.array, scope)
      if (!arr.isArray()) return NULL_VALUE

      return new StreamValue(async function* () {
        for await (const item of arr) {
          let inner: unknown
          if (mapping.inner) {
            const newScope = hidden ? scope.createHidden(item) : scope.createNested(item)
            const innerValue = await executeAsync(mapping.inner, newScope)
            inner = await innerValue.get()
          }
          for (const entry of reduce(node, await item.get(), inner, mapping.state)) {
            yield fromJS(entry)
          }
        }
      })
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

  Select: {
    executeSync({alternatives, fallback}, scope) {
      for (const alt of alternatives) {
        const altCond = executeSync(alt.condition, scope)
        if (altCond.type === 'boolean' && altCond.data === true) {
          return executeSync(alt.value, scope)
        }
      }

      if (fallback) {
        return executeSync(fallback, scope)
      }

      return NULL_VALUE
    },

    async executeAsync({alternatives, fallback}, scope) {
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
    },
  },

  InRange: mappedExecutor(
    ({base, left, right}) => [base, left, right],
    ({isInclusive}, value, leftValue, rightValue) => {
      const leftCmp = partialCompare(value.data, leftValue.data)
      if (leftCmp === null) {
        return NULL_VALUE
      }
      const rightCmp = partialCompare(value.data, rightValue.data)
      if (rightCmp === null) {
        return NULL_VALUE
      }

      if (isInclusive) {
        return leftCmp >= 0 && rightCmp <= 0 ? TRUE_VALUE : FALSE_VALUE
      }

      return leftCmp >= 0 && rightCmp < 0 ? TRUE_VALUE : FALSE_VALUE
    },
  ),

  Filter: arrayExecutor(
    ({base, expr}) => ({array: base, inner: expr}),
    function* (_, elem, inner) {
      if (inner === true) yield elem
    },
  ),

  Projection: {
    executeSync({base, expr}, scope) {
      const baseValue = executeSync(base, scope)

      if (baseValue.type !== 'object') {
        return NULL_VALUE
      }

      const newScope = scope.createNested(baseValue)
      return executeSync(expr, newScope)
    },

    async executeAsync({base, expr}, scope) {
      const baseValue = await executeAsync(base, scope)
      if (baseValue.type !== 'object') {
        return NULL_VALUE
      }

      const newScope = scope.createNested(baseValue)
      return executeAsync(expr, newScope)
    },
  },

  FuncCall: {
    executeAsync({func, args}, scope) {
      return func.executeAsync(args, scope)
    },

    executeSync({func, args}, scope) {
      return func.executeSync(args, scope)
    },
  },

  PipeFuncCall: {
    async executeAsync({func, base, args}, scope) {
      const baseValue = await executeAsync(base, scope)
      if (baseValue.type !== 'stream' && baseValue.type !== 'array') return NULL_VALUE
      return func.executeAsync({base: baseValue, args}, scope)
    },

    executeSync({func, base, args}, scope) {
      const baseValue = executeSync(base, scope)
      if (baseValue.type !== 'array') return NULL_VALUE
      return func.executeSync({base: baseValue, args}, scope)
    },
  },

  AccessAttribute: mappedExecutor(
    ({base}) => [base || {type: 'This'}],
    ({name}, value) => {
      if (value.type === 'object') {
        if (value.data.hasOwnProperty(name)) {
          return fromJS(value.data[name]) as ObjectValue
        }
      }

      return NULL_VALUE
    },
  ),

  AccessElement: mappedExecutor(
    ({base}) => [base],
    ({index}, baseValue) => {
      if (baseValue.type !== 'array') return NULL_VALUE
      const data = baseValue.data
      const finalIndex = index < 0 ? index + data.length : index
      return fromJS(data[finalIndex])
    },
  ),

  Slice: mappedExecutor(
    ({base}) => [base],
    ({left, right, isInclusive}, baseValue) => {
      if (baseValue.type !== 'array') {
        return NULL_VALUE
      }

      // OPT: Here we can optimize when either indices are >= 0
      const array = baseValue.data

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

      return fromArray(array.slice(leftIdx, rightIdx))
    },
  ),

  Deref: {
    executeSync({base}, scope) {
      const value = executeSync(base, scope)

      if (value.type !== 'object') {
        return NULL_VALUE
      }

      const id = value.data['_ref']
      if (typeof id !== 'string') {
        return NULL_VALUE
      }

      if (scope.context.dereference) {
        const value = scope.context.dereference({_ref: id})
        if (value && typeof value === 'object' && 'then' in value) {
          throw new Error('Dereference returned promise in synchronous mode')
        }

        return fromJS(value) as AnyStaticValue
      }

      if (scope.source.type !== 'array') {
        return NULL_VALUE
      }

      for (const doc of scope.source.data) {
        if (doc && typeof doc === 'object' && '_id' in doc && id === doc['_id']) {
          return fromJS(doc) as ObjectValue
        }
      }

      return NULL_VALUE
    },

    async executeAsync({base}, scope) {
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
    },
  },

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

  Object: {
    executeSync({attributes}, scope) {
      const result: {[key: string]: any} = {}
      for (const attr of attributes) {
        const attrType = attr.type
        switch (attr.type) {
          case 'ObjectAttributeValue': {
            const value = executeSync(attr.value, scope)
            result[attr.name] = value.data
            break
          }

          case 'ObjectConditionalSplat': {
            const cond = executeSync(attr.condition, scope)
            if (cond.type !== 'boolean' || cond.data === false) {
              continue
            }

            const value = executeSync(attr.value, scope)
            if (value.type === 'object') {
              Object.assign(result, value.data)
            }
            break
          }

          case 'ObjectSplat': {
            const value = executeSync(attr.value, scope)
            if (value.type === 'object') {
              Object.assign(result, value.data)
            }
            break
          }

          default:
            throw new Error(`Unknown node type: ${attrType}`)
        }
      }
      return fromJS(result) as ObjectValue
    },

    async executeAsync({attributes}, scope) {
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
    },
  },

  Array: {
    executeSync({elements}, scope) {
      const result = []
      for (const element of elements) {
        const value = executeSync(element.value, scope)
        if (element.isSplat) {
          if (value.type === 'array') {
            for (const v of value.data) {
              result.push(v)
            }
          }
        } else {
          result.push(value.data)
        }
      }

      return fromArray(result)
    },

    async executeAsync({elements}, scope) {
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
    },
  },

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

  ArrayCoerce: {
    executeSync({base}, scope) {
      const value = executeSync(base, scope)
      return value.isArray() ? value : NULL_VALUE
    },

    async executeAsync({base}, scope) {
      const value = await executeAsync(base, scope)
      return value.isArray() ? value : NULL_VALUE
    },
  },

  Map: arrayExecutor(
    ({base, expr}) => ({array: base, inner: expr}),
    function* (_, _item, inner) {
      yield inner
    },
    {hidden: true},
  ),

  FlatMap: arrayExecutor(
    ({base, expr}) => ({array: base, inner: expr}),
    function* (_, _item, inner) {
      if (Array.isArray(inner)) {
        for (const innerInner of inner) {
          yield innerInner
        }
      } else {
        yield inner
      }
    },
    {hidden: true},
  ),
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
