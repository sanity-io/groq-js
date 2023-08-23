import {ExprNode, FuncCallNode, PipeFuncCallNode} from '../nodeTypes'
import {
  FALSE_VALUE,
  fromJS,
  fromNumber,
  NULL_VALUE,
  StreamValue,
  TRUE_VALUE,
  Value,
} from '../values'
import {operators} from './operators'
import {partialCompare} from './ordering'
import {Scope} from './scope'
import {EvaluateOptions, Executor} from './types'

export function evaluate(
  node: ExprNode,
  scope: Scope,
  execute: Executor = evaluate,
): Value | PromiseLike<Value> {
  const func = EXECUTORS[node.type]
  return func(node as any, scope, execute)
}

type NarrowNode<T, N> = T extends {type: N} ? T : never

type ExecutorMap = {
  [key in ExprNode['type']]: (
    node: NarrowNode<ExprNode, key>,
    scope: Scope,
    exec: Executor,
  ) => Value | PromiseLike<Value>
}

/**
 * Applies the function to a value, but tries to avoid creating unnecessary promises.
 */
function promiselessApply(
  value: Value | PromiseLike<Value>,
  cb: (val: Value) => Value,
): Value | PromiseLike<Value> {
  if ('then' in value) {
    return value.then(cb)
  }

  return cb(value)
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
    const func = operators[op]
    if (!func) {
      throw new Error(`Unknown operator: ${op}`)
    }
    const leftValue = execute(left, scope)
    const rightValue = execute(right, scope)

    // Avoid uneccesary promises
    // This is required for constant evaluation to work correctly.
    if ('then' in leftValue || 'then' in rightValue) {
      return (async () => func(await leftValue, await rightValue))()
    }

    return func(leftValue, rightValue)
  },

  async Select({alternatives, fallback}, scope, execute) {
    for (const alt of alternatives) {
      const altCond = await execute(alt.condition, scope)
      if (altCond.type === 'boolean' && altCond.data === true) {
        return execute(alt.value, scope)
      }
    }

    if (fallback) {
      return execute(fallback, scope)
    }

    return NULL_VALUE
  },

  async InRange({base, left, right, isInclusive}, scope, execute) {
    const value = await execute(base, scope)
    const leftValue = await execute(left, scope)
    const rightValue = await execute(right, scope)

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
  },

  async Filter({base, expr}, scope, execute) {
    const baseValue = await execute(base, scope)
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
  },

  async Projection({base, expr}, scope, execute) {
    const baseValue = await execute(base, scope)
    if (baseValue.type !== 'object') {
      return NULL_VALUE
    }

    const newScope = scope.createNested(baseValue)
    return execute(expr, newScope)
  },

  FuncCall({func, args}: FuncCallNode, scope: Scope, execute) {
    return func(args, scope, execute)
  },

  async PipeFuncCall({func, base, args}: PipeFuncCallNode, scope: Scope, execute) {
    const baseValue = await execute(base, scope)
    return func(baseValue, args, scope, execute)
  },

  async AccessAttribute({base, name}, scope, execute) {
    let value = scope.value
    if (base) {
      value = await execute(base, scope)
    }
    if (value.type === 'object') {
      if (value.data.hasOwnProperty(name)) {
        return fromJS(value.data[name])
      }
    }

    return NULL_VALUE
  },

  async AccessElement({base, index}, scope, execute) {
    const baseValue = await execute(base, scope)
    if (!baseValue.isArray()) {
      return NULL_VALUE
    }

    const data = await baseValue.get()
    const finalIndex = index < 0 ? index + data.length : index
    return fromJS(data[finalIndex])
  },

  async Slice({base, left, right, isInclusive}, scope, execute) {
    const baseValue = await execute(base, scope)

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
  },

  async Deref({base}, scope, execute) {
    const value = await execute(base, scope)

    if (!scope.source.isArray()) {
      return NULL_VALUE
    }

    if (value.type !== 'object') {
      return NULL_VALUE
    }

    const id = value.data._ref
    if (typeof id !== 'string') {
      return NULL_VALUE
    }

    if (scope.context.dereference) {
      return fromJS(await scope.context.dereference({_ref: id}))
    }

    for await (const doc of scope.source) {
      if (doc.type === 'object' && id === doc.data._id) {
        return doc
      }
    }

    return NULL_VALUE
  },

  Value({value}) {
    return fromJS(value)
  },

  Group({base}, scope, execute) {
    return execute(base, scope)
  },

  async Object({attributes}, scope, execute) {
    const result: {[key: string]: any} = {}
    for (const attr of attributes) {
      const attrType = attr.type
      switch (attr.type) {
        case 'ObjectAttributeValue': {
          const value = await execute(attr.value, scope)
          result[attr.name] = await value.get()
          break
        }

        case 'ObjectConditionalSplat': {
          const cond = await execute(attr.condition, scope)
          if (cond.type !== 'boolean' || cond.data === false) {
            continue
          }

          const value = await execute(attr.value, scope)
          if (value.type === 'object') {
            Object.assign(result, value.data)
          }
          break
        }

        case 'ObjectSplat': {
          const value = await execute(attr.value, scope)
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

  async Or({left, right}, scope, execute) {
    const leftValue = await execute(left, scope)
    const rightValue = await execute(right, scope)

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

  async And({left, right}, scope, execute) {
    const leftValue = await execute(left, scope)
    const rightValue = await execute(right, scope)

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

  async Not({base}, scope, execute) {
    const value = await execute(base, scope)
    if (value.type !== 'boolean') {
      return NULL_VALUE
    }
    return value.data ? FALSE_VALUE : TRUE_VALUE
  },

  Neg({base}, scope, execute) {
    return promiselessApply(execute(base, scope), (value) => {
      if (value.type !== 'number') {
        return NULL_VALUE
      }
      return fromNumber(-value.data)
    })
  },

  Pos({base}, scope, execute) {
    return promiselessApply(execute(base, scope), (value) => {
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

  async ArrayCoerce({base}, scope, execute) {
    const value = await execute(base, scope)
    return value.isArray() ? value : NULL_VALUE
  },

  async Map({base, expr}, scope, execute) {
    const value = await execute(base, scope)
    if (!value.isArray()) {
      return NULL_VALUE
    }

    return new StreamValue(async function* () {
      for await (const elem of value) {
        const newScope = scope.createHidden(elem)
        yield await execute(expr, newScope)
      }
    })
  },

  async FlatMap({base, expr}, scope, execute) {
    const value = await execute(base, scope)
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
  },
}

/**
 * Evaluates a query.
 */
export function evaluateQuery(
  tree: ExprNode,
  options: EvaluateOptions = {},
): Value | PromiseLike<Value> {
  const root = fromJS(options.root)
  const dataset = fromJS(options.dataset)
  const params: {[key: string]: any} = {...options.params}

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
