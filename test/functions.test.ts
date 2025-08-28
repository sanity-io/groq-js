import t from 'tap'

import {evaluate, parse} from '../src/1'
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
    t.test('with empty before/after unchanged selector', async (t) => {
      const tree = parse('diff::changedOnly({}, {}, foo)')
      const result = await evaluate(tree)
      t.ok((await result.get()) === true, 'result should be `true`')
    })

    t.test('with scalar before/after and unchanged selector', async (t) => {
      const tree = parse('diff::changedOnly(1, 2, foo)')
      const result = await evaluate(tree)
      t.ok((await result.get()) === false, 'result should be `false`')
    })

    t.test('with unchanged selector', async (t) => {
      const tree = parse('diff::changedOnly({"foo": 1}, {"foo": 1}, foo)')
      const result = await evaluate(tree)
      t.ok((await result.get()) === true, 'result should be `true`')
    })

    t.test('with changed selector', async (t) => {
      const tree = parse('diff::changedOnly({"foo": 1}, {"foo": 2}, foo)')
      const result = await evaluate(tree)
      t.ok((await result.get()) === true, 'result should be `true`')
    })

    t.test('with changed selector', async (t) => {
      const tree = parse('diff::changedOnly({"foo": {"bar": 1}}, {"foo": {"bar": 2}}, foo.bar)')
      const result = await evaluate(tree)
      t.ok((await result.get()) === true, 'result should be `true`')
    })

    t.test('with change not in selector, selector not defined', async (t) => {
      const tree = parse('diff::changedOnly({"foo": 1}, {"foo": 2}, bar)')
      const result = await evaluate(tree)
      t.ok((await result.get()) === false, 'result should be `false`')
    })

    t.test('with change not in selector, long selector not defined', async (t) => {
      const tree = parse('diff::changedOnly({"foo": 1}, {"foo": 2}, foo.bar)')
      const result = await evaluate(tree)
      t.ok((await result.get()) === false, 'result should be `false`')
    })

    t.test('with change not in selector', async (t) => {
      const tree = parse('diff::changedOnly({"foo": 1, "bar": 3}, {"foo": 2, "bar": 3}, bar)')
      const result = await evaluate(tree)
      t.ok((await result.get()) === false, 'result should be `false`')
    })

    t.test('with change in selector and not in selector', async (t) => {
      const tree = parse('diff::changedOnly({"foo": 1, "bar": 3}, {"foo": 2, "bar": 4}, bar)')
      const result = await evaluate(tree)
      t.ok((await result.get()) === false, 'result should be `false`')
    })

    t.test('with change only in selector', async (t) => {
      const tree = parse('diff::changedOnly({"foo": 1, "bar": 3}, {"foo": 1, "bar": 4}, bar)')
      const result = await evaluate(tree)
      t.ok((await result.get()) === true, 'result should be `true`')
    })

    t.test('with change only in nested selector', async (t) => {
      const tree = parse('diff::changedOnly({"foo": {"bar": 3}}, {"foo": {"bar": 4}}, foo.bar)')
      const result = await evaluate(tree)
      t.ok((await result.get()) === true, 'result should be `true`')
    })

    t.test('with change only in tuple selector', async (t) => {
      const tree = parse(
        'diff::changedOnly({"foo": {"bar": 3}}, {"foo": {"bar": 4}}, (foo, foo.bar))',
      )
      const result = await evaluate(tree)
      t.ok((await result.get()) === true, 'result should be `true`')
    })

    t.test('with change in child of tuple selector', async (t) => {
      const tree = parse(
        'diff::changedOnly({"foo": {"bar": 3, "baz": 5}}, {"foo": {"bar": 4, "baz": 6}}, (foo, foo.bar))',
      )
      const result = await evaluate(tree)
      t.ok((await result.get()) === true, 'result should be `true`')
    })
  })

  t.test('diff::changedAny()', async (t) => {
    t.test('with empty before/after', async (t) => {
      const tree = parse('diff::changedAny({}, {}, foo)')
      const result = await evaluate(tree)
      t.ok((await result.get()) === false, 'result should be `false`')
    })

    t.test('with matching before/after', async (t) => {
      const tree = parse('diff::changedAny({"foo": "bar"}, {"foo": "bar"}, foo)')
      const result = await evaluate(tree)
      t.ok((await result.get()) === false, 'result should be `false`')
    })

    t.test('with different before/after but matched selector', async (t) => {
      const tree = parse(
        'diff::changedAny({"foo": "bar", "fizz": "bazz"}, {"foo": "bar", "fizz": "buzz"}, foo)',
      )
      const result = await evaluate(tree)
      t.ok((await result.get()) === false, 'result should be `false`')
    })

    t.test('with different before/after and differing selector', async (t) => {
      const tree = parse(
        'diff::changedAny({"foo": "bar", "fizz": "bazz"}, {"foo": "car", "fizz": "buzz"}, foo)',
      )
      const result = await evaluate(tree)
      t.ok((await result.get()) === true, 'result should be `true`')
    })
  })
})
