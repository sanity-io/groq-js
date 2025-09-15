import type {FunctionSet} from '.'
import {arrayExecutor} from '../evaluate'

const releases: FunctionSet = {}

// eslint-disable-next-line require-await
releases['all'] = arrayExecutor(
  () => ({array: {type: 'Everything'}}),
  function* (_, value) {
    if (
      typeof value === 'object' &&
      value &&
      '_type' in value &&
      value._type === 'system.release'
    ) {
      yield value
    }
  },
)
releases['all'].arity = 0

export default releases
