import {parse} from '../src'

import t from 'tap'

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

t.test('Selector validation', async (t) => {
  t.test('passes with valid selectors', async (t) => {
    const queries = [
      'diff::changedAny({}, {}, foo)',
      'diff::changedAny({}, {}, foo.bar.baz)',
      'diff::changedAny({}, {}, foo[])',
      'diff::changedAny({}, {}, foo.bar[baz == 1])',
      'diff::changedAny({}, {}, anywhere(foo))',
    ]

    queries.forEach((query) => {
      t.doesNotThrow(() => parse(query))
    })
  })

  t.test('fails with invalid selectors', async (t) => {
    const queries = [
      'diff::changedAny({}, {}, "foo")',
      'diff::changedAny({}, {}, 1 + 2)',
      'diff::changedAny({}, {}, 5)',
      'diff::changedAny({}, {}, (foo, bar))', // BUG: fails because we don't support tuples yet
      'diff::changedAny({}, {}, (foo))', // BUG: fails because we don't support groups yet
    ]

    queries.forEach((query) => {
      try {
        parse(query)
      } catch (error: any) {
        t.same(error.message, 'Invalid selector syntax')
      }
    })
  })

  // BUG: the below case throws a syntax error because we don't support the syntax *yet*.
  // This is a valid selector according to the spec, but not according to our implementation.
  t.test('fails due to syntax error', async (t) => {
    const query = 'diff::changedAny({}, {}, a[].(foo, bar).b)'

    try {
      parse(query)
    } catch (error: any) {
      t.match(error.message, 'Syntax error in GROQ query at position')
    }
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
