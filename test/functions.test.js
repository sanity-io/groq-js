const {evaluate, parse} = require('../src')

describe('Functions', () => {
  describe('now()', () => {
    test('returns iso-8601 timestamp', async () => {
      let tree = parse('now()')
      let value = await evaluate(tree, {dataset: []})
      let data = await value.get()

      expect(typeof data).toBe('string')

      // Allow a ~5s shift to account for lag
      expect(Date.parse(data)).toBeGreaterThan(Date.now() - 5000)
    })

    test('returns the same value for each use in query', async () => {
      let dataset = [
        {_type: 'product', deep: {deep: {deep: {deep: {deep: {deep: {text: 'value'}}}}}}}
      ]
      let query = `{
        "topTime": now(),
        "deep": *[_type == "product"][0].deep.deep.deep.deep.deep.deep { text, "time": now() }
      }`
      let tree = parse(query)
      let value = await evaluate(tree, {dataset})
      let data = await value.get()
      expect(data.deep.time).toStrictEqual(data.topTime)
    })

    test('throws is passing arguments', async () => {
      let tree = parse('now("foo")')
      return expect(evaluate(tree, {dataset: []})).rejects.toThrow('now: no arguments are allowed')
    })
  })
})
