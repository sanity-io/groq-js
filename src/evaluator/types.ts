import * as NodeTypes from '../nodeTypes'
import {Scope} from './scope'
import {Value} from '../values'

export type Executor<N = NodeTypes.ExprNode> = (node: N, scope: Scope) => Value | PromiseLike<Value>

export interface EvaluateOptions {
  // The value that will be available as `@` in GROQ.
  root?: any

  // The value that will be available as `*` in GROQ.
  dataset?: any

  // Parameters availble in the GROQ query (using `$param` syntax).
  params?: Record<string, unknown>

  // Timestamp used for now()
  timestamp?: Date

  // Value used for identity()
  identity?: string
}

export interface Context {
  timestamp: Date
  identity: string
}
