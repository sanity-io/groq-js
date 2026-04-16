/**
 * The arity constraint for a GROQ function. Either a fixed argument count,
 * or a predicate that validates the argument count (for variadic functions).
 */
export type GroqFunctionArity = number | ((count: number) => boolean)

/**
 * Metadata for a single GROQ function, used by the parser for validation.
 * Does not contain the function implementation itself.
 */
export interface FunctionRegistryEntry {
  /** Expected argument count, or a predicate for variadic functions. Omit for unconstrained arity. */
  arity?: GroqFunctionArity
  /** Restricts function availability to a specific evaluation mode. */
  mode?: 'normal' | 'delta'
}

/** A set of function metadata entries keyed by function name. */
export type FunctionRegistry = Record<string, FunctionRegistryEntry | undefined>

/** A set of namespaces, each containing function metadata entries. */
export type NamespaceRegistry = Record<string, FunctionRegistry | undefined>

/**
 * Registry of all built-in GROQ functions and their metadata, organized by namespace.
 * The parser uses this to validate function calls without importing the evaluator.
 */
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

/**
 * Registry of built-in GROQ pipe functions (used with `|` operator) and their metadata.
 */
export const pipeFunctionRegistry: FunctionRegistry = {
  order: {arity: (count) => count >= 1},
  score: {arity: (count) => count >= 1},
}
