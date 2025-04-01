import t from 'tap'

import {parse} from '../src/parser/parser'
import {evaluate} from '../src/evaluator/evaluate'
import {DateTime, toJS} from '../src/values/utils'
import {throwsWithMessage} from './testUtils'

t.test('Functions', (t) => {
  t.test('now()', (t) => {
    t.test('returns iso-8601 timestamp', (t) => {
      const tree = parse('now()')
      const value = evaluate(tree, {dataset: []})
      const data = toJS(value)

      t.type(data, 'string')

      // Allow a ~5s shift to account for lag
      t.ok(Date.parse(data as string) > Date.now() - 5000)
      t.end()
    })

    t.test('returns the same value for each use in query', (t) => {
      const dataset = [
        {_type: 'product', deep: {deep: {deep: {deep: {deep: {deep: {text: 'value'}}}}}}},
      ]
      const query = `{
        "topTime": now(),
        "deep": *[_type == "product"][0].deep.deep.deep.deep.deep.deep { text, "time": now() }
      }`
      const tree = parse(query)
      const value = evaluate(tree, {dataset})
      const data = toJS(value)
      t.same((data as {deep: {time: string}}).deep.time, (data as {topTime: string}).topTime)
      t.end()
    })
    t.end()
  })

  t.test('dateTime::now()', (t) => {
    t.test('returns the same value as dateTime(now())', (t) => {
      const query = `{"a": dateTime(now()), "b": dateTime::now()}`
      const tree = parse(query)
      const value = evaluate(tree)
      t.same((value as {a: DateTime}).a, (value as {b: DateTime}).b)
      t.end()
    })

    t.test('is a dateTime object', (t) => {
      // This is not possible with `now()`:
      const query = `string(dateTime::now() + 1000)`
      const tree = parse(query)
      const value = evaluate(tree)
      const data = toJS(value)
      t.type(data, 'string')
      t.end()
    })
    t.end()
  })

  t.test('upper()', (t) => {
    t.test('uppercases the given string', (t) => {
      const tree = parse('upper("abc")')
      const value = evaluate(tree, {})
      const data = toJS(value)
      t.same(data, 'ABC')
      t.end()
    })

    t.test('returns null when target is not a string', (t) => {
      const tree = parse('upper(1)')
      const value = evaluate(tree, {})
      const data = toJS(value)
      t.same(data, null)
      t.end()
    })
    t.end()
  })

  t.test('lower()', (t) => {
    t.test('lowercases the given string', (t) => {
      const tree = parse('lower("ABC")')
      const value = evaluate(tree, {})
      const data = toJS(value)
      t.same(data, 'abc')
      t.end()
    })

    t.test('returns null when target is not a string', (t) => {
      const tree = parse('lower(1)')
      const value = evaluate(tree, {})
      const data = toJS(value)
      t.same(data, null)
      t.end()
    })
    t.end()
  })

  t.test('startsWith()', (t) => {
    t.test('returns true if string starts with given prefix', (t) => {
      const tree = parse('string::startsWith("alphabet", "alpha")')
      const value = evaluate(tree, {})
      const data = toJS(value)
      t.same(data, true)
      t.end()
    })

    t.test('returns false if string does not with given prefix', (t) => {
      const tree = parse('string::startsWith("alphabet", "beta")')
      const value = evaluate(tree, {})
      const data = toJS(value)
      t.same(data, false)
      t.end()
    })

    t.test('returns null when prefix term is not a string', (t) => {
      const tree = parse('string::startsWith("alphabet", 1)')
      const value = evaluate(tree, {})
      const data = toJS(value)
      t.same(data, null)
      t.end()
    })

    t.test('returns null when search term is not a string', (t) => {
      const tree = parse('string::startsWith(1, "alpha")')
      const value = evaluate(tree, {})
      const data = toJS(value)
      t.same(data, null)
      t.end()
    })
    t.end()
  })

  t.test('score()', (t) => {
    t.test('returns null when base is not an array', (t) => {
      const tree = parse('* | score(title match "Red" || title match "Fish")')
      // purposefully pass null as the dataset
      const value = evaluate(tree, {dataset: null as unknown as Iterable<unknown>})
      const data = toJS(value)
      t.same(data, null)
      t.end()
    })

    t.test('evaluates scores as expected', (t) => {
      const dataset = [{title: 'Green Turtle'}, {title: 'Red Fish'}]
      const expectedData = [
        {title: 'Red Fish', _score: 1},
        {title: 'Green Turtle', _score: 0},
      ]

      const tree = parse('*[] | score(title match "Red")')
      const value = evaluate(tree, {dataset})
      const data = toJS(value)
      t.same(data, expectedData)
      t.end()
    })

    t.test('ignores documents that are not objects', (t) => {
      const dataset = [1, 'string', {title: 'Green Turtle'}, {title: 'Red Fish'}]
      const expectedData = [
        {title: 'Red Fish', _score: 1},
        {title: 'Green Turtle', _score: 0},
      ]

      const tree = parse('*[] | score(title match "Red")')
      const value = evaluate(tree, {dataset})
      const data = toJS(value)
      t.same(data, expectedData)
      t.end()
    })
    t.end()
  })

  t.test('delta::changedOnly()', (t) => {
    t.test('with delta mode enabled', (t) => {
      t.test('throws `not implemented` error', (t) => {
        const tree = parse('delta::changedOnly(foo)', {mode: 'delta'})
        throwsWithMessage(t, () => evaluate(tree, {}), 'not implemented')
        t.end()
      })
      t.end()
    })

    t.test('without delta mode enabled', (t) => {
      t.test('throws `Undefined function` error', (t) => {
        throwsWithMessage(
          t,
          () => parse('delta::changedOnly(foo)'),
          'Undefined function: changedOnly',
        )
        t.end()
      })
      t.end()
    })
    t.end()
  })

  t.test('delta::changedAny()', (t) => {
    t.test('with delta mode enabled', (t) => {
      t.test('throws `not implemented` error', (t) => {
        const tree = parse('delta::changedAny(foo)', {mode: 'delta'})
        throwsWithMessage(t, () => evaluate(tree, {}), 'not implemented')
        t.end()
      })
      t.end()
    })

    t.test('without delta mode enabled', (t) => {
      t.test('throws `Undefined function` error', (t) => {
        throwsWithMessage(
          t,
          () => parse('delta::changedAny(foo)'),
          'Undefined function: changedAny',
        )
        t.end()
      })
      t.end()
    })
    t.end()
  })

  t.test('diff::changedOnly()', (t) => {
    t.test('throws `not implemented` error', (t) => {
      const tree = parse('diff::changedOnly({}, {}, foo)')
      throwsWithMessage(t, () => evaluate(tree, {}), 'not implemented')
      t.end()
    })
    t.end()
  })

  t.test('diff::changedAny()', (t) => {
    t.test('throws `not implemented` error', (t) => {
      const tree = parse('diff::changedAny({}, {}, foo)')
      throwsWithMessage(t, () => evaluate(tree, {}), 'not implemented')
      t.end()
    })
    t.end()
  })
  t.end()
})
