import type {ExprNode} from '../nodeTypes'
import {
  co,
  DateTime,
  FALSE_VALUE,
  fromDateTime,
  fromJS,
  fromNumber,
  fromPath,
  fromString,
  getType,
  NULL_VALUE,
  Path,
  StaticValue,
  StreamValue,
  TRUE_VALUE,
  type Value,
} from '../values'
import {isEqual} from './equality'
import {evaluate} from './evaluate'
import {totalCompare} from './ordering'
import {portableTextContent} from './pt'
import {Scope} from './scope'
import {evaluateScore} from './scoring'

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

/** @public */
export type GroqFunctionArg = ExprNode
type WithOptions<T> = T & {
  arity?: GroqFunctionArity
  mode?: 'normal' | 'delta'
}

export type GroqFunctionArity = number | ((count: number) => boolean)

/** @public */
export type GroqFunction = (
  args: GroqFunctionArg[],
  scope: Scope,
  mode: 'sync' | 'async',
) => Value | PromiseLike<Value>

export type FunctionSet = Record<string, WithOptions<GroqFunction> | undefined>

export type NamespaceSet = Record<string, FunctionSet | undefined>

// underscored to not collide with environments like jest that give variables named `global` special treatment
const _global: FunctionSet = {}

// not implemented
_global['anywhere'] = function anywhere() {
  throw new Error('not implemented')
}
_global['anywhere'].arity = 1

_global['coalesce'] = function coalesce(args, scope, mode) {
  return co<Value>(function* () {
    for (const arg of args) {
      const value = yield evaluate(arg, scope, mode)
      if (value.type !== 'null') {
        return value
      }
    }
    return NULL_VALUE
  })
}

_global['count'] = function count(args, scope, mode) {
  return co<unknown>(function* (): Generator<unknown, Value, unknown> {
    const inner = (yield evaluate(args[0], scope, mode)) as Value
    if (!inner.isArray()) {
      return NULL_VALUE
    }

    const count = (yield inner.reduce((acc) => acc + 1, 0)) as number
    return fromNumber(count)
  }) as Value | PromiseLike<Value>
}
_global['count'].arity = 1

_global['dateTime'] = function dateTime(args, scope, mode) {
  return co<Value>(function* () {
    const val = yield evaluate(args[0], scope, mode)
    if (val.type === 'datetime') {
      return val
    }
    if (val.type !== 'string') {
      return NULL_VALUE
    }
    return DateTime.parseToValue(val.data)
  })
}
_global['dateTime'].arity = 1

_global['defined'] = function defined(args, scope, mode) {
  return co<Value>(function* () {
    const inner = yield evaluate(args[0], scope, mode)
    return inner.type === 'null' ? FALSE_VALUE : TRUE_VALUE
  })
}
_global['defined'].arity = 1

_global['identity'] = function identity(_args, scope) {
  return fromString(scope.context.identity)
}
_global['identity'].arity = 0

_global['length'] = function length(args, scope, mode) {
  return co<unknown>(function* (): Generator<unknown, Value, unknown> {
    const inner = (yield evaluate(args[0], scope, mode)) as Value

    if (inner.type === 'string') {
      return fromNumber(countUTF8(inner.data))
    }

    if (inner.isArray()) {
      const count = (yield inner.reduce((acc) => acc + 1, 0)) as number
      return fromNumber(count)
    }

    return NULL_VALUE
  }) as Value | PromiseLike<Value>
}
_global['length'].arity = 1

_global['path'] = function path(args, scope, mode) {
  return co<Value>(function* () {
    const inner = yield evaluate(args[0], scope, mode)
    if (inner.type !== 'string') {
      return NULL_VALUE
    }

    return fromPath(new Path(inner.data))
  })
}
_global['path'].arity = 1

_global['string'] = function string(args, scope, mode) {
  return co<Value>(function* () {
    const value = yield evaluate(args[0], scope, mode)
    switch (value.type) {
      case 'number':
      case 'string':
      case 'boolean':
      case 'datetime':
        return fromString(`${value.data}`)
      default:
        return NULL_VALUE
    }
  })
}
_global['string'].arity = 1

