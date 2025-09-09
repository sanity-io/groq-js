import type {FunctionSet} from '.'
import {isSelectorNode, type SelectorNode} from '../../nodeTypes'
import {FALSE_VALUE, TRUE_VALUE, type BooleanValue, type Value} from '../../values'
import {deepEqual} from '../equality'
import {asyncOnlyExecutor, executeAsync} from '../evaluate'
import {diffKeyPaths, startsWith, valueAtPath} from '../keyPath'
import type {Scope} from '../scope'
import {evaluateSelector} from '../selector'

export async function changedAny(
  before: Value,
  after: Value,
  selector: SelectorNode,
  scope: Scope,
): Promise<BooleanValue> {
  const beforeSelectorScope = scope.createHidden(before)
  const beforePaths = await evaluateSelector(
    selector,
    beforeSelectorScope.value,
    beforeSelectorScope,
  )
  const afterSelectorScope = scope.createHidden(after)
  const afterPaths = await evaluateSelector(selector, afterSelectorScope.value, afterSelectorScope)
  if (beforePaths.length !== afterPaths.length) {
    return TRUE_VALUE
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
          return TRUE_VALUE
        }
      }
    }

    const beforeValue = await valueAtPath(before, path)
    const afterValue = await valueAtPath(after, path)

    if (!deepEqual(beforeValue, afterValue)) {
      return TRUE_VALUE
    }
  }

  return FALSE_VALUE
}

export async function changedOnly(
  before: Value,
  after: Value,
  selector: SelectorNode,
  scope: Scope,
): Promise<BooleanValue> {
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
      return FALSE_VALUE
    }
  }

  return TRUE_VALUE
}

const diff: FunctionSet = {}
diff['changedAny'] = asyncOnlyExecutor(async (args, scope) => {
  const lhs = args[0]
  const rhs = args[1]
  const selector = args[2]
  if (!isSelectorNode(selector)) throw new Error('changedAny third argument must be a selector')

  const before = await executeAsync(lhs, scope)
  const after = await executeAsync(rhs, scope)

  return changedAny(before, after, selector, scope)
})
diff['changedAny'].arity = 3

diff['changedOnly'] = asyncOnlyExecutor(async (args, scope) => {
  const lhs = args[0]
  const rhs = args[1]
  const selector = args[2]
  if (!isSelectorNode(selector)) throw new Error('changedOnly third argument must be a selector')

  const before = await executeAsync(lhs, scope)
  const after = await executeAsync(rhs, scope)

  return changedOnly(before, after, selector, scope)
})
diff['changedOnly'].arity = 3

export default diff
