# API

`groq-js` provides functions to parse and evaluate GROQ queries in JavaScript environments.

## Core Functions

The primary functions you'll likely use are:

```typescript
import {parse, evaluate, toJS} from 'groq-js'

// Parse a GROQ query string into an Abstract Syntax Tree (AST)
const tree = parse('*[_type == "product"]{name, price}')

// Evaluate the AST against a dataset
const dataset = [
  /* ... your data ... */
]
const value = evaluate(tree, {dataset})

// Convert the internal result representation to a standard JavaScript value
const result = toJS(value)

console.log(result) // Output: Plain JavaScript array/object/value
```

- [`parse`](#parse): Parses a GROQ query string into an AST node (`ExprNode`).
- [`evaluate`](#evaluate): Evaluates an AST node against a dataset and context, returning an internal `Value` representation.
- [`toJS`](#tojs): Converts the internal `Value` representation into a plain JavaScript value.
- [`typeEvaluate`](#typeevaluate): (Beta) Evaluates the _type_ that a query would return based on a schema.

## Other Exports

The library also exports various types, errors, and helper functions:

```typescript
import {
  // Core Functions (already shown)
  // parse, evaluate, toJS, typeEvaluate

  // Errors
  GroqSyntaxError, // Thrown by parse for syntax issues
  GroqQueryError, // Thrown during evaluation for runtime issues

  // Type Evaluation Helpers & Types (used with typeEvaluate)
  createReferenceTypeNode,
  SchemaType, // Your schema definition type
  TypeNode, // The resulting type representation
  // ... specific TypeNode subtypes (ArrayTypeNode, StringTypeNode, etc.)
  // ... specific SchemaType subtypes (DocumentSchemaType, etc.)

  // Core Types
  ExprNode, // Base type for AST nodes from parse()
  Value, // Internal result type from evaluate()
  JSValue, // Type of the plain JS value returned by toJS()
  ParseOptions, // Options for parse()
  EvaluateOptions, // Options for evaluate()

  // Lower-level types (usually not needed directly)
  EvaluateContext,
  GroqFunction,
  GroqFunctionArg,
  GroqPipeFunction,
  DateTime, // Internal representation for dates/times
  // ... specific ExprNode subtypes (OperatorNode, FuncCallNode, etc.)
} from 'groq-js'
```

---

## `parse`

Parses a GROQ query string into an executable Abstract Syntax Tree (AST).

```typescript
declare function parse(
  input: string,
  options?: ParseOptions
): ExprNode

interface ParseOptions {
  /**
   * Parameters to make available in the query via `$paramName`.
   * Example: { paramName: "value" }
   */
  params?: Record<string, unknown>

  /**
   * Query mode. Affects behavior of certain functions/contexts.
   * - "normal": Standard query evaluation.
   * - "delta": For evaluating queries in the context of document patches (requires `before` and `after` values in `evaluate` options).
   * @default "normal"
   */
  mode?: 'normal' | 'delta'
}

// Base type for all nodes in the AST returned by parse()
interface ExprNode {
  type: string
  // ... other properties depending on the node type
}

// Error thrown for syntax errors during parsing
interface GroqSyntaxError extends Error {
  name = 'GroqSyntaxError'
  /** 0-indexed position in the input string where the error occurred. */
  position: number
}
```

- **Returns:** An `ExprNode` representing the root of the parsed query AST. This object can be passed to `evaluate` or `typeEvaluate`.
- **Throws:** `GroqSyntaxError` if the input string contains invalid GROQ syntax. May throw `GroqQueryError` for other parsing-related issues (less common).

---

## `evaluate`

Evaluates a parsed GROQ query AST against a dataset and environment.

```typescript
declare function evaluate(
  node: ExprNode, // The AST node from parse()
  options?: EvaluateOptions
): Value // Internal representation, use toJS() to get plain JS

interface EvaluateOptions {
  /** The root value, accessible as `@` in the query. */
  root?: unknown

  /** The dataset, accessible as `*` in the query. Should be an array or iterable. */
  dataset?: unknown

  /** Parameters available via `$paramName`. */
  params?: Record<string, unknown>

  /** Timestamp for the `now()` function. @default Date */
  timestamp?: Date

  /** Value for the `identity()` function. @default null */
  identity?: string

  /** Document state *before* a change (for delta mode). */
  before?: unknown

  /** Document state *after* a change (for delta mode). */
  after?: unknown

  /** Configuration for Sanity-specific functions like `sanity::dataset()`. */
  sanity?: {
    projectId: string
    dataset: string
  }
}

// Internal representation of a GROQ value. Not meant for direct use.
type Value = any // Actual type is complex (includes iterators, DateTime, etc.)

// Error thrown for issues during query execution (e.g., type mismatch, unknown function)
interface GroqQueryError extends Error {
  name = 'GroqQueryError'
  // ... other properties potentially
}

```

- **Returns:** A `Value` object representing the result of the query. This is an internal format that may contain lazy iterators or custom classes (`DateTime`). Use [`toJS`](#tojs) to convert it to a standard JavaScript value.
- **Throws:** `GroqQueryError` if an error occurs during evaluation (e.g., calling a function with wrong argument types, accessing a field that doesn't exist on `null`).

---

## `toJS`

Converts the internal `Value` representation returned by `evaluate` into a plain JavaScript value.

```typescript
declare function toJS<T extends JSValue = JSValue>(value: Value): T

/** Plain JavaScript equivalent of a GROQ result */
type JSValue = string | number | boolean | null | JSValue[] | {[key: string]: JSValue} | string // GROQ DateTime is converted to an ISO 8601 string
```

- This function handles the conversion of internal structures:
  - Iterators are eagerly converted into Arrays.
  - `DateTime` instances are converted into ISO 8601 formatted strings.
  - Objects and primitives are returned as standard JavaScript equivalents.
- **Returns:** A standard JavaScript value (`string`, `number`, `boolean`, `null`, `Array`, or `Object`) corresponding to the query result.

---

## `typeEvaluate`

_(Beta)_ Evaluates the _static type_ of a query based on a schema, without running the query against actual data.

```typescript
declare function typeEvaluate(
  node: ExprNode, // The AST node from parse()
  schema: SchemaType, // Your dataset's schema definition
): TypeNode

// Represents the structure of your Sanity schema (or any compatible schema)
interface SchemaType {
  /* ... */
}

// Represents the inferred GROQ type (e.g., String, Number, Object, Array)
interface TypeNode {
  type: 'string' | 'number' | 'boolean' | 'null' | 'array' | 'object' | 'union' | 'unknown'
  // ... other properties depending on the type
}
```

- Useful for validating queries or providing type hints in editors.
- **Returns:** A `TypeNode` representing the inferred type of the query's result.
