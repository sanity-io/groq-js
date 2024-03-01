import t from 'tap'

import {evaluateQueryType} from '../src/typeEvaluator/evaluateQueryType'
import {createReferenceTypeNode} from '../src/typeEvaluator/typeHelpers'
import {
  ArrayTypeNode,
  Document,
  ObjectAttribute,
  ObjectTypeNode,
  Schema,
  TypeDeclaration,
  TypeNode,
  UnionTypeNode,
} from '../src/typeEvaluator/types'

const postDocument = {
  type: 'document',
  name: 'post',
  attributes: {
    _id: {
      type: 'objectAttribute',
      value: {
        type: 'string',
      },
    } satisfies ObjectAttribute,
    _type: {
      type: 'objectAttribute',
      value: {
        type: 'string',
        value: 'post',
      },
    } satisfies ObjectAttribute,
    name: {
      type: 'objectAttribute',
      value: {
        type: 'string',
      },
    } satisfies ObjectAttribute,
    lastname: {
      type: 'objectAttribute',
      value: {
        type: 'string',
      },
      optional: true,
    } satisfies ObjectAttribute,
    publishedAt: {
      type: 'objectAttribute',
      value: {
        type: 'string',
      },
      optional: true,
    } satisfies ObjectAttribute,
    author: {
      type: 'objectAttribute',
      value: createReferenceTypeNode('author'),
    } satisfies ObjectAttribute,
    sluger: {
      type: 'objectAttribute',
      value: {
        type: 'inline',
        name: 'slug',
      },
      optional: true,
    } satisfies ObjectAttribute,
    authorOrGhost: {
      type: 'objectAttribute',
      value: {
        type: 'union',
        of: [createReferenceTypeNode('author'), createReferenceTypeNode('ghost')],
      },
      optional: true,
    } satisfies ObjectAttribute,
    allAuthorOrGhost: {
      type: 'objectAttribute',
      value: {
        type: 'array',
        of: {
          type: 'union',
          of: [createReferenceTypeNode('author', true), createReferenceTypeNode('ghost', true)],
        },
      },
      optional: true,
    } satisfies ObjectAttribute,
  },
} satisfies Document

const authorDocument = {
  type: 'document',
  name: 'author',
  attributes: {
    _id: {
      type: 'objectAttribute',
      value: {
        type: 'string',
      },
    },
    _type: {
      type: 'objectAttribute',
      value: {
        type: 'string',
        value: 'author',
      },
    },
    name: {
      type: 'objectAttribute',
      value: {
        type: 'string',
      },
    },
    firstname: {
      type: 'objectAttribute',
      value: {
        type: 'string',
      },
    },
    lastname: {
      type: 'objectAttribute',
      value: {
        type: 'string',
      },
    },
    _createdAt: {
      type: 'objectAttribute',
      value: {
        type: 'string',
      },
    },
    age: {
      type: 'objectAttribute',
      value: {
        type: 'number',
      },
    },
    object: {
      type: 'objectAttribute',
      value: {
        type: 'object',
        attributes: {
          subfield: {
            type: 'objectAttribute',
            value: {
              type: 'string',
            },
          },
        },
      },
    },
    optionalObject: {
      type: 'objectAttribute',
      optional: true,
      value: {
        type: 'object',
        attributes: {
          subfield: {
            type: 'objectAttribute',
            value: {
              type: 'string',
            },
          },
        },
      },
    },
  },
} satisfies Document
const ghostDocument = {
  type: 'document',
  name: 'ghost',
  attributes: {
    _id: {
      type: 'objectAttribute',
      value: {
        type: 'string',
      },
    },
    _type: {
      type: 'objectAttribute',
      value: {
        type: 'string',
        value: 'ghost',
      },
    },
    name: {
      type: 'objectAttribute',
      value: {
        type: 'string',
      },
    },
    concepts: {
      type: 'objectAttribute',
      value: {
        type: 'array',
        of: {
          type: 'inline',
          name: 'concept',
        },
      },
    },
  },
} satisfies Document

