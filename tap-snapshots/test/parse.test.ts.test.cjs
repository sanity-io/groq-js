/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
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
