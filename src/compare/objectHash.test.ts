import {objectHash} from './objectHash'

describe('objectHash', () => {
  it('works', () => {
    const a = {foo: 'apple', bar: 'orange'}
    const b = {bar: 'orange', foo: 'apple'}

    expect(objectHash(a)).toBe(objectHash(b))
    expect(objectHash(a)).toMatchInlineSnapshot(`"1b017cc8f5b31f"`)
  })

  it('works', () => {
    const a = [1, {two: '2', nested: {foo: 'apple', bar: 'orange'}}, 3]
    const b = [1, {two: '2', nested: {bar: 'orange', foo: 'apple'}}, 3]

    expect(objectHash(a)).toBe(objectHash(b))
    expect(objectHash(a)).toMatchInlineSnapshot(`"681b9b0a187b0"`)
  })

  it('one more', () => {
    const obj = {
      type: 'And',
      and: [
        {
          type: 'And',
          and: [
            {
              type: 'UnknownExpression',
              hash: 'C',
            },
            {
              type: 'UnknownExpression',
              hash: 'D',
            },
          ],
        },
        {
          type: 'And',
          and: [
            {
              type: 'UnknownExpression',
              hash: 'B',
            },
            {
              type: 'UnknownExpression',
              hash: 'C',
            },
            {
              type: 'UnknownExpression',
              hash: 'D',
            },
          ],
        },
      ],
    }

    expect(objectHash(obj)).toBe(objectHash(obj))
    expect(objectHash(obj)).toMatchInlineSnapshot(`"11e16c05c3b3db"`)
  })

  it.skip('perf', () => {
    const obj = {
      type: 'And',
      and: [
        {
          type: 'And',
          and: [
            {
              type: 'UnknownExpression',
              hash: 'C',
            },
            {
              type: 'UnknownExpression',
              hash: 'D',
            },
          ],
        },
        {
          type: 'And',
          and: [
            {
              type: 'UnknownExpression',
              hash: 'B',
            },
            {
              type: 'UnknownExpression',
              hash: 'C',
            },
            {
              type: 'UnknownExpression',
              hash: 'D',
            },
          ],
        },
      ],
    }

    const start = Date.now()
    for (let i = 0; i < 10000; i++) {
      objectHash(obj)
    }
    console.log(Date.now() - start)
  })
})