const namespaceOneDocument = {
  type: 'document',
  name: 'namespace.one',
  attributes: {
    _type: {
      type: 'objectAttribute',
      value: {
        type: 'string',
        value: 'namespace.one',
      },
    } satisfies ObjectAttribute,
    name: {
      type: 'objectAttribute',
      value: {
        type: 'string',
      },
    } satisfies ObjectAttribute,
    boolField: {
      type: 'objectAttribute',
      value: {
        type: 'boolean',
      },
    } satisfies ObjectAttribute,
  },
} satisfies Document

const namespaceTwoDocument = {
  type: 'document',
  name: 'namespace.two',
  attributes: {
    _type: {
      type: 'objectAttribute',
      value: {
        type: 'string',
        value: 'namespace.two',
      },
    } satisfies ObjectAttribute,
    name: {
      type: 'objectAttribute',
      value: {
        type: 'string',
      },
    } satisfies ObjectAttribute,
  },
} satisfies Document
const conceptType = {
  type: 'type',
  name: 'concept',
  value: {
    type: 'object',
    attributes: {
      name: {
        type: 'objectAttribute',
        value: {
          type: 'string',
        },
      },
      enabled: {
        type: 'objectAttribute',
        value: {
          type: 'boolean',
        },
      },
      posts: {
        type: 'objectAttribute',
        value: {
          type: 'array',
          of: createReferenceTypeNode('post', true),
        },
      },
    },
  },
} satisfies TypeDeclaration
const slugType = {
  name: 'slug',
  type: 'type',
  value: {
    type: 'object',
    attributes: {
      current: {
        type: 'objectAttribute',
        value: {
          type: 'string',
        },
        optional: true,
      },
      source: {
        type: 'objectAttribute',
        value: {
          type: 'string',
        },
        optional: true,
      },
      _type: {
        type: 'objectAttribute',
        value: {
          type: 'string',
          value: 'slug',
        },
      },
      _key: {
        type: 'objectAttribute',
        value: {
          type: 'string',
        },
        optional: true,
      },
    },
  },
} satisfies TypeDeclaration

const schemas = [
  postDocument,
  authorDocument,
  ghostDocument,
  namespaceOneDocument,
  namespaceTwoDocument,
  conceptType,
  slugType,
] satisfies Schema

t.test('no projection', (t) => {
  const query = `*[_type == "author" && _id == "123"]`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'array',
    of: findSchemaType('author'),
  } satisfies TypeNode)
  t.end()
})
t.test('pipe func call', (t) => {
  const query = `*[_type == "author" && defined(slug.current)] | order(_createdAt desc)`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'array',
    of: findSchemaType('author'),
  } satisfies TypeNode)
  t.end()
})

t.test('element access', (t) => {
  const query = `*[_type == "author"][0]`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'union',
    of: [findSchemaType('author'), {type: 'null'}],
  } satisfies TypeNode)
  t.end()
})

t.test('element access with attribute access', (t) => {
  const query = `*[_type == "post"][0].allAuthorOrGhost[] { _ref}`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'union',
    of: [
      {
        type: 'array',
        of: {
          type: 'object',
          attributes: {
            _ref: {
              type: 'objectAttribute',
              value: {
                type: 'string',
              },
            },
          },
        },
      },
      {type: 'null'},
    ],
  } satisfies TypeNode)
  t.end()
})

t.test('access attribute with objects', (t) => {
  const query = `*[_type == "author" && object.subfield == "foo"][0]`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'union',
    of: [findSchemaType('author'), {type: 'null'}],
  } satisfies TypeNode)
  t.end()
})

t.test('access attribute with derefences', (t) => {
  const query = `*[authorOrGhost->name == "foo"][0]`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'union',
    of: [findSchemaType('post'), {type: 'null'}],
  } satisfies TypeNode)
  t.end()
})

t.test('parameters', (t) => {
  const query = `*[_type == "author" && _id == $id]`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    of: findSchemaType('author'),
    type: 'array',
  } satisfies ArrayTypeNode)

  t.end()
})

