import type {ExprNode} from '../nodeTypes'
import {totalCompare} from './ordering'
import {Scope} from './scope'
import {evaluateScore} from './scoring'
import {Executor} from './types'
import {
  getType,
  fromNumber,
  TRUE_VALUE,
  FALSE_VALUE,
  NULL_VALUE,
  Value,
  DateTime,
  fromString,
  fromPath,
  Path,
  fromJS,
} from '../values'

function hasReference(value: any, pathSet: Set<string>): boolean {
  switch (getType(value)) {
    case 'array':
      for (const v of value) {
        if (hasReference(v, pathSet)) {
          return true
        }
      }
      break
    case 'object':
      if (value._ref) {
        return pathSet.has(value._ref)
      }
      for (const v of Object.values(value)) {
        if (hasReference(v, pathSet)) {
          return true
        }
      }
      break
    default:
  }
  return false
}

function countUTF8(str: string): number {
  let count = 0
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i)
    if (code >= 0xd800 && code <= 0xdbff) {
      // High surrogate. Don't count this.
      // By only counting the low surrogate we will correctly
      // count the number of UTF-8 code points.
      continue
    }
    count++
  }
  return count
}

type GroqFunctionArg = ExprNode
type WithArity<T> = T & {
  arity?: GroqFunctionArity
}

export type GroqFunctionArity = number | ((count: number) => boolean)

export type GroqFunction = (
  args: GroqFunctionArg[],
  scope: Scope,
  execute: Executor
) => PromiseLike<Value>

export const functions: {[key: string]: WithArity<GroqFunction>} = {}

functions.coalesce = async function coalesce(args, scope, execute) {
  for (const arg of args) {
    const value = await execute(arg, scope)
    if (value.type !== 'null') {
      return value
    }
  }
  return NULL_VALUE
}

functions.count = async function count(args, scope, execute) {
  const inner = await execute(args[0], scope)
  if (!inner.isArray()) {
    return NULL_VALUE
  }

  let num = 0
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for await (const _ of inner) {
    num++
  }
  return fromNumber(num)
}
functions.count.arity = 1

functions.dateTime = async function dateTime(args, scope, execute) {
  const val = await execute(args[0], scope)
  if (val.type === 'datetime') {
    return val
  }
  if (val.type !== 'string') {
    return NULL_VALUE
  }
  return DateTime.parseToValue(val.data)
}
functions.dateTime.arity = 1

functions.defined = async function defined(args, scope, execute) {
  const inner = await execute(args[0], scope)
  return inner.type === 'null' ? FALSE_VALUE : TRUE_VALUE
}
functions.defined.arity = 1

// eslint-disable-next-line require-await
functions.identity = async function identity(args) {
  return fromString('me')
}
functions.identity.arity = 0

functions.length = async function length(args, scope, execute) {
  const inner = await execute(args[0], scope)

  if (inner.type === 'string') {
    return fromNumber(countUTF8(inner.data))
  }

  if (inner.isArray()) {
    let num = 0
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const _ of inner) {
      num++
    }
    return fromNumber(num)
  }

  return NULL_VALUE
}
functions.length.arity = 1

functions.path = async function path(args, scope, execute) {
  const inner = await execute(args[0], scope)
  if (inner.type !== 'string') {
    return NULL_VALUE
  }

  return fromPath(new Path(inner.data))
}
functions.path.arity = 1

functions.string = async function string(args, scope, execute) {
  const value = await execute(args[0], scope)
  switch (value.type) {
    case 'number':
    case 'string':
    case 'boolean':
    case 'datetime':
      return fromString(`${value.data}`)
    default:
      return NULL_VALUE
  }
}
functions.string.arity = 1

