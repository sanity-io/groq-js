import {parse} from '../src/v2'

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
