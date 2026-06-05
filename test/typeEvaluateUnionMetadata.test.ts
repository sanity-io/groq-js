import t from 'tap'

import {parse} from '../src/parser'
import {optimizeUnions, removeDuplicateTypeNodes} from '../src/typeEvaluator/optimizations'
import {Scope} from '../src/typeEvaluator/scope'
import {typeEvaluate} from '../src/typeEvaluator/typeEvaluate'
import {
  createReferenceTypeNode,
  mapNode,
  nullUnion,
  unionOf,
} from '../src/typeEvaluator/typeHelpers'
import type {
  Document,
  InlineTypeNode,
  ObjectTypeNode,
  Schema,
  TypeNode,
  UnionTypeNode,
} from '../src/typeEvaluator/types'

const productPromotion = {
  type: 'object',
  attributes: {
    _type: {
      type: 'objectAttribute',
      value: {type: 'string', value: 'productPromotion'},
    },
  },
} satisfies ObjectTypeNode

const articlePromotion = {
  type: 'object',
  attributes: {
    _type: {
      type: 'objectAttribute',
      value: {type: 'string', value: 'articlePromotion'},
    },
  },
} satisfies ObjectTypeNode

const callout = {
  type: 'object',
  attributes: {
    _type: {
      type: 'objectAttribute',
      value: {type: 'string', value: 'callout'},
    },
  },
} satisfies ObjectTypeNode

const referenceDeclaredTo = [{type: 'inline', name: 'documentTarget'}] satisfies InlineTypeNode[]
const editorialTargetDeclaredTo = [
  {type: 'inline', name: 'editorialTarget'},
] satisfies InlineTypeNode[]

function namedPromotionUnion(): UnionTypeNode {
  return {
    type: 'union',
    name: 'promotion',
    of: [productPromotion, articlePromotion],
    declaredOf: [
      {type: 'inline', name: 'productPromotion'},
      {type: 'inline', name: 'articlePromotion'},
    ],
  }
}

t.test('optimizeUnions keeps a single-member union when it carries metadata', (t) => {
  const union = {
    type: 'union',
    name: 'promotion',
    of: [productPromotion],
    declaredOf: [{type: 'inline', name: 'productPromotion'}],
  } satisfies UnionTypeNode

  t.strictSame(optimizeUnions(union), union)
  t.end()
})

t.test(
  'optimizeUnions flattens nested effective members and preserves declared provenance',
  (t) => {
    const result = optimizeUnions({
      type: 'union',
      of: [namedPromotionUnion(), callout],
    } satisfies UnionTypeNode)

    t.strictSame(result, {
      type: 'union',
      of: [articlePromotion, callout, productPromotion],
      declaredOf: [{type: 'inline', name: 'promotion'}, callout],
    })
    t.end()
  },
)

t.test('optimizeUnions dedupes by structure while keeping useful union metadata', (t) => {
  const result = removeDuplicateTypeNodes([
    {type: 'union', of: [productPromotion, articlePromotion]},
    namedPromotionUnion(),
  ])

  t.strictSame(result, [namedPromotionUnion()])
  t.end()
})

t.test('optimizeUnions dedupes references by structure while keeping declaredTo metadata', (t) => {
  const declaredReference = {
    ...createReferenceTypeNode('post'),
    declaredTo: referenceDeclaredTo,
  } satisfies ObjectTypeNode

  const result = removeDuplicateTypeNodes([createReferenceTypeNode('post'), declaredReference])

  t.strictSame(result, [declaredReference])
  t.end()
})

t.test(
  'optimizeUnions dedupes union references by structure while keeping declaredTo metadata',
  (t) => {
    const declaredReference = sanityExtractedUnionReference()
    const result = removeDuplicateTypeNodes([
      {
        type: 'union',
        of: [
          {type: 'inline', name: 'book.reference'},
          {type: 'inline', name: 'author.reference'},
        ],
      },
      declaredReference,
    ])

    t.strictSame(result, [declaredReference])
    t.end()
  },
)

