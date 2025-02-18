/* eslint-disable require-yield */
import type {ExprNode, FuncCallNode, PipeFuncCallNode} from '../nodeTypes'
import {
  co,
  FALSE_VALUE,
  fromJS,
  fromNumber,
  isPromiseLike,
  NULL_VALUE,
  StaticValue,
  StreamValue,
  TRUE_VALUE,
  type Value,
} from '../values'
import {operators} from './operators'
import {partialCompare} from './ordering'
import {Scope} from './scope'
import type {Context, EvaluateOptions} from './types'

export function evaluate(
  node: ExprNode,
  scope: Scope,
  mode: 'sync' | 'async',
): Value | PromiseLike<Value> {
  const func = EXECUTORS[node.type]
  return func(
    // @ts-expect-error: TS struggles with the complex intersection of executor
    // types, so it can't verify that `node` matches the expected type for `func`.
    // We know by design that each executor handles its corresponding node type.
    node,
    scope,
    mode,
  )
}

type ExecutorMap = {
  [TKey in ExprNode['type']]: (
    node: Extract<ExprNode, {type: TKey}>,
    scope: Scope,
    mode: 'sync' | 'async',
  ) => Value | PromiseLike<Value>
}

const EXECUTORS: ExecutorMap = {
  This(_, scope) {
    return scope.value
  },

  Selector() {
    // These should be evaluated separately using a different evaluator.
    // At the moment we haven't implemented this.
    throw new Error('Selectors can not be evaluated')
  },

  Everything(_, scope) {
    return scope.source
  },

  Parameter({name}, scope, mode) {
    return fromJS(scope.params[name], mode)
  },

  Context({key}, scope) {
    if (key === 'before' || key === 'after') {
      const value = scope.context[key]
      return value || NULL_VALUE
    }
    throw new Error(`unknown context key: ${key}`)
  },

  Parent({n}, scope) {
    let current = scope
    for (let i = 0; i < n; i++) {
      if (!current.parent) {
        return NULL_VALUE
      }

      current = current.parent
    }
    return current.value
  },

  OpCall({op, left, right}, scope, mode) {
    return co<Value>(function* () {
      const func = operators[op]
      if (!func) {
        throw new Error(`Unknown operator: ${op}`)
      }
      const leftValue = yield evaluate(left, scope, mode)
      const rightValue = yield evaluate(right, scope, mode)

      return yield func(leftValue, rightValue, mode)
    })
  },

  Select({alternatives, fallback}, scope, mode) {
    return co<Value>(function* () {
      for (const alt of alternatives) {
        const altCond = yield evaluate(alt.condition, scope, mode)
        if (altCond.type === 'boolean' && altCond.data === true) {
          return yield evaluate(alt.value, scope, mode)
        }
      }

      if (fallback) {
        return yield evaluate(fallback, scope, mode)
      }

      return NULL_VALUE
    })
  },

  InRange({base, left, right, isInclusive}, scope, mode) {
    return co<unknown>(function* (): Generator<unknown, Value, unknown> {
      const value = (yield evaluate(base, scope, mode)) as Value
      const leftValue = (yield evaluate(left, scope, mode)) as Value
      const rightValue = (yield evaluate(right, scope, mode)) as Value

      const leftCmp = partialCompare(yield value.get(), yield leftValue.get())
      if (leftCmp === null) {
        return NULL_VALUE
      }
      const rightCmp = partialCompare(yield value.get(), yield rightValue.get())
      if (rightCmp === null) {
        return NULL_VALUE
      }

      if (isInclusive) {
        return leftCmp >= 0 && rightCmp <= 0 ? TRUE_VALUE : FALSE_VALUE
      }

      return leftCmp >= 0 && rightCmp < 0 ? TRUE_VALUE : FALSE_VALUE
    }) as Value | PromiseLike<Value>
  },

  Filter({base, expr}, scope, mode) {
    return co<unknown>(function* (): Generator<unknown, Value, unknown> {
      const baseValue = (yield evaluate(base, scope, mode)) as Value
      if (!baseValue.isArray()) {
        return NULL_VALUE
      }

      if (mode === 'sync') {
        const data = (yield baseValue.get()) as unknown[]
        const next: unknown[] = []

        for (const item of data) {
          const elem = fromJS(item, mode)
          const newScope = scope.createNested(elem)
          const exprValue = (yield evaluate(expr, newScope, mode)) as Value
          if (exprValue.type === 'boolean' && exprValue.data === true) {
            next.push(item)
          }
        }
        return new StaticValue(next, 'array')
      }

      return new StreamValue(async function* () {
        for await (const elem of baseValue) {
          const newScope = scope.createNested(elem)
          const exprValue = await evaluate(expr, newScope, mode)
          if (exprValue.type === 'boolean' && exprValue.data === true) {
            yield elem
          }
        }
      })
    }) as Value | PromiseLike<Value>
  },

  Projection({base, expr}, scope, mode) {
    return co<Value>(function* () {
      const baseValue = yield evaluate(base, scope, mode)
      if (baseValue.type !== 'object') {
        return NULL_VALUE
      }

      const newScope = scope.createNested(baseValue)
      return yield evaluate(expr, newScope, mode)
    })
  },

  FuncCall({func, args}: FuncCallNode, scope: Scope, mode) {
    return func(args, scope, mode)
  },

  PipeFuncCall({func, base, args}: PipeFuncCallNode, scope, mode) {
    return co<Value>(function* () {
      const baseValue = yield evaluate(base, scope, mode)
      return yield func(baseValue, args, scope, mode)
    })
  },

  AccessAttribute({base, name}, scope, mode) {
    return co<Value>(function* () {
      let value = scope.value
      if (base) {
        value = yield evaluate(base, scope, mode)
      }
      if (value.type === 'object') {
        if (value.data.hasOwnProperty(name)) {
          return fromJS(value.data[name], mode)
        }
      }

      return NULL_VALUE
    })
  },

  AccessElement({base, index}, scope, mode) {
    return co<unknown>(function* (): Generator<unknown, Value, unknown> {
      const baseValue = (yield evaluate(base, scope, mode)) as Value

      if (!baseValue.isArray()) {
        return NULL_VALUE
      }

      const data = (yield baseValue.get()) as unknown[]
      const finalIndex = index < 0 ? index + data.length : index
      return fromJS(data[finalIndex], mode)
    }) as Value | PromiseLike<Value>
  },

  Slice({base, left, right, isInclusive}, scope, mode) {
    return co<unknown>(function* (): Generator<unknown, Value, unknown> {
      const baseValue = (yield evaluate(base, scope, mode)) as Value

      if (!baseValue.isArray()) {
        return NULL_VALUE
      }

      // OPT: Here we can optimize when either indices are >= 0
      const array = (yield baseValue.get()) as unknown[]

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

      return fromJS(array.slice(leftIdx, rightIdx), mode)
    }) as Value | PromiseLike<Value>
  },

  Deref({base}, scope, mode) {
    return co(function* (): Generator<unknown, Value, unknown> {
      const value = (yield evaluate(base, scope, mode)) as Value

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
        type ScopeDereferenced = Awaited<ReturnType<NonNullable<Scope['context']['dereference']>>>
        const dereferenced = (yield scope.context.dereference({_ref: id})) as ScopeDereferenced
        return fromJS(dereferenced, mode)
      }

      type ScopeFirst = Awaited<ReturnType<Scope['source']['first']>>
      const firstDoc = (yield scope.source.first(
        (doc) => doc.type === 'object' && id == doc.data['_id'],
      )) as ScopeFirst
      if (firstDoc) {
        return firstDoc
      }

      return NULL_VALUE
    }) as Value | PromiseLike<Value>
  },

  Value({value}, _scope, mode) {
    return fromJS(value, mode)
  },

  Group({base}, scope, mode) {
    return evaluate(base, scope, mode)
  },

  Object({attributes}, scope, mode) {
    return co(function* (): Generator<unknown, Value, unknown> {
      const result: {[key: string]: unknown} = {}
      for (const attr of attributes) {
        const attrType = attr.type
        switch (attr.type) {
          case 'ObjectAttributeValue': {
            const value = (yield evaluate(attr.value, scope, mode)) as Value
            result[attr.name] = yield value.get()
            break
          }

          case 'ObjectConditionalSplat': {
            const cond = (yield evaluate(attr.condition, scope, mode)) as Value
            if (cond.type !== 'boolean' || cond.data === false) {
              continue
            }

            const value = (yield evaluate(attr.value, scope, mode)) as Value
            if (value.type === 'object') {
              Object.assign(result, value.data)
            }
            break
          }

          case 'ObjectSplat': {
            const value = (yield evaluate(attr.value, scope, mode)) as Value
            if (value.type === 'object') {
              Object.assign(result, value.data)
            }
            break
          }

          default:
            throw new Error(`Unknown node type: ${attrType}`)
        }
      }
      return fromJS(result, mode)
    }) as Value | PromiseLike<Value>
  },

  Array({elements}, scope, mode) {
    return co<unknown>(function* (): Generator<unknown, Value, unknown> {
      if (mode === 'sync') {
        const next: unknown[] = []

        for (const element of elements) {
          const value = (yield evaluate(element.value, scope, mode)) as Value
          if (element.isSplat) {
            if (value.isArray()) {
              const nested = (yield value.get()) as unknown[]
              next.push(...nested)
            }
          } else {
            next.push(yield value.get())
          }
        }

        return new StaticValue(next, 'array')
      }

      return new StreamValue(async function* () {
        for (const element of elements) {
          const value = await evaluate(element.value, scope, mode)
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
    }) as Value | PromiseLike<Value>
  },

  Tuple() {
    throw new Error('tuples can not be evaluated')
  },

  Or({left, right}, scope, mode) {
    return co<Value>(function* () {
      const leftValue = yield evaluate(left, scope, mode)
      const rightValue = yield evaluate(right, scope, mode)

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
    })
  },

  And({left, right}, scope, mode) {
    return co<Value>(function* () {
      const leftValue = yield evaluate(left, scope, mode)
      const rightValue = yield evaluate(right, scope, mode)

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
    })
  },

  Not({base}, scope, mode) {
    return co<Value>(function* () {
      const value = yield evaluate(base, scope, mode)
      if (value.type !== 'boolean') {
        return NULL_VALUE
      }
      return value.data ? FALSE_VALUE : TRUE_VALUE
    })
  },

  Neg({base}, scope, mode) {
    return co<Value>(function* () {
      const value = yield evaluate(base, scope, mode)
      if (value.type !== 'number') {
        return NULL_VALUE
      }
      return fromNumber(-value.data)
    })
  },

  Pos({base}, scope, mode) {
    return co<Value>(function* () {
      const value = yield evaluate(base, scope, mode)
      if (value.type !== 'number') {
        return NULL_VALUE
      }
      return fromNumber(value.data)
    })
  },

  Asc() {
    return NULL_VALUE
  },

  Desc() {
    return NULL_VALUE
  },

  ArrayCoerce({base}, scope, mode) {
    return co<Value>(function* () {
      const value = yield evaluate(base, scope, mode)
      return value.isArray() ? value : NULL_VALUE
    })
  },

  Map({base, expr}, scope, mode) {
    return co<unknown>(function* (): Generator<unknown, Value, unknown> {
      const value = (yield evaluate(base, scope, mode)) as Value
      if (!value.isArray()) {
        return NULL_VALUE
      }

      if (mode === 'sync') {
        const data = (yield value.get()) as unknown[]
        const next: unknown[] = []

        for (const item of data) {
          const elem = fromJS(item, 'sync')
          const newScope = scope.createHidden(elem)
          const exprValue = (yield evaluate(expr, newScope, mode)) as Value
          next.push(yield exprValue.get())
        }

        return new StaticValue(next, 'array')
      }

      return new StreamValue(async function* () {
        for await (const elem of value) {
          const newScope = scope.createHidden(elem)
          yield await evaluate(expr, newScope, mode)
        }
      })
    }) as Value | PromiseLike<Value>
  },

  FlatMap({base, expr}, scope, mode) {
    return co<unknown>(function* (): Generator<unknown, Value, unknown> {
      const value = (yield evaluate(base, scope, mode)) as Value
      if (!value.isArray()) {
        return NULL_VALUE
      }

      if (mode === 'sync') {
        const data = (yield value.get()) as unknown[]
        const next: unknown[] = []

        for (const item of data) {
          const elem = fromJS(item, 'sync')
          const newScope = scope.createHidden(elem)
          const innerValue = (yield evaluate(expr, newScope, mode)) as Value

          if (innerValue.isArray()) {
            const nested = (yield innerValue.get()) as unknown[]
            next.push(...nested)
          } else {
            const nested = yield innerValue.get()
            next.push(nested)
          }
        }

        return new StaticValue(next, 'array')
      }

      return new StreamValue(async function* () {
        for await (const elem of value) {
          const newScope = scope.createHidden(elem)
          const innerValue = await evaluate(expr, newScope, mode)
          if (innerValue.isArray()) {
            for await (const inner of innerValue) {
              yield inner
            }
          } else {
            yield innerValue
          }
        }
      })
    }) as Value | PromiseLike<Value>
  },
}

function getContext(options: EvaluateOptions = {}, mode: 'sync' | 'async'): Context {
  return {
    timestamp: options.timestamp || new Date(),
    identity: options.identity === undefined ? 'me' : options.identity,
    sanity: options.sanity,
    after: options.after ? fromJS(options.after, mode) : null,
    before: options.before ? fromJS(options.before, mode) : null,
    dereference: options.dereference,
  }
}

/**
 * Evaluates a query.
 * @internal
 */
export function evaluateQuery(
  tree: ExprNode,
  options: EvaluateOptions = {},
): Value | PromiseLike<Value> {
  const root = fromJS(options.root, 'async')
  const dataset = fromJS(options.dataset, 'async')
  const params: {[key: string]: unknown} = {...options.params}

  const scope = new Scope(params, dataset, root, getContext(options, 'async'), null)
  return evaluate(tree, scope, 'async')
}

/**
 * Evaluates a query.
 * @internal
 */
export function evaluateQuerySync(tree: ExprNode, options: EvaluateOptions = {}): Value {
  const root = fromJS(options.root, 'sync')
  const dataset = fromJS(options.dataset, 'sync')
  const params: {[key: string]: unknown} = {...options.params}

  const scope = new Scope(params, dataset, root, getContext(options, 'sync'), null)

  const result = evaluate(tree, scope, 'sync')
  if (isPromiseLike(result)) {
    throw new Error(
      `Unexpected promise when evaluating. This expression may not support evaluateSync.`,
    )
  }

  return result
}
