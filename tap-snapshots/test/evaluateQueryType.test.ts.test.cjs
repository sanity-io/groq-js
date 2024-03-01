/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/evaluateQueryType.test.ts TAP coalesce only > must match snapshot 1`] = `
Object {
  "of": Object {
    "attributes": Object {
      "maybe": Object {
        "type": "objectAttribute",
        "value": Object {
          "of": Array [
            Object {
              "attributes": Object {
                "subfield": Object {
                  "type": "objectAttribute",
                  "value": Object {
                    "type": "string",
                  },
                },
              },
              "type": "object",
            },
            Object {
              "type": "null",
            },
          ],
          "type": "union",
        },
      },
      "name": Object {
        "type": "objectAttribute",
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
    },
    "type": "object",
  },
  "type": "array",
}
`

exports[`test/evaluateQueryType.test.ts TAP coalesce with projection > must match snapshot 1`] = `
Object {
  "of": Array [
    Object {
      "attributes": Object {
        "_type": Object {
          "type": "objectAttribute",
          "value": Object {
            "type": "string",
            "value": "author",
          },
        },
        "foo": Object {
          "type": "objectAttribute",
          "value": Object {
            "of": Array [
              Object {
                "attributes": Object {
                  "ref": Object {
                    "type": "objectAttribute",
                    "value": Object {
                      "type": "null",
                    },
                  },
                  "subfield": Object {
                    "type": "objectAttribute",
                    "value": Object {
                      "type": "string",
                    },
                  },
                },
                "type": "object",
              },
              Object {
                "type": "null",
              },
            ],
            "type": "union",
          },
        },
      },
      "type": "object",
    },
    Object {
      "type": "null",
    },
  ],
  "type": "union",
}
`

exports[`test/evaluateQueryType.test.ts TAP complex 2 > must match snapshot 1`] = `
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
        "key": "name",
        "type": "objectKeyValue",
        "value": Object {
          "type": "string",
        },
      },
      Object {
        "key": "authorFullName",
        "type": "objectKeyValue",
        "value": Object {
          "fields": Array [
            Object {
              "type": "string",
            },
            Object {
              "type": "string",
              "value": " ",
            },
            Object {
              "type": "string",
            },
          ],
          "type": "concatenation",
        },
      },
      Object {
        "key": "slug",
        "type": "objectKeyValue",
        "value": Object {
          "type": "optional",
          "value": Object {
            "type": "unknown",
          },
        },
      },
      Object {
        "key": "relatedConcepts",
        "type": "objectKeyValue",
        "value": Object {
          "type": "optional",
          "value": Object {
            "type": "unknown",
          },
        },
      },
      Object {
        "key": "collaborators",
        "type": "objectKeyValue",
        "value": Object {
          "type": "optional",
          "value": Object {
            "of": Object {
              "of": Array [
                Object {
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
                      "key": "name",
                      "type": "objectKeyValue",
                      "value": Object {
                        "type": "string",
                      },
                    },
                    Object {
                      "key": "collaboratorPosts",
                      "type": "objectKeyValue",
                      "value": Object {
                        "of": Object {
                          "type": "string",
                        },
                        "type": "array",
                      },
                    },
                  ],
                  "type": "object",
                },
                Object {
                  "fields": Array [
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
                      "key": "collaboratorPosts",
                      "type": "objectKeyValue",
                      "value": Object {
                        "of": Object {
                          "type": "string",
                        },
                        "type": "array",
                      },
                    },
                  ],
                  "type": "object",
                },
              ],
              "type": "union",
            },
            "type": "array",
          },
        },
      },
    ],
    "type": "object",
  },
  "type": "array",
}
`

exports[`test/evaluateQueryType.test.ts TAP complex > must match snapshot 1`] = `
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
          "value": "post",
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
        "key": "lastname",
        "type": "objectKeyValue",
        "value": Object {
          "type": "optional",
          "value": Object {
            "type": "string",
          },
        },
      },
      Object {
        "key": "authorDetails",
        "type": "objectKeyValue",
        "value": Object {
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
      },
      Object {
        "key": "slugerDetails",
        "type": "objectKeyValue",
        "value": Object {
          "type": "optional",
          "value": Object {
            "type": "null",
          },
        },
      },
      Object {
        "key": "authorOrGhost",
        "type": "objectKeyValue",
        "value": Object {
          "type": "optional",
          "value": Object {
            "of": Array [
              Object {
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
                    "key": "name",
                    "type": "objectKeyValue",
                    "value": Object {
                      "type": "string",
                    },
                  },
                  Object {
                    "key": "details",
                    "type": "objectKeyValue",
                    "value": Object {
                      "fields": Array [
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
                  },
                ],
                "type": "object",
              },
              Object {
                "fields": Array [
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
                    "key": "details",
                    "type": "objectKeyValue",
                    "value": Object {
                      "fields": Array [
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
                      ],
                      "type": "object",
                    },
                  },
                ],
                "type": "object",
              },
            ],
            "type": "union",
          },
        },
      },
      Object {
        "key": "allAuthorsOrGhosts",
        "type": "objectKeyValue",
        "value": Object {
          "type": "optional",
          "value": Object {
            "of": Object {
              "of": Array [
                Object {
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
                      "key": "name",
                      "type": "objectKeyValue",
                      "value": Object {
                        "type": "string",
                      },
                    },
                    Object {
                      "key": "details",
                      "type": "objectKeyValue",
                      "value": Object {
                        "fields": Array [
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
                    },
                  ],
                  "type": "object",
                },
                Object {
                  "fields": Array [
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
                      "key": "details",
                      "type": "objectKeyValue",
                      "value": Object {
                        "fields": Array [
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
                        ],
                        "type": "object",
                      },
                    },
                  ],
                  "type": "object",
                },
              ],
              "type": "union",
            },
            "type": "array",
          },
        },
      },
    ],
    "type": "object",
  },
  "type": "array",
}
`

exports[`test/evaluateQueryType.test.ts TAP filter order doesnt matter > must match snapshot 1`] = `
Object {
  "of": Object {
    "attributes": Object {
      "_createdAt": Object {
        "type": "objectAttribute",
        "value": Object {
          "type": "string",
        },
      },
      "_id": Object {
        "type": "objectAttribute",
        "value": Object {
          "type": "string",
        },
      },
      "_type": Object {
        "type": "objectAttribute",
        "value": Object {
          "type": "string",
          "value": "author",
        },
      },
      "age": Object {
        "type": "objectAttribute",
        "value": Object {
          "type": "number",
        },
      },
      "firstname": Object {
        "type": "objectAttribute",
        "value": Object {
          "type": "string",
        },
      },
      "lastname": Object {
        "type": "objectAttribute",
        "value": Object {
          "type": "string",
        },
      },
      "name": Object {
        "type": "objectAttribute",
        "value": Object {
          "type": "string",
        },
      },
      "object": Object {
        "type": "objectAttribute",
        "value": Object {
          "attributes": Object {
            "subfield": Object {
              "type": "objectAttribute",
              "value": Object {
                "type": "string",
              },
            },
          },
          "type": "object",
        },
      },
      "optionalObject": Object {
        "optional": true,
        "type": "objectAttribute",
        "value": Object {
          "attributes": Object {
            "subfield": Object {
              "type": "objectAttribute",
              "value": Object {
                "type": "string",
              },
            },
          },
          "type": "object",
        },
      },
    },
    "type": "object",
  },
  "type": "array",
}
`

exports[`test/evaluateQueryType.test.ts TAP flatmap > must match snapshot 1`] = `
Object {
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
}
`

exports[`test/evaluateQueryType.test.ts TAP misc > must match snapshot 1`] = `
Object {
  "of": Object {
    "attributes": Object {
      "andWithAttriute": Object {
        "type": "objectAttribute",
        "value": Object {
          "type": "boolean",
          "value": true,
        },
      },
      "group": Object {
        "type": "objectAttribute",
        "value": Object {
          "type": "number",
          "value": 35,
        },
      },
      "notBool": Object {
        "type": "objectAttribute",
        "value": Object {
          "type": "boolean",
          "value": true,
        },
      },
      "notField": Object {
        "type": "objectAttribute",
        "value": Object {
          "type": "boolean",
        },
      },
      "pt": Object {
        "type": "objectAttribute",
        "value": Object {
          "type": "string",
        },
      },
      "unknownParent": Object {
        "type": "objectAttribute",
        "value": Object {
          "type": "null",
        },
      },
    },
    "type": "object",
  },
  "type": "array",
}
`

exports[`test/evaluateQueryType.test.ts TAP object references > must match snapshot 1`] = `
Object {
  "of": Object {
    "attributes": Object {
      "_id": Object {
        "type": "objectAttribute",
        "value": Object {
          "type": "string",
        },
      },
      "_type": Object {
        "type": "objectAttribute",
        "value": Object {
          "type": "string",
          "value": "ghost",
        },
      },
      "concepts": Object {
        "type": "objectAttribute",
        "value": Object {
          "of": Object {
            "to": "concept",
            "type": "reference",
          },
          "type": "array",
        },
      },
      "disabledConcepts": Object {
        "type": "objectAttribute",
        "value": Object {
          "of": Object {
            "to": "concept",
            "type": "reference",
          },
          "type": "array",
        },
      },
      "enabledConcepts": Object {
        "type": "objectAttribute",
        "value": Object {
          "of": Object {
            "attributes": Object {
              "name": Object {
                "type": "objectAttribute",
                "value": Object {
                  "type": "string",
                },
              },
            },
            "type": "object",
          },
          "type": "array",
        },
      },
      "name": Object {
        "type": "objectAttribute",
        "value": Object {
          "type": "string",
        },
      },
    },
    "type": "object",
  },
  "type": "array",
}
`

exports[`test/evaluateQueryType.test.ts TAP with conditional splat > must match snapshot 1`] = `
Object {
  "attributes": Object {
    "not match": Object {
      "type": "objectAttribute",
      "value": Object {
        "attributes": Object {
          "match": Object {
            "type": "objectAttribute",
            "value": Object {
              "attributes": Object {
                "foo": Object {
                  "type": "objectAttribute",
                  "value": Object {
                    "type": "number",
                    "value": 1,
                  },
                },
              },
              "type": "object",
            },
          },
        },
        "type": "object",
      },
    },
  },
  "type": "object",
}
`
