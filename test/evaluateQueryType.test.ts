import t from 'tap'

import {evaluateQueryType} from '../src/typeEvaluator/evaluateQueryType'
import {
  ArrayTypeNode,
  NeverTypeNode,
  ObjectTypeNode,
  OptionalTypeNode,
  ReferenceTypeNode,
  Schema,
  TypeNode,
  UnionTypeNode,
} from '../src/typeEvaluator/types'

const schemas = [
  {
    type: 'document',
    name: 'post',
    fields: [
      {
        type: 'objectKeyValue',
        key: '_id',
        value: {
          type: 'string',
        },
      },
      {
        type: 'objectKeyValue',
        key: '_type',
        value: {
          type: 'string',
          value: 'post',
        },
      },
      {
        type: 'objectKeyValue',
        key: 'name',
        value: {
          type: 'string',
        },
      },
      {
        type: 'objectKeyValue',
        key: 'lastname',
        value: {
          type: 'optional',
          value: {
            type: 'string',
          },
        },
      },
      {
        type: 'objectKeyValue',
        key: 'author',
        value: {
          type: 'reference',
          to: 'author',
        },
      },
      {
        type: 'objectKeyValue',
        key: 'sluger',
        value: {
          type: 'optional',
          value: {
            type: 'reference',
            to: 'slug',
          },
        },
      },
      {
        type: 'objectKeyValue',
        key: 'authorOrGhost',
        value: {
          type: 'optional',
          value: {
            type: 'union',
            of: [
              {
                type: 'reference',
                to: 'author',
              },
              {
                type: 'reference',
                to: 'ghost',
              },
            ],
          },
        },
      },
      {
        type: 'objectKeyValue',
        key: 'allAuthorOrGhost',
        value: {
          type: 'optional',
          value: {
            type: 'array',
            of: {
              type: 'union',
              of: [
                {
                  type: 'reference',
                  to: 'author',
                },
                {
                  type: 'reference',
                  to: 'ghost',
                },
              ],
            },
          },
        },
      },
    ],
  },
  {
    type: 'document',
    name: 'author',
    fields: [
      {
        type: 'objectKeyValue',
        key: '_id',
        value: {
          type: 'string',
        },
      },
      {
        type: 'objectKeyValue',
        key: '_type',
        value: {
          type: 'string',
          value: 'author',
        },
      },
      {
        type: 'objectKeyValue',
        key: 'name',
        value: {
          type: 'string',
        },
      },
      {
        type: 'objectKeyValue',
        key: 'firstname',
        value: {
          type: 'string',
        },
      },
      {
        type: 'objectKeyValue',
        key: 'lastname',
        value: {
          type: 'string',
        },
      },
      {
        type: 'objectKeyValue',
        key: 'object',
        value: {
          type: 'object',
          fields: [
            {
              key: 'subfield',
              type: 'objectKeyValue',
              value: {
                type: 'string',
              },
            },
          ],
        },
      },
      {
        type: 'objectKeyValue',
        key: 'optionalObject',
        value: {
          type: 'optional',
          value: {
            type: 'object',
            fields: [
              {
                key: 'subfield',
                type: 'objectKeyValue',
                value: {
                  type: 'string',
                },
              },
            ],
          },
        },
      },
    ],
  },
  {
    type: 'document',
    name: 'ghost',
    fields: [
      {
        type: 'objectKeyValue',
        key: '_id',
        value: {
          type: 'string',
        },
      },
      {
        type: 'objectKeyValue',
        key: '_type',
        value: {
          type: 'string',
          value: 'ghost',
        },
      },
      {
        type: 'objectKeyValue',
        key: 'name',
        value: {
          type: 'string',
        },
      },
      {
        type: 'objectKeyValue',
        key: 'concepts',
        value: {
          type: 'array',
          of: {
            type: 'reference',
            to: 'concept',
          },
        },
      },
    ],
  },
  {
    type: 'document',
    name: 'namespace.one',
    fields: [
      {
        type: 'objectKeyValue',
        key: '_type',
        value: {
          type: 'string',
          value: 'namespace.one',
        },
      },
      {
        type: 'objectKeyValue',
        key: 'name',
        value: {
          type: 'string',
        },
      },
      {
        type: 'objectKeyValue',
        key: 'boolField',
        value: {
          type: 'boolean',
        },
      },
    ],
  },
  {
    type: 'document',
    name: 'namespace.two',
    fields: [
      {
        type: 'objectKeyValue',
        key: '_type',
        value: {
          type: 'string',
          value: 'namespace.two',
        },
      },
      {
        type: 'objectKeyValue',
        key: 'name',
        value: {
          type: 'string',
        },
      },
    ],
  },
  {
    type: 'type',
    name: 'concept',
    value: {
      type: 'object',
      fields: [
        {
          key: 'name',
          type: 'objectKeyValue',
          value: {
            type: 'string',
          },
        },
        {
          key: 'enabled',
          type: 'objectKeyValue',
          value: {
            type: 'boolean',
          },
        },
        {
          key: 'posts',
          type: 'objectKeyValue',
          value: {
            type: 'array',
            of: {
              type: 'reference',
              to: 'post',
            },
          },
        },
      ],
    },
  },
  {
    name: 'slug',
    type: 'type',
    value: {
      type: 'object',
      fields: [
        {
          type: 'objectKeyValue',
          key: 'current',
          value: {
            type: 'optional',
            value: {
              type: 'string',
            },
          },
        },
        {
          type: 'objectKeyValue',
          key: 'source',
          value: {
            type: 'optional',
            value: {
              type: 'string',
            },
          },
        },
        {
          type: 'objectKeyValue',
          key: '_type',
          value: {
            type: 'string',
            value: 'slug',
          },
        },
        {
          type: 'objectKeyValue',
          key: '_key',
          value: {
            type: 'optional',
            value: {
              type: 'string',
            },
          },
        },
      ],
    },
  },
] satisfies Schema

