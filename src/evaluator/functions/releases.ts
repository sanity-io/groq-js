import type {FunctionSet} from '.'
import {fromJS, getType} from '../../values'

const releases: FunctionSet = {}

// eslint-disable-next-line require-await
releases['all'] = async function (_args, scope) {
  const allReleases: string[] = []
  for await (const value of scope.source) {
    if (getType(value) === 'object') {
      const val = await value.get()
      if (val && '_type' in val && val._type === 'system.release') {
        allReleases.push(val)
      }
    }
  }

  return fromJS(allReleases)
}
releases['all'].arity = 0

export default releases
