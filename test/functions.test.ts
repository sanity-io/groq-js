import {evaluate, parse} from '../src'

describe('Functions', () => {
  describe('now()', () => {
    test('returns iso-8601 timestamp', async () => {
      const tree = parse('now()')
      const value = await evaluate(tree, {dataset: []})
      const data = await value.get()

      expect(typeof data).toBe('string')

      // Allow a ~5s shift to account for lag
      expect(Date.parse(data)).toBeGreaterThan(Date.now() - 5000)
    })

    test('returns the same value for each use in query', async () => {
      const dataset = [
        {_type: 'product', deep: {deep: {deep: {deep: {deep: {deep: {text: 'value'}}}}}}}
      ]
      const query = `{
        "topTime": now(),
        "deep": *[_type == "product"][0].deep.deep.deep.deep.deep.deep { text, "time": now() }
      }`
      const tree = parse(query)
      const value = await evaluate(tree, {dataset})
      const data = await value.get()
      expect(data.deep.time).toStrictEqual(data.topTime)
    })

    test('throws is passing arguments', async () => {
      const tree = parse('now("foo")')
      return expect(evaluate(tree, {dataset: []})).rejects.toThrow('now: no arguments are allowed')
    })
  })
})
