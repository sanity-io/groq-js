import {parse} from '../src'

import t from 'tap'
import {throwsWithMessage} from './testUtils'

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
  t.test('when querying with a syntax error', async (t) => {
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

t.test('Expression parsing', async (t) => {
  t.test('when parsing strings', async (t) => {
    t.test('handles unicode hex characters', async (t) => {
      const queries = ['*[foo == "\\u{0040}"]', '*[foo == "\\u0040"]']

      for (const query of queries) {
        t.doesNotThrow(() => parse(query))
      }
    })
  })

  t.test('when parsing objects', async (t) => {
    t.test('throws when the object is not terminated properly', async (t) => {
      throwsWithMessage(() => parse('*{a, b'), 'Syntax error in GROQ query at position 5')
    })
  })

  t.test('when parsing functions', async (t) => {
    t.test('throws when the function call is not terminated properly', async (t) => {
      throwsWithMessage(() => parse('count(*[]'), 'Syntax error in GROQ query at position 9')
    })

    t.test('throws when using boost() when `allowBoost` is false', async (t) => {
      throwsWithMessage(() => parse('boost()'), 'unexpected boost')
    })

    t.test('throws when an undefined namespace is used', async (t) => {
      throwsWithMessage(() => parse('invalid::func()'), 'Undefined namespace: invalid')
    })
  })

  t.test('throws when nothing is passed', async (t) => {
    throwsWithMessage(() => parse(''), 'Syntax error in GROQ query at position 0')
  })

  t.test('has support for tuples', async (t) => {
    t.doesNotThrow(() => parse('(a, b, c)'))
  })

  t.test('throws when an open square bracket has no closing match', async (t) => {
    throwsWithMessage(() => parse('*[foo == [1, 2'), 'Syntax error in GROQ query at position 13')
  })

  t.test('when parsing pipecalls', async (t) => {
    t.test('throws when using a namespace other than `global`', async (t) => {
      throwsWithMessage(() => parse('* | invalid::func()'), 'Undefined namespace: invalid')
    })

    t.test('throws when using an invalid function', async (t) => {
      throwsWithMessage(() => parse('* | func()'), 'Undefined pipe function: func')
    })
  })

  t.test('when parsing `desc`', async (t) => {
    t.test('throws when used unexpectedly', async (t) => {
      throwsWithMessage(() => parse('*[_type desc]'), 'unexpected desc')
    })
  })

  t.test('when parsing slices', async (t) => {
    t.test('throws when a constant number is not used', async (t) => {
      throwsWithMessage(() => parse('*[0..x]'), 'slicing must use constant numbers')
    })
  })

  t.test('when extracting property keys', async (t) => {
    t.test('throws when the key cannot be determined', async (t) => {
      throwsWithMessage(() => parse('*{1}'), 'Cannot determine property key for type: Value')
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
