import {parse} from '../src'

import t from 'tap'
import {AccessAttributeNode, FuncCallNode, SelectorNode} from '../src/nodeTypes'
import {pathExpander} from './helpers'

t.test('Basic parsing', async (t) => {
  t.test('Example query', async (t) => {
    const query = `*[_type == "product"]{name}`
    const tree = parse(query)
    t.matchSnapshot(tree)
  })

  t.test('Trailing comma in function call', async (t) => {
    const query = `select(123,)`
    const tree = parse(query)
    t.matchSnapshot(tree)
  })

  t.test('Object expression starting with string', async (t) => {
    const query = `{"mail" == 1 => {}}`
    const tree = parse(query)
    t.matchSnapshot(tree)
  })

  t.test('Space after field in objects', async (t) => {
    const query = `{"mail" : 123}`
    const tree = parse(query)
    t.matchSnapshot(tree)
  })

  t.test('Comment with no text', async (t) => {
    const query = `
      // my comment
      //
      1
    `
    const tree = parse(query)
    t.matchSnapshot(tree)
  })
})

t.test('Error reporting', async (t) => {
  t.test('Query with syntax error', async (t) => {
    t.plan(3)
    const query = `*[_type == "]`
    try {
      parse(query)
    } catch (error: any) {
      t.same(error.name, 'GroqSyntaxError')
      t.same(error.position, 13)
      t.same(error.message, 'Syntax error in GROQ query at position 13')
    }
  })
})

t.test('Diff extension', async (t) => {
  t.test('throws when invalid selector syntax used', async (t) => {
    const queriesWithInvalidSelectors = [
      'diff::changedAny(a, b, 1337)',
      'diff::changedAny(a, b, [])',
      'diff::changedAny(a, b, "foo")',
    ]

    queriesWithInvalidSelectors.forEach((query) => {
      try {
        parse(query)
      } catch (error: any) {
        t.same(error.name, 'Error')
        t.same(error.message, 'Cannot parse selector, must be identifier or tuple of identifiers')
      }
    })
  })

  t.test('parses selectors properly', async (t) => {
    // `diff` queries mapped to their desired selector paths.
    // Resulting paths are formatted in human readable form.
    const queryPaths: {[key: string]: string[]} = {
      'diff::changedAny(a, b, foo)': ['foo'],
      'diff::changedAny(a, b, foo.bar.baz)': ['foo.bar.baz'],
      'diff::changedAny(a, b, (foo, bar, baz))': ['foo', 'bar', 'baz'],
      'diff::changedAny(a, b, (a, b).foo.bar)': ['a.foo.bar', 'b.foo.bar'],
      'diff::changedAny(a, b, (a.doc, b).foo.bar)': ['a.doc.foo.bar', 'b.foo.bar'],
      'diff::changedAny(a, b, doc.(foo, bar))': ['doc.foo', 'doc.bar'],
      'diff::changedAny(a, b, doc.(foo.a, bar))': ['doc.foo.a', 'doc.bar'],
      'diff::changedAny(a, b, doc.foo.(b.c.d, bar))': ['doc.foo.b.c.d', 'doc.foo.bar'],
      'diff::changedAny(a, b, doc.foo.a.b)': ['doc.foo.a.b'],
      'diff::changedAny(a, b, doc.foo.(b.c, d.e, f))': ['doc.foo.b.c', 'doc.foo.d.e', 'doc.foo.f'],
    }

    Object.keys(queryPaths).forEach((query) => {
      const result = parse(query) as FuncCallNode
      const selector = result.args[2] as SelectorNode
      const expandedSelectors = selector.paths.map((path) =>
        pathExpander(path as AccessAttributeNode)
      )

      t.same(expandedSelectors, queryPaths[query])
    })
  })
})

t.test('Delta-GROQ', async (t) => {
  const queries = [
    `before().title == after().title`,
    `delta::changedAny(name)`,
    `delta::changedAny((name, description))`,
    `delta::changedAny((name, description)._type)`,
    `delta::changedOnly(foo)`,
    `delta::changedOnly(foo[bar == 1])`,
  ]

  for (const query of queries) {
    t.test(query, async (t) => {
      t.throws(() => parse(query))
      t.doesNotThrow(() => parse(query, {mode: 'delta'}))
    })
  }
})
