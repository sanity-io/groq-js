import type {FunctionSet} from '.'
import {FALSE_VALUE, fromJS, fromString, NULL_VALUE, TRUE_VALUE} from '../../values'

const sanity: FunctionSet = {}
// eslint-disable-next-line require-await
// eslint-disable-next-line require-await
sanity['projectId'] = async function (_args, scope) {
  if (scope.context.sanity) {
    return fromString(scope.context.sanity.projectId)
  }

  return NULL_VALUE
}
// eslint-disable-next-line require-await
// eslint-disable-next-line require-await
sanity['dataset'] = async function (_args, scope) {
  if (scope.context.sanity) {
    return fromString(scope.context.sanity.dataset)
  }

  return NULL_VALUE
}

// eslint-disable-next-line require-await
sanity['versionOf'] = async function (args, scope, execute) {
  const value = await execute(args[0], scope)
  if (value.type !== 'string') return NULL_VALUE
  const baseId = value.data

  const val = await scope.value.get()
  if (!val || typeof val._id !== 'string') return NULL_VALUE

  const components = val._id.split('.')

  // published document
  if (val._id === baseId) return TRUE_VALUE

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
}
sanity['versionOf'].arity = 1

// eslint-disable-next-line require-await
sanity['partOfRelease'] = async function (args, scope, execute) {
  const value = await execute(args[0], scope)
  if (value.type !== 'string') return NULL_VALUE
  const baseId = value.data

  const val = await scope.value.get()
  if (!val || typeof val._id !== 'string') return NULL_VALUE

  const components = val._id.split('.')
  return fromJS(components.length >= 3 && components[0] === 'versions' && components[1] === baseId)
}
sanity['partOfRelease'].arity = 1

export default sanity
