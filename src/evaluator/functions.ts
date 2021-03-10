import type {SyntaxNode} from '../nodeTypes'
import {totalCompare} from './ordering'
import {evaluateScore} from './scoring'
import {Scope, Executor} from './index'
import {
  StaticValue,
  Path,
  getType,
  fromNumber,
  TRUE_VALUE,
  FALSE_VALUE,
  NULL_VALUE,
  Value,
  DateTime,
  StreamValue,
  isObject,
} from './value'

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

type GroqFunctionArg = any
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
    if (value.getType() !== 'null') {
      return value
    }
  }
  return NULL_VALUE
}

functions.count = async function count(args, scope, execute) {
  const inner = await execute(args[0], scope)
  if (inner.getType() !== 'array') {
    return NULL_VALUE
  }

  let num = 0
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for await (const _ of inner) {
    num++
  }
  return new StaticValue(num)
}
functions.count.arity = 1

functions.dateTime = async function dateTime(args, scope, execute) {
  const val = await execute(args[0], scope)
  if (val.getType() === 'datetime') {
    return val
  }
  if (val.getType() !== 'string') {
    return NULL_VALUE
  }
  return DateTime.parseToValue(await val.get())
}
functions.dateTime.arity = 1

functions.defined = async function defined(args, scope, execute) {
  const inner = await execute(args[0], scope)
  return inner.getType() === 'null' ? FALSE_VALUE : TRUE_VALUE
}
functions.defined.arity = 1

// eslint-disable-next-line require-await
functions.identity = async function identity(args) {
  return new StaticValue('me')
}
functions.identity.arity = 0

functions.length = async function length(args, scope, execute) {
  const inner = await execute(args[0], scope)

  if (inner.getType() === 'string') {
    const data = await inner.get()
    return fromNumber(countUTF8(data))
  }

  if (inner.getType() === 'array') {
    let num = 0
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const _ of inner) {
      num++
    }
    return new StaticValue(num)
  }

  return NULL_VALUE
}
functions.length.arity = 1

functions.path = async function path(args, scope, execute) {
  const inner = await execute(args[0], scope)
  if (inner.getType() !== 'string') {
    return NULL_VALUE
  }

  const str = await inner.get()

  return new StaticValue(new Path(str))
}
functions.path.arity = 1

functions.select = async function select(args, scope, execute) {
  // First check if everything is valid:
  let seenFallback = false
  for (const arg of args) {
    if (seenFallback) {
      return NULL_VALUE
    }

    if (arg.type === 'Pair') {
      // This is fine.
    } else {
      seenFallback = true
    }
  }

  for (const arg of args) {
    if (arg.type === 'Pair') {
      const cond = await execute(arg.left, scope)
      if (cond.getBoolean()) {
        return execute(arg.right, scope)
      }
    } else {
      return execute(arg, scope)
    }
  }

  return NULL_VALUE
}

functions.string = async function string(args, scope, execute) {
  const value = await execute(args[0], scope)
  switch (value.getType()) {
    case 'number':
    case 'string':
    case 'boolean':
    case 'datetime':
      return new StaticValue(`${await value.get()}`)
    default:
      return NULL_VALUE
  }
}
functions.string.arity = 1

functions.references = async function references(args, scope, execute) {
  const pathSet = new Set<string>()
  for (const arg of args) {
    const path = await execute(arg, scope)
    switch (path.getType()) {
      case 'string':
        pathSet.add(await path.get())
        break
      case 'array':
        for await (const elem of path) {
          if (elem.getType() === 'string') {
            pathSet.add(await elem.get())
          }
        }
        break
      default:
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
  if (value.getType() !== 'number') {
    return NULL_VALUE
  }

  const num = await value.get()
  let prec = 0

  if (args.length === 2) {
    const precValue = await execute(args[1], scope)
    if (precValue.getType() !== 'number') {
      return NULL_VALUE
    }
    prec = await precValue.get()
  }

  if (prec === 0) {
    return fromNumber(Math.round(num))
  }
  return fromNumber(Number(num.toFixed(prec)))
}
functions.round.arity = (count) => count >= 1 && count <= 2

// eslint-disable-next-line require-await
functions.now = async function now(args, scope) {
  return new StaticValue(scope.timestamp)
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
  args: SyntaxNode[],
  scope: Scope,
  execute: Executor
) => PromiseLike<Value>

export const pipeFunctions: {[key: string]: WithArity<GroqPipeFunction>} = {}

pipeFunctions.order = async function order(base, args, scope, execute) {
  // eslint-disable-next-line max-len
  // This is a workaround for https://github.com/rpetrich/babel-plugin-transform-async-to-promises/issues/59
  await true

  if (base.getType() !== 'array') {
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

  return new StaticValue(aux.map((v) => v[0]))
}
pipeFunctions.order.arity = (count) => count >= 1

// eslint-disable-next-line require-await
pipeFunctions.score = async function score(base, args, scope, execute) {
  if (base.getType() !== 'array') return TRUE_VALUE

  return new StreamValue(async function* () {
    for await (const value of base) {
      const newScope = scope.createNested(value)
      let valueScore = 0

      for (const arg of args) {
        valueScore += await evaluateScore(arg, newScope, execute)
      }

      const newObject: Record<string, any> = {}
      if (isObject(value)) {
        Object.assign(newObject, value.data)
      }
      newObject._score = valueScore
      yield new StaticValue(newObject)
    }
  })
}

pipeFunctions.score.arity = (count) => count >= 1
