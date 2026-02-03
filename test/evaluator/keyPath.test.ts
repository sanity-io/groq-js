import t from 'tap'

import {diffKeyPaths, startsWith, valueAtPath} from '../../src/evaluator/keyPath'
import {DateTime, fromJS, StreamValue} from '../../src/values'

const obj: any = {left: {a: 1}, right: [{foo: 2}, [{bar: 3}]]}

t.test('valueAtPath', async (tt) => {
  await tt.test('no parts', async (ttt) => {
    const value = await valueAtPath(fromJS(obj), [])
    ttt.same(value, obj)
  })

  await tt.test('one part', async (ttt) => {
    const value = await valueAtPath(fromJS(obj), ['left'])
    ttt.same(value, obj.left)
  })

  await tt.test('two parts', async (ttt) => {
    const value = await valueAtPath(fromJS(obj), ['left', 'a'])
    ttt.same(value, obj.left.a)
  })

  await tt.test('array and object', async (ttt) => {
    const value = await valueAtPath(fromJS(obj), ['right', 0, 'foo'])
    ttt.same(value, obj.right[0].foo)
  })

  await tt.test('array and sub-array', async (ttt) => {
    const value = await valueAtPath(fromJS(obj), ['right', 1, 0])
    ttt.same(value, obj.right[1][0])
  })

  await tt.test('array and sub-array and object', async (ttt) => {
    const value = await valueAtPath(fromJS(obj), ['right', 1, 0, 'bar'])
    ttt.same(value, obj.right[1][0].bar)
  })
})

t.test('startsWith', async (t) => {
  await t.test('empty path', async (t) => {
    t.ok(startsWith([], []))
  })

  await t.test('one entry path', async (t) => {
    t.ok(startsWith(['a'], ['a']), 'a')
    t.notOk(startsWith(['a'], ['b']), 'a')
    t.ok(startsWith(['a'], []), 'a')
    t.ok(startsWith([1], [1]), '[1]')
    t.notOk(startsWith([1], [2]), '[1]')
    t.ok(startsWith([1], []), '[1]')
  })

  await t.test('two entry path', async (t) => {
    t.ok(startsWith(['a', 'b'], ['a']), 'a.b')
    t.notOk(startsWith(['a', 'b'], ['b']), 'a.b')
    t.ok(startsWith(['a', 2], ['a']), 'a[2]')
    t.ok(startsWith(['a', 2], ['a', 2]), 'a[2]')
    t.notOk(startsWith(['a', 2], [2]), 'a[2]')
    t.notOk(startsWith(['a', 2], ['a', '2']), 'a[2]')
  })
})

