import type {FunctionSet} from '.'
import {constantExecutor} from '../evaluate'

/**
 * Text query function - no-op implementation.
 *
 * groq-js has no search engine, but we provide this no-op implementation
 * to avoid throwing errors when parsing queries that use text::query().
 */
const text: FunctionSet = {}
text['query'] = constantExecutor(() => {
  throw new Error('not implemented')
})
text['query'].arity = 1

export default text
