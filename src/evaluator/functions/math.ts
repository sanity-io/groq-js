import {type ExprNode, type Value} from '../../nodeTypes'
import {isIterable} from '../../values/utils'
import {type EvaluateContext} from '../../types'

export function min(args: ExprNode[], context: EvaluateContext): Value {
  const {evaluate} = context
  const base = evaluate(args[0], context)
  if (!isIterable(base)) return null

  let min = Infinity
  for (const item of base) {
    if (item === undefined || item === null) continue
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

export function max(args: ExprNode[], context: EvaluateContext): Value {
  const {evaluate} = context
  const base = evaluate(args[0], context)
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

export function sum(args: ExprNode[], context: EvaluateContext): Value {
  const {evaluate} = context
  const base = evaluate(args[0], context)
  if (!isIterable(base)) return null

  let sum = 0
  for (const item of base) {
    if (item === undefined || item === null) continue
    // early exit if a non-null, non-number is found
    if (typeof item !== 'number') return null
    sum += item
  }
  return sum
}
sum.arity = 1

export function avg(args: ExprNode[], context: EvaluateContext): Value {
  const {evaluate} = context
  const base = evaluate(args[0], context)
  if (!isIterable(base)) return null

  let sum = 0
  let count = 0
  for (const item of base) {
    if (item === undefined || item === null) continue
    // early exit if a non-null, non-number is found
    if (typeof item !== 'number') return null
    sum += item
    count++
  }
  if (count === 0) return null
  return sum / count
}
avg.arity = 1