t.test('filtering on sub-child', (t) => {
  const query = `*[_type == "author" && object.subfield == $slug]`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    of: findSchemaType('author'),
    type: 'array',
  } satisfies ArrayTypeNode)

  t.end()
})

t.test('in operator', (t) => {
  const query = `*[_type in ["author", "post"]]`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'array',
    of: {
      type: 'union',
      of: [findSchemaType('author'), findSchemaType('post')],
    },
  } satisfies ArrayTypeNode<UnionTypeNode>)

  t.end()
})

t.test('match operator', (t) => {
  const query = `*[_type match "namespace.**"  &&  !(_id in path("drafts.**"))]`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'array',
    of: {
      type: 'union',
      of: [findSchemaType('namespace.one'), findSchemaType('namespace.two')],
    },
  } satisfies ArrayTypeNode<UnionTypeNode>)

  t.end()
})

t.test('subfilter matches', (t) => {
  const query = `*[_type match "namespace.**"][boolField == true]`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'array',
    of: findSchemaType('namespace.one'),
  } satisfies ArrayTypeNode)

  t.end()
})

t.test('subfilter doesnt match', (t) => {
  const query = `*[_type == "namespace.two"][boolField == true]`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'array',
    of: {
      type: 'union',
      of: [],
    },
  } satisfies TypeNode)

  t.end()
})

t.test('subfilter with projection', (t) => {
  const query = `*[_type == "namespace.one"] {name, _type} [_type == "namespace.one"]`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'array',
    of: {
      type: 'object',
      attributes: {
        name: {
          type: 'objectAttribute',
          value: {
            type: 'string',
          },
        },
        _type: {
          type: 'objectAttribute',
          value: {
            type: 'string',
            value: 'namespace.one',
          },
        },
      },
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
  } satisfies TypeNode)

  t.end()
})

