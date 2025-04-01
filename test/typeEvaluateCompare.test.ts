import t, {type TAP} from 'tap'

import {namespaces} from '../src/evaluator/functions/namespaces'
import {type ExprNode, type OpCall, type Value} from '../src/nodeTypes'
import {type TypeNode} from '../src/typeEvaluator/types'
import {satisfies} from '../src/typeEvaluator/satisfies'
import {overrideTypeForNode, typeEvaluate} from '../src/typeEvaluator/typeEvaluate'
import {toJS, type JSValue} from '../src/values/utils'
import {evaluate} from '../src/evaluator/evaluate'
import {type GroqFunction} from '../src/types'

/**
 * The following tests uses the following strategy:
 *
 * First we built a list of "annotated values". These are values we a list of
 * possible types. For instance, for the value `1` we have the types `number`,
 * `1` and `unknown`.
 *
 * With a given annotated value and one of the types we can then build an
 * ExprNode:
 *
 * ```ts
 * {
 *   type: "OpCall",
 *   op: "+",
 *   left: {type: "Value", value: …},
 *   right: {type: "Value", value: …},
 * }
 * ```
 *
 * We then do two things (in "parallel"):
 *
 * 1. We run the regular evaulator. This will return a concrete value.
 * 2. We run the type evaluator, *but* we tweak the inner `Value`-nodes so that
 *    they are being inferred to one of the annotated type.
 *
 * Example: if the annotated values were `1` (with type: `number`) and `2` (with
 * type: `unknown`), then the evaluator will return 3. The type evaluator will
 * then be executed such that we test that `OpCall` with `number` and `unknown`
 * matches this.
 *
 * The nice thing here is that everything can be generated. From a small set of
 * annotated values we can build up arrays and objects and test for
 * combinations.
 *
 */

/**
 * A type with a description. Used so that your test cases gets nicer names.
 */
type DescribedType = {
  desc: string
  type: TypeNode
}

/**
 * A value annotated with possible types it satisfies.
 */
type AnnotatedValue = {
  /** The value. */
  value: Value
  /** A list of types which satifies this value. */
  types: DescribedType[]
  /** A unique key representing the value. Used for caching purposes. */
  key: string
}

type Test = Parameters<Parameters<TAP['test']>[0]>[0]

/**
 * List of primitive annotated values.
 */
const primitives: AnnotatedValue[] = [
  {
    key: 'null',
    value: null,
    types: [{desc: 'null', type: {type: 'null'}}],
  },
  {
    key: '1',
    value: 1,
    types: [
      {desc: 'number(1)', type: {type: 'number', value: 1}},
      {desc: 'number(undefined)', type: {type: 'number'}},
    ],
  },
  {
    key: 'hello',
    value: 'hello',
    types: [
      {desc: 'string(hello)', type: {type: 'string', value: 'hello'}},
      {desc: 'string(undefined)', type: {type: 'string'}},
    ],
  },
  {
    key: 'true',
    value: true,
    types: [
      {desc: 'boolean(true)', type: {type: 'boolean', value: true}},
      {desc: 'boolean(undefined)', type: {type: 'boolean'}},
    ],
  },
  {
    key: 'false',
    value: false,
    types: [
      {desc: 'boolean(false)', type: {type: 'boolean', value: false}},
      {desc: 'boolean(undefined)', type: {type: 'boolean'}},
    ],
  },
]

/**
 * Adds `type: "unknown"` into each annotated value.
 */
function withUnknown(input: AnnotatedValue[]): AnnotatedValue[] {
  return input.map(({key, value, types}) => ({
    key,
    value,
    types: types.concat({desc: 'unknown', type: {type: 'unknown'}}),
  }))
}

/**
 * Places each annotated value into an object with the given name.
 * E.g. if the value is `1` then the result value here is `{[name]: 1}`.
 */
function inObject(input: AnnotatedValue[], name: string): AnnotatedValue[] {
  return input.map(({key, value, types}) => ({
    key: `obj(${name}, ${key})`,
    value: {[name]: value},
    types: types.map(({desc, type}) => ({
      desc: `{${name}=${desc}}`,
      type: {
        type: 'object',
        attributes: {[name]: {type: 'objectAttribute', value: type}},
      },
    })),
  }))
}

