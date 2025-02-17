/* eslint-disable require-yield */
import type {ExprNode, FuncCallNode, PipeFuncCallNode} from '../nodeTypes'
import {
  co,
  FALSE_VALUE,
  fromJS,
  fromNumber,
  NULL_VALUE,
  StreamValue,
  TRUE_VALUE,
  type Value,
} from '../values'
import {operators} from './operators'
import {partialCompare} from './ordering'
import {Scope} from './scope'
import type {EvaluateOptions, Executor} from './types'

export function evaluate(
  node: ExprNode,
  scope: Scope,
  execute: Executor = evaluate,
): Value | PromiseLike<Value> {
  const func = EXECUTORS[node.type]
  return func(
    // @ts-expect-error: TS struggles with the complex intersection of executor
    // types, so it can't verify that `node` matches the expected type for `func`.
    // We know by design that each executor handles its corresponding node type.
    node,
    scope,
    execute,
  )
}

type ExecutorMap = {
  [TKey in ExprNode['type']]: (
    node: Extract<ExprNode, {type: TKey}>,
    scope: Scope,
    exec: Executor,
  ) => Value | PromiseLike<Value>
}

const EXECUTORS: ExecutorMap = {
  This(_, scope) {
    return scope.value
  },

  Selector() {
    // These should be evaluated separely using a different evaluator.
    // At the mooment we haven't implemented this.
    throw new Error('Selectors can not be evaluated')
  },

  Everything(_, scope) {
    return scope.source
  },

  Parameter({name}, scope) {
    return fromJS(scope.params[name])
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

  OpCall({op, left, right}, scope, execute) {
    return co<Value>(function* () {
      const func = operators[op]
      if (!func) {
        throw new Error(`Unknown operator: ${op}`)
      }
      const leftValue = yield execute(left, scope)
      const rightValue = yield execute(right, scope)

      return yield func(leftValue, rightValue)
    })
  },

  Select({alternatives, fallback}, scope, execute) {
    return co<Value>(function* () {
      for (const alt of alternatives) {
        const altCond = yield execute(alt.condition, scope)
        if (altCond.type === 'boolean' && altCond.data === true) {
          return yield execute(alt.value, scope)
        }
      }

      if (fallback) {
        return yield execute(fallback, scope)
      }

      return NULL_VALUE
    })
  },

  InRange({base, left, right, isInclusive}, scope, execute) {
    return co<unknown>(function* (): Generator<unknown, Value, unknown> {
      const value = (yield execute(base, scope)) as Value
      const leftValue = (yield execute(left, scope)) as Value
      const rightValue = (yield execute(right, scope)) as Value

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

  Filter({base, expr}, scope, execute) {
    return co<Value>(function* () {
      const baseValue = yield execute(base, scope)
      if (!baseValue.isArray()) {
        return NULL_VALUE
      }

      return new StreamValue(async function* () {
        for await (const elem of baseValue) {
          const newScope = scope.createNested(elem)
          const exprValue = await execute(expr, newScope)
          if (exprValue.type === 'boolean' && exprValue.data === true) {
            yield elem
          }
        }
      })
    })
  },

  Projection({base, expr}, scope, execute) {
    return co<Value>(function* () {
      const baseValue = yield execute(base, scope)
      if (baseValue.type !== 'object') {
        return NULL_VALUE
      }

      const newScope = scope.createNested(baseValue)
      return yield execute(expr, newScope)
    })
  },

  FuncCall({func, args}: FuncCallNode, scope: Scope, execute) {
    return func(args, scope, execute)
  },

  PipeFuncCall({func, base, args}: PipeFuncCallNode, scope: Scope, execute) {
    return co<Value>(function* () {
      const baseValue = yield execute(base, scope)
      return yield func(baseValue, args, scope, execute)
    })
  },

  AccessAttribute({base, name}, scope, execute) {
    return co<Value>(function* () {
      let value = scope.value
      if (base) {
        value = yield execute(base, scope)
      }
      if (value.type === 'object') {
        if (value.data.hasOwnProperty(name)) {
          return fromJS(value.data[name])
        }
      }

      return NULL_VALUE
    })
  },

  AccessElement({base, index}, scope, execute) {
    return co<unknown>(function* (): Generator<unknown, Value, unknown> {
      const baseValue = (yield execute(base, scope)) as Value

      if (!baseValue.isArray()) {
        return NULL_VALUE
      }

      const data = (yield baseValue.get()) as unknown[]
      const finalIndex = index < 0 ? index + data.length : index
      return fromJS(data[finalIndex])
    }) as Value | PromiseLike<Value>
  },

  Slice({base, left, right, isInclusive}, scope, execute) {
    return co<unknown>(function* (): Generator<unknown, Value, unknown> {
      const baseValue = (yield execute(base, scope)) as Value

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

      return fromJS(array.slice(leftIdx, rightIdx))
    }) as Value | PromiseLike<Value>
  },

  Deref({base}, scope, execute) {
    return co(function* (): Generator<unknown, Value, unknown> {
      const value = (yield execute(base, scope)) as Value

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
        return fromJS(dereferenced)
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

  Value({value}) {
    return fromJS(value)
  },

  Group({base}, scope, execute) {
    return execute(base, scope)
  },

  Object({attributes}, scope, execute) {
    return co(function* (): Generator<unknown, Value, unknown> {
      const result: {[key: string]: unknown} = {}
      for (const attr of attributes) {
        const attrType = attr.type
        switch (attr.type) {
          case 'ObjectAttributeValue': {
            const value = (yield execute(attr.value, scope)) as Value
            result[attr.name] = yield value.get()
            break
          }

          case 'ObjectConditionalSplat': {
            const cond = (yield execute(attr.condition, scope)) as Value
            if (cond.type !== 'boolean' || cond.data === false) {
              continue
            }

            const value = (yield execute(attr.value, scope)) as Value
            if (value.type === 'object') {
              Object.assign(result, value.data)
            }
            break
          }

          case 'ObjectSplat': {
            const value = (yield execute(attr.value, scope)) as Value
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
    }) as Value | PromiseLike<Value>
  },

  Array({elements}, scope, execute) {
    return new StreamValue(async function* () {
      for (const element of elements) {
        const value = await execute(element.value, scope)
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

  Tuple() {
    throw new Error('tuples can not be evaluated')
  },

  Or({left, right}, scope, execute) {
    return co<Value>(function* () {
      const leftValue = yield execute(left, scope)
      const rightValue = yield execute(right, scope)

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

  And({left, right}, scope, execute) {
    return co<Value>(function* () {
      const leftValue = yield execute(left, scope)
      const rightValue = yield execute(right, scope)

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

  Not({base}, scope, execute) {
    return co<Value>(function* () {
      const value = yield execute(base, scope)
      if (value.type !== 'boolean') {
        return NULL_VALUE
      }
      return value.data ? FALSE_VALUE : TRUE_VALUE
    })
  },

  Neg({base}, scope, execute) {
    return co<Value>(function* () {
      const value = yield execute(base, scope)
      if (value.type !== 'number') {
        return NULL_VALUE
      }
      return fromNumber(-value.data)
    })
  },

  Pos({base}, scope, execute) {
    return co<Value>(function* () {
      const value = yield execute(base, scope)
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

  ArrayCoerce({base}, scope, execute) {
    return co<Value>(function* () {
      const value = yield execute(base, scope)
      return value.isArray() ? value : NULL_VALUE
    })
  },

  Map({base, expr}, scope, execute) {
    return co<Value>(function* () {
      const value = yield execute(base, scope)
      if (!value.isArray()) {
        return NULL_VALUE
      }

      return new StreamValue(async function* () {
        for await (const elem of value) {
          const newScope = scope.createHidden(elem)
          yield await execute(expr, newScope)
        }
      })
    })
  },

  FlatMap({base, expr}, scope, execute) {
    return co<Value>(function* () {
      const value = yield execute(base, scope)
      if (!value.isArray()) {
        return NULL_VALUE
      }

      return new StreamValue(async function* () {
        for await (const elem of value) {
          const newScope = scope.createHidden(elem)
          const innerValue = await execute(expr, newScope)
          if (innerValue.isArray()) {
            for await (const inner of innerValue) {
              yield inner
            }
          } else {
            yield innerValue
          }
        }
      })
    })
  },
}

/**
 * Evaluates a query.
 * @internal
 */
export function evaluateQuery(
  tree: ExprNode,
  options: EvaluateOptions = {},
): Value | PromiseLike<Value> {
  const root = fromJS(options.root)
  const dataset = fromJS(options.dataset)
  const params: {[key: string]: unknown} = {...options.params}

  const scope = new Scope(
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
  return evaluate(tree, scope)
}