t.test('coerce reference', (t) => {
  const query = `*[_type == "post" && defined(author.name)][].author`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'array',
    of: createReferenceTypeNode('author'),
  } satisfies TypeNode)

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
      type: 'union',
      of: [],
    },
  } satisfies ArrayTypeNode)

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
      attributes: {
        name: {
          type: 'objectAttribute',
          value: {
            type: 'string',
          },
        },
      },
    },
  } satisfies TypeNode)

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
            "plusVar": 3 + age,
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
      attributes: {
        isAuthor: {
          type: 'objectAttribute',
          value: {
            type: 'boolean',
            value: true,
          },
        },
        greaterThan: {
          type: 'objectAttribute',
          value: {
            type: 'boolean',
            value: true,
          },
        },
        lessThan: {
          type: 'objectAttribute',
          value: {
            type: 'boolean',
            value: false,
          },
        },
        greaterThanOrEq: {
          type: 'objectAttribute',
          value: {
            type: 'boolean',
            value: true,
          },
        },
        lessThanOrEq: {
          type: 'objectAttribute',
          value: {
            type: 'boolean',
            value: true,
          },
        },
        notEqual: {
          type: 'objectAttribute',
          value: {
            type: 'boolean',
            value: true,
          },
        },
        notEqualObject: {
          type: 'objectAttribute',
          value: {
            type: 'boolean',
            value: true,
          },
        },
        plus: {
          type: 'objectAttribute',
          value: {
            type: 'number',
            value: 5,
          },
        },
        plusStr: {
          type: 'objectAttribute',
          value: {
            type: 'string',
            value: '32',
          },
        },
        plusVar: {
          type: 'objectAttribute',
          value: {
            type: 'number',
            value: undefined,
          },
        },
        minus: {
          type: 'objectAttribute',
          value: {
            type: 'number',
            value: 1,
          },
        },
        mul: {
          type: 'objectAttribute',
          value: {
            type: 'number',
            value: 9,
          },
        },
        div: {
          type: 'objectAttribute',
          value: {
            type: 'number',
            value: 20,
          },
        },
        exp: {
          type: 'objectAttribute',
          value: {
            type: 'number',
            value: 27,
          },
        },
        mod: {
          type: 'objectAttribute',
          value: {
            type: 'number',
            value: 1,
          },
        },
        arr: {
          type: 'objectAttribute',
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
        and: {
          type: 'objectAttribute',
          value: {
            type: 'boolean',
            value: undefined,
          },
        },
        or: {
          type: 'objectAttribute',
          value: {
            type: 'boolean',
            value: undefined,
          },
        },
      },
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
      attributes: {
        name: {
          type: 'objectAttribute',
          value: {
            type: 'string',
          },
        },
        author: {
          type: 'objectAttribute',
          value: findSchemaType('author'),
        },
      },
    },
  } satisfies TypeNode)

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
      attributes: {
        _id: {
          type: 'objectAttribute',
          value: {
            type: 'string',
          },
        },
        _type: {
          type: 'objectAttribute',
          value: {
            type: 'string',
            value: 'post',
          },
        },
        name: {
          type: 'objectAttribute',
          value: {
            type: 'string',
          },
        },
        lastname: {
          type: 'objectAttribute',
          value: {
            type: 'string',
          },
          optional: true,
        },
        publishedAt: {
          type: 'objectAttribute',
          value: {
            type: 'string',
          },
          optional: true,
        },
        author: {
          type: 'objectAttribute',
          value: createReferenceTypeNode('author'),
        },
        sluger: {
          type: 'objectAttribute',
          value: {
            type: 'inline',
            name: 'slug',
          },
          optional: true,
        },
        authorOrGhost: {
          type: 'objectAttribute',
          value: {
            type: 'union',
            of: [findSchemaType('author'), findSchemaType('ghost')],
          },
        },
        allAuthorOrGhost: {
          type: 'objectAttribute',
          optional: true,
          value: {
            type: 'array',
            of: {
              type: 'union',
              of: [createReferenceTypeNode('author', true), createReferenceTypeNode('ghost', true)],
            },
          },
        },
        authorName: {
          type: 'objectAttribute',
          value: {
            type: 'string',
          },
        },
        authorOrGhostName: {
          type: 'objectAttribute',
          value: {
            type: 'string',
          },
        },
        authorOrGhostProjected: {
          type: 'objectAttribute',
          value: {
            type: 'union',
            of: [
              {
                type: 'object',
                attributes: {
                  name: {
                    type: 'objectAttribute',
                    value: {
                      type: 'string',
                    },
                  },
                  _type: {
                    type: 'objectAttribute',
                    value: {
                      type: 'string',
                      value: 'author',
                    },
                  },
                },
              },
              {
                type: 'object',
                attributes: {
                  name: {
                    type: 'objectAttribute',
                    value: {
                      type: 'string',
                    },
                  },
                  _type: {
                    type: 'objectAttribute',
                    value: {
                      type: 'string',
                      value: 'ghost',
                    },
                  },
                },
              },
            ],
          },
        },
        resolvedAllAuthorOrGhost: {
          type: 'objectAttribute',
          value: {
            type: 'array',
            of: {
              type: 'union',
              of: [findSchemaType('author'), findSchemaType('ghost')],
            },
          },
        },
      },
    },
  } satisfies TypeNode)

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
      attributes: {
        name: {
          type: 'objectAttribute',
          value: {
            type: 'string',
          },
        },
        author: {
          type: 'objectAttribute',
          value: {
            type: 'object',
            attributes: {
              _id: {
                type: 'objectAttribute',
                value: {
                  type: 'string',
                },
              },
              name: {
                type: 'objectAttribute',
                value: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  } satisfies TypeNode)

  t.end()
})

t.test('deref with projection and element access', (t) => {
  const query = `*[_type == "post" && name == "foo" && _id == "123"]{
            name,
            author->{_id, name}
          }[0]`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'union',
    of: [
      {
        type: 'object',
        attributes: {
          name: {
            type: 'objectAttribute',
            value: {
              type: 'string',
            },
          },
          author: {
            type: 'objectAttribute',
            value: {
              type: 'object',
              attributes: {
                _id: {
                  type: 'objectAttribute',
                  value: {
                    type: 'string',
                  },
                },
                name: {
                  type: 'objectAttribute',
                  value: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      },
      {type: 'null'},
    ],
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
    type: 'union',
    of: [
      {
        type: 'object',
        attributes: {
          name: {
            type: 'objectAttribute',
            value: {
              type: 'string',
            },
          },
          author: {
            type: 'objectAttribute',
            value: {
              type: 'object',
              attributes: {
                _id: {
                  type: 'objectAttribute',
                  value: {
                    type: 'string',
                  },
                },
                name: {
                  type: 'objectAttribute',
                  value: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      },
      {type: 'null'},
    ],
  } satisfies TypeNode)

  t.end()
})

t.test('subquery', (t) => {
  const query = `*[_type == "author"]{
            "posts": *[_type == "post" && references(^._id) && ^._id == "123"] {
              "publishedAfterAuthor": publishedAt > ^._createdAt,
            }
          }`

  const res = evaluateQueryType(query, [authorDocument, postDocument])
  t.strictSame(res, {
    type: 'array',
    of: {
      type: 'object',
      attributes: {
        posts: {
          type: 'objectAttribute',
          value: {
            type: 'array',
            of: {
              type: 'object',
              attributes: {
                publishedAfterAuthor: {
                  type: 'objectAttribute',
                  value: {
                    type: 'boolean',
                    value: undefined,
                  },
                },
              },
            },
          },
        },
      },
    } satisfies TypeNode,
  } satisfies TypeNode)

  t.end()
})

t.test('string concetnation', (t) => {
  const query = `*[_type == "author"]{
            name,
            "fullName": firstname + " " + lastname,
          }`
  const res = evaluateQueryType(query, schemas)

  t.strictSame(res, {
    type: 'array',
    of: {
      type: 'object',
      attributes: {
        name: {
          type: 'objectAttribute',
          value: {
            type: 'string',
          },
        },
        fullName: {
          type: 'objectAttribute',
          value: {
            type: 'string',
            value: undefined,
          },
        },
      },
    },
  } satisfies ArrayTypeNode<ObjectTypeNode>)

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
          attributes: {
            _type: {
              type: 'objectAttribute',
              value: {
                type: 'string',
                value: 'author',
              },
            },
            authorName: {
              type: 'objectAttribute',
              value: {
                type: 'string',
              },
            },
          },
        },
        {
          type: 'object',
          attributes: {
            _type: {
              type: 'objectAttribute',
              value: {
                type: 'string',
                value: 'post',
              },
            },
            authorName: {
              type: 'objectAttribute',
              value: {
                type: 'string',
              },
            },
          },
        },
      ],
    },
  } satisfies TypeNode)

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
          attributes: {
            _type: {
              type: 'objectAttribute',
              value: {
                type: 'string',
                value: 'author',
              },
            },
            something: {
              type: 'objectAttribute',
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
          },
        },
        {
          type: 'object',
          attributes: {
            _type: {
              type: 'objectAttribute',
              value: {
                type: 'string',
                value: 'post',
              },
            },
            something: {
              type: 'objectAttribute',
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
          },
        },
      ],
    },
  } satisfies TypeNode)

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
      attributes: {
        _id: {
          type: 'objectAttribute',
          value: {
            type: 'string',
          },
        },
        _type: {
          type: 'objectAttribute',
          value: {
            type: 'string',
            value: 'author',
          },
        },
        name: {
          type: 'objectAttribute',
          value: {
            type: 'string',
          },
        },
        firstname: {
          type: 'objectAttribute',
          value: {
            type: 'string',
          },
        },
        lastname: {
          type: 'objectAttribute',
          value: {
            type: 'string',
          },
        },
        _createdAt: {
          type: 'objectAttribute',
          value: {
            type: 'string',
          },
        },
        age: {
          type: 'objectAttribute',
          value: {
            type: 'number',
          },
        },
        object: {
          type: 'objectAttribute',
          value: {
            type: 'object',
            attributes: {
              subfield: {
                type: 'objectAttribute',
                value: {
                  type: 'string',
                },
              },
            },
          },
        },
        optionalObject: {
          type: 'objectAttribute',
          optional: true,
          value: {
            type: 'object',
            attributes: {
              subfield: {
                type: 'objectAttribute',
                value: {
                  type: 'string',
                },
              },
            },
          },
        },
        otherName: {
          type: 'objectAttribute',
          value: {
            type: 'string',
          },
        },
      },
    },
  } satisfies TypeNode)

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

