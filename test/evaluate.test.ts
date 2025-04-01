import t from 'tap'

import {type ExprNode, type Value} from '../src/nodeTypes'
import {parse} from '../src/parser/parser'
import {evaluate} from '../src/evaluator/evaluate'
import {toJS} from '../src/values/utils'
import {type EvaluateContext} from '../src/types'
import {throwsWithMessage} from './testUtils'

t.test('Basic parsing', (t) => {
  t.test('Example query', (t) => {
    const dataset = [
      {_type: 'product', name: 'T-shirt'},
      {_type: 'product', name: 'Pants'},
      {_type: 'user', name: 'Bob'},
    ]
    const query = `*[_type == "product"]{name}`
    const tree = parse(query)

    const value = evaluate(tree, {dataset})
    const data = toJS(value)
    t.same(data, [{name: 'T-shirt'}, {name: 'Pants'}])
    t.end()
  })

  t.test('String function', (t) => {
    const dataset = [
      {_type: 'color', color: 'red', shade: 500, rgb: {r: 255, g: 0, b: 0}},
      {_type: 'color', color: 'green', shade: 500, rgb: {r: 0, g: 255, b: 0}},
    ]
    const query = `*[_type == "color"]{ "class": color + "-" + string(shade + 100), "rgb": string(rgb) }`
    const tree = parse(query)

    const value = evaluate(tree, {dataset})
    const data = toJS(value)
    t.same(data, [
      {class: 'red-600', rgb: null},
      {class: 'green-600', rgb: null},
    ])
    t.end()
  })

  t.test('In-range', (t) => {
    const dataset = [
      {_id: 'a', val: 1},
      {_id: 'b', val: 5},
      {_id: 'c', val: 3},
    ]
    const query = `*[val in 1..3]._id`
    const tree = parse(query)

    const value = evaluate(tree, {dataset})
    const data = toJS(value)
    t.same(data, ['a', 'c'])
    t.end()
  })

  t.test('select() function', (t) => {
    const dataset = [{_id: 'a', a: true}, {_id: 'b', b: true}, {_id: 'c'}]
    const query = `*{"a":select(a => 1, b => 2, 3)}.a`
    const tree = parse(query)

    const value = evaluate(tree, {dataset})
    const data = toJS(value)
    t.same(data, [1, 2, 3])
    t.end()
  })

  t.test('Controlling this', (t) => {
    const query = `@`
    const tree = parse(query)

    for (const root of [1, [1, 2], {a: 'b'}]) {
      const value = evaluate(tree, {root})
      const data = toJS(value)
      t.same(data, root)
    }
    t.end()
  })

  t.test('Re-using stream', (t) => {
    const query = `[[1, 2], [1, 4]] | order(@[0], @[1] desc)`
    const tree = parse(query)
    const value = evaluate(tree)
    const data = toJS(value)
    t.same(data, [
      [1, 4],
      [1, 2],
    ])
    t.end()
  })

  t.test('Parameters', (t) => {
    const query = `*[name == $name][].name`
    const dataset = [{name: 'Michael'}, {name: 'George Michael'}]
    const tree = parse(query)
    const value = evaluate(tree, {dataset, params: {name: 'Michael'}})
    const data = toJS(value)
    t.same(data, ['Michael'])
    t.end()
  })

  t.test('Slices', (t) => {
    const dataset = ['a', 'b', 'c', 'd', 'e', 'f']

    const query = `*[0...5][0..3]`
    const tree = parse(query)
    const value = evaluate(tree, {dataset})
    const data = toJS(value)
    t.same(data, ['a', 'b', 'c', 'd'])
    t.end()
  })

  t.test('Conditional', (t) => {
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
    const value = evaluate(tree, {dataset})
    const data = toJS(value)
    t.same(data, [{_type: 'book', title: 'A Game of Thrones'}, {_type: 'tv-show'}])
    t.end()
  })

  t.test('Asc', (t) => {
    t.test('returns a null value', (t) => {
      const tree: ExprNode = {type: 'Asc', base: {type: 'AccessAttribute', name: 'title'}}
      const value = evaluate(tree, {})
      const data = toJS(value)
      t.same(data, null)
      t.end()
    })
    t.end()
  })

  t.test('Desc', (t) => {
    t.test('returns a null value', (t) => {
      const tree: ExprNode = {type: 'Desc', base: {type: 'AccessAttribute', name: 'title'}}
      const value = evaluate(tree, {})
      const data = toJS(value)
      t.same(data, null)
      t.end()
    })
    t.end()
  })

  t.test('Tuples', (t) => {
    t.test('throw errors on evaluation', (t) => {
      const tree = parse('(foo, bar)')
      throwsWithMessage(t, () => evaluate(tree, {}), 'tuples can not be evaluated')
      t.end()
    })
    t.end()
  })

  t.test('Objects', (t) => {
    t.test('throw errors when the node type is unknown', (t) => {
      const tree: ExprNode = {
        type: 'Object',
        // @ts-expect-error (we want an invalid type for testing purposes)
        attributes: [{type: 'AccessAttribute', name: 'b'}],
      }

      throwsWithMessage(t, () => evaluate(tree, {}), 'Unknown node type: AccessAttribute')
      t.end()
    })
    t.end()
  })

  t.test('OpCall', (t) => {
    t.test('throws when an invalid operator function is used', (t) => {
      const tree: ExprNode = {
        type: 'OpCall',
        // @ts-expect-error (we want an invalid operator for testing purposes)
        op: '^',
        left: {type: 'AccessAttribute', name: 'a'},
        right: {type: 'AccessAttribute', name: 'b'},
      }

      throwsWithMessage(t, () => evaluate(tree, {}), 'Unknown operator: ^')
      t.end()
    })
    t.end()
  })

  t.test('Parent', (t) => {
    t.test('returns null when no parent is present', (t) => {
      const dataset = [{_type: 'book', title: 'I, Robot'}]

      // We intentionally access the higher scope to force the case when the scope's `parent` value is `null`
      const tree = parse('*[]{"parentName": ^.^.name}')
      const value = evaluate(tree, {dataset})
      const data = toJS(value)

      t.same(data, [{parentName: null}])
      t.end()
    })
    t.end()
  })

  t.test('Context', (t) => {
    t.test('throws when an unknown key is used', (t) => {
      const tree: ExprNode = {type: 'Context', key: 'foo'}
      throwsWithMessage(t, () => evaluate(tree, {}), 'unknown context key: foo')
      t.end()
    })
    t.end()
  })

  t.test('Paths', (t) => {
    const dataset = [
      {_id: 'drafts.agot', _type: 'book', title: 'A Game of Thrones'},
      {_id: 'agot', _type: 'book', title: 'Game of Thrones'},
    ]

    const query = `*[_id in path("drafts.**")]{_id}`
    const tree = parse(query)
    const value = evaluate(tree, {dataset})
    const data = toJS(value)
    t.same(data, [{_id: 'drafts.agot'}])
    t.end()
  })

  t.test('Delta-GROQ', (t) => {
    const tree = parse(`before().title == after().title`, {mode: 'delta'})
    const value1 = evaluate(tree, {before: {title: 'A'}, after: {title: 'A'}})
    t.same(toJS(value1), true)

    const value2 = evaluate(tree, {before: {title: 'A'}, after: {title: 'B'}})
    t.same(toJS(value2), false)
    t.end()
  })

  t.test('delta::operation()', (t) => {
    const tree = parse(`delta::operation()`, {mode: 'delta'})
    const value1 = evaluate(tree, {before: {title: 'A'}, after: {title: 'A'}})
    t.same(toJS(value1), 'update')

    const value2 = evaluate(tree, {before: {title: 'A'}})
    t.same(toJS(value2), 'delete')

    const value3 = evaluate(tree, {after: {title: 'A'}})
    t.same(toJS(value3), 'create')

    const value4 = evaluate(tree, {})
    t.same(toJS(value4), null)
    t.end()
  })

  t.test('Override identity()', (t) => {
    const dataset = [{_id: 'yes', user: 'me'}]
    const query = `{"me":identity(), "nested": *[user == "me"][0]._id}`
    const tree = parse(query)
    const value = evaluate(tree, {dataset, identity: 'bob'})
    const data = toJS(value)
    t.same(data, {me: 'bob', nested: 'yes'})
    t.end()
  })

  t.test('Override now()', (t) => {
    const dataset = [{_id: 'yes', time: '2021-05-06T12:14:15Z'}]
    const query = `{"me":now(), "nested": *[dateTime(time) == dateTime(now())][0]._id}`
    const tree = parse(query)
    const value = evaluate(tree, {dataset, timestamp: new Date('2021-05-06T12:14:15Z')})
    const data = toJS(value)
    t.same(data, {me: '2021-05-06T12:14:15Z', nested: 'yes'})
    t.end()
  })

  t.test('sanity-functions default', (t) => {
    const query = `sanity::dataset() + sanity::projectId()`
    const tree = parse(query)
    const value = evaluate(tree)
    const data = toJS(value)
    t.same(data, null)
    t.end()
  })

  t.test('sanity-functions', (t) => {
    t.test('sanity::dataset() and sanity::projectId()', (t) => {
      const query = `sanity::dataset() + sanity::projectId()`
      const tree = parse(query)
      const value = evaluate(tree, {sanity: {dataset: 'abc', projectId: 'def'}})
      const data = toJS(value)
      t.same(data, 'abcdef')
      t.end()
    })

    t.test('sanity::versionOf()', (t) => {
      const dataset = [
        {_id: 'doc1'},
        {_id: 'drafts.doc1'},
        {_id: 'versions.sale.doc1'},
        {_id: 'weekend.sale.doc1'},
        {_id: 'doc2'},
      ]

      const tree = parse('{"versions": sanity::versionOf("doc1")}')
      const value = evaluate(tree, {dataset})
      const data = toJS(value)
      t.same(data, {versions: ['doc1', 'drafts.doc1', 'versions.sale.doc1']})
      t.end()
    })

    t.test('sanity::partOfRelease()', (t) => {
      const dataset = [
        {_id: 'doc1'},
        {_id: 'drafts.doc1'},
        {_id: 'versions.sale.doc1'},
        {_id: 'versions.sale.doc2'},
        {_id: 'versions.sale'},
        {_id: 'weekend.sale.doc1'},
        {_id: 'sale.doc2'},
      ]

      const tree = parse('{"documentsInBundle": sanity::partOfRelease("sale")}')
      const value = evaluate(tree, {dataset})
      const data = toJS(value)
      t.same(data, {documentsInBundle: ['versions.sale.doc1', 'versions.sale.doc2']})
      t.end()
    })
    t.end()
  })

  t.test('releases-functions', (t) => {
    t.test('releases::all()', (t) => {
      const dataset = [
        {_id: '_.releases.summer', _type: 'system.release', title: 'Summer'},
        {_id: '_.releases.winter', _type: 'system.release', title: 'Winter'},
        {_id: '_.releases.not', _type: 'other', title: 'Not a release'},
      ]

      const tree = parse('{"rels": releases::all()[].title}')
      const value = evaluate(tree, {dataset})
      const data = toJS(value)
      t.same(data, {rels: ['Summer', 'Winter']})
      t.end()
    })
    t.end()
  })

  t.test('wrapping evaluate', (t) => {
    t.test('uses custom evaluator for nested expressions', (t) => {
      const dataset = [{_type: 'product', name: 'T-shirt'}]
      const query = `*[_type == "product"]{name}`
      const tree = parse(query)

      let evaluationCount = 0
      const trackedEvaluate = (node: ExprNode, context: EvaluateContext): Value => {
        evaluationCount++
        return evaluate(node, {...context, evaluate: trackedEvaluate})
      }

      const value = evaluate(tree, {dataset, evaluate: trackedEvaluate})
      const data = toJS(value)
      t.same(data, [{name: 'T-shirt'}])
      t.ok(evaluationCount > 1, 'custom evaluator should be called')
      t.end()
    })

    t.test('custom evaluator is used in all contexts', (t) => {
      const dataset = [
        {_type: 'product', name: 'T-shirt', price: 10},
        {_type: 'product', name: 'Pants', price: 20},
      ]
      const query = `*[_type == "product"]{name, "total": count(*[_type == "product"])}`
      const tree = parse(query)

      let evaluationCount = 0
      const trackedEvaluate = (node: ExprNode, context: EvaluateContext): Value => {
        evaluationCount++
        return evaluate(node, {...context, evaluate: trackedEvaluate})
      }

      const value = evaluate(tree, {dataset, evaluate: trackedEvaluate})
      const data = toJS(value)
      t.same(data, [
        {name: 'T-shirt', total: 2},
        {name: 'Pants', total: 2},
      ])
      t.ok(evaluationCount > 1, 'custom evaluator should be called')
      t.end()
    })

    t.end()
  })
  t.end()
})
