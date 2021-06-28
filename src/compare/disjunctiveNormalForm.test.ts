import {disjunctiveNormalForm} from './disjunctiveNormalForm'
import {hashify, generate} from './compare'

describe('disjunctiveNormalForm', () => {
  test('distributive', () => {
    const input = hashify({
      type: 'And',
      children: [
        {
          type: 'Or',
          children: [
            {type: 'UnknownExpression', hash: 'A'},
            {type: 'UnknownExpression', hash: 'B'},
          ],
        },
        {type: 'UnknownExpression', hash: 'C'},
      ],
    })
    const output = disjunctiveNormalForm(input)

    expect(generate(input)).toMatchInlineSnapshot(`"((A or B) and C)"`)
    expect(generate(output)).toMatchInlineSnapshot(`"((A and C) or (B and C))"`)
  })

  test('distributive multiple', () => {
    const input = hashify({
      type: 'And',
      children: [
        {
          type: 'Or',
          children: [
            {type: 'UnknownExpression', hash: 'A'},
            {type: 'UnknownExpression', hash: 'B'},
            {type: 'UnknownExpression', hash: 'C'},
            {type: 'UnknownExpression', hash: 'D'},
          ],
        },
        {type: 'UnknownExpression', hash: 'E'},
      ],
    })
    const output = disjunctiveNormalForm(input)

    expect(generate(input)).toMatchInlineSnapshot(`"((A or B or C or D) and E)"`)
    expect(generate(output)).toMatchInlineSnapshot(
      `"((A and E) or (B and E) or (C and E) or (D and E))"`
    )
  })

  test('nesting', () => {
    const input = hashify({
      type: 'Or',
      children: [
        {type: 'UnknownExpression', hash: 'A'},
        {
          type: 'And',
          children: [
            {type: 'UnknownExpression', hash: 'B'},
            {
              type: 'Or',
              children: [
                {type: 'UnknownExpression', hash: 'C'},
                {type: 'UnknownExpression', hash: 'D'},
              ],
            },
          ],
        },
      ],
    })
    const output = disjunctiveNormalForm(input)

    expect(generate(input)).toMatchInlineSnapshot(`"(((C or D) and B) or A)"`)
    expect(generate(output)).toMatchInlineSnapshot(`"((B and C) or (B and D) or A)"`)
  })

  test("de morgan's law !(A and B) <==> !A or !B", () => {
    const input = hashify({
      type: 'Not',
      not: {
        type: 'And',
        children: [
          {type: 'UnknownExpression', hash: 'A'},
          {type: 'UnknownExpression', hash: 'B'},
        ],
      },
    })
    const output = disjunctiveNormalForm(input)

    expect(generate(input)).toMatchInlineSnapshot(`"!((A and B))"`)
    expect(generate(output)).toMatchInlineSnapshot(`"(!(A) or !(B))"`)
  })

  test("de morgan's law !(A or B) <==> !A and !B", () => {
    const input = hashify({
      type: 'Not',
      not: {
        type: 'Or',
        children: [
          {type: 'UnknownExpression', hash: 'A'},
          {type: 'UnknownExpression', hash: 'B'},
        ],
      },
    })
    const output = disjunctiveNormalForm(input)

    expect(generate(input)).toMatchInlineSnapshot(`"!((A or B))"`)
    expect(generate(output)).toMatchInlineSnapshot(`"(!(A) and !(B))"`)
  })

  test('larger example', () => {
    const input = hashify({
      type: 'And',
      children: [
        {
          type: 'Or',
          children: [
            {type: 'Not', not: {type: 'UnknownExpression', hash: 'A'}},
            {
              type: 'And',
              children: [
                {type: 'UnknownExpression', hash: 'B'},
                {type: 'UnknownExpression', hash: 'C'},
                {type: 'UnknownExpression', hash: 'D'},
              ],
            },
          ],
        },
        {
          type: 'Or',
          children: [
            {type: 'Not', not: {type: 'UnknownExpression', hash: 'B'}},
            {
              type: 'And',
              children: [
                {type: 'UnknownExpression', hash: 'C'},
                {type: 'UnknownExpression', hash: 'D'},
              ],
            },
          ],
        },
        {
          type: 'Or',
          children: [
            {type: 'Not', not: {type: 'UnknownExpression', hash: 'C'}},
            {type: 'UnknownExpression', hash: 'D'},
          ],
        },
      ],
    })

    const output = disjunctiveNormalForm(input)

    expect(generate(input)).toMatchInlineSnapshot(
      `"((!(A) or (B and C and D)) and (!(B) or (C and D)) and (!(C) or D))"`
    )
    expect(generate(output)).toMatchInlineSnapshot(
      `"((!(A) and !(B) and !(C)) or (!(A) and !(B) and D) or (!(A) and C and D) or (B and C and D))"`
    )
  })
})