t.test('no projection', (t) => {
  const query = `*[_type == "author" && _id == "123"]`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'array',
    of: {
      type: 'reference',
      to: 'author',
      resolved: true,
    },
  })
  t.end()
})
t.test('pipe func call', (t) => {
  const query = `*[_type == "author" && defined(slug.current)] | order(_createdAt desc)`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'array',
    of: {
      type: 'reference',
      to: 'author',
      resolved: true,
    },
  })
  t.end()
})

t.test('element access', (t) => {
  const query = `*[_type == "author"][0]`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'optional',
    value: {
      type: 'reference',
      to: 'author',
      resolved: true,
    },
  })
  t.end()
})

t.test('access attribute with objects', (t) => {
  const query = `*[_type == "author" && object.subfield == "foo"][0]`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'optional',
    value: {
      type: 'reference',
      to: 'author',
      resolved: true,
    },
  })
  t.end()
})

t.test('access attribute with derefences', (t) => {
  const query = `*[authorOrGhost->name == "foo"][0]`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'optional',
    value: {
      type: 'reference',
      to: 'post',
      resolved: true,
    },
  })
  t.end()
})

t.test('parameters', (t) => {
  const query = `*[_type == "author" && _id == $id]`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    of: {
      to: 'author',
      type: 'reference',
      resolved: true,
    },
    type: 'array',
  } satisfies ArrayTypeNode<ReferenceTypeNode>)

  t.end()
})

t.test('filtering on sub-child', (t) => {
  const query = `*[_type == "author" && object.subfield == $slug]`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    of: {
      to: 'author',
      type: 'reference',
      resolved: true,
    },
    type: 'array',
  } satisfies ArrayTypeNode<ReferenceTypeNode>)

  t.end()
})

t.test('in operator', (t) => {
  const query = `*[_type in ["author", "post"]]`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'array',
    of: {
      type: 'union',
      of: [
        {
          type: 'reference',
          to: 'post',
          resolved: true,
        },
        {
          type: 'reference',
          to: 'author',
          resolved: true,
        },
      ],
    },
  } satisfies ArrayTypeNode<UnionTypeNode<ReferenceTypeNode>>)

  t.end()
})