/**
 * Places each annotated value into an array.
 * E.g. if the value is `1` then the result value here is `[1]`.
 */
function inArray(input: AnnotatedValue[]): AnnotatedValue[] {
  return input.map(({key, value, types}) => ({
    key: `arr(${key})`,
    value: [value],
    types: types.map(({desc, type}) => ({
      desc: `[${desc}]`,
      type: {
        type: 'array',
        of: type,
      },
    })),
  }))
}

/**
 * We have five different categories. This is mainly here so that we can exclude.
 */
type Category =
  | 'PRIMITIVES' /** primitives + unknown. */
  | 'OBJECT' /** A single object + unknown. */
  | 'ARRAY' /** A single array + unknown. */
  | 'OBJECTS' /** Objects of primitives + unknown. */
  | 'ARRAYS' /** Arrays of primitives + unknown. */
  | 'OBJECTS_IN_ARRAYS' /** Array of objects of primities. */
  | 'ARRAYS_IN_ARRAYS' /** Arrays of arrays. */

const num = primitives[1]

const primitivesWithUnknown = withUnknown(primitives)
const object = withUnknown(inObject([num], 'i0'))
const array = withUnknown(inArray([num]))
const objects0 = withUnknown(inObject(primitivesWithUnknown, 'i0'))
const objects1 = withUnknown(inObject(primitivesWithUnknown, 'i1'))
const arrays = withUnknown(inArray(primitivesWithUnknown))
const objects0InArrays = withUnknown(inArray(objects0))
const objects1InArrays = withUnknown(inArray(objects1))
const arraysInArrays = withUnknown(inArray(arrays).concat(inArray(objects0InArrays)))

// For the tests where we need _two_ annotated values we make sure that the
// object values actually have different keys. This tests a bit more stuff.

// Create a record structure to access categories by their string keys
const valuesForCategories: Record<0 | 1, Record<Category, AnnotatedValue[]>> = [
  {
    PRIMITIVES: primitivesWithUnknown,
    OBJECT: object,
    ARRAY: array,
    OBJECTS: objects0,
    ARRAYS: arrays,
    OBJECTS_IN_ARRAYS: objects0InArrays,
    ARRAYS_IN_ARRAYS: arraysInArrays,
  },
  {
    PRIMITIVES: primitivesWithUnknown,
    OBJECT: object,
    ARRAY: array,
    OBJECTS: objects1,
    ARRAYS: arrays,
    OBJECTS_IN_ARRAYS: objects1InArrays,
    ARRAYS_IN_ARRAYS: arraysInArrays,
  },
] as const

const SCHEMA: [] = []

const ALL_CATEGORIES: Category[] = [
  'PRIMITIVES',
  'OBJECT',
  'ARRAY',
  'OBJECTS',
  'ARRAYS',
  'OBJECTS_IN_ARRAYS',
  'ARRAYS_IN_ARRAYS',
]

const trivialVariant: Category[] = ['PRIMITIVES', 'OBJECT', 'ARRAY']

type CachedResult = {
  params: ExprNode[]
  node: ExprNode
  result: JSValue
}

type Cacher = (annotatedValues: AnnotatedValue[]) => CachedResult

/**
 * Builds a "cacher" which takes in an annotated value and caches as much as possible.
 * We use this to be able to speed up the tests since they often work on the same values.
 */
const buildCacher = (build: (params: ExprNode[]) => ExprNode): Cacher => {
  const cache: Record<string, CachedResult> = {}
  return (annotatedValues) => {
    const key = annotatedValues.map(({key}) => key).join(';')
    if (!(key in cache)) {
      const params = annotatedValues.map(({value}) => ({type: 'Value', value}) satisfies ExprNode)
      const node = build(params)
      cache[key] = {params, node, result: toJS(evaluate(node))}
    }
    return cache[key]
  }
}

/**
 * Generates subtests for a case where we need a single annotated value.
 */
