import {parse} from '../src'

describe('Basic parsing', () => {
  test('Example query', () => {
    let query = `*[_type == "product"]{name}`
    let tree = parse(query)
    expect(tree).toMatchSnapshot()
  })
})

describe('Error reporting', () => {
  test('Query with syntax error', () => {
    let query = `*[_type == "]`
    try {
      parse(query)
    } catch (error) {
      expect(error.name).toBe('GroqSyntaxError')
      expect(error.position).toBe(13)
      expect(error.message).toBe('Syntax error in GROQ query at position 13')
    }
  })
})

describe('Delta-GROQ', () => {
  const queries = [
    `before().title == after().title`,
    `delta::changedAny(name)`,
    `delta::changedAny((name, description))`,
    `delta::changedAny((name, description)._type)`,
    `delta::changedOnly(foo)`,
    `delta::changedOnly(foo[bar == 1])`,
  ]

  for (const query of queries) {
    test(query, () => {
      expect(() => parse(query)).toThrow()
      parse(query, {mode: 'delta'})
    })
  }
})
