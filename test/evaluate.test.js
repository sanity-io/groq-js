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

    let data = await evaluate(tree, {documents}).get()
    expect(data).toStrictEqual([{name: 'T-shirt'}, {name: 'Pants'}])
  })
})
