import t from 'tap'

import {type AnyStaticValue, DateTime, fromJS, Path, toJS} from '../../src/values'

t.test('toJSON', async (t) => {
  t.test('equivalent', async (t) => {
    for (const [name, value] of [
      ['obj', {a: 1}],
      ['num', 1],
      ['str', 'hello'],
      ['true', true],
      ['false', false],
      ['array', [1, true]],
    ] satisfies Array<[string, unknown]>) {
      t.test(name, async (t) => {
        t.equal(toJS(fromJS(value) as AnyStaticValue), value)
      })
    }
  })

  t.test('converted', async (t) => {
    for (const [name, value, expected] of [
      ['datetime', new DateTime(new Date('2025-09-09T07:36:19.249Z')), '2025-09-09T07:36:19.249Z'],
      ['path', new Path('*.versions'), '*.versions'],
      [
        'obj with datetime',
        {a: 1, b: new DateTime(new Date('2025-09-09T07:36:19.249Z')), c: 3},
        {a: 1, b: '2025-09-09T07:36:19.249Z', c: 3},
      ],
      [
        'arr with datetime',
        [1, new DateTime(new Date('2025-09-09T07:36:19.249Z')), 3],
        [1, '2025-09-09T07:36:19.249Z', 3],
      ],
    ] satisfies Array<[string, unknown, unknown]>) {
      t.test(name, async (t) => {
        const result = toJS(fromJS(value) as AnyStaticValue)
        t.same(result, expected)

        // These should _not_ be the same
        t.not(result, value)
      })
    }
  })
})
