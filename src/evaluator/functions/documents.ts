import {constantExecutor} from '../evaluate'
import type {FunctionSet} from '.'

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