t.test('diffKeyPaths', async (t) => {
  await t.test('diff basic values', async (t) => {
    const pairs = [
      {label: 'strings', a: 'a', b: 'b'},
      {label: 'booleans', a: true, b: false},
      {label: 'numbers', a: 1, b: 2},
      {
        label: 'dates',
        a: new DateTime(new Date(2000, 0, 1)),
        b: new DateTime(new Date(2000, 0, 2)),
      },
    ]

    for (const pair of pairs) {
      const result = await fromAsync(diffKeyPaths(fromJS(pair.a), fromJS(pair.b)))
      t.same(result, [[]], pair.label)
    }
  })

  await t.test('equal basic values', async (t) => {
    const pairs = [
      {label: 'strings', a: 'a', b: 'a'},
      {label: 'booleans', a: true, b: true},
      {label: 'numbers', a: 1, b: 1},
      {
        label: 'dates',
        a: new DateTime(new Date(2000, 0, 1)),
        b: new DateTime(new Date(2000, 0, 1)),
      },
    ]

    for (const pair of pairs) {
      const result = await fromAsync(diffKeyPaths(fromJS(pair.a), fromJS(pair.b)))
      t.same(result, [], pair.label)
    }
  })

  await t.test('diff object values', async (t) => {
    const pairs = [
      {label: 'nested', a: {x: 1}, b: {x: 2}, expected: [['x']]},
      {label: 'nested two deep', a: {x: {y: 1}}, b: {x: {y: 2}}, expected: [['x', 'y']]},
      {label: 'nested, partly equal', a: {x: 1, y: 3}, b: {x: 2, y: 3}, expected: [['x']]},
      {label: 'nested, two diff', a: {x: 1, y: 3}, b: {x: 2, y: 4}, expected: [['x'], ['y']]},
    ]

    for (const pair of pairs) {
      const result = await fromAsync(diffKeyPaths(fromJS(pair.a), fromJS(pair.b)))
      t.same(result, pair.expected, pair.label)
    }
  })

  await t.test('equal object values', async (t) => {
    const pairs = [
      {label: 'empty', a: {}, b: {}},
      {label: 'nested', a: {x: 1}, b: {x: 1}},
      {label: 'nested two deep', a: {x: {y: 1}}, b: {x: {y: 1}}},
      {label: 'nested, two equal', a: {x: 1, y: 3}, b: {x: 1, y: 3}},
      {label: 'nested, two deep', a: {x: 1, y: {z: 2}}, b: {x: 1, y: {z: 2}}},
    ]

    for (const pair of pairs) {
      const result = await fromAsync(diffKeyPaths(fromJS(pair.a), fromJS(pair.b)))
      t.same(result, [], pair.label)
    }
  })

  await t.test('diff array values', async (t) => {
    const pairs = [
      {label: 'diff length', a: [1, 2], b: [1, 2, 3], expected: [[]]},
      {label: 'diff inside object', a: {foo: [1, 2]}, b: {foo: [1, 2, 3]}, expected: [['foo']]},
      {label: 'diff values', a: [1, 2], b: [3, 4], expected: [[0], [1]]},
      {
        label: 'diff nested',
        a: [1, [2, 3]],
        b: [1, [3, 4]],
        expected: [
          [1, 0],
          [1, 1],
        ],
      },
      {label: 'diff types', a: [1, '2'], b: ['1', 2], expected: [[0], [1]]},
    ]

    for (const pair of pairs) {
      const result = await fromAsync(diffKeyPaths(fromJS(pair.a), fromJS(pair.b)))
      t.same(result, pair.expected, pair.label)
    }
  })

  await t.test('equal array values', async (t) => {
    const pairs = [
      {label: 'simple', a: [1, 2, 3], b: [1, 2, 3]},
      {label: 'nested', a: [1, [2, 3]], b: [1, [2, 3]]},
      {label: 'empty', a: [], b: []},
    ]

    for (const pair of pairs) {
      const result = await fromAsync(diffKeyPaths(fromJS(pair.a), fromJS(pair.b)))
      t.same(result, [], pair.label)
    }
  })

  await t.test('diff stream values', async (t) => {
    async function* a() {
      yield fromJS(1)
      yield Promise.resolve(fromJS(2))
      yield fromJS(3)
    }
    async function* b() {
      yield fromJS(1)
      yield Promise.resolve(fromJS(2))
      yield fromJS(4)
    }

    const streamA = new StreamValue(a)
    const streamB = new StreamValue(b)
    const result = await fromAsync(diffKeyPaths(streamA, streamB))
    t.same(result, [[2]], 'streams')
  })

  await t.test('diff stream lengths', async (t) => {
    async function* a() {
      yield fromJS(1)
      yield fromJS(3)
    }
    async function* b() {
      yield fromJS(1)
      yield Promise.resolve(fromJS(2))
      yield fromJS(4)
    }

    const streamA = new StreamValue(a)
    const streamB = new StreamValue(b)
    const result = await fromAsync(diffKeyPaths(streamA, streamB))
    t.same(result, [[]], 'streams')
  })

  await t.test('equal stream values', async (t) => {
    async function* a() {
      yield fromJS(1)
      yield Promise.resolve(fromJS(2))
      yield fromJS(3)
    }
    async function* b() {
      yield fromJS(1)
      yield Promise.resolve(fromJS(2))
      yield fromJS(3)
    }

    const streamA = new StreamValue(a)
    const streamB = new StreamValue(b)
    const result = await fromAsync(diffKeyPaths(streamA, streamB))
    t.same(result, [], 'streams')
  })
})

async function fromAsync<T>(generator: AsyncGenerator<T>): Promise<Array<T>> {
  const result = Array<T>(0)

  let i = 0
  for await (const item of generator) {
    result[i] = item

    i++
  }

  return result
}
