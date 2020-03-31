# API

GROQ-JS exposes two functions:

```typescript
import {parse, evaluate} from 'groq-js'
```

- [`parse`](#parse)
- [`evalute`](#evaluate)

## `parse`

```typescript
declare function parse(input: string): SyntaxNode

interface GroqSyntaxError extends Error {
  position: number
  name: 'GroqSyntaxError'
}
```

`parse` accepts a string and parses a GROQ query.
The returned value can be passed to [`evalute`](#evaluate) to evaluate the query.

The function will throw `GroqSyntaxError` if there's a syntax error in the query.

## `evaluate`

```typescript
interface EvaluateOptions {
  // The value that will be available as `@` in GROQ.
  root?: any

  // The value that will be available as `*` in GROQ.
  dataset?: any

  // Parameters availble in the GROQ query (using `$param` syntax).
  params?: {[key: string]: any}
}

declare async function evaluate(node: SyntaxNode, options: EvaluateOptions = {})
```

`evaluate` accepts a node returned by [`parse`](#parse) and evaluates the query.
