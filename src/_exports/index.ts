// @ts-expect-error no types
// eslint-disable-next-line import-x/no-unresolved
import Iterator from 'core-js-pure/actual/iterator'

if (typeof globalThis !== 'undefined' && typeof globalThis.Iterator === 'undefined') {
  globalThis.Iterator = Iterator
}

export {evaluate} from '../evaluator/evaluate'
export type {
  EvaluateContext,
  EvaluateOptions,
  GroqFunction,
  GroqFunctionArg,
  GroqPipeFunction,
  ParseOptions,
} from '../types'
export * from '../nodeTypes'
export {parse, GroqSyntaxError, GroqQueryError} from '../parser/parser'
export {typeEvaluate} from '../typeEvaluator/typeEvaluate'
export {createReferenceTypeNode} from '../typeEvaluator/typeHelpers'
export {toJS} from '../values/utils'

export type {
  ArrayTypeNode,
  BooleanTypeNode,
  Document as DocumentSchemaType,
  InlineTypeNode,
  NullTypeNode,
  NumberTypeNode,
  ObjectAttribute,
  ObjectTypeNode,
  PrimitiveTypeNode,
  Schema as SchemaType,
  StringTypeNode,
  TypeDeclaration as TypeDeclarationSchemaType,
  TypeNode,
  UnionTypeNode,
  UnknownTypeNode,
} from '../typeEvaluator/types'
