import t from 'tap'

import {optimizeUnions} from '../src/typeEvaluator/optimizations'
import {
  arrayOf,
  objectAttribute,
  objectWith,
  objectWithRest,
  unionOf,
} from '../src/typeEvaluator/typeHelpers'
import type {TypeNode, UnionTypeNode} from '../src/typeEvaluator/types'

const unionVariants: Array<{
  name: string
  typeNode: UnionTypeNode
  noop?: boolean
  expected?: TypeNode
}> = [
  {
    name: 'empty union',
    typeNode: unionOf(),
    expected: unionOf(),
  },
  {
    name: 'flatten unions',
    typeNode: unionOf({type: 'number'}, unionOf(unionOf(unionOf({type: 'string'})))),
    expected: unionOf({type: 'number'}, {type: 'string'}),
  },
  {
    name: 'sorts unions',
    typeNode: unionOf({type: 'string'}, {type: 'array', of: {type: 'number'}}),
    expected: unionOf({type: 'array', of: {type: 'number'}}, {type: 'string'}),
  },
  {
    name: 'removes duplicates',
    typeNode: unionOf(
      {type: 'number'},
      {type: 'null'},
      {type: 'string'},
      {type: 'string'},
      {type: 'string', value: 'foo'},
      {type: 'string', value: 'foo'},
    ),
    expected: unionOf(
      {type: 'number'},
      {type: 'null'},
      {type: 'string'},
      {type: 'string', value: 'foo'},
    ),
  },
  {
    name: 'removes single union',
    typeNode: unionOf({type: 'number'}, {type: 'number'}),
    expected: {type: 'number'},
  },
  {
    name: 'hoists attributes',
    typeNode: unionOf(
      objectWithRest(
        {
          type: 'inline',
          name: 'foo',
        },
        objectAttribute('_key', {type: 'string'}),
      ),
      objectWithRest(
        {
          type: 'inline',
          name: 'bar',
        },
        objectAttribute('_key', {type: 'string'}),
      ),
    ),
  },
  {
    name: 'no optimization needed',
    noop: true,
    typeNode: unionOf(
      objectWithRest(
        {
          type: 'inline',
          name: 'foo',
        },
        objectAttribute('foo', {type: 'string'}),
      ),
      objectWithRest(
        {
          type: 'inline',
          name: 'bar',
        },
        objectAttribute('bar', {type: 'string'}),
      ),
    ),
  },
]

for (const {name, typeNode, noop, expected} of unionVariants) {
  t.test(`optimizeUnions: ${name}`, (t) => {
    const optimized = optimizeUnions(typeNode)
    t.matchSnapshot(optimized)
    if (noop) {
      t.strictSame(optimized, typeNode)
    }
    if (expected) {
      t.strictSame(optimized, expected)
    }

    t.test(`wrapped in array`, (t) => {
      const optimized = optimizeUnions(arrayOf(typeNode))
      t.matchSnapshot(optimized)
      if (noop) {
        t.strictSame(optimized, arrayOf(typeNode))
      }
      if (expected) {
        t.strictSame(optimized, arrayOf(expected))
      }
      t.end()
    })

    t.test(`wrapped inside an object`, (t) => {
      const original = objectWith(
        objectAttribute('foo', typeNode),
        objectAttribute('bar', typeNode),
      )
      const optimized = optimizeUnions(original)
      t.matchSnapshot(optimized)
      if (noop) {
        t.strictSame(optimized, original)
      }
      if (expected) {
        t.strictSame(
          optimized,
          objectWith(objectAttribute('foo', expected), objectAttribute('bar', expected)),
        )
      }
      t.end()
    })

    t.end()
  })
}
