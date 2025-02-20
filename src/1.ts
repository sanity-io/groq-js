export {evaluateQuery as evaluate} from './evaluator'
export type {GroqFunction, GroqFunctionArg, GroqPipeFunction} from './evaluator/functions'
export type {
  Context,
  DereferenceFunction,
  Document,
  EvaluateQueryOptions as EvaluateOptions,
} from './evaluator/types'
export * from './nodeTypes'
export {parse} from './parser'
export type {ParseOptions} from './types'

// Type evaluation
export type * from './typeEvaluator'
export {createReferenceTypeNode, typeEvaluate} from './typeEvaluator'
