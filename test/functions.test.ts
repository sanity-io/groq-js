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

  describe('references()', () => {
    test('returns true for object with matching reference (shallow)', async () => {
      const book = {_type: 'book', author: {_ref: 'grrm'}}
      const query = `*[references('grrm')][0]`
      const tree = parse(query)
      const value = await evaluate(tree, {dataset: [book]})
      const data = await value.get()
      expect(data).toEqual(book)
    })

    test('returns false for object with no matching reference (shallow)', async () => {
      const book = {_type: 'book', author: {_ref: 'grrm'}}
      const query = `*[references('jrr-tolkien')][0]`
      const tree = parse(query)
      const value = await evaluate(tree, {dataset: [book]})
      const data = await value.get()
      expect(data).toStrictEqual(null)
    })

    test('returns true for object with matching reference (deep)', async () => {
      const movie = {_type: 'movie', deep: {deep: {deep: [{deep: {deep: {_ref: 'impact'}}}]}}}
      const query = `*[references("impact")][0]`
      const tree = parse(query)
      const value = await evaluate(tree, {dataset: [movie]})
      const data = await value.get()
      expect(data).toEqual(movie)
    })

    test('returns false for object with no matching reference (deep)', async () => {
      const movie = {_type: 'movie', deep: {deep: {deep: [{deep: {deep: {_ref: 'focus'}}}]}}}
      const query = `*[references("impact")][0]`
      const tree = parse(query)
      const value = await evaluate(tree, {dataset: [movie]})
      const data = await value.get()
      expect(data).toStrictEqual(null)
    })
  })
})
