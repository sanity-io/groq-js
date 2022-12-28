import {ExprNode} from '../nodeTypes'
import {Value} from '../values'
import {Scope} from './scope'

export type Executor<N = ExprNode> = (node: N, scope: Scope) => Value | PromiseLike<Value>

export interface EvaluateOptions {
  // The value that will be available as `@` in GROQ.
  root?: any

  // The value that will be available as `*` in GROQ.
  dataset?: any

  // Parameters availble in the GROQ query (using `$param` syntax).
  params?: Record<string, unknown>

  // The timestamp returned from now()
  timestamp?: Date

  // Value used for identity()
  identity?: string

  // The value returned from before() in Delta-mode
  before?: any

  // The value returned from after() in Delta-mode
  after?: any

  // Settings used for the `sanity`-functions
  sanity?: {
    projectId: string
    dataset: string
  }
}

export interface Context {
  timestamp: Date
  identity: string
  before: Value | null
  after: Value | null
  sanity?: {
    projectId: string
    dataset: string
  }
}
