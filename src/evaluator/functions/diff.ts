import type {FunctionSet} from '.'
import {isSelectorNode} from '../../nodeTypes'
import {fromJS} from '../../values'
import {deepEqual} from '../equality'
import {diffKeyPaths, startsWith, valueAtPath} from '../keyPath'
import {evaluateSelector} from '../selector'

const diff: FunctionSet = {}
diff['changedAny'] = async (args, scope, execute) => {
  const lhs = args[0]
  const rhs = args[1]
  const selector = args[2]
  if (!isSelectorNode(selector)) throw new Error('changedAny third argument must be a selector')

  const before = await execute(lhs, scope)
  const after = await execute(rhs, scope)

  const beforeSelectorScope = scope.createHidden(before)
  const beforePaths = await evaluateSelector(
    selector,
    beforeSelectorScope.value,
    beforeSelectorScope,
  )
  const afterSelectorScope = scope.createHidden(after)
  const afterPaths = await evaluateSelector(selector, afterSelectorScope.value, afterSelectorScope)
  if (beforePaths.length !== afterPaths.length) {
    return fromJS(true)
  }

  for (const path of beforePaths) {
    for (let i = 0; i < path.length; i++) {
      if (typeof path[i] === 'number') {
        const slice = path.slice(0, i)
        const beforeArr = await valueAtPath(before, slice)
        const afterArr = await valueAtPath(after, slice)

        if (
          !Array.isArray(beforeArr) ||
          !Array.isArray(afterArr) ||
          beforeArr.length !== afterArr.length
        ) {
          return fromJS(true)
        }
      }
    }

    const beforeValue = await valueAtPath(before, path)
    const afterValue = await valueAtPath(after, path)

    if (!deepEqual(beforeValue, afterValue)) {
      return fromJS(true)
    }
  }

  return fromJS(false)
}
diff['changedAny'].arity = 3

diff['changedOnly'] = async (args, scope, execute) => {
  const lhs = args[0]
  const rhs = args[1]
  const selector = args[2]
  if (!isSelectorNode(selector)) throw new Error('changedOnly third argument must be a selector')

  const before = await execute(lhs, scope)
  const after = await execute(rhs, scope)

  const beforeSelectorScope = scope.createHidden(before)
  const selectedPaths = await evaluateSelector(
    selector,
    beforeSelectorScope.value,
    beforeSelectorScope,
  )

  for await (const diffPath of diffKeyPaths(before, after)) {
    let found = false
    for (const selectedPath of selectedPaths) {
      // it matches if the diff path starts with the selected path
      const match = startsWith(diffPath, selectedPath)
      if (match) {
        found = true
        break
      }
    }
    if (!found) {
      return fromJS(false)
    }
  }

  return fromJS(true)
}
diff['changedOnly'].arity = 3

export default diff
