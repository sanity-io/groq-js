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
  StreamValue,
} from '../values'
import {portableTextContent} from './pt'

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
type WithOptions<T> = T & {
  arity?: GroqFunctionArity
  mode?: 'normal' | 'delta'
}

export type GroqFunctionArity = number | ((count: number) => boolean)

export type GroqFunction = (
  args: GroqFunctionArg[],
  scope: Scope,
  execute: Executor
) => PromiseLike<Value>

export type FunctionSet = Record<string, WithOptions<GroqFunction> | undefined>

export type NamespaceSet = Record<string, FunctionSet | undefined>

const global: FunctionSet = {}

global.anywhere = async function anywhere() {
  throw new Error('not implemented')
}

global.anywhere.arity = 1

global.coalesce = async function coalesce(args, scope, execute) {
  for (const arg of args) {
    const value = await execute(arg, scope)
    if (value.type !== 'null') {
      return value
    }
  }
  return NULL_VALUE
}

global.count = async function count(args, scope, execute) {
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
global.count.arity = 1

global.dateTime = async function dateTime(args, scope, execute) {
  const val = await execute(args[0], scope)
  if (val.type === 'datetime') {
    return val
  }
  if (val.type !== 'string') {
    return NULL_VALUE
  }
  return DateTime.parseToValue(val.data)
}
global.dateTime.arity = 1

global.defined = async function defined(args, scope, execute) {
  const inner = await execute(args[0], scope)
  return inner.type === 'null' ? FALSE_VALUE : TRUE_VALUE
}
global.defined.arity = 1

// eslint-disable-next-line require-await
global.identity = async function identity(args, scope) {
  return fromString(scope.context.identity)
}
global.identity.arity = 0

global.length = async function length(args, scope, execute) {
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
global.length.arity = 1

global.path = async function path(args, scope, execute) {
  const inner = await execute(args[0], scope)
  if (inner.type !== 'string') {
    return NULL_VALUE
  }

  return fromPath(new Path(inner.data))
}
global.path.arity = 1

global.string = async function string(args, scope, execute) {
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
global.string.arity = 1

global.references = async function references(args, scope, execute) {
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
global.references.arity = (c) => c >= 1

global.round = async function round(args, scope, execute) {
  const value = await execute(args[0], scope)
  if (value.type !== 'number') {
    return NULL_VALUE
  }

  const num = value.data
  let prec = 0

  if (args.length === 2) {
    const precValue = await execute(args[1], scope)
    if (precValue.type !== 'number' || precValue.data < 0 || !Number.isInteger(precValue.data)) {
      return NULL_VALUE
    }
    prec = precValue.data
  }

  if (prec === 0) {
    if (num < 0) {
      // JavaScript's round() function will always rounds towards positive infinity (-3.5 -> -3).
      // The behavior we're interested in is to "round half away from zero".
      return fromNumber(-Math.round(-num))
    }
    return fromNumber(Math.round(num))
  }
  return fromNumber(Number(num.toFixed(prec)))
}
global.round.arity = (count) => count >= 1 && count <= 2

// eslint-disable-next-line require-await
global.now = async function now(args, scope) {
  return fromString(scope.context.timestamp.toISOString())
}
global.now.arity = 0

// eslint-disable-next-line require-await
global.boost = async function boost() {
  // This should be handled by the scoring function.
  throw new Error('unexpected boost call')
}

global.boost.arity = 2

const string: FunctionSet = {}

string.lower = async function (args, scope, execute) {
  const value = await execute(args[0], scope)

  if (value.type !== 'string') {
    return NULL_VALUE
  }

  return fromString(value.data.toLowerCase())
}
string.lower.arity = 1

string.upper = async function (args, scope, execute) {
  const value = await execute(args[0], scope)

  if (value.type !== 'string') {
    return NULL_VALUE
  }

  return fromString(value.data.toUpperCase())
}
string.upper.arity = 1

string.split = async function (args, scope, execute) {
  const str = await execute(args[0], scope)
  if (str.type !== 'string') {
    return NULL_VALUE
  }
  const sep = await execute(args[1], scope)
  if (sep.type !== 'string') {
    return NULL_VALUE
  }

  if (str.data.length === 0) {
    return fromJS([])
  }
  if (sep.data.length === 0) {
    // This uses a Unicode codepoint splitting algorithm
    return fromJS(Array.from(str.data))
  }
  return fromJS(str.data.split(sep.data))
}
string.split.arity = 2

global.lower = string.lower
global.upper = string.upper

string.startsWith = async function (args, scope, execute) {
  const str = await execute(args[0], scope)
  if (str.type !== 'string') {
    return NULL_VALUE
  }

  const prefix = await execute(args[1], scope)
  if (prefix.type !== 'string') {
    return NULL_VALUE
  }

  return str.data.startsWith(prefix.data) ? TRUE_VALUE : FALSE_VALUE
}
string.startsWith.arity = 2

const array: FunctionSet = {}

array.join = async function (args, scope, execute) {
  const arr = await execute(args[0], scope)
  if (!arr.isArray()) {
    return NULL_VALUE
  }
  const sep = await execute(args[1], scope)
  if (sep.type !== 'string') {
    return NULL_VALUE
  }
  let buf = ''
  let needSep = false
  for await (const elem of arr) {
    if (needSep) {
      buf += sep.data
    }
    switch (elem.type) {
      case 'number':
      case 'string':
      case 'boolean':
      case 'datetime':
        buf += `${elem.data}`
        break
      default:
        return NULL_VALUE
    }
    needSep = true
  }
  return fromJS(buf)
}
array.join.arity = 2

array.compact = async function (args, scope, execute) {
  const arr = await execute(args[0], scope)
  if (!arr.isArray()) {
    return NULL_VALUE
  }

  return new StreamValue(async function* () {
    for await (const elem of arr) {
      if (elem.type !== 'null') {
        yield elem
      }
    }
  })
}
array.compact.arity = 1

array.unique = async function (args, scope, execute) {
  const value = await execute(args[0], scope)
  if (!value.isArray()) {
    return NULL_VALUE
  }

  return new StreamValue(async function* () {
    const added = new Set()
    for await (const iter of value) {
      switch (iter.type) {
        case 'number':
        case 'string':
        case 'boolean':
        case 'datetime':
          if (!added.has(iter.data)) {
            added.add(iter.data)
            yield iter
          }
          break
        default:
          yield iter
      }
    }
  })
}
array.unique.arity = 1

const pt: FunctionSet = {}
pt.text = async function (args, scope, execute) {
  const value = await execute(args[0], scope)
  const text = await portableTextContent(value)

  if (text === null) {
    return NULL_VALUE
  }

  return fromString(text)
}

pt.text.arity = 1

const sanity: FunctionSet = {}
// eslint-disable-next-line require-await
sanity.projectId = async function (args, scope) {
  if (scope.context.sanity) {
    return fromString(scope.context.sanity.projectId)
  }

  return NULL_VALUE
}
// eslint-disable-next-line require-await
sanity.dataset = async function (args, scope) {
  if (scope.context.sanity) {
    return fromString(scope.context.sanity.dataset)
  }

  return NULL_VALUE
}

export type GroqPipeFunction = (
  base: Value,
  args: ExprNode[],
  scope: Scope,
  execute: Executor
) => PromiseLike<Value>

export const pipeFunctions: {[key: string]: WithOptions<GroqPipeFunction>} = {}

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

const delta: FunctionSet = {}
delta.operation = async function (args, scope) {
  const hasBefore = scope.context.before !== null
  const hasAfter = scope.context.after !== null

  if (hasBefore && hasAfter) {
    return fromString('update')
  }

  if (hasAfter) {
    return fromString('create')
  }

  if (hasBefore) {
    return fromString('delete')
  }

  return NULL_VALUE
}

delta.changedAny = () => {
  throw new Error('not implemented')
}
delta.changedAny.arity = 1
delta.changedAny.mode = 'delta'

delta.changedOnly = () => {
  throw new Error('not implemented')
}
delta.changedOnly.arity = 1
delta.changedOnly.mode = 'delta'

const diff: FunctionSet = {}
diff.changedAny = () => {
  throw new Error('not implemented')
}
diff.changedAny.arity = 3

diff.changedOnly = () => {
  throw new Error('not implemented')
}
diff.changedOnly.arity = 3

const math: FunctionSet = {}
math.min = async function (args, scope, execute) {
  const arr = await execute(args[0], scope)
  if (!arr.isArray()) {
    return NULL_VALUE
  }

  let n: number | undefined = undefined
  for await (const elem of arr) {
    if (elem.type === 'null') continue
    if (elem.type !== 'number') {
      return NULL_VALUE
    }
    if (n === undefined || elem.data < n) {
      n = elem.data
    }
  }
  return fromJS(n)
}
math.min.arity = 1

math.max = async function (args, scope, execute) {
  const arr = await execute(args[0], scope)
  if (!arr.isArray()) {
    return NULL_VALUE
  }

  let n: number | undefined = undefined
  for await (const elem of arr) {
    if (elem.type === 'null') continue
    if (elem.type !== 'number') {
      return NULL_VALUE
    }
    if (n === undefined || elem.data > n) {
      n = elem.data
    }
  }
  return fromJS(n)
}
math.max.arity = 1

math.sum = async function (args, scope, execute) {
  const arr = await execute(args[0], scope)
  if (!arr.isArray()) {
    return NULL_VALUE
  }

  let n = 0
  for await (const elem of arr) {
    if (elem.type === 'null') continue
    if (elem.type !== 'number') {
      return NULL_VALUE
    }
    n += elem.data
  }
  return fromJS(n)
}
math.sum.arity = 1

math.avg = async function (args, scope, execute) {
  const arr = await execute(args[0], scope)
  if (!arr.isArray()) {
    return NULL_VALUE
  }

  let n = 0
  let c = 0
  for await (const elem of arr) {
    if (elem.type === 'null') continue
    if (elem.type !== 'number') {
      return NULL_VALUE
    }
    n += elem.data
    c++
  }
  if (c === 0) {
    return NULL_VALUE
  }
  return fromJS(n / c)
}
math.avg.arity = 1

export const namespaces: NamespaceSet = {
  global,
  string,
  array,
  pt,
  delta,
  diff,
  sanity,
  math,
}