t.test('match operator', (t) => {
  const query = `*[_type match "namespace.**"  &&  !(_id in path("drafts.**"))]`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'array',
    of: {
      type: 'union',
      of: [
        {
          type: 'reference',
          to: 'namespace.one',
          resolved: true,
        },
        {
          type: 'reference',
          to: 'namespace.two',
          resolved: true,
        },
      ],
    },
  } satisfies ArrayTypeNode<UnionTypeNode<ReferenceTypeNode>>)

  t.end()
})

t.test('subfilter matches', (t) => {
  const query = `*[_type match "namespace.**"][boolField == true]`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'array',
    of: {
      type: 'reference',
      to: 'namespace.one',
      resolved: true,
    },
  } satisfies ArrayTypeNode<ReferenceTypeNode>)

  t.end()
})

t.test('subfilter doesnt match', (t) => {
  const query = `*[_type == "namespace.two"][boolField == true]`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'array',
    of: {
      type: 'never',
    },
  } satisfies ArrayTypeNode<NeverTypeNode>)

  t.end()
})

t.test('subfilter with projection', (t) => {
  const query = `*[_type == "namespace.one"] {name, _type} [_type == "namespace.one"]`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'array',
    of: {
      type: 'object',
      fields: [
        {
          key: 'name',
          type: 'objectKeyValue',
          value: {
            type: 'string',
          },
        },
        {
          key: '_type',
          type: 'objectKeyValue',
          value: {
            type: 'string',
            value: 'namespace.one',
          },
        },
      ],
    },
  } satisfies ArrayTypeNode<ObjectTypeNode>)

  t.end()
})

t.test('attribute access', (t) => {
  const query = `*[_type == "author"][].object.subfield`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'array',
    of: {
      type: 'string',
    },
  })

  t.end()
})

t.test('coerce reference', (t) => {
  const query = `*[_type == "post" && defined(author.name)][].author`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'array',
    of: {
      type: 'reference',
      to: 'author',
    },
  })

  t.end()
})

t.test('object references', (t) => {
  const query = `*[_type == "ghost"]{
      ...,
      "enabledConcepts": concepts[enabled == true] {
        name,
      },
      "disabledConcepts": concepts[enabled == false],
    }`
  const res = evaluateQueryType(query, schemas)
  t.matchSnapshot(res)
  t.end()
})

t.test('never', (t) => {
  const query = `*[1 == 1 && 1 == 2]{
        name,
      }`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'array',
    of: {
      type: 'never',
    },
  } satisfies ArrayTypeNode<NeverTypeNode>)

  t.end()
})

t.test('simple', (t) => {
  const query = `*[_type == "post"]{
            name,
          }`
  const res = evaluateQueryType(query, schemas)

  t.strictSame(res, {
    type: 'array',
    of: {
      type: 'object',
      fields: [
        {
          key: 'name',
          type: 'objectKeyValue',
          value: {
            type: 'string',
          },
        },
      ],
    },
  })

  t.end()
})

