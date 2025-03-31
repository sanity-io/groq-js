import t from 'tap'

import {parse} from '../src/parser/parser'
import {evaluateQuery as evaluate} from '../src/evaluator/evaluate'
import {throwsWithMessage} from './testUtils'

t.test('Functions', async (t) => {
  t.test('now()', async (t) => {
    t.test('returns iso-8601 timestamp', async (t) => {
      const tree = parse('now()')
      const value = await evaluate(tree, {dataset: []})
      const data = await value.get()

      t.type(data, 'string')

      // Allow a ~5s shift to account for lag
      t.ok(Date.parse(data) > Date.now() - 5000)
    })

    t.test('returns the same value for each use in query', async (t) => {
      const dataset = [
        {_type: 'product', deep: {deep: {deep: {deep: {deep: {deep: {text: 'value'}}}}}}},
      ]
      const query = `{
        "topTime": now(),
        "deep": *[_type == "product"][0].deep.deep.deep.deep.deep.deep { text, "time": now() }
      }`
      const tree = parse(query)
      const value = await evaluate(tree, {dataset})
      const data = await value.get()
      t.same(data.deep.time, data.topTime)
    })
  })

  t.test('dateTime::now()', async (t) => {
    t.test('returns the same value as dateTime(now())', async (t) => {
      const query = `{"a": dateTime(now()), "b": dateTime::now()}`
      const tree = parse(query)
      const value = await evaluate(tree)
      const data = await value.get()
      t.same(data.a, data.b)
    })

    t.test('is a dateTime object', async (t) => {
      // This is not possible with `now()`:
      const query = `string(dateTime::now() + 1000)`
      const tree = parse(query)
      const value = await evaluate(tree)
      const data = await value.get()
      t.type(data, 'string')
    })
  })

  t.test('upper()', async (t) => {
    t.test('uppercases the given string', async (t) => {
      const tree = parse('upper("abc")')
      const value = await evaluate(tree, {})
      const data = await value.get()
      t.same(data, 'ABC')
    })

    t.test('returns null when target is not a string', async (t) => {
      const tree = parse('upper(1)')
      const value = await evaluate(tree, {})
      const data = await value.get()
      t.same(data, null)
    })
  })

  t.test('lower()', async (t) => {
    t.test('lowercases the given string', async (t) => {
      const tree = parse('lower("ABC")')
      const value = await evaluate(tree, {})
      const data = await value.get()
      t.same(data, 'abc')
    })

    t.test('returns null when target is not a string', async (t) => {
      const tree = parse('lower(1)')
      const value = await evaluate(tree, {})
      const data = await value.get()
      t.same(data, null)
    })
  })

  t.test('startsWith()', async (t) => {
    t.test('returns true if string starts with given prefix', async (t) => {
      const tree = parse('string::startsWith("alphabet", "alpha")')
      const value = await evaluate(tree, {})
      const data = await value.get()
      t.same(data, true)
    })

    t.test('returns false if string does not with given prefix', async (t) => {
      const tree = parse('string::startsWith("alphabet", "beta")')
      const value = await evaluate(tree, {})
      const data = await value.get()
      t.same(data, false)
    })

    t.test('returns null when prefix term is not a string', async (t) => {
      const tree = parse('string::startsWith("alphabet", 1)')
      const value = await evaluate(tree, {})
      const data = await value.get()
      t.same(data, null)
    })

    t.test('returns null when search term is not a string', async (t) => {
      const tree = parse('string::startsWith(1, "alpha")')
      const value = await evaluate(tree, {})
      const data = await value.get()
      t.same(data, null)
    })
  })

  t.test('score()', async (t) => {
    t.test('returns null when base is not an array', async (t) => {
      const tree = parse('* | score(title match "Red" || title match "Fish")')
      const value = await evaluate(tree, {})
      const data = await value.get()
      t.same(data, null)
    })

    t.test('evaluates scores as expected', async (t) => {
      const dataset = [{title: 'Green Turtle'}, {title: 'Red Fish'}]
      const expectedData = [
        {title: 'Red Fish', _score: 1},
        {title: 'Green Turtle', _score: 0},
      ]

      const tree = parse('*[] | score(title match "Red")')
      const value = await evaluate(tree, {dataset})
      const data = await value.get()
      t.same(data, expectedData)
    })

    t.test('ignores documents that are not objects', async (t) => {
      const dataset = [1, 'string', {title: 'Green Turtle'}, {title: 'Red Fish'}]
      const expectedData = [
        {title: 'Red Fish', _score: 1},
        {title: 'Green Turtle', _score: 0},
      ]

      const tree = parse('*[] | score(title match "Red")')
      const value = await evaluate(tree, {dataset})
      const data = await value.get()
      t.same(data, expectedData)
    })
  })

  t.test('delta::changedOnly()', async (t) => {
    t.test('with delta mode enabled', async (t) => {
      t.test('throws `not implemented` error', async (t) => {
        const tree = parse('delta::changedOnly(foo)', {mode: 'delta'})
        throwsWithMessage(t, async () => await evaluate(tree, {}), 'not implemented')
      })
    })

    t.test('without delta mode enabled', async (t) => {
      t.test('throws `Undefined function` error', async (t) => {
        throwsWithMessage(
          t,
          () => parse('delta::changedOnly(foo)'),
          'Undefined function: changedOnly',
        )
      })
    })
  })

  t.test('delta::changedAny()', async (t) => {
    t.test('with delta mode enabled', async (t) => {
      t.test('throws `not implemented` error', async (t) => {
        const tree = parse('delta::changedAny(foo)', {mode: 'delta'})
        throwsWithMessage(t, async () => await evaluate(tree, {}), 'not implemented')
      })
    })

    t.test('without delta mode enabled', async (t) => {
      t.test('throws `Undefined function` error', async (t) => {
        throwsWithMessage(
          t,
          () => parse('delta::changedAny(foo)'),
          'Undefined function: changedAny',
        )
      })
    })
  })

  t.test('diff::changedOnly()', async (t) => {
    t.test('throws `not implemented` error', async (t) => {
      const tree = parse('diff::changedOnly({}, {}, foo)')
      throwsWithMessage(t, async () => await evaluate(tree, {}), 'not implemented')
    })
  })

  t.test('diff::changedAny()', async (t) => {
    t.test('throws `not implemented` error', async (t) => {
      const tree = parse('diff::changedAny({}, {}, foo)')
      throwsWithMessage(t, async () => await evaluate(tree, {}), 'not implemented')
    })
  })
})
