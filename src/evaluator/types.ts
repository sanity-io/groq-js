export type Document = {
  _id?: string
  _type?: string
  [T: string]: unknown
}
export type DereferenceFunction = (obj: {_ref: string}) => PromiseLike<Document | null | undefined>

export interface EvaluateQueryOptions
  extends Partial<
    Pick<Context, 'identity' | 'timestamp' | 'before' | 'after' | 'params' | 'sanity'>
  > {
  dataset?: unknown
}

export interface Context {
  /**
   * User identity, the value of `identity()`
   */
  identity: string
  /**
   * Scopes used for this evaluation
   */
  scope: unknown[]
  /**
   * The timestamp returned from `now()`
   */
  timestamp: string
  /**
   * The value returned from before() in Delta-mode
   */
  before?: unknown
  /**
   * The value returned from after() in Delta-mode
   */
  after?: unknown
  /**
   * Parameters available in the GROQ query (using `$param` syntax).
   */
  params?: Record<string, unknown>
  /**
   * Settings used for the `sanity`-functions
   */
  sanity?: {
    projectId: string
    dataset: string
  }
}
