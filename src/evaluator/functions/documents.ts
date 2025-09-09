import type {FunctionSet} from '.'
import {constantExecutor} from '../evaluate'

const documents: FunctionSet = {}
documents['get'] = constantExecutor(() => {
  throw new Error('not implemented')
})
export default documents
