import {type Scope} from './evaluator/scope'
import {type Executor} from './evaluator/types'
import {type ExprNode} from './nodeTypes'
import {type Value} from './values/types'

export interface ParseOptions {
  params?: Record<string, unknown>
  mode?: 'normal' | 'delta'
}

/** @public */
export type GroqFunctionArg = ExprNode
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