t.test('coalesce only', async (t) => {
  const query = `*[_type == "author"]{
          "name": coalesce(name, "unknown"),
          "maybe": coalesce(optionalObject, dontExists)
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
    attributes: {
      hello: {
        type: 'objectAttribute',
        value: {
          type: 'string',
          value: 'world',
        },
      },
    },
  } satisfies TypeNode)

  t.end()
})

t.test('filter with function', (t) => {
  const query = `*[_type == "author" && defined(slug.current)]`
  const res = evaluateQueryType(query, schemas)
  t.strictSame(res, {
    type: 'array',
    of: findSchemaType('author'),
  } satisfies TypeNode)

  t.end()
})

t.test('filter with type reference', (t) => {
  const res = evaluateQueryType(`*[_type == "post" && sluger.current == $foo][0]`, schemas)
  t.strictSame(res, {
    type: 'union',
    of: [findSchemaType('post'), {type: 'null'}],
  } satisfies TypeNode)
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
      "notField": !someAttriute,
      "unknownParent": ^._id,
      "andWithAttriute": !false && !someAttriute,
      "pt": pt::text(block)
    }`
  const res = evaluateQueryType(query, [{type: 'document', name: 'foo', attributes: {}}])
  t.matchSnapshot(res)

  t.end()
})

