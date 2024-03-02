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
    "attributes": Object {
      "_id": Object {
        "type": "objectAttribute",
        "value": Object {
          "type": "string",
        },
      },
      "authorFullName": Object {
        "type": "objectAttribute",
        "value": Object {
          "type": "string",
          "value": undefined,
        },
      },
      "collaborators": Object {
        "type": "objectAttribute",
        "value": Object {
          "of": Object {
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
                  "collaboratorPosts": Object {
                    "type": "objectAttribute",
                    "value": Object {
                      "of": Object {
                        "type": "string",
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
              Object {
                "attributes": Object {
                  "_type": Object {
                    "type": "objectAttribute",
                    "value": Object {
                      "type": "string",
                      "value": "ghost",
                    },
                  },
                  "collaboratorPosts": Object {
                    "type": "objectAttribute",
                    "value": Object {
                      "of": Object {
                        "type": "string",
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
            ],
            "type": "union",
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
      "relatedConcepts": Object {
        "type": "objectAttribute",
        "value": Object {
          "of": Array [
            Object {
              "of": Object {
                "to": "concept",
                "type": "reference",
              },
              "type": "array",
            },
            Object {
              "type": "null",
            },
          ],
          "type": "union",
        },
      },
      "slug": Object {
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

exports[`test/evaluateQueryType.test.ts TAP complex > must match snapshot 1`] = `
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
          "value": "post",
        },
      },
      "allAuthorsOrGhosts": Object {
        "type": "objectAttribute",
        "value": Object {
          "of": Object {
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
                  "details": Object {
                    "type": "objectAttribute",
                    "value": Object {
                      "attributes": Object {
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
              Object {
                "attributes": Object {
                  "_type": Object {
                    "type": "objectAttribute",
                    "value": Object {
                      "type": "string",
                      "value": "ghost",
                    },
                  },
                  "details": Object {
                    "type": "objectAttribute",
                    "value": Object {
                      "attributes": Object {
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
                      },
                      "type": "object",
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
            ],
            "type": "union",
          },
          "type": "array",
        },
      },
      "authorDetails": Object {
        "type": "objectAttribute",
        "value": Object {
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
                "value": "author",
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
      },
      "authorOrGhost": Object {
        "type": "objectAttribute",
        "value": Object {
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
                "details": Object {
                  "type": "objectAttribute",
                  "value": Object {
                    "attributes": Object {
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
            Object {
              "attributes": Object {
                "_type": Object {
                  "type": "objectAttribute",
                  "value": Object {
                    "type": "string",
                    "value": "ghost",
                  },
                },
                "details": Object {
                  "type": "objectAttribute",
                  "value": Object {
                    "attributes": Object {
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
                    },
                    "type": "object",
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
          ],
          "type": "union",
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
      "slugerDetails": Object {
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
