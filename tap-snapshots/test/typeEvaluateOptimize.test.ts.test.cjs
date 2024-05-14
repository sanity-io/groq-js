/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/typeEvaluateOptimize.test.ts TAP optimizeUnions: empty union > must match snapshot 1`] = `
Object {
  "of": Array [],
  "type": "union",
}
`

exports[`test/typeEvaluateOptimize.test.ts TAP optimizeUnions: empty union wrapped in array > must match snapshot 1`] = `
Object {
  "of": Object {
    "of": Array [],
    "type": "union",
  },
  "type": "array",
}
`

exports[`test/typeEvaluateOptimize.test.ts TAP optimizeUnions: empty union wrapped inside an object > must match snapshot 1`] = `
Object {
  "attributes": Object {
    "bar": Object {
      "optional": undefined,
      "type": "objectAttribute",
      "value": Object {
        "of": Array [],
        "type": "union",
      },
    },
    "foo": Object {
      "optional": undefined,
      "type": "objectAttribute",
      "value": Object {
        "of": Array [],
        "type": "union",
      },
    },
  },
  "type": "object",
}
`

exports[`test/typeEvaluateOptimize.test.ts TAP optimizeUnions: flatten unions > must match snapshot 1`] = `
Object {
  "of": Array [
    Object {
      "type": "number",
    },
    Object {
      "type": "string",
    },
  ],
  "type": "union",
}
`

exports[`test/typeEvaluateOptimize.test.ts TAP optimizeUnions: flatten unions wrapped in array > must match snapshot 1`] = `
Object {
  "of": Object {
    "of": Array [
      Object {
        "type": "number",
      },
      Object {
        "type": "string",
      },
    ],
    "type": "union",
  },
  "type": "array",
}
`

exports[`test/typeEvaluateOptimize.test.ts TAP optimizeUnions: flatten unions wrapped inside an object > must match snapshot 1`] = `
Object {
  "attributes": Object {
    "bar": Object {
      "optional": undefined,
      "type": "objectAttribute",
      "value": Object {
        "of": Array [
          Object {
            "type": "number",
          },
          Object {
            "type": "string",
          },
        ],
        "type": "union",
      },
    },
    "foo": Object {
      "optional": undefined,
      "type": "objectAttribute",
      "value": Object {
        "of": Array [
          Object {
            "type": "number",
          },
          Object {
            "type": "string",
          },
        ],
        "type": "union",
      },
    },
  },
  "type": "object",
}
`

exports[`test/typeEvaluateOptimize.test.ts TAP optimizeUnions: hoists attributes > must match snapshot 1`] = `
Object {
  "attributes": Object {
    "_key": Object {
      "optional": undefined,
      "type": "objectAttribute",
      "value": Object {
        "type": "string",
      },
    },
  },
  "rest": Object {
    "of": Array [
      Object {
        "name": "bar",
        "type": "inline",
      },
      Object {
        "name": "foo",
        "type": "inline",
      },
    ],
    "type": "union",
  },
  "type": "object",
}
`

exports[`test/typeEvaluateOptimize.test.ts TAP optimizeUnions: hoists attributes wrapped in array > must match snapshot 1`] = `
Object {
  "of": Object {
    "attributes": Object {
      "_key": Object {
        "optional": undefined,
        "type": "objectAttribute",
        "value": Object {
          "type": "string",
        },
      },
    },
    "rest": Object {
      "of": Array [
        Object {
          "name": "bar",
          "type": "inline",
        },
        Object {
          "name": "foo",
          "type": "inline",
        },
      ],
      "type": "union",
    },
    "type": "object",
  },
  "type": "array",
}
`

exports[`test/typeEvaluateOptimize.test.ts TAP optimizeUnions: hoists attributes wrapped inside an object > must match snapshot 1`] = `
Object {
  "attributes": Object {
    "bar": Object {
      "optional": undefined,
      "type": "objectAttribute",
      "value": Object {
        "attributes": Object {
          "_key": Object {
            "optional": undefined,
            "type": "objectAttribute",
            "value": Object {
              "type": "string",
            },
          },
        },
        "rest": Object {
          "of": Array [
            Object {
              "name": "bar",
              "type": "inline",
            },
            Object {
              "name": "foo",
              "type": "inline",
            },
          ],
          "type": "union",
        },
        "type": "object",
      },
    },
    "foo": Object {
      "optional": undefined,
      "type": "objectAttribute",
      "value": Object {
        "attributes": Object {
          "_key": Object {
            "optional": undefined,
            "type": "objectAttribute",
            "value": Object {
              "type": "string",
            },
          },
        },
        "rest": Object {
          "of": Array [
            Object {
              "name": "bar",
              "type": "inline",
            },
            Object {
              "name": "foo",
              "type": "inline",
            },
          ],
          "type": "union",
        },
        "type": "object",
      },
    },
  },
  "type": "object",
}
`

exports[`test/typeEvaluateOptimize.test.ts TAP optimizeUnions: no optimization needed > must match snapshot 1`] = `
Object {
  "of": Array [
    Object {
      "attributes": Object {
        "bar": Object {
          "optional": undefined,
          "type": "objectAttribute",
          "value": Object {
            "type": "string",
          },
        },
      },
      "rest": Object {
        "name": "bar",
        "type": "inline",
      },
      "type": "object",
    },
    Object {
      "attributes": Object {
        "foo": Object {
          "optional": undefined,
          "type": "objectAttribute",
          "value": Object {
            "type": "string",
          },
        },
      },
      "rest": Object {
        "name": "foo",
        "type": "inline",
      },
      "type": "object",
    },
  ],
  "type": "union",
}
`

exports[`test/typeEvaluateOptimize.test.ts TAP optimizeUnions: no optimization needed wrapped in array > must match snapshot 1`] = `
Object {
  "of": Object {
    "of": Array [
      Object {
        "attributes": Object {
          "bar": Object {
            "optional": undefined,
            "type": "objectAttribute",
            "value": Object {
              "type": "string",
            },
          },
        },
        "rest": Object {
          "name": "bar",
          "type": "inline",
        },
        "type": "object",
      },
      Object {
        "attributes": Object {
          "foo": Object {
            "optional": undefined,
            "type": "objectAttribute",
            "value": Object {
              "type": "string",
            },
          },
        },
        "rest": Object {
          "name": "foo",
          "type": "inline",
        },
        "type": "object",
      },
    ],
    "type": "union",
  },
  "type": "array",
}
`

exports[`test/typeEvaluateOptimize.test.ts TAP optimizeUnions: no optimization needed wrapped inside an object > must match snapshot 1`] = `
Object {
  "attributes": Object {
    "bar": Object {
      "optional": undefined,
      "type": "objectAttribute",
      "value": Object {
        "of": Array [
          Object {
            "attributes": Object {
              "bar": Object {
                "optional": undefined,
                "type": "objectAttribute",
                "value": Object {
                  "type": "string",
                },
              },
            },
            "rest": Object {
              "name": "bar",
              "type": "inline",
            },
            "type": "object",
          },
          Object {
            "attributes": Object {
              "foo": Object {
                "optional": undefined,
                "type": "objectAttribute",
                "value": Object {
                  "type": "string",
                },
              },
            },
            "rest": Object {
              "name": "foo",
              "type": "inline",
            },
            "type": "object",
          },
        ],
        "type": "union",
      },
    },
    "foo": Object {
      "optional": undefined,
      "type": "objectAttribute",
      "value": Object {
        "of": Array [
          Object {
            "attributes": Object {
              "bar": Object {
                "optional": undefined,
                "type": "objectAttribute",
                "value": Object {
                  "type": "string",
                },
              },
            },
            "rest": Object {
              "name": "bar",
              "type": "inline",
            },
            "type": "object",
          },
          Object {
            "attributes": Object {
              "foo": Object {
                "optional": undefined,
                "type": "objectAttribute",
                "value": Object {
                  "type": "string",
                },
              },
            },
            "rest": Object {
              "name": "foo",
              "type": "inline",
            },
            "type": "object",
          },
        ],
        "type": "union",
      },
    },
  },
  "type": "object",
}
`

exports[`test/typeEvaluateOptimize.test.ts TAP optimizeUnions: removes duplicates > must match snapshot 1`] = `
Object {
  "of": Array [
    Object {
      "type": "number",
    },
    Object {
      "type": "null",
    },
    Object {
      "type": "string",
    },
    Object {
      "type": "string",
      "value": "foo",
    },
  ],
  "type": "union",
}
`

exports[`test/typeEvaluateOptimize.test.ts TAP optimizeUnions: removes duplicates wrapped in array > must match snapshot 1`] = `
Object {
  "of": Object {
    "of": Array [
      Object {
        "type": "number",
      },
      Object {
        "type": "null",
      },
      Object {
        "type": "string",
      },
      Object {
        "type": "string",
        "value": "foo",
      },
    ],
    "type": "union",
  },
  "type": "array",
}
`

exports[`test/typeEvaluateOptimize.test.ts TAP optimizeUnions: removes duplicates wrapped inside an object > must match snapshot 1`] = `
Object {
  "attributes": Object {
    "bar": Object {
      "optional": undefined,
      "type": "objectAttribute",
      "value": Object {
        "of": Array [
          Object {
            "type": "number",
          },
          Object {
            "type": "null",
          },
          Object {
            "type": "string",
          },
          Object {
            "type": "string",
            "value": "foo",
          },
        ],
        "type": "union",
      },
    },
    "foo": Object {
      "optional": undefined,
      "type": "objectAttribute",
      "value": Object {
        "of": Array [
          Object {
            "type": "number",
          },
          Object {
            "type": "null",
          },
          Object {
            "type": "string",
          },
          Object {
            "type": "string",
            "value": "foo",
          },
        ],
        "type": "union",
      },
    },
  },
  "type": "object",
}
`

exports[`test/typeEvaluateOptimize.test.ts TAP optimizeUnions: removes single union > must match snapshot 1`] = `
Object {
  "type": "number",
}
`

exports[`test/typeEvaluateOptimize.test.ts TAP optimizeUnions: removes single union wrapped in array > must match snapshot 1`] = `
Object {
  "of": Object {
    "type": "number",
  },
  "type": "array",
}
`

exports[`test/typeEvaluateOptimize.test.ts TAP optimizeUnions: removes single union wrapped inside an object > must match snapshot 1`] = `
Object {
  "attributes": Object {
    "bar": Object {
      "optional": undefined,
      "type": "objectAttribute",
      "value": Object {
        "type": "number",
      },
    },
    "foo": Object {
      "optional": undefined,
      "type": "objectAttribute",
      "value": Object {
        "type": "number",
      },
    },
  },
  "type": "object",
}
`

exports[`test/typeEvaluateOptimize.test.ts TAP optimizeUnions: sorts unions > must match snapshot 1`] = `
Object {
  "of": Array [
    Object {
      "of": Object {
        "type": "number",
      },
      "type": "array",
    },
    Object {
      "type": "string",
    },
  ],
  "type": "union",
}
`

exports[`test/typeEvaluateOptimize.test.ts TAP optimizeUnions: sorts unions wrapped in array > must match snapshot 1`] = `
Object {
  "of": Object {
    "of": Array [
      Object {
        "of": Object {
          "type": "number",
        },
        "type": "array",
      },
      Object {
        "type": "string",
      },
    ],
    "type": "union",
  },
  "type": "array",
}
`

exports[`test/typeEvaluateOptimize.test.ts TAP optimizeUnions: sorts unions wrapped inside an object > must match snapshot 1`] = `
Object {
  "attributes": Object {
    "bar": Object {
      "optional": undefined,
      "type": "objectAttribute",
      "value": Object {
        "of": Array [
          Object {
            "of": Object {
              "type": "number",
            },
            "type": "array",
          },
          Object {
            "type": "string",
          },
        ],
        "type": "union",
      },
    },
    "foo": Object {
      "optional": undefined,
      "type": "objectAttribute",
      "value": Object {
        "of": Array [
          Object {
            "of": Object {
              "type": "number",
            },
            "type": "array",
          },
          Object {
            "type": "string",
          },
        ],
        "type": "union",
      },
    },
  },
  "type": "object",
}
`
