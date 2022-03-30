# API

GROQ-JS exposes two functions:

```typescript
import {parse, evaluate} from 'groq-js'
```

- [`parse`](#parse)
- [`evalute`](#evaluate)

## `parse`

```typescript
declare function parse(input: string, options: ParserOptions = {}): ExprNode

interface ParseOptions {
  /** Parameters given to the query. */
  params?: Record<string, unknown>

  /** What mode to evaluate the query under. Defaults to "normal". */
  mode?: 'normal' | 'delta'
}

interface GroqSyntaxError extends Error {
  position: number
  name = 'GroqSyntaxError'
}
```

`parse` accepts a string and parses a GROQ query.
The returned value can be passed to [`evaluate`](#evaluate) to evaluate the query.

The function will throw `GroqSyntaxError` if there's a syntax error in the query.

## `evaluate`

```typescript
interface EvaluateOptions {
  // The value that will be available as `@` in GROQ.
  root?: any

  // The value that will be available as `*` in GROQ.
  dataset?: any

  // Parameters availble in the GROQ query (using `$param` syntax).
  params?: Record<string, unknown>

  // Timestamp used for now().
  timestamp?: Date

  // Value used for identity().
  identity?: string

  // The value returned from before() in Delta-mode
  before?: any

  // The value returned from after() in Delta-mode
  after?: any

  // Settings used for the `sanity`-functions.
  sanity?: {
    projectId: string
    dataset: string
  }
}

declare async function evaluate(node: ExprNode, options: EvaluateOptions = {})
```

`evaluate` accepts a node returned by [`parse`](#parse) and evaluates the query.
