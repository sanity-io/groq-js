import type {ExprNode, Value} from '../../nodeTypes'
import type {Scope} from '../scope'
import type {Context} from '../types'
import {createStub} from './utils'

export function operation(_args: ExprNode[], _scope: Scope, context: Context): Value {
  if (context?.after && context?.before) return 'update'
  if (context?.after) return 'create'
  if (context?.before) return 'delete'
  return null
}

export const changedAny = createStub({arity: 1, mode: 'delta'})
export const changedOnly = createStub({arity: 1, mode: 'delta'})
