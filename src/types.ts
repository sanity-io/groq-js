import {type Scope} from './evaluator/scope'
import {type Executor} from './evaluator/types'
import {type ExprNode} from './nodeTypes'
import {type Value} from './values/types'

/**
 * A collection of GROQ functions indexed by name
 * @public
 */
export type FunctionSet = Record<string, WithOptions<GroqFunction> | undefined>

/**
 * Represents a GROQ function that can be called in a query
 * @public
 */
export type GroqFunction = (
  args: GroqFunctionArg[],
  scope: Scope,
  execute: Executor,
) => PromiseLike<Value>

/**
 * Represents an argument to a GROQ function
 * @public
 */
export type GroqFunctionArg = ExprNode

/**
 * Specifies the allowed number of arguments for a GROQ function
 * Either an exact number or a predicate function to validate the argument count
 * @public
 */
export type GroqFunctionArity = number | ((count: number) => boolean)

/**
 * Represents a GROQ pipe function that can be called with the | operator
 * @public
 */
export type GroqPipeFunction = (
  base: Value,
  args: ExprNode[],
  scope: Scope,
  execute: Executor,
) => PromiseLike<Value>

/**
 * A collection of function sets organized by namespace
 * @public
 */
export type NamespaceSet = Record<string, FunctionSet | undefined>

/**
 * Options for parsing GROQ queries
 * @public
 */
export interface ParseOptions {
  /** Parameters available to the query using $param syntax */
  params?: Record<string, unknown>
  /** The mode of operation, either 'normal' or 'delta' */
  mode?: 'normal' | 'delta'
}

/**
 * Augments a type with function options including arity and mode
 * @public
 */
export type WithOptions<T> = T & {
  /** The arity (number of arguments) the function accepts */
  arity?: GroqFunctionArity
  /** The mode the function operates in */
  mode?: 'normal' | 'delta'
}
