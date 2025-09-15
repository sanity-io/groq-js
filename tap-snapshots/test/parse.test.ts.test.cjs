/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/parse.test.ts TAP Basic parsing Comment with no text > must match snapshot 1`] = `
Object {
  "type": "Value",
  "value": 1,
}
`

exports[`test/parse.test.ts TAP Basic parsing Complex query > must match snapshot 1`] = `
Object {
  "args": Array [
    Object {
      "args": Array [
        Object {
          "base": Object {
            "base": Object {
              "type": "Everything",
            },
            "expr": Object {
              "left": Object {
                "name": "_type",
                "type": "AccessAttribute",
              },
              "op": "==",
              "right": Object {
                "type": "Value",
                "value": "page",
              },
              "type": "OpCall",
            },
            "type": "Filter",
          },
          "expr": Object {
            "base": Object {
              "base": Object {
                "type": "This",
              },
              "expr": Object {
                "attributes": Array [
                  Object {
                    "name": "_id",
                    "type": "ObjectAttributeValue",
                    "value": Object {
                      "alternatives": Array [
                        Object {
                          "condition": Object {
                            "left": Object {
                              "name": "_id",
                              "type": "AccessAttribute",
                            },
                            "op": "in",
                            "right": Object {
                              "args": Array [
                                Object {
                                  "type": "Value",
                                  "value": "drafts.**",
                                },
                              ],
                              "func": Object {
                                "arity": 1,
                                "executeAsync": AsyncFunction executeAsync(node, scope),
                                "executeSync": Function executeSync(node, scope),
                              },
                              "name": "path",
                              "namespace": "global",
                              "type": "FuncCall",
                            },
                            "type": "OpCall",
                          },
                          "type": "SelectAlternative",
                          "value": Object {
                            "name": "_id",
                            "type": "AccessAttribute",
                          },
                        },
                      ],
                      "fallback": Object {
                        "left": Object {
                          "type": "Value",
                          "value": "drafts.",
                        },
                        "op": "+",
                        "right": Object {
                          "name": "_id",
                          "type": "AccessAttribute",
                        },
                        "type": "OpCall",
                      },
                      "type": "Select",
                    },
                  },
                ],
                "type": "Object",
              },
              "type": "Projection",
            },
            "name": "_id",
            "type": "AccessAttribute",
          },
          "type": "Map",
        },
      ],
      "func": Object {
        "arity": 1,
        "executeAsync": AsyncFunction (args, scope),
        "executeSync": Function executeSync(),
      },
      "name": "unique",
      "namespace": "array",
      "type": "FuncCall",
    },
  ],
  "func": Object {
    "arity": 1,
    "executeAsync": AsyncFunction executeAsync(node, scope),
    "executeSync": Function executeSync(node, scope),
  },
  "name": "count",
  "namespace": "global",
  "type": "FuncCall",
}
`

exports[`test/parse.test.ts TAP Basic parsing Example query > must match snapshot 1`] = `
Object {
  "base": Object {
    "base": Object {
      "type": "Everything",
    },
    "expr": Object {
      "left": Object {
        "name": "_type",
        "type": "AccessAttribute",
      },
      "op": "==",
      "right": Object {
        "type": "Value",
        "value": "product",
      },
      "type": "OpCall",
    },
    "type": "Filter",
  },
  "expr": Object {
    "base": Object {
      "type": "This",
    },
    "expr": Object {
      "attributes": Array [
        Object {
          "name": "name",
          "type": "ObjectAttributeValue",
          "value": Object {
            "name": "name",
            "type": "AccessAttribute",
          },
        },
      ],
      "type": "Object",
    },
    "type": "Projection",
  },
  "type": "Map",
}
`

exports[`test/parse.test.ts TAP Basic parsing Object expression starting with string > must match snapshot 1`] = `
Object {
  "attributes": Array [
    Object {
      "condition": Object {
        "left": Object {
          "type": "Value",
          "value": "mail",
        },
        "op": "==",
        "right": Object {
          "type": "Value",
          "value": 1,
        },
        "type": "OpCall",
      },
      "type": "ObjectConditionalSplat",
      "value": Object {
        "attributes": Array [],
        "type": "Object",
      },
    },
  ],
  "type": "Object",
}
`

exports[`test/parse.test.ts TAP Basic parsing Space after field in objects > must match snapshot 1`] = `
Object {
  "attributes": Array [
    Object {
      "name": "mail",
      "type": "ObjectAttributeValue",
      "value": Object {
        "type": "Value",
        "value": 123,
      },
    },
  ],
  "type": "Object",
}
`

exports[`test/parse.test.ts TAP Basic parsing Trailing comma in function call > must match snapshot 1`] = `
Object {
  "alternatives": Array [],
  "fallback": Object {
    "type": "Value",
    "value": 123,
  },
  "type": "Select",
}
`

exports[`test/parse.test.ts TAP Expression parsing when extracting property keys can extract from group > must match snapshot 1`] = `
Object {
  "base": Object {
    "type": "Everything",
  },
  "expr": Object {
    "base": Object {
      "type": "This",
    },
    "expr": Object {
      "attributes": Array [
        Object {
          "name": "id",
          "type": "ObjectAttributeValue",
          "value": Object {
            "base": Object {
              "name": "id",
              "type": "AccessAttribute",
            },
            "type": "Group",
          },
        },
      ],
      "type": "Object",
    },
    "type": "Projection",
  },
  "type": "Map",
}
`
