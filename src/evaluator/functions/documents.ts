import type {FunctionSet} from '.'
import {constantExecutor} from '../evaluate'

const documents: FunctionSet = {}
documents['get'] = constantExecutor(() => {
  throw new Error('not implemented')
})
documents['incomingRefCount'] = constantExecutor(() => {
  throw new Error('not implemented')
})
documents['incomingGlobalDocumentReferenceCount'] = constantExecutor(() => {
  throw new Error('not implemented')
})
export default documents
