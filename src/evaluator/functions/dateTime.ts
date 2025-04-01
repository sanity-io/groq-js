import {type ExprNode} from '../../nodeTypes'
import {type EvaluateContext} from '../../types'
import {type DateTime} from '../../values/utils'

export function now(_args: ExprNode[], {timestamp}: EvaluateContext): DateTime {
  return timestamp
}
now.arity = 0
