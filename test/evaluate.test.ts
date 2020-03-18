import {evaluate, parse} from '../src'

describe('Basic parsing', () => {
  test('Example query', async () => {
    let dataset = [
      {_type: 'product', name: 'T-shirt'},
      {_type: 'product', name: 'Pants'},
      {_type: 'user', name: 'Bob'}
    ]
    let query = `*[_type == "product"]{name}`
    let tree = parse(query)

    let value = await evaluate(tree, {dataset})
    let data = await value.get()
    expect(data).toStrictEqual([{name: 'T-shirt'}, {name: 'Pants'}])
  })

  test('Controlling this', async () => {
    let query = `@`
    let tree = parse(query)

    for (let root of [1, [1, 2], {a: 'b'}]) {
      let value = await evaluate(tree, {root})
      let data = await value.get()
      expect(data).toStrictEqual(root)
    }
  })

  test('Re-using stream', async () => {
    let query = `[[1, 2], [1, 4]] | order(@[0], @[1] desc)`
    let tree = parse(query)
    let value = await evaluate(tree)
    let data = await value.get()
    expect(data).toStrictEqual([
      [1, 4],
      [1, 2]
    ])
  })

  test('Async documents', async () => {
    let dataset = (async function*() {
      yield {_id: 'a', name: 'Michael'}
      yield {_id: 'b', name: 'George Michael', father: {_ref: 'a'}}
    })()

    let query = `*[father->name == "Michael"][0].name`
    let tree = parse(query)
    let value = await evaluate(tree, {dataset})
    let data = await value.get()
    expect(data).toStrictEqual('George Michael')
  })

  test('Parameters', async () => {
    let query = `*[name == $name][].name`
    let dataset = [{name: 'Michael'}, {name: 'George Michael'}]
    let tree = parse(query)
    let value = await evaluate(tree, {dataset, params: {name: 'Michael'}})
    let data = await value.get()
    expect(data).toStrictEqual(['Michael'])
  })

  test('Non-array documents', async () => {
    let dataset = {data: [{person: {_ref: 'b'}}]}

    let query = `*.data{person->}`
    let tree = parse(query)
    let value = await evaluate(tree, {dataset})
    let data = await value.get()
    expect(data).toStrictEqual([{}])
  })

  test('Slices', async () => {
    let dataset = ['a', 'b', 'c', 'd', 'e', 'f']

    let query = `*[0...5][0..3]`
    let tree = parse(query)
    let value = await evaluate(tree, {dataset})
    let data = await value.get()
    expect(data).toStrictEqual(['a', 'b', 'c', 'd'])
  })

  test('Conditional', async () => {
    let dataset = [
      {_type: 'book', title: 'A Game of Thrones'},
      {_type: 'tv-show', title: 'Game of Thrones'}
    ]

    let query = `*[] {
      _type,
      _type == "book" => {
        title
      }
    }`
    let tree = parse(query)
    let value = await evaluate(tree, {dataset})
    let data = await value.get()
    expect(data).toStrictEqual([{_type: 'book', title: 'A Game of Thrones'}, {_type: 'tv-show'}])
  })

  test('Paths', async () => {
    let dataset = [
      {_id: 'drafts.agot', _type: 'book', title: 'A Game of Thrones'},
      {_id: 'agot', _type: 'book', title: 'Game of Thrones'}
    ]

    let query = `*[_id in path("drafts.**")]{_id}`
    let tree = parse(query)
    let value = await evaluate(tree, {dataset})
    let data = await value.get()
    expect(data).toStrictEqual([{_id: 'drafts.agot'}])
  })
})
