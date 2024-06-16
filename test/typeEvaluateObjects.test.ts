import assert from 'node:assert'

import t from 'tap'

import type {ObjectAttributeNode} from '../src/nodeTypes'
import {optimizeUnions} from '../src/typeEvaluator/optimizations'
import {overrideTypeForNode, typeEvaluate} from '../src/typeEvaluator/typeEvaluate'
import {unionOf} from '../src/typeEvaluator/typeHelpers'
import type {Schema, TypeNode} from '../src/typeEvaluator/types'

const nodeWithType = (type: TypeNode) => {
  const expr = {type: 'Value', value: null} as const
  overrideTypeForNode(expr, type)
  return expr
}

const objectVariants: {
  name: string
  attributes: ObjectAttributeNode[]
  expects?: TypeNode
  schema?: Schema
  asserter?: (t: Tap.Test, res: TypeNode) => void
}[] = [
  // normal projection attributes
  {
    name: 'Attribute works',
    attributes: [
      {type: 'ObjectAttributeValue', name: 'A', value: nodeWithType({type: 'string'})},
      {type: 'ObjectAttributeValue', name: 'B', value: nodeWithType({type: 'number'})},
    ],
    expects: {
      type: 'object',
      attributes: {
        A: {
          type: 'objectAttribute',
          value: {
            type: 'string',
          },
        },
        B: {
          type: 'objectAttribute',
          value: {
            type: 'number',
          },
        },
      },
    },
  },

  {
    name: 'Attributes works, order matters',
    attributes: [
      {type: 'ObjectAttributeValue', name: 'A', value: nodeWithType({type: 'string'})},
      {type: 'ObjectAttributeValue', name: 'A', value: nodeWithType({type: 'number'})},
    ],
    expects: {
      type: 'object',
      attributes: {
        A: {
          type: 'objectAttribute',
          value: {
            type: 'number',
          },
        },
      },
    },
  },
  // normal projection attributes end

  // MARK: START: Unknown type splatting
  {
    name: "Test with a type we can't splat over(array)",
    attributes: [
      {type: 'ObjectAttributeValue', name: 'A', value: nodeWithType({type: 'boolean'})},
      {
        type: 'ObjectConditionalSplat',
        condition: {type: 'Parameter', name: 'someParam'},
        value: nodeWithType({
          type: 'array',
          of: unionOf(
            {
              type: 'object',
              attributes: {
                B: {type: 'objectAttribute', value: {type: 'string'}},
              },
            },
            {
              type: 'object',
              attributes: {
                C: {type: 'objectAttribute', value: {type: 'string'}},
              },
            },
          ),
        }),
      },
    ],
    expects: {
      type: 'unknown',
    },
  },

  {
    name: "Test with a type we can't splat over(union of array)",
    attributes: [
      {type: 'ObjectAttributeValue', name: 'A', value: nodeWithType({type: 'boolean'})},
      {
        type: 'ObjectConditionalSplat',
        condition: {type: 'Parameter', name: 'someParam'},
        value: nodeWithType(
          unionOf(
            {
              type: 'array',
              of: {
                type: 'object',
                attributes: {
                  B: {type: 'objectAttribute', value: {type: 'string'}},
                },
              },
            },
            {
              type: 'array',
              of: {
                type: 'object',
                attributes: {
                  A: {type: 'objectAttribute', value: {type: 'string'}},
                },
              },
            },
          ),
        ),
      },
    ],
    expects: {
      type: 'unknown',
    },
  },

  {
    name: "Test with a type we can't splat over(number)",
    attributes: [
      {type: 'ObjectAttributeValue', name: 'A', value: nodeWithType({type: 'boolean'})},
      {
        type: 'ObjectConditionalSplat',
        condition: {type: 'Parameter', name: 'someParam'},
        value: nodeWithType({type: 'number'}),
      },
    ],
    expects: {
      type: 'unknown',
    },
  },

  {
    name: 'Splatting over unknown type should result in unknown type',
    attributes: [
      {type: 'ObjectAttributeValue', name: 'A', value: nodeWithType({type: 'string'})},
      {type: 'ObjectSplat', value: nodeWithType({type: 'unknown'})},
    ],
    expects: {
      type: 'unknown',
    },
  },
  {
    name: 'Splatting over a non-object type should result in unknown type',
    attributes: [{type: 'ObjectSplat', value: nodeWithType({type: 'string'})}],
    expects: {
      type: 'unknown',
    },
  },

  // MARK: END: Unknown type splatting

  {
    name: 'Conditional splat over object with splat',
    attributes: [
      {
        type: 'ObjectSplat',
        value: nodeWithType({
          type: 'object',
          attributes: {
            A: {type: 'objectAttribute', value: {type: 'string'}},
          },
        }),
      },
      {
        type: 'ObjectConditionalSplat',
        condition: {type: 'Parameter', name: 'someParam'},
        value: nodeWithType({
          type: 'object',
          attributes: {
            B: {type: 'objectAttribute', value: {type: 'boolean'}},
            C: {type: 'objectAttribute', value: {type: 'number'}},
          },
        }),
      },
    ],
    asserter: (t, res) => {
      t.ok(res.type === 'union')
      assert(res.type === 'union') // TS type guard
      // (1+1) = 2 combinations
      t.strictSame(res.of.length, 2)
    },
    expects: optimizeUnions(
      unionOf(
        {
          type: 'object',
          attributes: {
            A: {type: 'objectAttribute', value: {type: 'string'}},
          },
        },
        {
          type: 'object',
          attributes: {
            A: {type: 'objectAttribute', value: {type: 'string'}},
            B: {type: 'objectAttribute', value: {type: 'boolean'}},
            C: {type: 'objectAttribute', value: {type: 'number'}},
          },
        },
      ),
    ),
  },

  // Doesn't test a specific query, but correctnes when expanding splats
  {
    name: 'Conditional splat over object with splat, overrides key',
    attributes: [
      {
        type: 'ObjectSplat',
        value: nodeWithType({
          type: 'object',
          attributes: {
            A: {type: 'objectAttribute', value: {type: 'string'}},
          },
        }),
      },
      {
        type: 'ObjectConditionalSplat',
        condition: {type: 'Parameter', name: 'someParam'},
        value: nodeWithType({
          type: 'object',
          attributes: {
            A: {type: 'objectAttribute', value: {type: 'boolean'}},
            B: {type: 'objectAttribute', value: {type: 'number'}},
          },
        }),
      },
    ],
    asserter: (t, res) => {
      t.ok(res.type === 'union')
      assert(res.type === 'union') // TS type guard
      // (2^1) = 2 combinations
      t.strictSame(res.of.length, 2)
    },
    expects: optimizeUnions(
      unionOf(
        {
          type: 'object',
          attributes: {
            A: {type: 'objectAttribute', value: {type: 'string'}},
          },
        },
        {
          type: 'object',
          attributes: {
            A: {type: 'objectAttribute', value: {type: 'boolean'}},
            B: {type: 'objectAttribute', value: {type: 'number'}},
          },
        },
      ),
    ),
  },

  // Doesn't test a specific query, but correctnes when expanding splats
  {
    name: 'Splat over union of objects',
    attributes: [
      {
        type: 'ObjectSplat',
        value: nodeWithType({
          type: 'object',
          attributes: {
            A: {type: 'objectAttribute', value: {type: 'string'}},
          },
        }),
      },
      {
        type: 'ObjectSplat',
        value: nodeWithType(
          unionOf(
            {
              type: 'object',
              attributes: {
                B: {type: 'objectAttribute', value: {type: 'boolean'}},
                C: {type: 'objectAttribute', value: {type: 'number'}},
              },
            },
            {
              type: 'object',
              attributes: {
                D: {type: 'objectAttribute', value: {type: 'string'}},
                E: {type: 'objectAttribute', value: {type: 'number'}},
              },
            },
          ),
        ),
      },
    ],
    asserter: (t, res) => {
      t.ok(res.type === 'union')
      assert(res.type === 'union') // TS type guard
      // (2^1) = 2 combinations
      t.strictSame(res.of.length, 2)
    },
    expects: optimizeUnions(
      unionOf(
        {
          type: 'object',
          attributes: {
            A: {
              type: 'objectAttribute',
              value: {
                type: 'string',
              },
            },
            B: {
              type: 'objectAttribute',
              value: {
                type: 'boolean',
              },
            },
            C: {
              type: 'objectAttribute',
              value: {
                type: 'number',
              },
            },
          },
        },
        {
          type: 'object',
          attributes: {
            A: {
              type: 'objectAttribute',
              value: {
                type: 'string',
              },
            },
            D: {
              type: 'objectAttribute',
              value: {
                type: 'string',
              },
            },
            E: {
              type: 'objectAttribute',
              value: {
                type: 'number',
              },
            },
          },
        },
      ),
    ),
  },

  // Doesn't test a specific query, but correctnes when expanding splats
  {
    name: 'Unresolvable conditional splat only',
    attributes: [
      {
        type: 'ObjectConditionalSplat',
        condition: {type: 'Parameter', name: 'someParam'},
        value: nodeWithType({
          type: 'object',
          attributes: {
            A: {type: 'objectAttribute', value: {type: 'boolean'}},
            B: {type: 'objectAttribute', value: {type: 'number'}},
          },
        }),
      },
    ],
    asserter: (t, res) => {
      t.ok(res.type === 'union')
      assert(res.type === 'union') // TS type guard
      // (1+ EMPTY) = 2 combinations
      t.strictSame(res.of.length, 2)
    },
    expects: optimizeUnions(
      unionOf(
        {
          type: 'object',
          attributes: {},
        },
        {
          type: 'object',
          attributes: {
            A: {type: 'objectAttribute', value: {type: 'boolean'}},
            B: {type: 'objectAttribute', value: {type: 'number'}},
          },
        },
      ),
    ),
  },

  // Doesn't test a specific query, but correctnes when expanding splats
  {
    name: 'Two unresolvable conditional splats only with unions',
    attributes: [
      {
        type: 'ObjectConditionalSplat',
        condition: {type: 'Parameter', name: 'someParam'},
        value: nodeWithType(
          unionOf(
            {
              type: 'object',
              attributes: {
                A: {type: 'objectAttribute', value: {type: 'number'}},
              },
            },
            {
              type: 'object',
              attributes: {
                B: {type: 'objectAttribute', value: {type: 'boolean'}},
              },
            },
          ),
        ),
      },
      {
        type: 'ObjectConditionalSplat',
        condition: {type: 'Parameter', name: 'someParam'},
        value: nodeWithType(
          unionOf(
            {
              type: 'object',
              attributes: {
                C: {type: 'objectAttribute', value: {type: 'number'}},
              },
            },
            {
              type: 'object',
              attributes: {
                D: {type: 'objectAttribute', value: {type: 'boolean'}},
              },
            },
          ),
        ),
      },
    ],
    asserter: (t, res) => {
      t.ok(res.type === 'union')
      assert(res.type === 'union') // TS type guard
      // 3(A,B,Empty) * 3(C,D,Empty) = 9 combinations
      t.strictSame(res.of.length, 9)
    },
    expects: unionOf(
      {
        type: 'object',
        attributes: {},
      },
      {
        type: 'object',
        attributes: {
          A: {
            type: 'objectAttribute',
            value: {
              type: 'number',
            },
          },
          C: {
            type: 'objectAttribute',
            value: {
              type: 'number',
            },
          },
        },
      },
      {
        type: 'object',
        attributes: {
          A: {
            type: 'objectAttribute',
            value: {
              type: 'number',
            },
          },
          D: {
            type: 'objectAttribute',
            value: {
              type: 'boolean',
            },
          },
        },
      },
      {
        type: 'object',
        attributes: {
          A: {
            type: 'objectAttribute',
            value: {
              type: 'number',
            },
          },
        },
      },
      {
        type: 'object',
        attributes: {
          B: {
            type: 'objectAttribute',
            value: {
              type: 'boolean',
            },
          },
          C: {
            type: 'objectAttribute',
            value: {
              type: 'number',
            },
          },
        },
      },
      {
        type: 'object',
        attributes: {
          B: {
            type: 'objectAttribute',
            value: {
              type: 'boolean',
            },
          },
          D: {
            type: 'objectAttribute',
            value: {
              type: 'boolean',
            },
          },
        },
      },
      {
        type: 'object',
        attributes: {
          B: {
            type: 'objectAttribute',
            value: {
              type: 'boolean',
            },
          },
        },
      },
      {
        type: 'object',
        attributes: {
          C: {
            type: 'objectAttribute',
            value: {
              type: 'number',
            },
          },
        },
      },
      {
        type: 'object',
        attributes: {
          D: {
            type: 'objectAttribute',
            value: {
              type: 'boolean',
            },
          },
        },
      },
    ),
  },

  // MARK: START: Splatting over multiple conditionals
  // Doesn't test a specific query, but correctnes when expanding splats

  {
    name: 'Test splatting over multiple conditionals leads to a matrix of all possible combinations',
    attributes: [
      {
        type: 'ObjectSplat',
        value: nodeWithType({
          type: 'object',
          attributes: {
            A: {type: 'objectAttribute', value: {type: 'string'}},
          },
        }),
      },
      {
        type: 'ObjectConditionalSplat',
        condition: {type: 'Parameter', name: 'someParam2'},
        value: nodeWithType({
          type: 'object',
          attributes: {
            B: {type: 'objectAttribute', value: {type: 'number'}},
            C: {type: 'objectAttribute', value: {type: 'number'}},
            D: {type: 'objectAttribute', value: {type: 'number'}},
          },
        }),
      },
      {
        type: 'ObjectConditionalSplat',
        condition: {type: 'Parameter', name: 'someParam'},
        value: nodeWithType({
          type: 'object',
          attributes: {
            E: {type: 'objectAttribute', value: {type: 'number'}},
            F: {type: 'objectAttribute', value: {type: 'number'}},
            G: {type: 'objectAttribute', value: {type: 'number'}},
          },
        }),
      },
      {
        type: 'ObjectConditionalSplat',
        condition: {type: 'Parameter', name: 'someParam'},
        value: nodeWithType({
          type: 'object',
          attributes: {
            H: {type: 'objectAttribute', value: {type: 'number'}},
            I: {type: 'objectAttribute', value: {type: 'number'}},
            J: {type: 'objectAttribute', value: {type: 'number'}},
          },
        }),
      },
    ],
    asserter: (t, res) => {
      t.ok(res.type === 'union')
      assert(res.type === 'union') // TS type guard
      // 2^3 = 8 combinations
      t.strictSame(res.of.length, 8)
    },
    expects: unionOf(
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          B: {type: 'objectAttribute', value: {type: 'number'}},
          C: {type: 'objectAttribute', value: {type: 'number'}},
          D: {type: 'objectAttribute', value: {type: 'number'}},
          E: {type: 'objectAttribute', value: {type: 'number'}},
          F: {type: 'objectAttribute', value: {type: 'number'}},
          G: {type: 'objectAttribute', value: {type: 'number'}},
          H: {type: 'objectAttribute', value: {type: 'number'}},
          I: {type: 'objectAttribute', value: {type: 'number'}},
          J: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          B: {type: 'objectAttribute', value: {type: 'number'}},
          C: {type: 'objectAttribute', value: {type: 'number'}},
          D: {type: 'objectAttribute', value: {type: 'number'}},
          E: {type: 'objectAttribute', value: {type: 'number'}},
          F: {type: 'objectAttribute', value: {type: 'number'}},
          G: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          B: {type: 'objectAttribute', value: {type: 'number'}},
          C: {type: 'objectAttribute', value: {type: 'number'}},
          D: {type: 'objectAttribute', value: {type: 'number'}},
          H: {type: 'objectAttribute', value: {type: 'number'}},
          I: {type: 'objectAttribute', value: {type: 'number'}},
          J: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          B: {type: 'objectAttribute', value: {type: 'number'}},
          C: {type: 'objectAttribute', value: {type: 'number'}},
          D: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          E: {type: 'objectAttribute', value: {type: 'number'}},
          F: {type: 'objectAttribute', value: {type: 'number'}},
          G: {type: 'objectAttribute', value: {type: 'number'}},
          H: {type: 'objectAttribute', value: {type: 'number'}},
          I: {type: 'objectAttribute', value: {type: 'number'}},
          J: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          E: {type: 'objectAttribute', value: {type: 'number'}},
          F: {type: 'objectAttribute', value: {type: 'number'}},
          G: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          H: {type: 'objectAttribute', value: {type: 'number'}},
          I: {type: 'objectAttribute', value: {type: 'number'}},
          J: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {type: 'object', attributes: {A: {type: 'objectAttribute', value: {type: 'string'}}}},
    ),
  },
  // MARK: END: Splatting over multiple conditionals

  /* Projection:
   * *[_type == "someType"] {
   *  A: someStringField,
   *  ...{ B, C },
   * }
   */
  {
    name: 'test splat operations',
    attributes: [
      {type: 'ObjectAttributeValue', name: 'A', value: nodeWithType({type: 'string'})},
      {
        type: 'ObjectSplat',
        value: nodeWithType({
          type: 'object',
          attributes: {
            B: {type: 'objectAttribute', value: {type: 'string'}},
            C: {type: 'objectAttribute', value: {type: 'string'}},
          },
        }),
      },
    ],
    expects: {
      type: 'object',
      attributes: {
        A: {
          type: 'objectAttribute',
          value: {
            type: 'string',
          },
        },
        B: {
          type: 'objectAttribute',
          value: {
            type: 'string',
          },
        },
        C: {
          type: 'objectAttribute',
          value: {
            type: 'string',
          },
        },
      },
    },
  },

  /** Projection:
   * *[_type == "someType"] {
   *  A: someNumberField,
   *  A: someStringField,
   * }
   */

  {
    name: 'order matters, and type is overwritten',
    attributes: [
      {type: 'ObjectAttributeValue', name: 'A', value: nodeWithType({type: 'string'})},
      {
        type: 'ObjectSplat',
        value: nodeWithType({
          type: 'object',
          attributes: {
            A: {type: 'objectAttribute', value: {type: 'number'}},
          },
        }),
      },
    ],
    expects: {
      type: 'object',
      attributes: {
        A: {
          type: 'objectAttribute',
          value: {
            type: 'number',
          },
        },
      },
    },
  },

  {
    name: 'order matters, and type is overwritten',
    attributes: [
      {
        type: 'ObjectSplat',
        value: nodeWithType({
          type: 'object',
          attributes: {
            A: {type: 'objectAttribute', value: {type: 'number'}},
          },
        }),
      },
      {type: 'ObjectAttributeValue', name: 'A', value: nodeWithType({type: 'string'})},
    ],
    expects: {
      type: 'object',
      attributes: {
        A: {
          type: 'objectAttribute',
          value: {
            type: 'string',
          },
        },
      },
    },
  },

  /** Projection:
   * *[_type == "someType"] {
   *  A,
   * _type == "someOtherType" => { B }
   * }
   */

  {
    name: 'Test conditionals that never resolves since the condition is always false',
    attributes: [
      {type: 'ObjectAttributeValue', name: 'A', value: nodeWithType({type: 'string'})},
      {
        type: 'ObjectConditionalSplat',
        condition: {type: 'Value', value: false},
        value: nodeWithType({
          type: 'object',
          attributes: {
            B: {type: 'objectAttribute', value: {type: 'string'}},
          },
        }),
      },
    ],
    expects: {
      type: 'object',
      attributes: {
        A: {
          type: 'objectAttribute',
          value: {
            type: 'string',
          },
        },
      },
    },
  },

  /** Projection:
   * *[_type == "someType"] {
   *  A,
   * _type == "someType" => { B }
   * }
   */

  {
    name: 'Test conditionals that always resolves since the condition is always true',
    attributes: [
      {type: 'ObjectAttributeValue', name: 'A', value: nodeWithType({type: 'string'})},
      {
        type: 'ObjectConditionalSplat',
        condition: {type: 'Value', value: true},
        value: nodeWithType({
          type: 'object',
          attributes: {
            B: {type: 'objectAttribute', value: {type: 'string'}},
          },
        }),
      },
    ],
    expects: {
      type: 'object',
      attributes: {
        A: {
          type: 'objectAttribute',
          value: {
            type: 'string',
          },
        },
        B: {
          type: 'objectAttribute',
          value: {
            type: 'string',
          },
        },
      },
    },
  },

  {
    name: 'Test that order matters and attributes overrides conditionals',
    attributes: [
      {
        type: 'ObjectConditionalSplat',
        condition: {type: 'Parameter', name: 'someParam'},
        value: nodeWithType({
          type: 'object',
          attributes: {
            A: {type: 'objectAttribute', value: {type: 'string'}},
          },
        }),
      },
      {type: 'ObjectAttributeValue', name: 'A', value: nodeWithType({type: 'string'})},
    ],
    expects: {
      type: 'object',
      attributes: {
        A: {
          type: 'objectAttribute',
          value: {
            type: 'string',
          },
        },
      },
    },
  },

  // MARK: START unresolvable conditionals
  /** Projection:
   * {
   *  A,
   * _type == "someType" => { B }
   * }
   */
  {
    name: 'Test with attribute and conditional splat with "unresolvable" condition',
    attributes: [
      {type: 'ObjectAttributeValue', name: 'A', value: nodeWithType({type: 'string'})},
      {
        type: 'ObjectConditionalSplat',
        condition: {type: 'Parameter', name: 'someParam'},
        value: nodeWithType({
          type: 'object',
          attributes: {
            B: {type: 'objectAttribute', value: {type: 'string'}},
          },
        }),
      },
    ],
    expects: unionOf(
      {
        type: 'object',
        attributes: {
          A: {
            type: 'objectAttribute',
            value: {
              type: 'string',
            },
          },
          B: {
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
          A: {
            type: 'objectAttribute',
            value: {
              type: 'string',
            },
          },
        },
      },
    ),
  },

  // MARK: START unresolvable conditionals
  /** Projection:
   * {
   *  A,
   * age > 10 => { B },
   * field == "something" => { C }
   * }
   */

  {
    name: 'Test with attribute and multiple conditional splat with "unresolvable" condition',
    attributes: [
      {type: 'ObjectAttributeValue', name: 'A', value: nodeWithType({type: 'string'})},
      {
        type: 'ObjectConditionalSplat',
        condition: {type: 'Parameter', name: 'someParam'},
        value: nodeWithType({
          type: 'object',
          attributes: {
            B: {type: 'objectAttribute', value: {type: 'string'}},
          },
        }),
      },
      {
        type: 'ObjectConditionalSplat',
        condition: {type: 'Parameter', name: 'someOtherParam'},
        value: nodeWithType({
          type: 'object',
          attributes: {
            C: {type: 'objectAttribute', value: {type: 'string'}},
          },
        }),
      },
    ],
    expects: unionOf(
      {
        type: 'object',
        attributes: {
          A: {
            type: 'objectAttribute',
            value: {
              type: 'string',
            },
          },
          B: {
            type: 'objectAttribute',
            value: {
              type: 'string',
            },
          },
          C: {
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
          A: {
            type: 'objectAttribute',
            value: {
              type: 'string',
            },
          },
          B: {
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
          A: {
            type: 'objectAttribute',
            value: {
              type: 'string',
            },
          },
          C: {
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
          A: {
            type: 'objectAttribute',
            value: {
              type: 'string',
            },
          },
        },
      },
    ),
  },

  // MARK: START: Multiple conditionals with unions
  /**
   * Projection: {
   *  A: someField
   * _type == "B" || _type == "C" => @
   * _type == "D" || _type == "E" => @
   * _type == "F" || _type == "G" || || _type == "H" => @
   * }
   */
  {
    name: 'Test splatting over multiple conditionals, with unions, leads to a matrix of all possible combinations',
    attributes: [
      {
        type: 'ObjectSplat',
        value: nodeWithType({
          type: 'object',
          attributes: {
            A: {type: 'objectAttribute', value: {type: 'string'}},
          },
        }),
      },
      {
        type: 'ObjectConditionalSplat',
        condition: {type: 'Parameter', name: 'someParam2'},
        value: nodeWithType(
          unionOf(
            {
              type: 'object',
              attributes: {
                B: {type: 'objectAttribute', value: {type: 'number'}},
              },
            },
            {
              type: 'object',
              attributes: {
                C: {type: 'objectAttribute', value: {type: 'number'}},
              },
            },
          ),
        ),
      },
      {
        type: 'ObjectConditionalSplat',
        condition: {type: 'Parameter', name: 'someParam'},
        value: nodeWithType(
          unionOf(
            {
              type: 'object',
              attributes: {
                D: {type: 'objectAttribute', value: {type: 'number'}},
              },
            },
            {
              type: 'object',
              attributes: {
                E: {type: 'objectAttribute', value: {type: 'number'}},
              },
            },
          ),
        ),
      },
      {
        type: 'ObjectConditionalSplat',
        condition: {type: 'Parameter', name: 'someParam'},
        value: nodeWithType(
          unionOf(
            {
              type: 'object',
              attributes: {
                F: {type: 'objectAttribute', value: {type: 'number'}},
              },
            },
            {
              type: 'object',
              attributes: {
                G: {type: 'objectAttribute', value: {type: 'number'}},
              },
            },
            {
              type: 'object',
              attributes: {
                H: {type: 'objectAttribute', value: {type: 'number'}},
              },
            },
          ),
        ),
      },
    ],
    asserter: (t, res) => {
      t.ok(res.type === 'union', 'Result is a union')
      assert(res.type === 'union') // workaround for TS

      // 1 (A is always included) × 3 (choices for B|C) × 3 (choices for D|E) × 4 (choices for F|G|H) = 1×3×3×4 = 36 combinations
      t.equal(res.of.length, 36, `Result should have 36 possible combinations`)
    },
    expects: unionOf(
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          B: {type: 'objectAttribute', value: {type: 'number'}},
          D: {type: 'objectAttribute', value: {type: 'number'}},
          F: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          B: {type: 'objectAttribute', value: {type: 'number'}},
          D: {type: 'objectAttribute', value: {type: 'number'}},
          G: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          B: {type: 'objectAttribute', value: {type: 'number'}},
          D: {type: 'objectAttribute', value: {type: 'number'}},
          H: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          B: {type: 'objectAttribute', value: {type: 'number'}},
          D: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          B: {type: 'objectAttribute', value: {type: 'number'}},
          E: {type: 'objectAttribute', value: {type: 'number'}},
          F: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          B: {type: 'objectAttribute', value: {type: 'number'}},
          E: {type: 'objectAttribute', value: {type: 'number'}},
          G: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          B: {type: 'objectAttribute', value: {type: 'number'}},
          E: {type: 'objectAttribute', value: {type: 'number'}},
          H: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          B: {type: 'objectAttribute', value: {type: 'number'}},
          E: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          B: {type: 'objectAttribute', value: {type: 'number'}},
          F: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          B: {type: 'objectAttribute', value: {type: 'number'}},
          G: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          B: {type: 'objectAttribute', value: {type: 'number'}},
          H: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          B: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          C: {type: 'objectAttribute', value: {type: 'number'}},
          D: {type: 'objectAttribute', value: {type: 'number'}},
          F: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          C: {type: 'objectAttribute', value: {type: 'number'}},
          D: {type: 'objectAttribute', value: {type: 'number'}},
          G: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          C: {type: 'objectAttribute', value: {type: 'number'}},
          D: {type: 'objectAttribute', value: {type: 'number'}},
          H: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          C: {type: 'objectAttribute', value: {type: 'number'}},
          D: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          C: {type: 'objectAttribute', value: {type: 'number'}},
          E: {type: 'objectAttribute', value: {type: 'number'}},
          F: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          C: {type: 'objectAttribute', value: {type: 'number'}},
          E: {type: 'objectAttribute', value: {type: 'number'}},
          G: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          C: {type: 'objectAttribute', value: {type: 'number'}},
          E: {type: 'objectAttribute', value: {type: 'number'}},
          H: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          C: {type: 'objectAttribute', value: {type: 'number'}},
          E: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          C: {type: 'objectAttribute', value: {type: 'number'}},
          F: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          C: {type: 'objectAttribute', value: {type: 'number'}},
          G: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          C: {type: 'objectAttribute', value: {type: 'number'}},
          H: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          C: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          D: {type: 'objectAttribute', value: {type: 'number'}},
          F: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          D: {type: 'objectAttribute', value: {type: 'number'}},
          G: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          D: {type: 'objectAttribute', value: {type: 'number'}},
          H: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          D: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          E: {type: 'objectAttribute', value: {type: 'number'}},
          F: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          E: {type: 'objectAttribute', value: {type: 'number'}},
          G: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          E: {type: 'objectAttribute', value: {type: 'number'}},
          H: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          E: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          F: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          G: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
          H: {type: 'objectAttribute', value: {type: 'number'}},
        },
      },
      {
        type: 'object',
        attributes: {
          A: {type: 'objectAttribute', value: {type: 'string'}},
        },
      },
    ),
  },
  // MARK: END: Multiple conditionals with unions
]

for (const variant of objectVariants) {
  t.test(`objects: ${variant.name}`, (t) => {
    const result = typeEvaluate(
      {
        type: 'Object',
        attributes: variant.attributes,
      },
      variant.schema || [],
    )
    if (variant.expects !== undefined) {
      t.strictSame(result, variant.expects)
    }

    if (variant.asserter !== undefined) {
      variant.asserter(t, result)
    }

    t.end()
  })
}
