import type {FunctionSet} from '.'
import {FALSE_VALUE, fromString, NULL_VALUE, TRUE_VALUE} from '../../values'
import {constantExecutor, mappedExecutor} from '../evaluate'

const sanity: FunctionSet = {}
sanity['projectId'] = constantExecutor((_, scope) => {
  if (scope.context.sanity) {
    return fromString(scope.context.sanity.projectId)
  }

  return NULL_VALUE
})
sanity['dataset'] = constantExecutor((_, scope) => {
  if (scope.context.sanity) {
    return fromString(scope.context.sanity.dataset)
  }

  return NULL_VALUE
})

// eslint-disable-next-line require-await
sanity['versionOf'] = mappedExecutor(
  ([value]) => [value!, {type: 'This'}],
  (_, value, val) => {
    if (value.type !== 'string') return NULL_VALUE
    const baseId = value.data

    if (val.type !== 'object') return NULL_VALUE
    if (typeof val.data['_id'] !== 'string') return NULL_VALUE

    // published document
    if (val.data['_id'] === baseId) return TRUE_VALUE

    const components = val.data['_id'].split('.')

    // draft document
    if (
      components.length >= 2 &&
      components[0] === 'drafts' &&
      components.slice(1).join('.') === baseId
    ) {
      return TRUE_VALUE
    }

    // version document
    if (
      components.length >= 3 &&
      components[0] === 'versions' &&
      components.slice(2).join('.') === baseId
    ) {
      return TRUE_VALUE
    }

    return FALSE_VALUE
  },
)
sanity['versionOf'].arity = 1

// eslint-disable-next-line require-await
sanity['partOfRelease'] = mappedExecutor(
  (args) => [args[0]!, {type: 'This'}],
  (_, value, val) => {
    if (value.type !== 'string') return NULL_VALUE
    const baseId = value.data

    if (val.type !== 'object') return NULL_VALUE

    if (typeof val.data['_id'] !== 'string') return NULL_VALUE

    const components = val.data['_id'].split('.')
    if (components.length >= 3 && components[0] === 'versions' && components[1] === baseId) {
      return TRUE_VALUE
    }

    return FALSE_VALUE
  },
)
sanity['partOfRelease'].arity = 1

export default sanity
