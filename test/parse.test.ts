import {parse} from '../src'

describe('Basic parsing', () => {
  test('Example query', () => {
    const query = `*[_type == "product"]{name}`
    const tree = parse(query)
    expect(tree).toMatchSnapshot()
  })
})

describe('Error reporting', () => {
  test('Query with syntax error', () => {
    const query = `*[_type == "]`
    try {
      parse(query)
    } catch (error: any) {
      expect(error.name).toBe('GroqSyntaxError')
      expect(error.position).toBe(13)
      expect(error.message).toBe('Syntax error in GROQ query at position 13')
    }
  })
})
