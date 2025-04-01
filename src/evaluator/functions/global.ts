import {type ExprNode, type Value} from '../../nodeTypes'
import {DateTime, isIterable, isRecord} from '../../values/utils'
import {type EvaluateContext} from '../../types'

export {lower, upper} from './string'

export function anywhere(args: ExprNode[], context: EvaluateContext): Value {
  const {evaluate} = context
  const base = evaluate(args[0], context)
  if (!isIterable(base)) return null
  return Iterator.from(base).some((item) => item === true)
}
anywhere.arity = 1

export function coalesce(args: ExprNode[], context: EvaluateContext): Value {
  const {evaluate} = context
  for (const arg of args) {
    const value = evaluate(arg, context)
    if (value !== null && value !== undefined) return value
  }
  return null
}

export function count(args: ExprNode[], context: EvaluateContext): Value {
  const {evaluate} = context
  const base = evaluate(args[0], context)
  if (!isIterable(base)) return null
  return Iterator.from(base).reduce<number>((count) => count + 1, 0)
}
count.arity = 1

// NOTE: this function behaves differently than `dateTime::now`
export function now(_args: ExprNode[], {timestamp}: EvaluateContext): Value {
  return timestamp.toJSON()
}
now.arity = 0

export function dateTime(args: ExprNode[], context: EvaluateContext): Value {
  const {evaluate} = context
  return DateTime.from(evaluate(args[0], context))
}
dateTime.arity = 1

export function defined(args: ExprNode[], context: EvaluateContext): Value {
  const {evaluate} = context
  const base = evaluate(args[0], context)
  return base !== null && base !== undefined
}
defined.arity = 1

export function identity(_args: ExprNode[], context: EvaluateContext): Value {
  return context.identity
}
identity.arity = 0

export function length(args: ExprNode[], context: EvaluateContext): Value {
  const {evaluate} = context
  const base = evaluate(args[0], context)
  if (typeof base === 'string') return countUTF8(base)
  if (isIterable(base)) return Iterator.from(base).reduce<number>((length) => length + 1, 0)
  return null
}
length.arity = 1

export function path(args: ExprNode[], context: EvaluateContext): Value {
  const {evaluate} = context
  const base = evaluate(args[0], context)
  if (typeof base !== 'string') return null
  return base
}
path.arity = 1

export function string(args: ExprNode[], context: EvaluateContext): Value {
  const {evaluate} = context
  const base = evaluate(args[0], context)
  if (base instanceof DateTime) return base.toJSON()
  switch (typeof base) {
    case 'number':
    case 'string':
    case 'boolean': {
      return `${base}`
    }
    default: {
      return null
    }
  }
}
string.arity = 1

export function references(args: ExprNode[], context: EvaluateContext): Value {
  const {evaluate} = context
  const paths = new Set(
    args.flatMap((arg) => {
      const base = evaluate(arg, context)
      return (isIterable(base) ? Array.from(base) : [base]).filter((i) => typeof i === 'string')
    }),
  )
  return hasReference(context.scope.value, paths)
}
references.arity = (c: number) => c >= 1

export function round(args: ExprNode[], context: EvaluateContext): Value {
  const {evaluate} = context
  const base = evaluate(args[0], context)
  if (typeof base !== 'number') return null

  let precision = 0
  if (args[1]) {
    const p = evaluate(args[1], context)
    if (typeof p !== 'number' || p < 0 || !Number.isInteger(p)) {
      return null
    }
    precision = p
  }

  if (precision === 0) {
    // Round half away from zero for negative values
    return base < 0 ? -Math.round(-base) : Math.round(base)
  }

  return Number(base.toFixed(precision))
}
round.arity = (c: number) => c >= 1 && c <= 2

export function boost(): never {
  throw new Error('Unexpected boost call')
}

// Helper functions
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

function hasReference(value: Value, paths: Set<string>): boolean {
  if (isIterable(value)) {
    for (const child of value) {
      if (hasReference(child, paths)) return true
    }
  }

  if (!isRecord(value)) return false

  if ('_ref' in value && typeof value['_ref'] === 'string') {
    return paths.has(value['_ref'])
  }

  for (const child of Object.values(value)) {
    if (hasReference(child, paths)) return true
  }

  return false
}
