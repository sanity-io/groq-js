import {type ExprNode} from '../../nodeTypes'
import {type ArrayValue, StreamValue} from '../../values'
import type {Executor} from '../types'
import array from './array'
import dateTime from './dateTime'
import delta from './delta'
import diff from './diff'
import documents from './documents'
import geo from './geo'
import _global from './global'
import math from './math'
import media from './media'
import pt from './pt'
import releases from './releases'
import sanity from './sanity'
import string from './string'
import text from './text'

export {default as pipeFunctions} from './pipeFunctions'

/** @public */
export type GroqFunctionArg = ExprNode

/** @internal */
export type WithOptions<T> = T & {
  arity?: GroqFunctionArity
  mode?: 'normal' | 'delta'
}

export type GroqFunctionArity = number | ((count: number) => boolean)

/** @public */
export type GroqFunction = Executor<GroqFunctionArg[]>

export type FunctionSet = Record<string, WithOptions<GroqFunction> | undefined>

export type NamespaceSet = Record<string, FunctionSet | undefined>

export type GroqPipeFunction = Executor<
  {base: ArrayValue | StreamValue; args: ExprNode[]},
  {base: ArrayValue; args: ExprNode[]}
>

export const namespaces: NamespaceSet = {
  global: _global,
  string,
  array,
  pt,
  delta,
  diff,
  media,
  sanity,
  math,
  dateTime,
  releases,
  text,
  geo,
  documents,
}
