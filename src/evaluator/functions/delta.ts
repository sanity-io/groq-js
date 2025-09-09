import type {FunctionSet} from '.'
import {isSelectorNode} from '../../nodeTypes'
import {fromString, NULL_VALUE} from '../../values'
import {asyncOnlyExecutor, constantExecutor} from '../evaluate'
import {changedAny, changedOnly} from './diff'

const delta: FunctionSet = {}
// eslint-disable-next-line require-await
delta['operation'] = constantExecutor((_, scope) => {
  const hasBefore = scope.context.before !== null
  const hasAfter = scope.context.after !== null

  if (hasBefore && hasAfter) {
    return fromString('update')
  }

  if (hasAfter) {
    return fromString('create')
  }

  if (hasBefore) {
    return fromString('delete')
  }

  return NULL_VALUE
})

delta['changedAny'] = asyncOnlyExecutor(async (args, scope) => {
  const before = scope.context.before || NULL_VALUE
  const after = scope.context.after || NULL_VALUE
  const selector = args[0]
  if (!isSelectorNode(selector)) throw new Error('changedAny first argument must be a selector')

  return changedAny(before, after, selector, scope)
})
delta['changedAny'].arity = 1
delta['changedAny'].mode = 'delta'

delta['changedOnly'] = asyncOnlyExecutor(async (args, scope) => {
  const before = scope.context.before || NULL_VALUE
  const after = scope.context.after || NULL_VALUE
  const selector = args[0]
  if (!isSelectorNode(selector)) throw new Error('changedOnly first argument must be a selector')

  return changedOnly(before, after, selector, scope)
})
delta['changedOnly'].arity = 1
delta['changedOnly'].mode = 'delta'

export default delta
