import {OpCall, SyntaxNode} from '../nodeTypes'
import {StaticValue, TRUE_VALUE, FALSE_VALUE, NULL_VALUE, fromNumber, Value} from './value'
import {isEqual} from './equality'
import {partialCompare} from './ordering'
import {Scope, Executor} from './'
import {gatherText, Token, Pattern, matchText, matchTokenize, matchAnalyzePattern} from './matching'

type GroqOperatorFn = (
  left: SyntaxNode,
  right: SyntaxNode,
  scope: Scope,
  execute: Executor
) => Value | PromiseLike<Value>

export const operators: {[key in OpCall]: GroqOperatorFn} = {
  '==': async function eq(left, right, scope, execute) {
    const a = await execute(left, scope)
    const b = await execute(right, scope)
    const result = await isEqual(a, b)
    return result ? TRUE_VALUE : FALSE_VALUE
  },

  '!=': async function neq(left, right, scope, execute) {
    const a = await execute(left, scope)
    const b = await execute(right, scope)
    const result = await isEqual(a, b)
    return result ? FALSE_VALUE : TRUE_VALUE
  },

  '>': async function gt(left, right, scope, execute) {
    const a = await (await execute(left, scope)).get()
    const b = await (await execute(right, scope)).get()
    const result = partialCompare(a, b)

    if (result === null) {
      return NULL_VALUE
    }
    return result > 0 ? TRUE_VALUE : FALSE_VALUE
  },

  '>=': async function gte(left, right, scope, execute) {
    const a = await (await execute(left, scope)).get()
    const b = await (await execute(right, scope)).get()
    const result = partialCompare(a, b)

    if (result === null) {
      return NULL_VALUE
    }
    return result >= 0 ? TRUE_VALUE : FALSE_VALUE
  },

  '<': async function lt(left, right, scope, execute) {
    const a = await (await execute(left, scope)).get()
    const b = await (await execute(right, scope)).get()
    const result = partialCompare(a, b)

    if (result === null) {
      return NULL_VALUE
    }
    return result < 0 ? TRUE_VALUE : FALSE_VALUE
  },

  '<=': async function lte(left, right, scope, execute) {
    const a = await (await execute(left, scope)).get()
    const b = await (await execute(right, scope)).get()
    const result = partialCompare(a, b)

    if (result === null) {
      return NULL_VALUE
    }
    return result <= 0 ? TRUE_VALUE : FALSE_VALUE
  },

  // eslint-disable-next-line func-name-matching
  in: async function inop(left, right, scope, execute) {
    const a = await execute(left, scope)
    const choices = await execute(right, scope)

    switch (choices.getType()) {
      case 'array':
        for await (const b of choices) {
          if (await isEqual(a, b)) {
            return TRUE_VALUE
          }
        }
        return FALSE_VALUE
      case 'range': {
        const value = await a.get()
        const range = await choices.get()
        const leftCmp = partialCompare(value, range.left)
        if (leftCmp === null) {
          return NULL_VALUE
        }
        const rightCmp = partialCompare(value, range.right)
        if (rightCmp === null) {
          return NULL_VALUE
        }

        if (range.isExclusive()) {
          return leftCmp >= 0 && rightCmp < 0 ? TRUE_VALUE : FALSE_VALUE
        }
        return leftCmp >= 0 && rightCmp <= 0 ? TRUE_VALUE : FALSE_VALUE
      }
      case 'path': {
        if (a.getType() !== 'string') {
          return NULL_VALUE
        }
        const str = await a.get()
        const path = await choices.get()
        return path.matches(str) ? TRUE_VALUE : FALSE_VALUE
      }
      default:
        return NULL_VALUE
    }
  },

  match: async function match(left, right, scope, execute) {
    const text = await execute(left, scope)
    const pattern = await execute(right, scope)

    let tokens: Token[] = []
    let patterns: Pattern[] = []

    await gatherText(text, (part) => {
      tokens = tokens.concat(matchTokenize(part))
    })

    const didSucceed = await gatherText(pattern, (part) => {
      patterns = patterns.concat(matchAnalyzePattern(part))
    })
    if (!didSucceed) {
      return FALSE_VALUE
    }

    const matched = matchText(tokens, patterns)

    return matched ? TRUE_VALUE : FALSE_VALUE
  },

  '+': async function plus(left, right, scope, execute) {
    const a = await execute(left, scope)
    const b = await execute(right, scope)
    const aType = a.getType()
    const bType = b.getType()

    if (aType === 'datetime' && bType === 'number') {
      const dateTime = await a.get()
      const secs = await b.get()
      return new StaticValue(dateTime.add(secs))
    }

    if ((aType === 'number' && bType === 'number') || (aType === 'string' && bType === 'string')) {
      return new StaticValue((await a.get()) + (await b.get()))
    }

    if (aType === 'array' && bType === 'array') {
      return new StaticValue((await a.get()).concat(await b.get()))
    }

    if (aType === 'object' && bType === 'object') {
      return new StaticValue({...(await a.get()), ...(await b.get())})
    }

    return NULL_VALUE
  },

  '-': async function minus(left, right, scope, execute) {
    const a = await execute(left, scope)
    const b = await execute(right, scope)
    const aType = a.getType()
    const bType = b.getType()

    if (aType === 'datetime' && bType === 'number') {
      const dateTime = await a.get()
      const secs = await b.get()
      return new StaticValue(dateTime.add(-secs))
    }

    if (aType === 'datetime' && bType === 'datetime') {
      const aDateTime = await a.get()
      const bDateTime = await b.get()
      return new StaticValue(aDateTime.difference(bDateTime))
    }

    if (aType === 'number' && bType === 'number') {
      return new StaticValue((await a.get()) - (await b.get()))
    }

    return NULL_VALUE
  },

  '*': numericOperator((a, b) => a * b),
  '/': numericOperator((a, b) => a / b),
  '%': numericOperator((a, b) => a % b),
  '**': numericOperator((a, b) => Math.pow(a, b)),
}

function numericOperator(impl: (a: number, b: number) => number): GroqOperatorFn {
  return async function (left, right, scope, execute) {
    const a = await execute(left, scope)
    const b = await execute(right, scope)
    const aType = a.getType()
    const bType = b.getType()

    if (aType === 'number' && bType === 'number') {
      const result = impl(await a.get(), await b.get())
      return fromNumber(result)
    }

    return NULL_VALUE
  }
}
