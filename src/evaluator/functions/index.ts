import {type ExprNode} from '../../shared/nodeTypes'
import {type ArrayValue, StreamValue} from '../../shared/values'
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
import user from './user'

export {default as pipeFunctions} from './pipeFunctions'

/** @public */
export type GroqFunctionArg = ExprNode

/** @public */
export type GroqFunction = Executor<GroqFunctionArg[]>

export type FunctionSet = Record<string, GroqFunction | undefined>

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
  user,
}
