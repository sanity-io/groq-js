import {constantExecutor} from '../evaluate'
import type {FunctionSet} from '.'

const user: FunctionSet = {}
user['attributes'] = constantExecutor(() => {
  throw new Error('not implemented')
})
export default user
