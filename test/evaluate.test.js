const {evaluate, parse} = require('../src')

describe('Basic parsing', () => {
  test('Example query', async () => {
    let documents = [
      {_type: 'product', name: 'T-shirt'},
      {_type: 'product', name: 'Pants'},
      {_type: 'user', name: 'Bob'}
    ]
    let query = `*[_type == "product"]{name}`
    let tree = parse(query)

    let value = await evaluate(tree, {documents})
    let data = await value.get()
    expect(data).toStrictEqual([{name: 'T-shirt'}, {name: 'Pants'}])
  })

  test('Controlling this', async () => {
    let query = `@`
    let tree = parse(query)

    for (let root of [1, [1, 2], {"a": "b"}]) {
      let value = await evaluate(tree, {root})
      let data = await value.get()
      expect(data).toStrictEqual(root)
    }
  })
})
