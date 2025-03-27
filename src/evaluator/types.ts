import type {ExprNode, Value} from '../nodeTypes'
import type {DateTime} from '../values'
import type {Scope} from './scope'

export interface Context {
  timestamp: DateTime
  identity: string
  dataset: Value
  before?: Value
  after?: Value

  sanity?: {
    projectId: string
    dataset: string
  }
  params?: Record<string, Value>
}

export type GroqFunctionArg = ExprNode
export type WithOptions<T> = T & {
  arity?: GroqFunctionArity
  mode?: 'normal' | 'delta'
}
export type GroqFunctionArity = number | ((count: number) => boolean)
export type GroqFunction = (args: ExprNode[], scope: Scope, context: Context) => Value
export type FunctionSet = Record<string, WithOptions<GroqFunction> | undefined>
export type NamespaceSet = Record<string, FunctionSet | undefined>
export type GroqPipeFunction = (
  base: Value,
  args: ExprNode[],
  scope: Scope,
  context: Context,
) => Value

export interface EvaluateOptions {
  dataset?: Iterable<unknown>
  identity?: string
  timestamp?: string | Date | DateTime
  root?: Value
  before?: Value
  after?: Value
  sanity?: {
    projectId: string
    dataset: string
  }
  params?: Record<string, Value>
}
