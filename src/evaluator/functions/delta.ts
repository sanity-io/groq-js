import {type ExprNode} from '../../nodeTypes'
import {type EvaluateContext} from '../../types'
import {createStub} from './utils'

export function operation(_args: ExprNode[], context: EvaluateContext): string | null {
  if (context?.after && context?.before) return 'update'
  if (context?.after) return 'create'
  if (context?.before) return 'delete'
  return null
}

export const changedAny = createStub({arity: 1, mode: 'delta'})
export const changedOnly = createStub({arity: 1, mode: 'delta'})
