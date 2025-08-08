import t from 'tap'

import {parse} from '../src/1'
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

  t.test('Complex query', async (t) => {
    const query = `count(array::unique(
      *[_type == 'page']{"_id": select(
        _id in path("drafts.**") => _id,
        "drafts." + _id
      )}._id
    ))`

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
      t.same(error.message, 'Syntax error in GROQ query at position 13: Unexpected end of query')
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

  t.test('when parsing numbers', async (t) => {
    t.test('throws when the exponent is not a number', async (t) => {
      throwsWithMessage(
        t,
        () => parse('1.2eX'),
        'Syntax error in GROQ query at position 4: Exponent must be a number',
      )
    })
  })

  t.test('when parsing objects', async (t) => {
    t.test('throws when the object is not terminated properly', async (t) => {
      throwsWithMessage(
        t,
        () => parse('*{a, b'),
        'Syntax error in GROQ query at position 5: Unexpected end of query',
      )
    })
  })

  t.test('when parsing arrays', async (t) => {
    t.test('throws when the array is not terminated properly', async (t) => {
      throwsWithMessage(
        t,
        () => parse('{"a":[0}'),
        'Syntax error in GROQ query at position 7: Expected \"]\" after array expression',
      )
    })
  })

  t.test('when parsing functions', async (t) => {
    t.test('throws when the function call is not terminated properly', async (t) => {
      throwsWithMessage(
        t,
        () => parse('count(*[]'),
        'Syntax error in GROQ query at position 9: Expected \")\" after function arguments',
      )
    })

    t.test('throws when using boost() when `allowBoost` is false', async (t) => {
      throwsWithMessage(t, () => parse('boost()'), 'unexpected boost')
    })

    t.test('throws when an undefined namespace is used', async (t) => {
      throwsWithMessage(t, () => parse('invalid::func()'), 'Undefined namespace: invalid')
    })

    t.test('allows text namespace functions', async (t) => {
      t.doesNotThrow(() => parse('text::query("foo bar")'))
    })
    t.test('allows geo namespace functions', async (t) => {
      t.doesNotThrow(() => parse('geo::distance([52.24, 10.21], [52.10, 10.45])'))
    })
  })

  t.test('throws when nothing is passed', async (t) => {
    throwsWithMessage(
      t,
      () => parse(''),
      'Syntax error in GROQ query at position 0: Expected expression',
    )
  })

  t.test('when parsing tuples', async (t) => {
    t.test('has support for tuples', async (t) => {
      t.doesNotThrow(() => parse('(a, b, c)'))
    })

    t.test('throws when the tuple has a syntax error', async (t) => {
      throwsWithMessage(
        t,
        () => parse('(a, b;)'),
        'Syntax error in GROQ query at position 5: Expected \")\" after tuple expression',
      )
    })
  })

  t.test('when parsing groups', async (t) => {
    t.test('has support for groups', async (t) => {
      t.doesNotThrow(() => parse('(a)'))
    })

    t.test('throws when the group has a syntax error', async (t) => {
      throwsWithMessage(
        t,
        () => parse('(a;)'),
        'Syntax error in GROQ query at position 2: Unexpected character \";\"',
      )
    })
  })

  t.test('throws when an open square bracket has no closing match', async (t) => {
    throwsWithMessage(
      t,
      () => parse('*[foo == [1, 2'),
      'Syntax error in GROQ query at position 13: Unexpected end of query',
    )
  })

  t.test('when parsing pipecalls', async (t) => {
    t.test('throws when using a namespace other than `global`', async (t) => {
      throwsWithMessage(t, () => parse('* | invalid::func()'), 'Undefined namespace: invalid')
    })

    t.test('throws when using an invalid function', async (t) => {
      throwsWithMessage(t, () => parse('* | func()'), 'Undefined pipe function: func')
    })

    t.test('throws when using invalid syntax', async (t) => {
      throwsWithMessage(
        t,
        () => parse('* | 1'),
        'Syntax error in GROQ query at position 4: Expected identifier',
      )
    })
  })

  t.test('when parsing `desc`', async (t) => {
    t.test('throws when used unexpectedly', async (t) => {
      throwsWithMessage(t, () => parse('*[_type desc]'), 'unexpected desc')
    })
  })

  t.test('when parsing slices', async (t) => {
    t.test('throws when a constant number is not used', async (t) => {
      throwsWithMessage(t, () => parse('*[0..x]'), 'slicing must use constant numbers')
    })
  })

  t.test('when extracting property keys', async (t) => {
    t.test('throws when the key cannot be determined', async (t) => {
      throwsWithMessage(t, () => parse('*{1}'), 'Cannot determine property key for type: Value')
    })

    t.test('can extract from group', async (t) => {
      t.matchSnapshot(parse('*{(id)}'))
    })
  })

  t.test('when parsing operators', async (t) => {
    t.test('comparison should be non-associative', async (t) => {
      const ops = ['==', '!=', '>', '>=', '<=', 'in', 'match']
      for (const a of ops) {
        for (const b of ops) {
          t.test(`${a} and ${b}`, async (t) => {
            t.throws(() => parse(`left ${a} middle ${b} right`))
          })
        }
      }
    })
  })
})

t.test('Selector validation', async (t) => {
  t.test('passes with valid selectors', async (t) => {
    const queries = [
      'diff::changedAny({}, {}, foo)',
      'diff::changedAny({}, {}, foo.bar.baz)',
      'diff::changedAny({}, {}, foo[])',
      'diff::changedAny({}, {}, foo.bar[baz == 1])',
      'diff::changedAny({}, {}, (foo))',
      'diff::changedAny({}, {}, anywhere(foo))',
    ]

    for (const query of queries) {
      t.doesNotThrow(() => parse(query))
    }
  })

  t.test('fails with invalid selectors', async (t) => {
    const queries = [
      'diff::changedAny({}, {}, "foo")',
      'diff::changedAny({}, {}, 1 + 2)',
      'diff::changedAny({}, {}, 5)',
      'diff::changedAny({}, {}, (foo, bar))', // BUG: fails because we don't support tuples inside traversals yet
    ]

    for (const query of queries) {
      throwsWithMessage(t, () => parse(query), 'Invalid selector syntax')
    }
  })

  // BUG: the below cases throw syntax errors because we don't support their syntax *yet*.
  // These are valid selectors according to the spec, but not according to our implementation.
  t.test('fails due to syntax error', async (t) => {
    const queries = [
      'diff::changedAny({}, {}, a.(foo).bar)',
      'diff::changedAny({}, {}, a[].(foo, bar).b)',
    ]

    for (const query of queries) {
      try {
        parse(query)
      } catch (error: any) {
        t.match(error.message, 'Syntax error in GROQ query at position')
      }
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

t.test('handles parenthesis inside filters (regression bug)', async (t) => {
  t.doesNotThrow(() => parse('*[(_type == "foo")]'))
})
