// Utilities for enabling introspection on query results

import type {GroqType} from './values/types'

export const introspectGroqType = Symbol('introspectGroqType')

export interface IntrospectableGroqType {
  [introspectGroqType]: GroqType
}
