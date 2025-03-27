import type {ExprNode, Value} from '../../nodeTypes'
import {isIterable, isRecord} from '../../values/utils'
import type {Scope} from '../scope'
import type {Context} from '../types'

export function all(_args: ExprNode[], _scope: Scope, {dataset}: Context): Value {
  if (!isIterable(dataset)) return null
  return Iterator.from(dataset).filter(
    (value) => isRecord(value) && value['_type'] === 'system.release',
  )
}
all.arity = 0