t.test('values in projection', (t) => {
  const query = `*[_type == "author"]{
            "isAuthor": _type == "author",
            "greaterThan": 5 > 3,
            "lessThan": 5 < 3,
            "greaterThanOrEq": 10 >= 3,
            "lessThanOrEq": 5 <= 5,
            "notEqual": 3 != "foo",
            "notEqualObject": 3 != {},
            "plus": 3 + 2,
            "plusStr": "3" + "2",
            "plusVar": 3 + field,
            "minus": 3 - 2,
            "mul": 3 * 3,
            "div": 100 / 5,
            "exp": 3 ** 3,
            "mod": 3 % 2,
            "arr": [1, 2, 3] + [4, 5, 6],
            "and": 3 > foo && 3 > bar,
            "or": 3 > foo || 3 > bar,
          }`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'array',
    of: {
      type: 'object',
      fields: [
        {
          type: 'objectKeyValue',
          key: 'isAuthor',
          value: {
            type: 'boolean',
            value: true,
          },
        },
        {
          type: 'objectKeyValue',
          key: 'greaterThan',
          value: {
            type: 'boolean',
            value: true,
          },
        },
        {
          type: 'objectKeyValue',
          key: 'lessThan',
          value: {
            type: 'boolean',
            value: false,
          },
        },
        {
          type: 'objectKeyValue',
          key: 'greaterThanOrEq',
          value: {
            type: 'boolean',
            value: true,
          },
        },
        {
          type: 'objectKeyValue',
          key: 'lessThanOrEq',
          value: {
            type: 'boolean',
            value: true,
          },
        },
        {
          type: 'objectKeyValue',
          key: 'notEqual',
          value: {
            type: 'boolean',
            value: true,
          },
        },
        {
          type: 'objectKeyValue',
          key: 'notEqualObject',
          value: {
            type: 'boolean',
            value: true,
          },
        },
        {
          type: 'objectKeyValue',
          key: 'plus',
          value: {
            type: 'number',
            value: 5,
          },
        },
        {
          type: 'objectKeyValue',
          key: 'plusStr',
          value: {
            type: 'string',
            value: '32',
          },
        },
        {
          type: 'objectKeyValue',
          key: 'plusVar',
          value: {
            type: 'number',
          },
        },
        {
          type: 'objectKeyValue',
          key: 'minus',
          value: {
            type: 'number',
            value: 1,
          },
        },
        {
          type: 'objectKeyValue',
          key: 'mul',
          value: {
            type: 'number',
            value: 9,
          },
        },
        {
          type: 'objectKeyValue',
          key: 'div',
          value: {
            type: 'number',
            value: 20,
          },
        },
        {
          type: 'objectKeyValue',
          key: 'exp',
          value: {
            type: 'number',
            value: 27,
          },
        },
        {
          type: 'objectKeyValue',
          key: 'mod',
          value: {
            type: 'number',
            value: 1,
          },
        },
        {
          type: 'objectKeyValue',
          key: 'arr',
          value: {
            type: 'array',
            of: {
              type: 'union',
              of: [
                {
                  type: 'number',
                  value: 1,
                },
                {
                  type: 'number',
                  value: 2,
                },
                {
                  type: 'number',
                  value: 3,
                },
                {
                  type: 'number',
                  value: 4,
                },
                {
                  type: 'number',
                  value: 5,
                },
                {
                  type: 'number',
                  value: 6,
                },
              ],
            },
          },
        },
        {
          type: 'objectKeyValue',
          key: 'and',
          value: {
            type: 'boolean',
            value: undefined,
          },
        },
        {
          type: 'objectKeyValue',
          key: 'or',
          value: {
            type: 'boolean',
            value: undefined,
          },
        },
      ],
    },
  } satisfies ArrayTypeNode<ObjectTypeNode>)

  t.end()
})

t.test('deref', (t) => {
  const query = `*[_type == "post"]{
            name,
            author->
          }`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'array',
    of: {
      type: 'object',
      fields: [
        {
          type: 'objectKeyValue',
          key: 'name',
          value: {
            type: 'string',
          },
        },
        {
          type: 'objectKeyValue',
          key: 'author',
          value: {
            type: 'reference',
            to: 'author',
            resolved: true,
          },
        },
      ],
    },
  })

  t.end()
})

