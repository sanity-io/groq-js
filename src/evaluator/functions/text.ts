import {constantExecutor} from '../evaluate'
import type {FunctionSet} from '.'

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

text['semanticSimilarity'] = constantExecutor(() => {
  throw new Error('not implemented')
})

export default text