t.test('nullUnion preserves a named union as declared provenance', (t) => {
  const result = nullUnion(namedPromotionUnion())

  t.strictSame(result, {
    type: 'union',
    of: [productPromotion, articlePromotion, {type: 'null'}],
    declaredOf: [{type: 'inline', name: 'promotion'}, {type: 'null'}],
  } satisfies TypeNode)
  t.end()
})

t.test('nullUnion preserves inline reference declaredTo metadata', (t) => {
  const reference = {
    type: 'inline',
    name: 'book.reference',
    declaredTo: editorialTargetDeclaredTo,
  } satisfies InlineTypeNode

  t.strictSame(nullUnion(reference), {
    type: 'union',
    of: [reference, {type: 'null'}],
    declaredTo: editorialTargetDeclaredTo,
  } satisfies TypeNode)
  t.end()
})

t.test('unionOf accepts metadata for schema-originated unions', (t) => {
  const result = unionOf([productPromotion, articlePromotion], {
    name: 'promotion',
    declaredOf: [
      {type: 'inline', name: 'productPromotion'},
      {type: 'inline', name: 'articlePromotion'},
    ],
  })

  t.strictSame(result, namedPromotionUnion())
  t.end()
})

t.test('mapNode preserves source union provenance on mapped unions', (t) => {
  const result = mapNode(namedPromotionUnion(), new Scope([]), (node) => node)

  t.strictSame(result, {
    type: 'union',
    of: [articlePromotion, productPromotion],
    declaredOf: [{type: 'inline', name: 'promotion'}],
  })
  t.end()
})

t.test('deref resolves declaredTo named document unions', (t) => {
  const post = documentWithType('post')
  const author = documentWithType('author')
  const schema = [
    {
      type: 'document',
      name: 'source',
      attributes: {
        _type: {
          type: 'objectAttribute',
          value: {
            type: 'string',
            value: 'source',
          },
        },
        target: {
          type: 'objectAttribute',
          value: createReferenceTypeNode('post', false, referenceDeclaredTo),
        },
      },
    },
    {
      type: 'type',
      name: 'documentTarget',
      value: unionOf(createReferenceTypeNode('post'), createReferenceTypeNode('author')),
    },
    post,
    author,
  ] satisfies Schema

  const result = typeEvaluate(parse('*[_type == "source"] { target-> { _type } }'), schema)

  t.strictSame(result, {
    type: 'array',
    of: {
      type: 'object',
      attributes: {
        target: {
          type: 'objectAttribute',
          value: {
            type: 'union',
            of: [documentObject(author), documentObject(post)],
            declaredOf: referenceDeclaredTo,
          },
        },
      },
    },
  } satisfies TypeNode)
  t.end()
})

t.test('deref resolves Sanity-extracted union references with declaredTo', (t) => {
  const book = documentWithType('book')
  const author = documentWithType('author')
  const schema = [
    {
      type: 'document',
      name: 'source',
      attributes: {
        _type: {
          type: 'objectAttribute',
          value: {
            type: 'string',
            value: 'source',
          },
        },
        target: {
          type: 'objectAttribute',
          value: sanityExtractedUnionReference(),
        },
      },
    },
    {
      type: 'type',
      name: 'editorialTarget',
      value: unionOf([documentObject(book), documentObject(author)], {
        name: 'editorialTarget',
      }),
    },
    {
      type: 'type',
      name: 'book.reference',
      value: createReferenceTypeNode('book'),
    },
    {
      type: 'type',
      name: 'author.reference',
      value: createReferenceTypeNode('author'),
    },
    book,
    author,
  ] satisfies Schema

  const result = typeEvaluate(parse('*[_type == "source"] { target-> { _type } }'), schema)

  t.strictSame(result, {
    type: 'array',
    of: {
      type: 'object',
      attributes: {
        target: {
          type: 'objectAttribute',
          value: {
            type: 'union',
            of: [documentObject(author), documentObject(book)],
            declaredOf: editorialTargetDeclaredTo,
          },
        },
      },
    },
  } satisfies TypeNode)
  t.end()
})

