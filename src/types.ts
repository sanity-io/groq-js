import {type Scope} from './evaluator/scope'
import {type ExprNode, type Value} from './nodeTypes'
import {type DateTime} from './values/utils'

/**
 * @public
 */
export interface EvaluateContext {
  timestamp: DateTime
  identity: string
  dataset: Value
  before?: Value
  after?: Value
  scope: Scope
  evaluate: EvaluateFunction

  sanity?: {
    projectId: string
    dataset: string
  }
  params?: Record<string, Value>
}

/**
 * @public
 */
export type EvaluateFunction = (node: ExprNode, context: EvaluateContext) => Value

/**
 * @public
 */
export interface EvaluateOptions {
  dataset?: Value | unknown
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
  evaluate?: EvaluateFunction
}

/**
 * A collection of GROQ functions indexed by name
 * @internal
 */
export type FunctionSet = Record<string, WithOptions<GroqFunction> | undefined>

/**
 * Represents a GROQ function that can be called in a query
 * @internal
 */
export type GroqFunction = (args: ExprNode[], context: EvaluateContext) => Value

/**
 * Represents an argument to a GROQ function
 * @internal
 */
export type GroqFunctionArg = ExprNode

/**
 * Specifies the allowed number of arguments for a GROQ function
 * Either an exact number or a predicate function to validate the argument count
 * @internal
 */
export type GroqFunctionArity = number | ((count: number) => boolean)

/**
 * Represents a GROQ pipe function that can be called with the | operator
 * @internal
 */
export type GroqPipeFunction = (base: Value, args: ExprNode[], context: EvaluateContext) => Value

/**
 * A collection of function sets organized by namespace
 * @internal
 */
export type NamespaceSet = Record<string, FunctionSet | undefined>

/**
 * Options for parsing GROQ queries
 * @public
 */
export interface ParseOptions {
  /** Parameters available to the query using $param syntax */
  params?: Record<string, Value>
  /** The mode of operation, either 'normal' or 'delta' */
  mode?: 'normal' | 'delta'
}

/**
 * Augments a type with function options including arity and mode
 * @internal
 */
export type WithOptions<T> = T & {
  /** The arity (number of arguments) the function accepts */
  arity?: GroqFunctionArity
  /** The mode the function operates in */
  mode?: 'normal' | 'delta'
}