t.test('deref with projection union', (t) => {
  const query = `*[_type == "post"]{
            ...,
            name,
            authorOrGhost->,
            "authorName": author->name,
            "authorOrGhostName": authorOrGhost->name,
            "authorOrGhostProjected": authorOrGhost->{name, _type},
            "resolvedAllAuthorOrGhost": allAuthorOrGhost->,
          }`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'array',
    of: {
      type: 'object',
      fields: [
        {
          type: 'objectKeyValue',
          key: '_id',
          value: {
            type: 'string',
          },
        },
        {
          type: 'objectKeyValue',
          key: '_type',
          value: {
            type: 'string',
            value: 'post',
          },
        },
        {
          type: 'objectKeyValue',
          key: 'name',
          value: {
            type: 'string',
          },
        },
        {
          type: 'objectKeyValue',
          key: 'lastname',
          value: optional({
            type: 'string',
          }),
        },
        {
          type: 'objectKeyValue',
          key: 'author',
          value: {
            type: 'reference',
            to: 'author',
          },
        },
        {
          type: 'objectKeyValue',
          key: 'sluger',
          value: optional({
            type: 'reference',
            to: 'slug',
          }),
        },
        {
          type: 'objectKeyValue',
          key: 'authorOrGhost',
          value: {
            type: 'optional',
            value: {
              type: 'union',
              of: [
                {
                  type: 'reference',
                  to: 'author',
                  resolved: true,
                },
                {
                  type: 'reference',
                  to: 'ghost',
                  resolved: true,
                },
              ],
            },
          },
        },
        {
          type: 'objectKeyValue',
          key: 'allAuthorOrGhost',
          value: optional({
            type: 'array',
            of: {
              type: 'union',
              of: [
                {
                  type: 'reference',
                  to: 'author',
                },
                {
                  type: 'reference',
                  to: 'ghost',
                },
              ],
            },
          }),
        },
        {
          type: 'objectKeyValue',
          key: 'authorName',
          value: {
            type: 'string',
          },
        },
        {
          type: 'objectKeyValue',
          key: 'authorOrGhostName',
          value: {
            type: 'optional',
            value: {
              type: 'string',
            },
          },
        },
        {
          type: 'objectKeyValue',
          key: 'authorOrGhostProjected',
          value: optional({
            type: 'union',
            of: [
              {
                type: 'object',
                fields: [
                  {
                    type: 'objectKeyValue',
                    key: 'name',
                    value: {
                      type: 'string',
                    },
                  },
                  {
                    type: 'objectKeyValue',
                    key: '_type',
                    value: {
                      type: 'string',
                      value: 'author',
                    },
                  },
                ],
              },
              {
                type: 'object',
                fields: [
                  {
                    type: 'objectKeyValue',
                    key: 'name',
                    value: {
                      type: 'string',
                    },
                  },
                  {
                    type: 'objectKeyValue',
                    key: '_type',
                    value: {
                      type: 'string',
                      value: 'ghost',
                    },
                  },
                ],
              },
            ],
          }),
        },
        {
          type: 'objectKeyValue',
          key: 'resolvedAllAuthorOrGhost',
          value: optional({
            type: 'array',
            of: {
              type: 'union',
              of: [
                {
                  type: 'reference',
                  to: 'author',
                  resolved: true,
                },
                {
                  type: 'reference',
                  to: 'ghost',
                  resolved: true,
                },
              ],
            },
          }),
        },
      ],
    },
  })

  t.end()
})

t.test('deref with projection', (t) => {
  const query = `*[_type == "post"]{
            name,
            author->{_id, name}
          }`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'array',
    of: {
      type: 'object',
      fields: [
        {
          type: 'objectKeyValue',
          key: 'name',
          value: {
            type: 'string',
          },
        },
        {
          type: 'objectKeyValue',
          key: 'author',
          value: {
            type: 'object',
            fields: [
              {
                type: 'objectKeyValue',
                key: '_id',
                value: {
                  type: 'string',
                },
              },
              {
                type: 'objectKeyValue',
                key: 'name',
                value: {
                  type: 'string',
                },
              },
            ],
          },
        },
      ],
    },
  })

  t.end()
})

t.test('deref with projection and element access', (t) => {
  const query = `*[_type == "post" && name == "foo" && _id == "123"]{
            name,
            author->{_id, name}
          }[0]`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'optional',
    value: {
      type: 'object',
      fields: [
        {
          type: 'objectKeyValue',
          key: 'name',
          value: {
            type: 'string',
          },
        },
        {
          type: 'objectKeyValue',
          key: 'author',
          value: {
            type: 'object',
            fields: [
              {
                type: 'objectKeyValue',
                key: '_id',
                value: {
                  type: 'string',
                },
              },
              {
                type: 'objectKeyValue',
                key: 'name',
                value: {
                  type: 'string',
                },
              },
            ],
          },
        },
      ],
    },
  } satisfies TypeNode)

  t.end()
})

t.test('deref with element access, then projection ', (t) => {
  const query = `*[_type == "post" && name == "foo" && _id == "123"][0]{
            name,
            author->{_id, name}
          }`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'optional',
    value: {
      type: 'object',
      fields: [
        {
          type: 'objectKeyValue',
          key: 'name',
          value: {
            type: 'string',
          },
        },
        {
          type: 'objectKeyValue',
          key: 'author',
          value: {
            type: 'object',
            fields: [
              {
                type: 'objectKeyValue',
                key: '_id',
                value: {
                  type: 'string',
                },
              },
              {
                type: 'objectKeyValue',
                key: 'name',
                value: {
                  type: 'string',
                },
              },
            ],
          },
        },
      ],
    },
  } satisfies TypeNode)

  t.end()
})