_global['references'] = function references(args, scope, mode) {
  return co<unknown>(function* (): Generator<unknown, Value, unknown> {
    const pathSet = new Set<string>()
    for (const arg of args) {
      const pathVal = (yield evaluate(arg, scope, mode)) as Value
      if (pathVal.type === 'string') {
        pathSet.add(pathVal.data)
      } else if (pathVal.isArray()) {
        const data = (yield pathVal.get()) as unknown[]
        for (const item of data) {
          if (typeof item === 'string') {
            pathSet.add(item)
          }
        }
      }
    }

    if (pathSet.size === 0) {
      return FALSE_VALUE
    }

    const scopeValue = yield scope.value.get()
    return hasReference(scopeValue, pathSet) ? TRUE_VALUE : FALSE_VALUE
  }) as Value | PromiseLike<Value>
}
_global['references'].arity = (c) => c >= 1

_global['round'] = function round(args, scope, mode) {
  return co<Value>(function* () {
    const value = yield evaluate(args[0], scope, mode)
    if (value.type !== 'number') {
      return NULL_VALUE
    }

    const num = value.data
    let prec = 0

    if (args.length === 2) {
      const precValue = yield evaluate(args[1], scope, mode)
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
  })
}
_global['round'].arity = (count) => count >= 1 && count <= 2

_global['now'] = function now(_args, scope) {
  return fromString(scope.context.timestamp.toISOString())
}
_global['now'].arity = 0

_global['boost'] = function boost() {
  // This should be handled by the scoring function.
  throw new Error('unexpected boost call')
}

_global['boost'].arity = 2

const string: FunctionSet = {}

string['lower'] = function (args, scope, mode) {
  return co<Value>(function* () {
    const value = (yield evaluate(args[0], scope, mode)) as Value
    if (value.type !== 'string') {
      return NULL_VALUE
    }
    return fromString(value.data.toLowerCase())
  })
}
string['lower'].arity = 1

string['upper'] = function (args, scope, mode) {
  return co<Value>(function* () {
    const value = yield evaluate(args[0], scope, mode)
    if (value.type !== 'string') {
      return NULL_VALUE
    }
    return fromString(value.data.toUpperCase())
  })
}
string['upper'].arity = 1

string['split'] = function (args, scope, mode) {
  return co<Value>(function* () {
    const str = yield evaluate(args[0], scope, mode)
    if (str.type !== 'string') {
      return NULL_VALUE
    }
    const sep = yield evaluate(args[1], scope, mode)
    if (sep.type !== 'string') {
      return NULL_VALUE
    }

    if (str.data.length === 0) {
      return fromJS([], mode)
    }
    if (sep.data.length === 0) {
      // This uses a Unicode codepoint splitting algorithm
      return fromJS(Array.from(str.data), mode)
    }
    return fromJS(str.data.split(sep.data), mode)
  })
}
string['split'].arity = 2

_global['lower'] = string['lower']
_global['upper'] = string['upper']

string['startsWith'] = function (args, scope, mode) {
  return co<Value>(function* () {
    const str = yield evaluate(args[0], scope, mode)
    if (str.type !== 'string') {
      return NULL_VALUE
    }

    const prefix = yield evaluate(args[1], scope, mode)
    if (prefix.type !== 'string') {
      return NULL_VALUE
    }

    return str.data.startsWith(prefix.data) ? TRUE_VALUE : FALSE_VALUE
  })
}
string['startsWith'].arity = 2

const array: FunctionSet = {}

array['join'] = function (args, scope, mode) {
  return co<unknown>(function* (): Generator<unknown, Value, unknown> {
    const arr = (yield evaluate(args[0], scope, mode)) as Value
    if (!arr.isArray()) {
      return NULL_VALUE
    }
    const sep = (yield evaluate(args[1], scope, mode)) as Value
    if (sep.type !== 'string') {
      return NULL_VALUE
    }
    let buf = ''
    let needSep = false

    const data = (yield arr.get()) as unknown[]
    for (const item of data) {
      const elem = fromJS(item, mode)
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

    return fromJS(buf, mode)
  }) as Value | PromiseLike<Value>
}
array['join'].arity = 2

array['compact'] = function (args, scope, mode) {
  return co<Value>(function* () {
    const arr = yield evaluate(args[0], scope, mode)
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
  })
}
array['compact'].arity = 1

array['unique'] = function (args, scope, mode) {
  return co<unknown>(function* (): Generator<unknown, Value, unknown> {
    const value = (yield evaluate(args[0], scope, mode)) as Value
    if (!value.isArray()) {
      return NULL_VALUE
    }

    if (mode === 'sync') {
      const data = (yield value.get()) as unknown[]

      const added = new Set()
      const result: Value[] = []
      for (const item of data) {
        const elem = fromJS(item, 'sync')

        switch (elem.type) {
          case 'number':
          case 'string':
          case 'boolean':
          case 'datetime':
            if (!added.has(item)) {
              added.add(item)
              result.push(elem)
            }
            break
          default:
            result.push(elem)
        }
      }
      return new StaticValue(result, 'array')
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
  }) as Value | PromiseLike<Value>
}
array['unique'].arity = 1

array['intersects'] = function (args, scope, mode) {
  // Intersects returns true if the two arrays have at least one element in common. Only
  // primitives are supported; non-primitives are ignored.

  if (mode === 'sync') {
    return co<unknown>(function* (): Generator<unknown, Value, unknown> {
      const arr1 = (yield evaluate(args[0], scope, mode)) as Value
      if (!arr1.isArray()) {
        return NULL_VALUE
      }

      const arr2 = (yield evaluate(args[1], scope, mode)) as Value
      if (!arr2.isArray()) {
        return NULL_VALUE
      }

      const arr1Data = (yield arr1.get()) as unknown[]
      const arr2Data = (yield arr2.get()) as unknown[]

      for (const v1 of arr1Data) {
        for (const v2 of arr2Data) {
          if (isEqual(fromJS(v1, 'sync'), fromJS(v2, 'sync'))) {
            return TRUE_VALUE
          }
        }
      }

      return FALSE_VALUE
    }) as Value | PromiseLike<Value>
  }

  return (async () => {
    const arr1 = await evaluate(args[0], scope, mode)
    const arr2 = await evaluate(args[1], scope, mode)

    for await (const v1 of arr1) {
      for await (const v2 of arr2) {
        if (isEqual(v1, v2)) {
          return TRUE_VALUE
        }
      }
    }

    return FALSE_VALUE
  })()
}
array['intersects'].arity = 2

const pt: FunctionSet = {}
pt['text'] = function (args, scope, mode) {
  return co<unknown>(function* (): Generator<unknown, Value, unknown> {
    const value = (yield evaluate(args[0], scope, mode)) as Value
    const text = (yield portableTextContent(value, mode)) as string | null

    if (text === null) {
      return NULL_VALUE
    }

    return fromString(text)
  }) as Value | PromiseLike<Value>
}

pt['text'].arity = 1

const sanity: FunctionSet = {}
sanity['projectId'] = function (_args, scope) {
  if (scope.context.sanity) {
    return fromString(scope.context.sanity.projectId)
  }

  return NULL_VALUE
}
sanity['dataset'] = function (_args, scope) {
  if (scope.context.sanity) {
    return fromString(scope.context.sanity.dataset)
  }

  return NULL_VALUE
}

sanity['versionsOf'] = function (args, scope, mode) {
  return co<unknown>(function* () {
    if (!scope.source.isArray()) return NULL_VALUE

    const value = (yield evaluate(args[0], scope, mode)) as Value
    if (value.type !== 'string') return NULL_VALUE
    const baseId = value.data

    // All the document are a version of the given ID if:
    //  1. Document ID is of the form bundleId.documentGroupId
    //  2. And, they have a field called _version which is an object.
    const versionIds = (yield scope.source.reduce<string[]>((acc, value) => {
      if (getType(value) === 'object') {
        const val = value.get()
        if (
          val &&
          '_id' in val &&
          val._id.split('.').length === 2 &&
          val._id.endsWith(`.${baseId}`) &&
          '_version' in val &&
          typeof val._version === 'object'
        ) {
          acc.push(val._id)
        }
      }
      return acc
    }, [])) as string[]

    return fromJS(versionIds, mode)
  }) as Value | PromiseLike<Value>
}
sanity['versionsOf'].arity = 1

sanity['partOfRelease'] = function (args, scope, mode) {
  return co<unknown>(function* (): Generator<unknown, Value, unknown> {
    if (!scope.source.isArray()) return NULL_VALUE

    const value = (yield evaluate(args[0], scope, mode)) as Value
    if (value.type !== 'string') return NULL_VALUE
    const baseId = value.data

    // A document belongs to a bundle ID if:
    //  1. Document ID is of the form bundleId.documentGroupId
    //  2. And, they have a field called _version which is an object.
    const documentIdsInBundle = (yield scope.source.reduce<string[]>((acc, value) => {
      if (getType(value) === 'object') {
        const val = value.get()
        if (
          val &&
          '_id' in val &&
          val._id.split('.').length === 2 &&
          val._id.startsWith(`${baseId}.`) &&
          '_version' in val &&
          typeof val._version === 'object'
        ) {
          acc.push(val._id)
        }
      }

      return acc
    }, [])) as string[]

    return fromJS(documentIdsInBundle, mode)
  }) as Value | PromiseLike<Value>
}
sanity['partOfRelease'].arity = 1

export type GroqPipeFunction = (
  base: Value,
  args: ExprNode[],
  scope: Scope,
  mode: 'sync' | 'async',
) => Value | PromiseLike<Value>

export const pipeFunctions: {[key: string]: WithOptions<GroqPipeFunction>} = {}

pipeFunctions['order'] = function order(base, args, scope, mode) {
  return co<unknown>(function* (): Generator<unknown, Value, unknown> {
    if (!base.isArray()) {
      return NULL_VALUE
    }

    const mappers: ExprNode[] = []
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

    const aux: Array<[unknown, number, ...unknown[]]> = []
    let idx = 0

    const data = (yield base.get()) as unknown[]
    for (const item of data) {
      const value = fromJS(item, mode)
      const newScope = scope.createNested(value)
      // First element is the original value.
      const tuple: [unknown, number, ...unknown[]] = [yield value.get(), idx]
      for (let i = 0; i < n; i++) {
        const res = (yield evaluate(mappers[i], newScope, mode)) as Value
        tuple.push(yield res.get())
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

    return fromJS(
      aux.map((v) => v[0]),
      mode,
    )
  }) as Value | PromiseLike<Value>
}
pipeFunctions['order'].arity = (count) => count >= 1

pipeFunctions['score'] = function score(base, args, scope, mode) {
  return co<unknown>(function* (): Generator<unknown, Value, unknown> {
    if (!base.isArray()) return NULL_VALUE

    // Anything that isn't an object should be sorted first.
    const unknown: Array<any> = []
    const scored: Array<ObjectWithScore> = []

    const data = (yield base.get()) as unknown[]

    for (const item of data) {
      const value = fromJS(item, mode)
      if (value.type !== 'object') {
        unknown.push(yield value.get())
        continue
      }

      const newScope = scope.createNested(value)
      let valueScore = typeof value.data['_score'] === 'number' ? value.data['_score'] : 0

      for (const arg of args) {
        valueScore += (yield evaluateScore(arg, newScope, mode)) as number
      }

      const newObject = Object.assign({}, value.data, {_score: valueScore})
      scored.push(newObject)
    }

    scored.sort((a, b) => b._score - a._score)
    return fromJS(scored, mode)
  }) as Value | PromiseLike<Value>
}

pipeFunctions['score'].arity = (count) => count >= 1

type ObjectWithScore = Record<string, unknown> & {_score: number}

const delta: FunctionSet = {}
delta['operation'] = function (_args, scope) {
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

delta['changedAny'] = () => {
  throw new Error('not implemented')
}
delta['changedAny'].arity = 1
delta['changedAny'].mode = 'delta'

delta['changedOnly'] = () => {
  throw new Error('not implemented')
}
delta['changedOnly'].arity = 1
delta['changedOnly'].mode = 'delta'

const diff: FunctionSet = {}
diff['changedAny'] = () => {
  throw new Error('not implemented')
}
diff['changedAny'].arity = 3

diff['changedOnly'] = () => {
  throw new Error('not implemented')
}
diff['changedOnly'].arity = 3

const math: FunctionSet = {}
math['min'] = function (args, scope, mode) {
  return co<unknown>(function* (): Generator<unknown, Value, unknown> {
    const arr = (yield evaluate(args[0], scope, mode)) as Value
    if (!arr.isArray()) {
      return NULL_VALUE
    }

    // early exit if a non-null, non-number is found
    const hasNonNumber = (yield arr.first(
      (elem) => elem.type !== 'null' && elem.type !== 'number',
    )) as Value | undefined

    if (hasNonNumber) {
      return NULL_VALUE
    }

    const data = (yield arr.get()) as unknown[]

    let n: number | undefined
    for (const item of data) {
      if (typeof item !== 'number') continue
      if (n === undefined || item < n) {
        n = item
      }
    }
    return fromJS(n, mode)
  }) as Value | PromiseLike<Value>
}
math['min'].arity = 1

math['max'] = function (args, scope, mode) {
  return co<unknown>(function* (): Generator<unknown, Value, unknown> {
    const arr = (yield evaluate(args[0], scope, mode)) as Value
    if (!arr.isArray()) {
      return NULL_VALUE
    }

    // early exit if a non-null, non-number is found
    const hasNonNumber = (yield arr.first(
      (elem) => elem.type !== 'null' && elem.type !== 'number',
    )) as Value | undefined

    if (hasNonNumber) {
      return NULL_VALUE
    }

    const data = (yield arr.get()) as unknown[]

    let n: number | undefined
    for (const item of data) {
      if (typeof item !== 'number') continue
      if (n === undefined || item > n) {
        n = item
      }
    }
    return fromJS(n, mode)
  }) as Value | PromiseLike<Value>
}
math['max'].arity = 1

math['sum'] = function (args, scope, mode) {
  return co<unknown>(function* (): Generator<unknown, Value, unknown> {
    const arr = (yield evaluate(args[0], scope, mode)) as Value
    if (!arr.isArray()) {
      return NULL_VALUE
    }

    // early exit if a non-null, non-number is found
    const hasNonNumber = (yield arr.first(
      (elem) => elem.type !== 'null' && elem.type !== 'number',
    )) as Value | undefined

    if (hasNonNumber) {
      return NULL_VALUE
    }

    const sum = (yield arr.reduce<number>((acc, elem) => {
      if (elem.type !== 'number') return acc
      return acc + elem.data
    }, 0)) as number

    return fromJS(sum, mode)
  }) as Value | PromiseLike<Value>
}
math['sum'].arity = 1

math['avg'] = function (args, scope, mode) {
  return co<unknown>(function* (): Generator<unknown, Value, unknown> {
    const arr = (yield evaluate(args[0], scope, mode)) as Value
    if (!arr.isArray()) {
      return NULL_VALUE
    }

    // early exit if a non-null, non-number is found
    const hasNonNumber = (yield arr.first(
      (elem) => elem.type !== 'null' && elem.type !== 'number',
    )) as Value | undefined

    if (hasNonNumber) {
      return NULL_VALUE
    }

    const c = (yield arr.reduce<number>((acc, elem) => {
      if (elem.type !== 'number') return acc
      return acc + 1
    }, 0)) as number
    const n = (yield arr.reduce<number>((acc, elem) => {
      if (elem.type !== 'number') return acc
      return acc + elem.data
    }, 0)) as number

    if (c === 0) {
      return NULL_VALUE
    }
    return fromJS(n / c, mode)
  }) as Value | PromiseLike<Value>
}
math['avg'].arity = 1

const dateTime: FunctionSet = {}
dateTime['now'] = function now(_args, scope) {
  return fromDateTime(new DateTime(scope.context.timestamp))
}
dateTime['now'].arity = 0

export const namespaces: NamespaceSet = {
  global: _global,
  string,
  array,
  pt,
  delta,
  diff,
  sanity,
  math,
  dateTime,
}
