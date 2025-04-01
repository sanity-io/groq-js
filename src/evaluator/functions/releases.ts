import {type ExprNode, type Value} from '../../nodeTypes'
import {isIterable, isRecord} from '../../values/utils'
import {type EvaluateContext} from '../../types'
import {iteratorFrom} from '../../values/iteratorFrom'

export function all(_args: ExprNode[], {dataset}: EvaluateContext): Value {
  if (!isIterable(dataset)) return null
  return iteratorFrom(dataset).filter(
    (value) => isRecord(value) && value['_type'] === 'system.release',
  )
}
all.arity = 0