t.test('subquery', (t) => {
  const query = `*[_type == "author"]{
            "posts": *[_type == "post" && references(^._id) && ^._id == "123"] {
              "publishedAfterAuthor": publishedAt > ^._createdAt,
            }
          }`

  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'array',
    of: {
      type: 'object',
      fields: [
        {
          type: 'objectKeyValue',
          key: 'posts',
          value: {
            type: 'array',
            of: {
              type: 'object',
              fields: [
                {
                  type: 'objectKeyValue',
                  key: 'publishedAfterAuthor',
                  value: {
                    type: 'boolean',
                    value: undefined,
                  },
                },
              ],
            },
          },
        },
      ],
    } satisfies TypeNode,
  })

  t.end()
})

t.test('3 fields with concetnation', (t) => {
  const query = `*[_type == "author"]{
            name,
            "fullName": firstname + " " + lastname,
          }`
  const res = evaluateQueryType(query, schemas)

  t.strictSame(res, {
    type: 'array',
    of: {
      type: 'object',
      fields: [
        {
          type: 'objectKeyValue',
          key: 'name',
          value: {
            type: 'string',
          },
        },
        {
          type: 'objectKeyValue',
          key: 'fullName',
          value: {
            type: 'concatenation',
            fields: [
              {
                type: 'string',
              },
              {
                type: 'string',
                value: ' ',
              },
              {
                type: 'string',
              },
            ],
          },
        },
      ],
    },
  })

  t.end()
})
t.test('with select', (t) => {
  const query = `*[_type == "author" || _type == "post"] {
      _type,
        "authorName": select(
          _type == "author" => name,
          _type == "post" => lastname,
          "unknown name"
        )
      }`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'array',
    of: {
      type: 'union',
      of: [
        {
          type: 'object',
          fields: [
            {
              type: 'objectKeyValue',
              key: '_type',
              value: {
                type: 'string',
                value: 'post',
              },
            },
            {
              type: 'objectKeyValue',
              key: 'authorName',
              value: optional({
                type: 'string',
              }),
            },
          ],
        },
        {
          type: 'object',
          fields: [
            {
              type: 'objectKeyValue',
              key: '_type',
              value: {
                type: 'string',
                value: 'author',
              },
            },
            {
              type: 'objectKeyValue',
              key: 'authorName',
              value: {
                type: 'string',
              },
            },
          ],
        },
      ],
    },
  })

  t.end()
})

