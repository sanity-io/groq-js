import {type ExprNode, type Value} from '../../nodeTypes'
import {type EvaluateContext} from '../../types'

export function lower(args: ExprNode[], context: EvaluateContext): Value {
  const {evaluate} = context
  const base = evaluate(args[0], context)
  if (typeof base !== 'string') return null
  return base.toLowerCase()
}
lower.arity = 1

export function upper(args: ExprNode[], context: EvaluateContext): Value {
  const {evaluate} = context
  const base = evaluate(args[0], context)
  if (typeof base !== 'string') return null
  return base.toUpperCase()
}
upper.arity = 1

export function split(args: ExprNode[], context: EvaluateContext): Value {
  const {evaluate} = context
  const base = evaluate(args[0], context)
  if (typeof base !== 'string') return null
  const sep = evaluate(args[1], context)
  if (typeof sep !== 'string') return null
  if (!base.length) return []
  if (!sep.length) return Array.from(base)
  return base.split(sep)
}
split.arity = 2

export function startsWith(args: ExprNode[], context: EvaluateContext): Value {
  const {evaluate} = context
  const base = evaluate(args[0], context)
  if (typeof base !== 'string') return null
  const prefix = evaluate(args[1], context)
  if (typeof prefix !== 'string') return null
  return base.startsWith(prefix)
}
startsWith.arity = 2
