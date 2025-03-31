import {type ExprNode} from '../nodeTypes'
import {type Value} from '../values/types'
import {Scope} from './scope'

/**
 * Function that evaluates a node in a given scope
 * @public
 */
export type Executor<N = ExprNode> = (node: N, scope: Scope) => Value | PromiseLike<Value>

/**
 * Represents a document in a dataset
 * @public
 */
export type Document = {
  /** Document ID */
  _id?: string
  /** Document type */
  _type?: string
  [T: string]: unknown
}

/**
 * Function to resolve document references
 * @public
 */
export type DereferenceFunction = (obj: {_ref: string}) => PromiseLike<Document | null | undefined>

/**
 * Options for evaluating a GROQ query
 * @public
 */
export interface EvaluateOptions {
  /** The value that will be available as `@` in GROQ */
  root?: any

  /** The value that will be available as `*` in GROQ */
  dataset?: any

  /** Parameters available in the GROQ query (using `$param` syntax) */
  params?: Record<string, unknown>

  /** The timestamp returned from now() */
  timestamp?: Date

  /** Value used for identity() */
  identity?: string

  /** The value returned from before() in Delta-mode */
  before?: any

  /** The value returned from after() in Delta-mode */
  after?: any

  /** Settings used for the `sanity`-functions */
  sanity?: {
    projectId: string
    dataset: string
  }

  /** Custom function to resolve document references */
  dereference?: DereferenceFunction
}

/**
 * Context for evaluating GROQ expressions
 * @public
 */
export interface Context {
  /** Current timestamp for the query */
  timestamp: Date
  /** Current identity for the query */
  identity: string
  /** The value returned from before() in Delta-mode */
  before: Value | null
  /** The value returned from after() in Delta-mode */
  after: Value | null
  /** Settings used for the `sanity`-functions */
  sanity?: {
    projectId: string
    dataset: string
  }
  /** Custom function to resolve document references */
  dereference?: DereferenceFunction
}
