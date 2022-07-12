import {evaluate, parse} from '../src'

import t from 'tap'

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

  t.test('diff extension', async (t) => {
    t.test('throws when passed invalid selector names', async (t) => {
      const queriesWithInvalidSelectors = [
        'diff::changedAny(a, b, true)',
        'diff::changedAny(a, b, false)',
        'diff::changedAny(a, b, null)',
        'diff::changedOnly(a, b, true)',
        'diff::changedOnly(a, b, false)',
        'diff::changedOnly(a, b, null)',
      ]

      queriesWithInvalidSelectors.forEach((query) => {
        const tree = parse(query)
        try {
          evaluate(tree, {dataset: []})
        } catch (error: any) {
          t.same(error.name, 'Error')
          t.same(error.message, 'Invalid selector')
        }
      })
    })
  })
})
