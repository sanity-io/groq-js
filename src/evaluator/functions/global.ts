import type {FunctionSet} from '.'
import {
  DateTime,
  FALSE_VALUE,
  fromNumber,
  fromPath,
  fromString,
  getType,
  NULL_VALUE,
  Path,
  TRUE_VALUE,
} from '../../values'
import string from './string'

// underscored to not collide with environments like jest that give variables named `global` special treatment
const _global: FunctionSet = {}

// eslint-disable-next-line require-await
// eslint-disable-next-line require-await
_global['anywhere'] = async function anywhere() {
  throw new Error('not implemented')
}

_global['anywhere'].arity = 1

_global['coalesce'] = async function coalesce(args, scope, execute) {
  for (const arg of args) {
    const value = await execute(arg, scope)
    if (value.type !== 'null') {
      return value
    }
  }
  return NULL_VALUE
}

_global['count'] = async function count(args, scope, execute) {
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
_global['count'].arity = 1

_global['dateTime'] = async function dateTime(args, scope, execute) {
  const val = await execute(args[0], scope)
  if (val.type === 'datetime') {
    return val
  }
  if (val.type !== 'string') {
    return NULL_VALUE
  }
  return DateTime.parseToValue(val.data)
}
_global['dateTime'].arity = 1

_global['defined'] = async function defined(args, scope, execute) {
  const inner = await execute(args[0], scope)
  return inner.type === 'null' ? FALSE_VALUE : TRUE_VALUE
}
_global['defined'].arity = 1

// eslint-disable-next-line require-await
// eslint-disable-next-line require-await
_global['identity'] = async function identity(_args, scope) {
  return fromString(scope.context.identity)
}
_global['identity'].arity = 0

_global['length'] = async function length(args, scope, execute) {
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
_global['length'].arity = 1

_global['path'] = async function path(args, scope, execute) {
  const inner = await execute(args[0], scope)
  if (inner.type !== 'string') {
    return NULL_VALUE
  }

  return fromPath(new Path(inner.data))
}
_global['path'].arity = 1

_global['string'] = async function string(args, scope, execute) {
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
_global['string'].arity = 1

_global['references'] = async function references(args, scope, execute) {
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
_global['references'].arity = (c) => c >= 1

_global['round'] = async function round(args, scope, execute) {
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
_global['round'].arity = (count) => count >= 1 && count <= 2

// eslint-disable-next-line require-await
// eslint-disable-next-line require-await
_global['now'] = async function now(_args, scope) {
  return fromString(scope.context.timestamp.toISOString())
}
_global['now'].arity = 0

// eslint-disable-next-line require-await
// eslint-disable-next-line require-await
_global['boost'] = async function boost() {
  // This should be handled by the scoring function.
  throw new Error('unexpected boost call')
}

_global['boost'].arity = 2

_global['lower'] = string['lower']
_global['upper'] = string['upper']

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

export default _global
