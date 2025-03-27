import type {ExprNode, Value} from '../../nodeTypes'
import {evaluate} from '../evaluate'
import type {Scope} from '../scope'
import type {Context} from '../types'

export function lower(args: ExprNode[], scope: Scope, context: Context): Value {
  const base = evaluate(args[0], scope, context)
  if (typeof base !== 'string') return null
  return base.toLowerCase()
}
lower.arity = 1

export function upper(args: ExprNode[], scope: Scope, context: Context): Value {
  const base = evaluate(args[0], scope, context)
  if (typeof base !== 'string') return null
  return base.toUpperCase()
}
upper.arity = 1

export function split(args: ExprNode[], scope: Scope, context: Context): Value {
  const base = evaluate(args[0], scope, context)
  if (typeof base !== 'string') return null
  const separator = evaluate(args[1], scope, context)
  if (typeof separator !== 'string') return null
  if (!base.length) return []
  if (!separator.length) return Array.from(base)
  return base.split(separator)
}
split.arity = 2

export function startsWith(args: ExprNode[], scope: Scope, context: Context): Value {
  const base = evaluate(args[0], scope, context)
  if (typeof base !== 'string') return null
  const prefix = evaluate(args[1], scope, context)
  if (typeof prefix !== 'string') return null
  return base.startsWith(prefix)
}
startsWith.arity = 2