t.test('with select, not guaranteed & with fallback', (t) => {
  const query = `*[_type == "author" || _type == "post"] {
        _type,
        "something": select(
          _id > 5 => _id,
          "old id"
        )
      }`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'array',
    of: {
      type: 'union',
      of: [
        {
          type: 'object',
          fields: [
            {
              type: 'objectKeyValue',
              key: '_type',
              value: {
                type: 'string',
                value: 'post',
              },
            },
            {
              type: 'objectKeyValue',
              key: 'something',
              value: {
                type: 'union',
                of: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'string',
                    value: 'old id',
                  },
                ],
              },
            },
          ],
        },
        {
          type: 'object',
          fields: [
            {
              type: 'objectKeyValue',
              key: '_type',
              value: {
                type: 'string',
                value: 'author',
              },
            },
            {
              type: 'objectKeyValue',
              key: 'something',
              value: {
                type: 'union',
                of: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'string',
                    value: 'old id',
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  })

  t.end()
})

t.test('with splat', (t) => {
  const query = `*[_type == "author"] {
        ...,
        "otherName": name
      }`
  const res = evaluateQueryType(query, schemas)

  t.strictSame(res, {
    type: 'array',
    of: {
      type: 'object',
      fields: [
        {
          type: 'objectKeyValue',
          key: '_id',
          value: {
            type: 'string',
          },
        },
        {
          type: 'objectKeyValue',
          key: '_type',
          value: {
            type: 'string',
            value: 'author',
          },
        },
        {
          type: 'objectKeyValue',
          key: 'name',
          value: {
            type: 'string',
          },
        },
        {
          type: 'objectKeyValue',
          key: 'firstname',
          value: {
            type: 'string',
          },
        },
        {
          type: 'objectKeyValue',
          key: 'lastname',
          value: {
            type: 'string',
          },
        },
        {
          type: 'objectKeyValue',
          key: 'object',
          value: {
            type: 'object',
            fields: [
              {
                key: 'subfield',
                type: 'objectKeyValue',
                value: {
                  type: 'string',
                },
              },
            ],
          },
        },
        {
          type: 'objectKeyValue',
          key: 'optionalObject',
          value: optional({
            type: 'object',
            fields: [
              {
                key: 'subfield',
                type: 'objectKeyValue',
                value: {
                  type: 'string',
                },
              },
            ],
          }),
        },
        {
          type: 'objectKeyValue',
          key: 'otherName',
          value: {
            type: 'string',
          },
        },
      ],
    },
  })

  t.end()
})

t.test('with conditional splat', (t) => {
  const query = `{"foo": 1}{
    "not match": {"mail" == 1 => {},
    "match": {1 == 1 => {...}}}
  
  }`
  const res = evaluateQueryType(query, schemas)
  t.matchSnapshot(res)
  t.end()
})

t.test('coalesce', async (t) => {
  const query = `*[_type == "author"]{
          "name": coalesce(name, "unknown"),
        }`
  const res = evaluateQueryType(query, schemas)
  t.matchSnapshot(res)
  t.end()
})

t.test('coalesce with projection', async (t) => {
  const query = `*[_type == "author"][0]{
          _type,
          "foo": coalesce(optionalObject, dontExists) {
            subfield,
            ref->
          },
        }`
  const res = evaluateQueryType(query, schemas)
  t.matchSnapshot(res)
  t.end()
})

t.test('number', (t) => {
  const query = `3`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'number',
    value: 3,
  })
  t.end()
})
t.test('string', (t) => {
  const query = `"hello"`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'string',
    value: 'hello',
  })
  t.end()
})
t.test('null', (t) => {
  const query = `null`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'null',
  })
  t.end()
})
t.test('object', (t) => {
  const query = `{ "hello": "world" }`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'object',
    fields: [
      {
        type: 'objectKeyValue',
        key: 'hello',
        value: {
          type: 'string',
          value: 'world',
        },
      },
    ],
  } satisfies TypeNode)

  t.end()
})

t.test('filter with function', (t) => {
  const query = `*[_type == "author" && defined(slug.current)]`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'array',
    of: {
      type: 'reference',
      to: 'author',
      resolved: true,
    },
  })

  t.end()
})

t.test('filter with type reference', (t) => {
  const res = evaluateQueryType(`*[_type == "post" && sluger.current == $foo][0]`, schemas)
  t.strictSame(
    res,
    optional({
      type: 'reference',
      to: 'post',
      resolved: true,
    }),
  )
  t.end()
})

t.test('filter order doesnt matter', (t) => {
  const res = evaluateQueryType(`*[_type == "author" && _id == "123"]`, schemas)
  t.strictSame(res, evaluateQueryType(`*["author" == _type &&  "123" == _id]`, schemas))
  t.matchSnapshot(res)

  t.end()
})

t.test('misc', (t) => {
  const query = `*[]{
      "group": ((3 + 4) * 5),
      "notBool": !false,
      "notField": !someField,
      "unknownParent": ^._id,
      "and": !false && !field,
      "pt": pt::text(block)
    }`
  const res = evaluateQueryType(query, schemas)
  t.matchSnapshot(res)

  t.end()
})

t.test('flatmap', (t) => {
  const query = `*[_type == "post"].allAuthorOrGhost[]`
  const res = evaluateQueryType(query, schemas)
  t.matchSnapshot(res)

  t.end()
})

function optional(field: TypeNode): OptionalTypeNode {
  return {
    type: 'optional',
    value: field,
  }
}
