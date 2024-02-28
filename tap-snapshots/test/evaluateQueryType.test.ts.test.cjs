/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/evaluateQueryType.test.ts TAP coalesce > must match snapshot 1`] = `
Object {
  "of": Object {
    "fields": Array [
      Object {
        "key": "name",
        "type": "objectKeyValue",
        "value": Object {
          "of": Array [
            Object {
              "type": "string",
            },
            Object {
              "type": "string",
              "value": "unknown",
            },
          ],
          "type": "union",
        },
      },
    ],
    "type": "object",
  },
  "type": "array",
}
`

exports[`test/evaluateQueryType.test.ts TAP coalesce with projection > must match snapshot 1`] = `
Object {
  "type": "optional",
  "value": Object {
    "fields": Array [
      Object {
        "key": "_type",
        "type": "objectKeyValue",
        "value": Object {
          "type": "string",
          "value": "author",
        },
      },
      Object {
        "key": "foo",
        "type": "objectKeyValue",
        "value": Object {
          "type": "optional",
          "value": Object {
            "fields": Array [
              Object {
                "key": "subfield",
                "type": "objectKeyValue",
                "value": Object {
                  "type": "string",
                },
              },
              Object {
                "key": "ref",
                "type": "objectKeyValue",
                "value": Object {
                  "type": "null",
                },
              },
            ],
            "type": "object",
          },
        },
      },
    ],
    "type": "object",
  },
}
`

exports[`test/evaluateQueryType.test.ts TAP filter order doesnt matter > must match snapshot 1`] = `
Object {
  "of": Object {
    "fields": Array [
      Object {
        "key": "_id",
        "type": "objectKeyValue",
        "value": Object {
          "type": "string",
        },
      },
      Object {
        "key": "_type",
        "type": "objectKeyValue",
        "value": Object {
          "type": "string",
          "value": "author",
        },
      },
      Object {
        "key": "name",
        "type": "objectKeyValue",
        "value": Object {
          "type": "string",
        },
      },
      Object {
        "key": "firstname",
        "type": "objectKeyValue",
        "value": Object {
          "type": "string",
        },
      },
      Object {
        "key": "lastname",
        "type": "objectKeyValue",
        "value": Object {
          "type": "string",
        },
      },
      Object {
        "key": "object",
        "type": "objectKeyValue",
        "value": Object {
          "fields": Array [
            Object {
              "key": "subfield",
              "type": "objectKeyValue",
              "value": Object {
                "type": "string",
              },
            },
          ],
          "type": "object",
        },
      },
      Object {
        "key": "optionalObject",
        "type": "objectKeyValue",
        "value": Object {
          "type": "optional",
          "value": Object {
            "fields": Array [
              Object {
                "key": "subfield",
                "type": "objectKeyValue",
                "value": Object {
                  "type": "string",
                },
              },
            ],
            "type": "object",
          },
        },
      },
    ],
    "type": "object",
  },
  "type": "array",
}
`

exports[`test/evaluateQueryType.test.ts TAP flatmap > must match snapshot 1`] = `
Object {
  "type": "optional",
  "value": Object {
    "of": Object {
      "of": Array [
        Object {
          "to": "author",
          "type": "reference",
        },
        Object {
          "to": "ghost",
          "type": "reference",
        },
      ],
      "type": "union",
    },
    "type": "array",
  },
}
`

exports[`test/evaluateQueryType.test.ts TAP misc > must match snapshot 1`] = `
Object {
  "of": Object {
    "fields": Array [
      Object {
        "key": "group",
        "type": "objectKeyValue",
        "value": Object {
          "type": "number",
          "value": 35,
        },
      },
      Object {
        "key": "notBool",
        "type": "objectKeyValue",
        "value": Object {
          "type": "boolean",
          "value": true,
        },
      },
      Object {
        "key": "notField",
        "type": "objectKeyValue",
        "value": Object {
          "type": "boolean",
        },
      },
      Object {
        "key": "unknownParent",
        "type": "objectKeyValue",
        "value": Object {
          "of": Array [
            Object {
              "type": "string",
            },
            Object {
              "type": "null",
            },
          ],
          "type": "union",
        },
      },
      Object {
        "key": "and",
        "type": "objectKeyValue",
        "value": Object {
          "type": "boolean",
          "value": true,
        },
      },
      Object {
        "key": "pt",
        "type": "objectKeyValue",
        "value": Object {
          "type": "string",
        },
      },
    ],
    "type": "object",
  },
  "type": "array",
}
`

exports[`test/evaluateQueryType.test.ts TAP object references > must match snapshot 1`] = `
Object {
  "of": Object {
    "fields": Array [
      Object {
        "key": "_id",
        "type": "objectKeyValue",
        "value": Object {
          "type": "string",
        },
      },
      Object {
        "key": "_type",
        "type": "objectKeyValue",
        "value": Object {
          "type": "string",
          "value": "ghost",
        },
      },
      Object {
        "key": "name",
        "type": "objectKeyValue",
        "value": Object {
          "type": "string",
        },
      },
      Object {
        "key": "concepts",
        "type": "objectKeyValue",
        "value": Object {
          "of": Object {
            "to": "concept",
            "type": "reference",
          },
          "type": "array",
        },
      },
      Object {
        "key": "enabledConcepts",
        "type": "objectKeyValue",
        "value": Object {
          "of": Object {
            "fields": Array [
              Object {
                "key": "name",
                "type": "objectKeyValue",
                "value": Object {
                  "type": "string",
                },
              },
            ],
            "type": "object",
          },
          "type": "array",
        },
      },
      Object {
        "key": "disabledConcepts",
        "type": "objectKeyValue",
        "value": Object {
          "of": Object {
            "to": "concept",
            "type": "reference",
          },
          "type": "array",
        },
      },
    ],
    "type": "object",
  },
  "type": "array",
}
`

exports[`test/evaluateQueryType.test.ts TAP with conditional splat > must match snapshot 1`] = `
Object {
  "fields": Array [
    Object {
      "key": "not match",
      "type": "objectKeyValue",
      "value": Object {
        "fields": Array [
          Object {
            "key": "match",
            "type": "objectKeyValue",
            "value": Object {
              "fields": Array [
                Object {
                  "key": "foo",
                  "type": "objectKeyValue",
                  "value": Object {
                    "type": "number",
                    "value": 1,
                  },
                },
              ],
              "type": "object",
            },
          },
        ],
        "type": "object",
      },
    },
  ],
  "type": "object",
}
`
