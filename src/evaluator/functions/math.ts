import type {ExprNode, Value} from '../../nodeTypes'
import {isIterable} from '../../values/utils'
import {evaluate} from '../evaluate'
import type {Scope} from '../scope'
import type {Context} from '../types'

export function min(args: ExprNode[], scope: Scope, context: Context): Value {
  const base = evaluate(args[0], scope, context)
  if (!isIterable(base)) return null

  let min = Infinity
  for (const item of base) {
    if (item === null || item === undefined) continue
    // early exit if a non-null, non-number is found
    if (typeof item !== 'number') return null
    if (item < min) {
      min = item
    }
  }

  if (min === Infinity) return null
  return min
}
min.arity = 1

export function max(args: ExprNode[], scope: Scope, context: Context): Value {
  const base = evaluate(args[0], scope, context)
  if (!isIterable(base)) return null

  let max = -Infinity
  for (const item of base) {
    if (item === undefined || item === null) continue
    // early exit if a non-null, non-number is found
    if (typeof item !== 'number') return null
    if (item > max) {
      max = item
    }
  }
  if (max === -Infinity) return null
  return max
}
max.arity = 1

export function sum(args: ExprNode[], scope: Scope, context: Context): Value {
  const base = evaluate(args[0], scope, context)
  if (!isIterable(base)) return null

  let sum = 0
  let count = 0
  let foundNumber = false
  for (const item of base) {
    if (item === undefined || item === null) continue
    // early exit if a non-null, non-number is found
    if (typeof item !== 'number') return null
    foundNumber = true
    count += 1
    sum += item
  }

  if (!foundNumber && count > 0) return null
  return sum
}
sum.arity = 1

export function avg(args: ExprNode[], scope: Scope, context: Context): Value {
  const base = evaluate(args[0], scope, context)
  if (!isIterable(base)) return null

  let sum = 0
  let count = 0
  for (const item of base) {
    if (item === undefined || item === null) continue
    // early exit if a non-null, non-number is found
    if (typeof item !== 'number') return null
    count += 1
    sum += item
  }

  if (count === 0) return null
  return sum / count
}
avg.arity = 1
