/**
 * Lightweight function metadata registry for GROQ functions.
 *
 * This file contains only metadata (name, arity, mode) - no function
 * implementations. It exists so the parser can validate function calls
 * without importing the evaluator.
 *
 * IMPORTANT: This file must have ZERO imports from ./evaluator/ or
 * any other module. It is pure data and types.
 */

/** @public */
export type GroqFunctionArity = number | ((count: number) => boolean)

export interface FunctionRegistryEntry {
  arity?: GroqFunctionArity
  mode?: 'normal' | 'delta'
}

export type FunctionRegistry = Record<string, FunctionRegistryEntry | undefined>

export type NamespaceRegistry = Record<string, FunctionRegistry | undefined>

export const namespaceRegistry: NamespaceRegistry = {
  global: {
    anywhere: {arity: 1},
    coalesce: {},
    count: {arity: 1},
    dateTime: {arity: 1},
    defined: {arity: 1},
    identity: {arity: 0},
    length: {arity: 1},
    path: {arity: 1},
    string: {arity: 1},
    references: {arity: (c) => c >= 1},
    round: {arity: (count) => count >= 1 && count <= 2},
    now: {arity: 0},
    boost: {arity: 2},
    lower: {arity: 1},
    upper: {arity: 1},
  },

  string: {
    lower: {arity: 1},
    upper: {arity: 1},
    split: {arity: 2},
    startsWith: {arity: 2},
  },

  array: {
    join: {arity: 2},
    compact: {arity: 1},
    unique: {arity: 1},
    intersects: {arity: 2},
  },

  pt: {
    text: {arity: 1},
  },

  delta: {
    operation: {},
    changedAny: {arity: 1, mode: 'delta'},
    changedOnly: {arity: 1, mode: 'delta'},
  },

  diff: {
    changedAny: {arity: 3},
    changedOnly: {arity: 3},
  },

  media: {
    aspect: {arity: 2},
  },

  sanity: {
    projectId: {},
    dataset: {},
    versionOf: {arity: 1},
    partOfRelease: {arity: 1},
  },

  math: {
    min: {arity: 1},
    max: {arity: 1},
    sum: {arity: 1},
    avg: {arity: 1},
  },

  dateTime: {
    now: {arity: 0},
  },

  releases: {
    all: {arity: 0},
  },

  text: {
    query: {arity: 1},
    semanticSimilarity: {arity: 1},
  },

  geo: {
    latLng: {},
    contains: {},
    intersects: {},
    distance: {},
  },

  documents: {
    get: {},
    incomingRefCount: {},
    incomingGlobalDocumentReferenceCount: {},
  },

  user: {
    attributes: {},
  },
}

export const pipeFunctionRegistry: FunctionRegistry = {
  order: {arity: (count) => count >= 1},
  score: {arity: (count) => count >= 1},
}
