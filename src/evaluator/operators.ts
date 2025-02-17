import type {OpCall} from '../nodeTypes'
import {
  co,
  FALSE_VALUE,
  fromDateTime,
  fromJS,
  fromNumber,
  fromString,
  NULL_VALUE,
  StreamValue,
  TRUE_VALUE,
  type Value,
} from '../values'
import {isEqual} from './equality'
import {matchAnalyzePattern, matchText, matchTokenize} from './matching'
import {partialCompare} from './ordering'

type GroqOperatorFn = (left: Value, right: Value) => Value | PromiseLike<Value>

export const operators: {[key in OpCall]: GroqOperatorFn} = {
  '==': function eq(left, right) {
    return isEqual(left, right) ? TRUE_VALUE : FALSE_VALUE
  },

  '!=': function neq(left, right) {
    return isEqual(left, right) ? FALSE_VALUE : TRUE_VALUE
  },

  '>': function gt(left, right) {
    if (left.type === 'stream' || right.type === 'stream') return NULL_VALUE
    const result = partialCompare(left.data, right.data)

    if (result === null) {
      return NULL_VALUE
    }
    return result > 0 ? TRUE_VALUE : FALSE_VALUE
  },

  '>=': function gte(left, right) {
    if (left.type === 'stream' || right.type === 'stream') return NULL_VALUE
    const result = partialCompare(left.data, right.data)

    if (result === null) {
      return NULL_VALUE
    }
    return result >= 0 ? TRUE_VALUE : FALSE_VALUE
  },

  '<': function lt(left, right) {
    if (left.type === 'stream' || right.type === 'stream') return NULL_VALUE
    const result = partialCompare(left.data, right.data)

    if (result === null) {
      return NULL_VALUE
    }
    return result < 0 ? TRUE_VALUE : FALSE_VALUE
  },

  '<=': function lte(left, right) {
    if (left.type === 'stream' || right.type === 'stream') return NULL_VALUE
    const result = partialCompare(left.data, right.data)

    if (result === null) {
      return NULL_VALUE
    }
    return result <= 0 ? TRUE_VALUE : FALSE_VALUE
  },

  // eslint-disable-next-line func-name-matching
  'in': function inop(left, right) {
    return co<unknown>(function* (): Generator<unknown, Value, unknown> {
      if (right.type === 'path') {
        if (left.type !== 'string') {
          return NULL_VALUE
        }

        return right.data.matches(left.data) ? TRUE_VALUE : FALSE_VALUE
      }

      if (right.isArray()) {
        const result = (yield right.first((b) => isEqual(left, b))) as Value | undefined
        if (result) return TRUE_VALUE
        return FALSE_VALUE
      }

      return NULL_VALUE
    }) as Value | PromiseLike<Value>
  },

  'match': function match(left, right) {
    return co<Value>(function* () {
      const leftData = yield left.get()
      const rightData = yield right.get()

      let leftStrings: string[] = []
      if (Array.isArray(leftData)) {
        leftStrings = leftData.filter((i) => typeof i === 'string')
      } else if (typeof leftData === 'string') {
        leftStrings = [leftData]
      }

      let rightStrings: string[] | undefined
      if (Array.isArray(rightData)) {
        rightStrings = rightData.filter((i) => typeof i === 'string')
      } else if (typeof rightData === 'string') {
        rightStrings = [rightData]
      }

      if (!rightStrings?.length) {
        return FALSE_VALUE
      }

      const tokens = leftStrings.flatMap(matchTokenize)
      const patterns = rightStrings.flatMap(matchAnalyzePattern)
      const matched = matchText(tokens, patterns)

      return matched ? TRUE_VALUE : FALSE_VALUE
    })
  },

  '+': function plus(left, right) {
    if (left.type === 'datetime' && right.type === 'number') {
      return fromDateTime(left.data.add(right.data))
    }

    if (left.type === 'number' && right.type === 'number') {
      return fromNumber(left.data + right.data)
    }

    if (left.type === 'string' && right.type === 'string') {
      return fromString(left.data + right.data)
    }

    if (left.type === 'object' && right.type === 'object') {
      return fromJS({...left.data, ...right.data})
    }

    if (left.type === 'array' && right.type === 'array') {
      return fromJS(left.data.concat(right.data))
    }

    if (left.isArray() && right.isArray()) {
      return new StreamValue(async function* () {
        for await (const val of left) {
          yield val
        }

        for await (const val of right) {
          yield val
        }
      })
    }

    return NULL_VALUE
  },

  '-': function minus(left, right) {
    if (left.type === 'datetime' && right.type === 'number') {
      return fromDateTime(left.data.add(-right.data))
    }

    if (left.type === 'datetime' && right.type === 'datetime') {
      return fromNumber(left.data.difference(right.data))
    }

    if (left.type === 'number' && right.type === 'number') {
      return fromNumber(left.data - right.data)
    }

    return NULL_VALUE
  },

  '*': numericOperator((a, b) => a * b),
  '/': numericOperator((a, b) => a / b),
  '%': numericOperator((a, b) => a % b),
  '**': numericOperator((a, b) => Math.pow(a, b)),
}

function numericOperator(impl: (a: number, b: number) => number): GroqOperatorFn {
  return function (left, right) {
    if (left.type === 'number' && right.type === 'number') {
      const result = impl(left.data, right.data)
      return fromNumber(result)
    }

    return NULL_VALUE
  }
}
