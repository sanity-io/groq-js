import {type ExprNode} from '../../nodeTypes'
import {type Value} from '../../values'
import {Scope} from '../scope'
import type {Executor} from '../types'
import array from './array'
import dateTime from './dateTime'
import delta from './delta'
import diff from './diff'
import geo from './geo'
import _global from './global'
import math from './math'
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
export type GroqFunction = (
  args: GroqFunctionArg[],
  scope: Scope,
  execute: Executor,
) => PromiseLike<Value>

export type FunctionSet = Record<string, WithOptions<GroqFunction> | undefined>

export type NamespaceSet = Record<string, FunctionSet | undefined>

export type GroqPipeFunction = (
  base: Value,
  args: ExprNode[],
  scope: Scope,
  execute: Executor,
) => PromiseLike<Value>

export const namespaces: NamespaceSet = {
  global: _global,
  string,
  array,
  pt,
  delta,
  diff,
  sanity,
  math,
  dateTime,
  releases,
  text,
  geo,
}