function subtestUnary({
  t,
  build,
  variants = ALL_CATEGORIES,
}: {
  t: Test
  variants?: Category[]
  build: (param: ExprNode) => ExprNode
}) {
  const getCachedResult = buildCacher((params) => build(params[0]))
  let totalTests = 0

  for (const variant of variants) {
    for (const annotatedValue of valuesForCategories[0][variant]) {
      totalTests += annotatedValue.types.length
    }
  }

  t.plan(totalTests)

  for (const variant of variants) {
    for (const annotatedValue of valuesForCategories[0][variant]) {
      const cachedResult = getCachedResult([annotatedValue])
      for (const {desc, type} of annotatedValue.types) {
        overrideTypeForNode(cachedResult.params[0], type)
        const resultType = typeEvaluate(cachedResult.node, SCHEMA)
        const result = cachedResult.result
        t.ok(satisfies(resultType, result), `evaluation matches type: ${desc}`, {
          result,
          resultType,
        })
      }
    }
  }
}

/**
 * Generates subtests for a case where we need a two annotated values.
 */
function subtestBinary({
  t,
  build,
  variants1 = ALL_CATEGORIES,
  variants2 = ALL_CATEGORIES,
}: {
  t: Test
  variants1?: Category[]
  variants2?: Category[]
  build: (param1: ExprNode, param2: ExprNode) => ExprNode
}) {
  const getCachedResult = buildCacher((params) => build(params[0], params[1]))
  let totalTests = 0

  for (const variant1 of variants1) {
    for (const annotatedValue1 of valuesForCategories[0][variant1]) {
      for (const variant2 of variants2) {
        for (const annotatedValue2 of valuesForCategories[1][variant2]) {
          totalTests += annotatedValue1.types.length * annotatedValue2.types.length
        }
      }
    }
  }

  t.plan(totalTests)

  for (const variant1 of variants1) {
    for (const annotatedValue1 of valuesForCategories[0][variant1]) {
      for (const variant2 of variants2) {
        for (const annotatedValue2 of valuesForCategories[1][variant2]) {
          const cachedResult = getCachedResult([annotatedValue1, annotatedValue2])
          for (const {desc: desc1, type: type1} of annotatedValue1.types) {
            for (const {desc: desc2, type: type2} of annotatedValue2.types) {
              overrideTypeForNode(cachedResult.params[0], type1)
              overrideTypeForNode(cachedResult.params[1], type2)
              const evaluatedNodeType = typeEvaluate(cachedResult.node, SCHEMA)
              const expectedValue = cachedResult.result
              t.ok(
                satisfies(evaluatedNodeType, expectedValue),
                `evaluation should match type: ${desc1},${desc2}`,
                {
                  expectedValue,
                  evaluatedNodeType,
                },
              )
            }
          }
        }
      }
    }
  }
}

t.test('AccessAttribute found', (t) => {
  subtestUnary({
    t,
    build: (param) => ({type: 'AccessAttribute', base: param, name: 'i0'}),
  })
  t.end()
})

t.test('AccessAttribute missing', (t) => {
  subtestUnary({
    t,
    build: (param) => ({type: 'AccessAttribute', base: param, name: 'notFound'}),
  })
  t.end()
})

t.test('FlatMap base', (t) => {
  subtestUnary({
    t,
    build: (param) => ({type: 'FlatMap', base: param, expr: {type: 'This'}}),
  })
  t.end()
})

t.test('FlatMap expr', (t) => {
  subtestUnary({
    t,
    build: (param) => ({
      type: 'FlatMap',
      base: {
        type: 'Array',
        elements: [
          {
            type: 'ArrayElement',
            value: {type: 'Value', value: 1},
            isSplat: false,
          },
        ],
      },
      expr: param,
    }),
  })
  t.end()
})

t.test('Map', (t) => {
  subtestUnary({
    t,
    build: (param) => ({type: 'Map', base: param, expr: {type: 'This'}}),
  })
  t.end()
})

t.test('Projection base', (t) => {
  subtestUnary({
    t,
    build: (param) => ({type: 'Projection', base: param, expr: {type: 'This'}}),
  })
  t.end()
})