t.test('flatmap', (t) => {
  const query = `*[_type == "post"].allAuthorOrGhost[]`
  const res = evaluateQueryType(query, schemas)
  t.matchSnapshot(res)

  t.end()
})

// Fetch posts with detailed author, ghost, and concept information
t.test('complex', (t) => {
  const query = `*[_type == "post"]{
    _id,
    _type,
    name,
    lastname,
    "authorDetails": author->{
      _id,
      _type,
      name,
      firstname,
      lastname,
      object,
      optionalObject
    },
    "slugerDetails": sluger->{
      _type,
      current,
      source,
      _key
    },
    "authorOrGhost": authorOrGhost->{
      _type,
      name,
      "details": select(
        _type == "author" => {
          firstname,
          lastname,
          object,
          optionalObject
        },
        _type == "ghost" => {
          concepts[]->{
            name,
            enabled,
            posts[]->{_id, name}
          }
        }
      )
    },
    "allAuthorsOrGhosts": allAuthorOrGhost[]->{
      _type,
      name,
      "details": select(
        _type == "author" => {
          firstname,
          lastname,
          object,
          optionalObject
        },
        _type == "ghost" => {
          concepts[]->{
            name,
            enabled,
            posts[]->{_id, name}
          }
        }
      )
    }
  }`

  const res = evaluateQueryType(query, schemas)
  t.matchSnapshot(res)

  t.end()
})

// Fetch posts with complex filtering on optional fields and references
t.test('complex 2', (t) => {
  const query = `*[_type == "post" && defined(sluger) && (author->firstname match "Emily*" || authorOrGhost->name match "Ghost*")]{
    _id,
    name,
    "authorFullName": author->firstname + " " + author->lastname,
    "slug": sluger->current,
    "relatedConcepts": authorOrGhost->concepts[]->{
      name,
      "isActive": enabled,
      "relatedPostsCount": count(posts)
    },
    "collaborators": allAuthorOrGhost[]->{
      _type,
      name,
      "collaboratorPosts": *[_type == "post" && references(^._id)].name
    }
  }`

  const res = evaluateQueryType(query, schemas)
  t.matchSnapshot(res)

  t.end()
})

function findSchemaType(name: string): TypeNode {
  const type = schemas.find((s) => s.name === name)
  if (!type) {
    throw new Error(`type ${name} not found`)
  }
  if (type.type === 'document') {
    return {
      type: 'object',
      attributes: type.attributes,
    }
  }
  return type.value
}