t.test(
  'deref preserves null branch for optional Sanity-extracted union references with declaredTo',
  (t) => {
    const book = documentWithType('book')
    const author = documentWithType('author')
    const schema = [
      {
        type: 'document',
        name: 'source',
        attributes: {
          _type: {
            type: 'objectAttribute',
            value: {
              type: 'string',
              value: 'source',
            },
          },
          target: {
            type: 'objectAttribute',
            value: sanityExtractedUnionReference({optional: true}),
          },
        },
      },
      {
        type: 'type',
        name: 'editorialTarget',
        value: unionOf([documentObject(book), documentObject(author)], {
          name: 'editorialTarget',
        }),
      },
      {
        type: 'type',
        name: 'book.reference',
        value: createReferenceTypeNode('book'),
      },
      {
        type: 'type',
        name: 'author.reference',
        value: createReferenceTypeNode('author'),
      },
      book,
      author,
    ] satisfies Schema

    const result = typeEvaluate(parse('*[_type == "source"] { target-> { _type } }'), schema)

    t.strictSame(result, {
      type: 'array',
      of: {
        type: 'object',
        attributes: {
          target: {
            type: 'objectAttribute',
            value: {
              type: 'union',
              of: [documentObject(author), documentObject(book), {type: 'null'}],
              declaredOf: editorialTargetDeclaredTo,
            },
          },
        },
      },
    } satisfies TypeNode)
    t.end()
  },
)

t.test('deref preserves declaredTo for optional Sanity-extracted single references', (t) => {
  const book = documentWithType('book')
  const schema = [
    {
      type: 'document',
      name: 'source',
      attributes: {
        _type: {
          type: 'objectAttribute',
          value: {
            type: 'string',
            value: 'source',
          },
        },
        target: {
          type: 'objectAttribute',
          value: sanityExtractedSingleReference({optional: true}),
        },
      },
    },
    {
      type: 'type',
      name: 'editorialTarget',
      value: unionOf([documentObject(book)], {
        name: 'editorialTarget',
      }),
    },
    {
      type: 'type',
      name: 'book.reference',
      value: createReferenceTypeNode('book'),
    },
    book,
  ] satisfies Schema

  const result = typeEvaluate(parse('*[_type == "source"] { target-> { _type } }'), schema)

  t.strictSame(result, {
    type: 'array',
    of: {
      type: 'object',
      attributes: {
        target: {
          type: 'objectAttribute',
          value: {
            type: 'union',
            of: [documentObject(book), {type: 'null'}],
            declaredOf: editorialTargetDeclaredTo,
          },
        },
      },
    },
  } satisfies TypeNode)
  t.end()
})

function documentWithType(name: string): Document {
  return {
    type: 'document',
    name,
    attributes: {
      _type: {
        type: 'objectAttribute',
        value: {
          type: 'string',
          value: name,
        },
      },
    },
  }
}

function documentObject(document: Document): ObjectTypeNode {
  return {
    type: 'object',
    attributes: document.attributes,
  }
}

function sanityExtractedUnionReference(options: {optional?: boolean} = {}): UnionTypeNode {
  const of: TypeNode[] = [
    {type: 'inline', name: 'book.reference'},
    {type: 'inline', name: 'author.reference'},
  ]

  if (options.optional) {
    of.push({type: 'null'})
  }

  return {
    type: 'union',
    declaredTo: editorialTargetDeclaredTo,
    of,
  } satisfies UnionTypeNode
}

function sanityExtractedSingleReference(options: {optional?: boolean} = {}): TypeNode {
  const reference = {
    type: 'inline',
    name: 'book.reference',
    declaredTo: editorialTargetDeclaredTo,
  } satisfies InlineTypeNode

  return options.optional ? {type: 'union', of: [reference, {type: 'null'}]} : reference
}
