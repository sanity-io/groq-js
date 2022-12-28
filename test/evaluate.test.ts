import t from 'tap'

import {evaluate, parse} from '../src/1'
import {ExprNode} from '../src/nodeTypes'
import {throwsWithMessage} from './testUtils'

t.test('Basic parsing', async (t) => {
  t.test('Example query', async (t) => {
    const dataset = [
      {_type: 'product', name: 'T-shirt'},
      {_type: 'product', name: 'Pants'},
      {_type: 'user', name: 'Bob'},
    ]
    const query = `*[_type == "product"]{name}`
    const tree = parse(query)

    const value = await evaluate(tree, {dataset})
    const data = await value.get()
    t.same(data, [{name: 'T-shirt'}, {name: 'Pants'}])
  })

  t.test('String function', async (t) => {
    const dataset = [
      {_type: 'color', color: 'red', shade: 500, rgb: {r: 255, g: 0, b: 0}},
      {_type: 'color', color: 'green', shade: 500, rgb: {r: 0, g: 255, b: 0}},
    ]
    const query = `*[_type == "color"]{ "class": color + "-" + string(shade + 100), "rgb": string(rgb) }`
    const tree = parse(query)

    const value = await evaluate(tree, {dataset})
    const data = await value.get()
    t.same(data, [
      {class: 'red-600', rgb: null},
      {class: 'green-600', rgb: null},
    ])
  })

  t.test('In-range', async (t) => {
    const dataset = [
      {_id: 'a', val: 1},
      {_id: 'b', val: 5},
      {_id: 'c', val: 3},
    ]
    const query = `*[val in 1..3]._id`
    const tree = parse(query)

    const value = await evaluate(tree, {dataset})
    const data = await value.get()
    t.same(data, ['a', 'c'])
  })

  t.test('select() function', async (t) => {
    const dataset = [{_id: 'a', a: true}, {_id: 'b', b: true}, {_id: 'c'}]
    const query = `*{"a":select(a => 1, b => 2, 3)}.a`
    const tree = parse(query)

    const value = await evaluate(tree, {dataset})
    const data = await value.get()
    t.same(data, [1, 2, 3])
  })

  t.test('Controlling this', async (t) => {
    const query = `@`
    const tree = parse(query)

    for (const root of [1, [1, 2], {a: 'b'}]) {
      const value = await evaluate(tree, {root})
      const data = await value.get()
      t.same(data, root)
    }
  })

  t.test('Re-using stream', async (t) => {
    const query = `[[1, 2], [1, 4]] | order(@[0], @[1] desc)`
    const tree = parse(query)
    const value = await evaluate(tree)
    const data = await value.get()
    t.same(data, [
      [1, 4],
      [1, 2],
    ])
  })

  t.test('Async documents', async (t) => {
    const dataset = (async function* () {
      yield {_id: 'a', name: 'Michael'}
      yield {_id: 'b', name: 'George Michael', father: {_ref: 'a'}}
    })()

    const query = `*[father->name == "Michael"][0].name`
    const tree = parse(query)
    const value = await evaluate(tree, {dataset})
    const data = await value.get()
    t.same(data, 'George Michael')
  })

  t.test('Parameters', async (t) => {
    const query = `*[name == $name][].name`
    const dataset = [{name: 'Michael'}, {name: 'George Michael'}]
    const tree = parse(query)
    const value = await evaluate(tree, {dataset, params: {name: 'Michael'}})
    const data = await value.get()
    t.same(data, ['Michael'])
  })

  t.test('Non-array documents', async (t) => {
    const dataset = {data: [{person: {_ref: 'b'}}]}

    const query = `(*).data[]{person->}`
    const tree = parse(query)
    const value = await evaluate(tree, {dataset})
    const data = await value.get()
    t.same(data, [{person: null}])
  })

  t.test('Slices', async (t) => {
    const dataset = ['a', 'b', 'c', 'd', 'e', 'f']

    const query = `*[0...5][0..3]`
    const tree = parse(query)
    const value = await evaluate(tree, {dataset})
    const data = await value.get()
    t.same(data, ['a', 'b', 'c', 'd'])
  })

  t.test('Conditional', async (t) => {
    const dataset = [
      {_type: 'book', title: 'A Game of Thrones'},
      {_type: 'tv-show', title: 'Game of Thrones'},
    ]

    const query = `*[] {
      _type,
      _type == "book" => {
        title
      }
    }`
    const tree = parse(query)
    const value = await evaluate(tree, {dataset})
    const data = await value.get()
    t.same(data, [{_type: 'book', title: 'A Game of Thrones'}, {_type: 'tv-show'}])
  })

  t.test('Asc', async (t) => {
    t.test('returns a null value', async (t) => {
      const tree: ExprNode = {type: 'Asc', base: {type: 'AccessAttribute', name: 'title'}}
      const value = await evaluate(tree, {})
      const data = await value.get()
      t.same(data, null)
    })
  })

  t.test('Desc', async (t) => {
    t.test('returns a null value', async (t) => {
      const tree: ExprNode = {type: 'Desc', base: {type: 'AccessAttribute', name: 'title'}}
      const value = await evaluate(tree, {})
      const data = await value.get()
      t.same(data, null)
    })
  })

  t.test('Tuples', async (t) => {
    t.test('throw errors on evaluation', async (t) => {
      const tree = parse('(foo, bar)')
      throwsWithMessage(t, () => evaluate(tree, {}), 'tuples can not be evaluated')
    })
  })

  t.test('Objects', async (t) => {
    t.test('throw errors when the node type is unknown', async (t) => {
      const tree: ExprNode = {
        type: 'Object',
        // @ts-ignore (we want an invalid type for testing purposes)
        attributes: [{type: 'AccessAttribute', name: 'b'}],
      }

      throwsWithMessage(t, () => evaluate(tree, {}), 'Unknown node type: AccessAttribute')
    })
  })

  t.test('OpCall', async (t) => {
    t.test('throws when an invalid operator function is used', async (t) => {
      const tree: ExprNode = {
        type: 'OpCall',
        // @ts-ignore (we want an invalid operator for testing purposes)
        op: '^',
        left: {type: 'AccessAttribute', name: 'a'},
        right: {type: 'AccessAttribute', name: 'b'},
      }

      throwsWithMessage(t, () => evaluate(tree, {}), 'Unknown operator: ^')
    })
  })

  t.test('Parent', async (t) => {
    t.test('returns null when no parent is present', async (t) => {
      const dataset = [{_type: 'book', title: 'I, Robot'}]

      // We intentionally access the higher scope to force the case when the scope's `parent` value is `null`
      const tree = await parse('*[]{"parentName": ^.^.name}')
      const value = await evaluate(tree, {dataset})
      const data = await value.get()

      t.same(data, [{parentName: null}])
    })
  })

  t.test('Context', async (t) => {
    t.test('throws when an unknown key is used', async (t) => {
      const tree: ExprNode = {type: 'Context', key: 'foo'}
      throwsWithMessage(t, () => evaluate(tree, {}), 'unknown context key: foo')
    })
  })

  t.test('Paths', async (t) => {
    const dataset = [
      {_id: 'drafts.agot', _type: 'book', title: 'A Game of Thrones'},
      {_id: 'agot', _type: 'book', title: 'Game of Thrones'},
    ]

    const query = `*[_id in path("drafts.**")]{_id}`
    const tree = parse(query)
    const value = await evaluate(tree, {dataset})
    const data = await value.get()
    t.same(data, [{_id: 'drafts.agot'}])
  })

  t.test('Delta-GROQ', async (t) => {
    const tree = parse(`before().title == after().title`, {mode: 'delta'})
    const value1 = await evaluate(tree, {before: {title: 'A'}, after: {title: 'A'}})
    t.same(await value1.get(), true)

    const value2 = await evaluate(tree, {before: {title: 'A'}, after: {title: 'B'}})
    t.same(await value2.get(), false)
  })

  t.test('delta::operation()', async (t) => {
    const tree = parse(`delta::operation()`, {mode: 'delta'})
    const value1 = await evaluate(tree, {before: {title: 'A'}, after: {title: 'A'}})
    t.same(await value1.get(), 'update')

    const value2 = await evaluate(tree, {before: {title: 'A'}})
    t.same(await value2.get(), 'delete')

    const value3 = await evaluate(tree, {after: {title: 'A'}})
    t.same(await value3.get(), 'create')

    const value4 = await evaluate(tree, {})
    t.same(await value4.get(), null)
  })

  t.test('Override identity()', async (t) => {
    const dataset = [{_id: 'yes', user: 'me'}]
    const query = `{"me":identity(), "nested": *[user == "me"][0]._id}`
    const tree = parse(query)
    const value = await evaluate(tree, {dataset, identity: 'bob'})
    const data = await value.get()
    t.same(data, {me: 'bob', nested: 'yes'})
  })

  t.test('Override now()', async (t) => {
    const dataset = [{_id: 'yes', time: '2021-05-06T12:14:15Z'}]
    const query = `{"me":now(), "nested": *[dateTime(time) == dateTime(now())][0]._id}`
    const tree = parse(query)
    const value = await evaluate(tree, {dataset, timestamp: new Date('2021-05-06T12:14:15Z')})
    const data = await value.get()
    t.same(data, {me: '2021-05-06T12:14:15.000Z', nested: 'yes'})
  })

  t.test('sanity-functions default', async (t) => {
    const query = `sanity::dataset() + sanity::projectId()`
    const tree = parse(query)
    const value = await evaluate(tree)
    const data = await value.get()
    t.same(data, null)
  })

  t.test('sanity-functions', async (t) => {
    const query = `sanity::dataset() + sanity::projectId()`
    const tree = parse(query)
    const value = await evaluate(tree, {sanity: {dataset: 'abc', projectId: 'def'}})
    const data = await value.get()
    t.same(data, 'abcdef')
  })
})
