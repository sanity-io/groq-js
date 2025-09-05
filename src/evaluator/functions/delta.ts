import type {FunctionSet} from '.'
import {fromString, NULL_VALUE} from '../../values'

const delta: FunctionSet = {}
// eslint-disable-next-line require-await
delta['operation'] = async function (_args, scope) {
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
}

delta['changedAny'] = (_args, _scope) => {
  throw new Error('not implemented')
}
delta['changedAny'].arity = 1
delta['changedAny'].mode = 'delta'

delta['changedOnly'] = () => {
  throw new Error('not implemented')
}
delta['changedOnly'].arity = 1
delta['changedOnly'].mode = 'delta'

export default delta