t.test('Projection expr', (t) => {
  subtestUnary({
    t,
    build: (param) => ({type: 'Projection', base: {type: 'Object', attributes: []}, expr: param}),
  })
  t.end()
})

t.test('AccessElement', (t) => {
  subtestUnary({
    t,
    build: (param) => ({type: 'AccessElement', base: param, index: 0}),
  })
  t.end()
})

t.test('Slice', (t) => {
  subtestUnary({
    t,
    build: (param) => ({type: 'Slice', base: param, left: 0, right: 0, isInclusive: true}),
  })
  t.end()
})

t.test(`And`, (t) => {
  subtestBinary({
    t,
    variants1: trivialVariant,
    variants2: trivialVariant,
    build: (left, right) => ({type: 'And', left, right}),
  })
  t.end()
})

t.test(`Or`, (t) => {
  subtestBinary({
    t,
    variants1: trivialVariant,
    variants2: trivialVariant,
    build: (left, right) => ({type: 'Or', left, right}),
  })
  t.end()
})

// It's too much to test _every_ possible combination of binary operations. For
// each operator we therefore keep track of which variants are interesting to
// test for. We already know that many operations don't care about deeply nested
// objects/arrays so we avoid testing for those.

const opVariants: Record<OpCall, Category[]> = {
  // + is very polymorphic so we want to test it for everything.
  '+': ALL_CATEGORIES,
  '%': trivialVariant,
  '*': trivialVariant,
  '==': trivialVariant,
  '!=': trivialVariant,
  '>': trivialVariant,
  '<': trivialVariant,
  '<=': trivialVariant,
  '>=': trivialVariant,
  '-': trivialVariant,
  '/': trivialVariant,
  '**': trivialVariant,
  'in': ['PRIMITIVES', 'ARRAYS'],
  'match': ['PRIMITIVES', 'ARRAYS'],
}

const ops = Object.keys({
  '!=': null,
  '==': null,
  '>': null,
  '>=': null,
  '<': null,
  '<=': null,
  '-': null,
  '%': null,
  '**': null,
  'in': null,
  'match': null,
  '*': null,
  '+': null,
  '/': null,
} satisfies Record<OpCall, null>) as OpCall[]

for (const op of ops) {
  t.test(`OpCall ${op}`, (t) => {
    subtestBinary({
      t,
      variants1: opVariants[op],
      variants2: opVariants[op],
      build: (left, right) => ({type: 'OpCall', op, left, right}),
    })
    t.end()
  })
}

const unaryFunctionTests: {namespace: string; funcName: string}[] = [
  {namespace: 'math', funcName: 'sum'},
  {namespace: 'math', funcName: 'min'},
  {namespace: 'math', funcName: 'max'},
  {namespace: 'math', funcName: 'avg'},
  {namespace: 'array', funcName: 'compact'},
  {namespace: 'array', funcName: 'unique'},
  {namespace: 'global', funcName: 'dateTime'},
  {namespace: 'global', funcName: 'length'},
]

for (const {namespace, funcName} of unaryFunctionTests) {
  t.test(`${namespace}::${funcName}`, (t) => {
    subtestUnary({
      t,
      build: (param) => ({
        type: 'FuncCall',
        name: funcName,
        namespace,
        args: [param],
        func: namespaces[namespace]![funcName] as GroqFunction,
      }),
    })
    t.end()
  })
}

const binaryFunctionTests: {namespace: string; funcName: string}[] = [
  {namespace: 'array', funcName: 'join'},
  {namespace: 'global', funcName: 'round'},
  {namespace: 'global', funcName: 'upper'},
  {namespace: 'global', funcName: 'lower'},
]

for (const {namespace, funcName} of binaryFunctionTests) {
  t.test(`${namespace}::${funcName}`, (t) => {
    subtestBinary({
      t,
      build: (param1, param2) => ({
        type: 'FuncCall',
        name: funcName,
        namespace,
        args: [param1, param2],
        func: namespaces[namespace]![funcName] as GroqFunction,
      }),
    })
    t.end()
  })
}