functions.references = async function references(args, scope, execute) {
  const pathSet = new Set<string>()
  for (const arg of args) {
    const path = await execute(arg, scope)
    if (path.type === 'string') {
      pathSet.add(path.data)
    } else if (path.isArray()) {
      for await (const elem of path) {
        if (elem.type === 'string') {
          pathSet.add(elem.data)
        }
      }
    }
  }

  if (pathSet.size === 0) {
    return FALSE_VALUE
  }

  const scopeValue = await scope.value.get()
  return hasReference(scopeValue, pathSet) ? TRUE_VALUE : FALSE_VALUE
}
functions.references.arity = (c) => c >= 1

functions.round = async function round(args, scope, execute) {
  const value = await execute(args[0], scope)
  if (value.type !== 'number') {
    return NULL_VALUE
  }

  const num = value.data
  let prec = 0

  if (args.length === 2) {
    const precValue = await execute(args[1], scope)
    if (precValue.type !== 'number' || precValue.data < 0) {
      return NULL_VALUE
    }
    prec = precValue.data
  }

  if (prec === 0) {
    return fromNumber(Math.round(num))
  }
  return fromNumber(Number(num.toFixed(prec)))
}
functions.round.arity = (count) => count >= 1 && count <= 2

// eslint-disable-next-line require-await
functions.now = async function now(args, scope) {
  return fromString(scope.timestamp)
}
functions.now.arity = 0

// eslint-disable-next-line require-await
functions.boost = async function boost() {
  // This should be handled by the scoring function.
  throw new Error('unexpected boost call')
}

functions.boost.arity = 2

export type GroqPipeFunction = (
  base: Value,
  args: ExprNode[],
  scope: Scope,
  execute: Executor
) => PromiseLike<Value>

export const pipeFunctions: {[key: string]: WithArity<GroqPipeFunction>} = {}

pipeFunctions.order = async function order(base, args, scope, execute) {
  // eslint-disable-next-line max-len
  // This is a workaround for https://github.com/rpetrich/babel-plugin-transform-async-to-promises/issues/59
  await true

  if (!base.isArray()) {
    return NULL_VALUE
  }

  const mappers = []
  const directions: string[] = []
  let n = 0

  for (let mapper of args) {
    let direction = 'asc'

    if (mapper.type === 'Desc') {
      direction = 'desc'
      mapper = mapper.base
    } else if (mapper.type === 'Asc') {
      mapper = mapper.base
    }

    mappers.push(mapper)
    directions.push(direction)
    n++
  }

  const aux = []
  let idx = 0

  for await (const value of base) {
    const newScope = scope.createNested(value)
    const tuple = [await value.get(), idx]
    for (let i = 0; i < n; i++) {
      const result = await execute(mappers[i], newScope)
      tuple.push(await result.get())
    }
    aux.push(tuple)
    idx++
  }

  aux.sort((aTuple, bTuple) => {
    for (let i = 0; i < n; i++) {
      let c = totalCompare(aTuple[i + 2], bTuple[i + 2])
      if (directions[i] === 'desc') {
        c = -c
      }
      if (c !== 0) {
        return c
      }
    }
    // Fallback to sorting on the original index for stable sorting.
    return aTuple[1] - bTuple[1]
  })

  return fromJS(aux.map((v) => v[0]))
}
pipeFunctions.order.arity = (count) => count >= 1

// eslint-disable-next-line require-await
pipeFunctions.score = async function score(base, args, scope, execute) {
  if (!base.isArray()) return NULL_VALUE

  // Anything that isn't an object should be sorted first.
  const unknown: Array<any> = []
  const scored: Array<ObjectWithScore> = []

  for await (const value of base) {
    if (value.type !== 'object') {
      unknown.push(await value.get())
      continue
    }

    const newScope = scope.createNested(value)
    let valueScore = typeof value.data._score === 'number' ? value.data._score : 0

    for (const arg of args) {
      valueScore += await evaluateScore(arg, newScope, execute)
    }

    const newObject = Object.assign({}, value.data, {_score: valueScore})
    scored.push(newObject)
  }

  scored.sort((a, b) => b._score - a._score)
  return fromJS(scored)
}

pipeFunctions.score.arity = (count) => count >= 1

type ObjectWithScore = Record<string, unknown> & {_score: number}
