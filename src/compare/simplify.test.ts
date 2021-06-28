import {simplify} from './simplify'
import {hashify, generate} from './compare'

describe('simplify', () => {
  describe('flatten', () => {
    test('(A or (B or C)) ==> (A or B or C)', () => {
      const input = hashify({
        type: 'Or',
        children: [
          {type: 'UnknownExpression', hash: 'A'},
          {
            type: 'Or',
            children: [
              {type: 'UnknownExpression', hash: 'B'},
              {type: 'UnknownExpression', hash: 'C'},
            ],
          },
        ],
      })
      const output = simplify(input)

      expect(generate(input)).toMatchInlineSnapshot(`"((B or C) or A)"`)
      expect(generate(output)).toMatchInlineSnapshot(`"(A or B or C)"`)
    })

    test('(A and ((B and C) and D))) ==> (A and B and C and D)', () => {
      const input = hashify({
        type: 'And',
        children: [
          {type: 'UnknownExpression', hash: 'A'},
          {
            type: 'And',
            children: [
              {
                type: 'And',
                children: [
                  {type: 'UnknownExpression', hash: 'B'},
                  {type: 'UnknownExpression', hash: 'C'},
                ],
              },
              {type: 'UnknownExpression', hash: 'D'},
            ],
          },
        ],
      })
      const output = simplify(input)

      expect(generate(input)).toMatchInlineSnapshot(`"(((B and C) and D) and A)"`)
      expect(generate(output)).toMatchInlineSnapshot(`"(A and B and C and D)"`)
    })
  })

  describe('unwrapSizeOfOneChildren', () => {
    test('and(A) ==> A', () => {
      const input = hashify({
        type: 'And',
        children: [{type: 'UnknownExpression', hash: 'A'}],
      })
      const output = simplify(input)

      expect(generate(input)).toMatchInlineSnapshot(`"(A)"`)
      expect(generate(output)).toMatchInlineSnapshot(`"A"`)
    })

    test('or(A) ==> A', () => {
      const input = hashify({
        type: 'Or',
        children: [{type: 'UnknownExpression', hash: 'A'}],
      })
      const output = simplify(input)

      expect(generate(input)).toMatchInlineSnapshot(`"(A)"`)
      expect(generate(output)).toMatchInlineSnapshot(`"A"`)
    })
  })

  describe('removeSelfNegation', () => {
    test('(A and !A) ==> false', () => {
      const input = hashify({
        type: 'And',
        children: [
          {type: 'UnknownExpression', hash: 'A'},
          {type: 'Not', not: {type: 'UnknownExpression', hash: 'A'}},
        ],
      })
      const output = simplify(input)

      expect(generate(input)).toMatchInlineSnapshot(`"(!(A) and A)"`)
      expect(generate(output)).toMatchInlineSnapshot(`"false"`)
    })

    test('(A or !A) ==> true', () => {
      const input = hashify({
        type: 'Or',
        children: [
          {type: 'UnknownExpression', hash: 'A'},
          {type: 'Not', not: {type: 'UnknownExpression', hash: 'A'}},
        ],
      })
      const output = simplify(input)

      expect(generate(input)).toMatchInlineSnapshot(`"(!(A) or A)"`)
      expect(generate(output)).toMatchInlineSnapshot(`"true"`)
    })
  })

  describe('simplifyToFalseInConjunction', () => {
    test('A && false ==> false', () => {
      const input = hashify({
        type: 'And',
        children: [
          {type: 'UnknownExpression', hash: 'A'},
          {type: 'Literal', hash: 'false'},
        ],
      })
      const output = simplify(input)

      expect(generate(input)).toMatchInlineSnapshot(`"(A and false)"`)
      expect(generate(output)).toMatchInlineSnapshot(`"false"`)
    })
  })

  describe('simplifyToTrueInUnion', () => {
    test('A || true ==> true', () => {
      const input = hashify({
        type: 'Or',
        children: [
          {type: 'UnknownExpression', hash: 'A'},
          {type: 'Literal', hash: 'true'},
        ],
      })
      const output = simplify(input)

      expect(generate(input)).toMatchInlineSnapshot(`"(A or true)"`)
      expect(generate(output)).toMatchInlineSnapshot(`"true"`)
    })
  })

  describe('removeFalseInUnion', () => {
    test('A || false || B ==> A', () => {
      const input = hashify({
        type: 'Or',
        children: [
          {type: 'UnknownExpression', hash: 'A'},
          {type: 'Literal', hash: 'false'},
          {type: 'UnknownExpression', hash: 'B'},
        ],
      })
      const output = simplify(input)

      expect(generate(input)).toMatchInlineSnapshot(`"(A or B or false)"`)
      expect(generate(output)).toMatchInlineSnapshot(`"(A or B)"`)
    })
  })

  describe('removeTrueInConjunction', () => {
    test('A && true && B', () => {
      const input = hashify({
        type: 'And',
        children: [
          {type: 'UnknownExpression', hash: 'A'},
          {type: 'Literal', hash: 'true'},
          {type: 'UnknownExpression', hash: 'B'},
        ],
      })
      const output = simplify(input)

      expect(generate(input)).toMatchInlineSnapshot(`"(A and B and true)"`)
      expect(generate(output)).toMatchInlineSnapshot(`"(A and B)"`)
    })
  })

  describe('removeNotNot', () => {
    test('!!A => A', () => {
      const input = hashify({
        type: 'Not',
        not: {
          type: 'Not',
          not: {type: 'UnknownExpression', hash: 'A'},
        },
      })

      const output = simplify(input)

      expect(generate(input)).toMatchInlineSnapshot(`"!(!(A))"`)
      expect(generate(output)).toMatchInlineSnapshot(`"A"`)
    })

    test('!!!A => !A', () => {
      const input = hashify({
        type: 'Not',
        not: {
          type: 'Not',
          not: {
            type: 'Not',
            not: {type: 'UnknownExpression', hash: 'A'},
          },
        },
      })

      const output = simplify(input)

      expect(generate(input)).toMatchInlineSnapshot(`"!(!(!(A)))"`)
      expect(generate(output)).toMatchInlineSnapshot(`"!(A)"`)
    })
  })

  describe('removeNestedConjunctionInUnion', () => {
    test('A or (!A and B) ==> A or B', () => {
      const input = hashify({
        type: 'Or',
        children: [
          {type: 'UnknownExpression', hash: 'A'},
          {
            type: 'And',
            children: [
              {type: 'Not', not: {type: 'UnknownExpression', hash: 'A'}},
              {type: 'UnknownExpression', hash: 'B'},
            ],
          },
        ],
      })
      const output = simplify(input)

      expect(generate(input)).toMatchInlineSnapshot(`"((!(A) and B) or A)"`)
      expect(generate(output)).toMatchInlineSnapshot(`"A"`)
    })

    test('A or C or (!A and B and !C) ==> A or B or C', () => {
      const input = hashify({
        type: 'Or',
        children: [
          {type: 'UnknownExpression', hash: 'A'},
          {type: 'UnknownExpression', hash: 'C'},
          {
            type: 'And',
            children: [
              {type: 'Not', not: {type: 'UnknownExpression', hash: 'A'}},
              {type: 'UnknownExpression', hash: 'B'},
              {type: 'Not', not: {type: 'UnknownExpression', hash: 'C'}},
            ],
          },
        ],
      })
      const output = simplify(input)

      expect(generate(input)).toMatchInlineSnapshot(`"((!(A) and !(C) and B) or A or C)"`)
      expect(generate(output)).toMatchInlineSnapshot(`"(A or C)"`)
    })
  })
})
