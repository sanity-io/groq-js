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
import {
  arrayReducerExecutor,
  constantExecutor,
  executeAsync,
  executeSync,
  mappedExecutor,
} from '../evaluate'
import string from './string'

// underscored to not collide with environments like jest that give variables named `global` special treatment
const _global: FunctionSet = {}

// eslint-disable-next-line require-await
// eslint-disable-next-line require-await
_global['anywhere'] = constantExecutor(() => {
  throw new Error('not implemented')
})

_global['anywhere'].arity = 1

_global['coalesce'] = {
  async executeAsync(args, scope) {
    for (const arg of args) {
      const value = await executeAsync(arg, scope)
      if (value.type !== 'null') {
        return value
      }
    }
    return NULL_VALUE
  },

  executeSync(args, scope) {
    for (const arg of args) {
      const value = executeSync(arg, scope)
      if (value.type !== 'null') {
        return value
      }
    }
    return NULL_VALUE
  },
}

_global['count'] = arrayReducerExecutor(
  (args) => ({array: args[0]!}),
  () => 0,
  (_, count) => count + 1,
  fromNumber,
)
_global['count'].arity = 1

_global['dateTime'] = mappedExecutor(
  (args) => args,
  (_, val) => {
    if (val.type === 'datetime') {
      return val
    }
    if (val.type !== 'string') {
      return NULL_VALUE
    }
    return DateTime.parseToValue(val.data)
  },
)
_global['dateTime'].arity = 1

_global['defined'] = mappedExecutor(
  (args) => args,
  (_, inner) => {
    return inner.type === 'null' ? FALSE_VALUE : TRUE_VALUE
  },
)
_global['defined'].arity = 1

// eslint-disable-next-line require-await
_global['identity'] = constantExecutor((_args, scope) => {
  return fromString(scope.context.identity)
})
_global['identity'].arity = 0

_global['length'] = mappedExecutor(
  (args) => args,
  (_, inner) => {
    if (inner.type === 'string') {
      return fromNumber(countUTF8(inner.data))
    }

    if (inner.type === 'array') {
      return fromNumber(inner.data.length)
    }

    return NULL_VALUE
  },
)
_global['length'].arity = 1

_global['path'] = mappedExecutor(
  (args) => args,
  (_, inner) => {
    if (inner.type !== 'string') {
      return NULL_VALUE
    }

    return fromPath(new Path(inner.data))
  },
)
_global['path'].arity = 1

_global['string'] = mappedExecutor(
  (args) => args,
  (_, value) => {
    switch (value.type) {
      case 'number':
      case 'string':
      case 'boolean':
      case 'datetime':
        return fromString(`${value.data}`)
      default:
        return NULL_VALUE
    }
  },
)
_global['string'].arity = 1

_global['references'] = mappedExecutor(
  (args) => [{type: 'This'}, ...args],
  (_, scopeValue, ...args) => {
    const pathSet = new Set<string>()
    for (const path of args) {
      if (path.type === 'string') {
        pathSet.add(path.data)
      } else if (path.type === 'array') {
        for (const elem of path.data) {
          if (typeof elem === 'string') {
            pathSet.add(elem)
          }
        }
      }
    }

    if (pathSet.size === 0) {
      return FALSE_VALUE
    }

    return hasReference(scopeValue, pathSet) ? TRUE_VALUE : FALSE_VALUE
  },
)
_global['references'].arity = (c) => c >= 1

_global['round'] = mappedExecutor(
  (args) => args,
  (_, value, precValue) => {
    if (value.type !== 'number') {
      return NULL_VALUE
    }

    const num = value.data
    let prec = 0

    if (precValue) {
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
  },
)
_global['round'].arity = (count) => count >= 1 && count <= 2

// eslint-disable-next-line require-await
_global['now'] = constantExecutor((_args, scope) => {
  return fromString(scope.context.timestamp.toISOString())
})
_global['now'].arity = 0

// eslint-disable-next-line require-await
_global['boost'] = constantExecutor(() => {
  // This should be handled by the scoring function.
  throw new Error('unexpected boost call')
})

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
