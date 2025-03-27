import type {ExprNode, Value} from '../../nodeTypes'
import type {Scope} from '../scope'
import type {Context} from '../types'

export function now(args: ExprNode[], scope: Scope, context: Context): Value {
  return context.timestamp
}
now.arity = 0
