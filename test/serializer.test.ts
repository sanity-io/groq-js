import t from 'tap'

import {parse} from '../src/1'
import {serialize} from '../src/beta'

t.test('Basic serialization', async (t) => {
  t.test('Simple value', async (t) => {
    const tree = parse('42')
    const result = serialize(tree)
    t.equal(result, '42')
  })

  t.test('String value', async (t) => {
    const tree = parse('"hello"')
    const result = serialize(tree)
    t.equal(result, '"hello"')
  })

  t.test('String escaping according to GROQ spec', async (t) => {
    // Test that the serializer properly escapes control characters when serializing strings
    // Note: When we parse a string, escape sequences are already converted to actual characters

    // Basic quote escaping - string contains actual quote character
    const quoteTree = {type: 'Value', value: 'test "quote"'} as any
    t.equal(serialize(quoteTree), '"test \\"quote\\""')

    // Backslash escaping - string contains actual backslash
    const backslashTree = {type: 'Value', value: 'test\\backslash'} as any
    t.equal(serialize(backslashTree), '"test\\\\backslash"')

    // Newline escaping - string contains actual newline
    const newlineTree = {type: 'Value', value: 'test\nline'} as any
    t.equal(serialize(newlineTree), '"test\\nline"')

    // Carriage return escaping - string contains actual CR
    const crTree = {type: 'Value', value: 'test\rreturn'} as any
    t.equal(serialize(crTree), '"test\\rreturn"')

    // Tab escaping - string contains actual tab
    const tabTree = {type: 'Value', value: 'test\ttab'} as any
    t.equal(serialize(tabTree), '"test\\ttab"')

    // Form feed escaping - string contains actual form feed
    const ffTree = {type: 'Value', value: 'test\fform'} as any
    t.equal(serialize(ffTree), '"test\\fform"')

    // Backspace escaping - string contains actual backspace
    const bsTree = {type: 'Value', value: 'test\x08space'} as any
    t.equal(serialize(bsTree), '"test\\bspace"')

    // Combined escapes - string contains actual control characters
    const combinedTree = {type: 'Value', value: 'line1\nline2\ttab\r\n'} as any
    t.equal(serialize(combinedTree), '"line1\\nline2\\ttab\\r\\n"')

    // Test that parsed strings with escape sequences work correctly
    t.equal(serialize(parse('"test\\nline"')), '"test\\nline"')
    t.equal(serialize(parse('"test\\ttab"')), '"test\\ttab"')
    t.equal(serialize(parse('"test\\\\"')), '"test\\\\"')
  })

  t.test('Boolean values', async (t) => {
    t.equal(serialize(parse(' true ')), 'true')
    t.equal(serialize(parse('false ')), 'false')
    t.equal(serialize(parse('null')), 'null')
  })

  t.test('Everything selector', async (t) => {
    const tree = parse('*')
    const result = serialize(tree)
    t.equal(result, '*')
  })

  t.test('This reference', async (t) => {
    const tree = parse('@')
    const result = serialize(tree)
    t.equal(result, '@')
  })

  t.test('Parameter', async (t) => {
    const tree = parse('$param')
    const result = serialize(tree)
    t.equal(result, '$param')
  })
})

t.test('Array serialization', async (t) => {
  t.test('Empty array', async (t) => {
    const tree = parse('[ ]')
    const result = serialize(tree)
    t.equal(result, '[]')
  })

  t.test('Array with elements', async (t) => {
    const tree = parse('[1,2, 3]')
    const result = serialize(tree)
    t.equal(result, '[1, 2, 3]')
  })

  t.test('Array with spread', async (t) => {
    const tree = parse('[1,... arr]')
    const result = serialize(tree)
    t.equal(result, '[1, ...arr]')
  })
})

t.test('Object serialization', async (t) => {
  t.test('Empty object', async (t) => {
    const tree = parse('{}')
    const result = serialize(tree)
    t.equal(result, '{}')
  })

  t.test('Simple object', async (t) => {
    const tree = parse('{name,age}')
    const result = serialize(tree)
    t.equal(
      result,
      `{
  name,
  age
}`,
    )
  })

  t.test('Object with explicit keys', async (t) => {
    const tree = parse('{"key":value}')
    const result = serialize(tree)
    t.equal(
      result,
      `{
  "key": value
}`,
    )
  })
})

t.test('Operator serialization', async (t) => {
  t.test('Arithmetic operators', async (t) => {
    t.equal(serialize(parse('1 +2')), '1 + 2')
    t.equal(serialize(parse('3- 4')), '3 - 4')
    t.equal(serialize(parse('5*6')), '5 * 6')
    t.equal(serialize(parse('7/8')), '7 / 8')
    t.equal(serialize(parse('9 %10')), '9 % 10')
  })

  t.test('Comparison operators', async (t) => {
    t.equal(serialize(parse('a==b')), 'a == b')
    t.equal(serialize(parse('a !=b')), 'a != b')
    t.equal(serialize(parse('a> b')), 'a > b')
    t.equal(serialize(parse('a<b')), 'a < b')
    t.equal(serialize(parse('a>= b')), 'a >= b')
    t.equal(serialize(parse('a <=b')), 'a <= b')
  })

  t.test('Logical operators', async (t) => {
    t.equal(serialize(parse('a &&b')), 'a && b')
    t.equal(serialize(parse('a|| b')), 'a || b')
    t.equal(serialize(parse('!a')), '!a')
  })
})

t.test('Function calls', async (t) => {
  t.test('Simple function call', async (t) => {
    const tree = parse('count( *)')
    const result = serialize(tree)
    t.equal(result, 'count(*)')
  })

  t.test('Function with multiple arguments', async (t) => {
    const tree = parse('select( true=> 1,false =>2)')
    const result = serialize(tree)
    t.equal(result, 'select(true => 1, false => 2)')
  })

  t.test('Namespaced function', async (t) => {
    const tree = parse('string::split( "hello world"," ")')
    const result = serialize(tree)
    t.equal(result, 'string::split("hello world", " ")')
  })
})

t.test('Pipe operations', async (t) => {
  t.test('Simple pipe', async (t) => {
    const tree = parse('*|order( name)')
    const result = serialize(tree)
    t.equal(result, '* | order(name)')
  })

  t.test('Multiple pipes', async (t) => {
    const tree = parse('*|order(name)|score(0.5)')
    const result = serialize(tree)
    t.equal(result, '* | order(name) | score(0.5)')
  })
})

t.test('Serialization improvements', async (t) => {
  t.test('Function argument spacing', async (t) => {
    // Test that missing spaces are added
    t.equal(serialize(parse('count(*)')), 'count(*)')
    t.equal(serialize(parse('select(true=>1,false=>2)')), 'select(true => 1, false => 2)')
    t.equal(
      serialize(parse('string::split("hello world"," ")')),
      'string::split("hello world", " ")',
    )
    t.equal(serialize(parse('array::join(tags,", ")')), 'array::join(tags, ", ")')
    t.equal(serialize(parse('length(name)')), 'length(name)')
  })

  t.test('Operator spacing normalization', async (t) => {
    // Test that operators get proper spacing
    t.equal(serialize(parse('a==b')), 'a == b')
    t.equal(serialize(parse('a!=b')), 'a != b')
    t.equal(serialize(parse('a>=b')), 'a >= b')
    t.equal(serialize(parse('a<=b')), 'a <= b')
    t.equal(serialize(parse('a+b*c')), 'a + b * c')
    t.equal(serialize(parse('a&&b||c')), 'a && b || c')
  })

  t.test('GROQ query spacing', async (t) => {
    // Test that GROQ queries get proper spacing
    t.equal(serialize(parse('*[_type=="post"]')), '*[_type == "post"]')
    t.equal(
      serialize(parse('*[_type=="post"]{title,body}')),
      `*[_type == "post"] {
  title,
  body
}`,
    )
    t.equal(serialize(parse('*|order(name)')), '* | order(name)')
    t.equal(
      serialize(parse('author->{name,bio}')),
      `author-> {
  name,
  bio
}`,
    )
  })

  t.test('Array and object spacing', async (t) => {
    // Test that arrays and objects get proper spacing
    t.equal(serialize(parse('[1,2,3]')), '[1, 2, 3]')
    t.equal(serialize(parse('[1,...more]')), '[1, ...more]')
    t.equal(
      serialize(parse('{name,age}')),
      `{
  name,
  age
}`,
    )
    t.equal(
      serialize(parse('{"key":value}')),
      `{
  "key": value
}`,
    )
  })

  t.test('Complex nested formatting', async (t) => {
    // Test complex nested structures
    const messy =
      '*[_type=="post"&&published==true]{title,author->{name,bio},tags[type=="category"]}'
    const clean = `*[_type == "post" && published == true] {
  title,
  author-> {
    name,
    bio
  },
  tags[type == "category"]
}`
    t.equal(serialize(parse(messy)), clean)
  })
})

t.test('Pretty serialization', async (t) => {
  t.test('Simple object serialization', async (t) => {
    const query = '{name,age,email}'
    const expected = `{
  name,
  age,
  email
}`
    t.equal(serialize(parse(query)), expected)
  })

  t.test('Nested projection serialization', async (t) => {
    const query = '*[_type=="post"]{title,author->{name,bio}}'
    const expected = `*[_type == "post"] {
  title,
  author-> {
    name,
    bio
  }
}`
    t.equal(serialize(parse(query)), expected)
  })

  t.test('Complex query serialization', async (t) => {
    const query =
      '*[_type=="post"&&published==true]{title,"excerpt":body[0...100],author->{name,bio},"tags":tags[type=="category"]}'
    const expected = `*[_type == "post" && published == true] {
  title,
  "excerpt": body[0...100],
  author-> {
    name,
    bio
  },
  tags[type == "category"]
}`
    t.equal(serialize(parse(query)), expected)
  })
})

t.test('Complex queries', async (t) => {
  t.test('Filter with projection', async (t) => {
    const tree = parse('*[_type == "post"]{title, body}')
    const result = serialize(tree)
    t.equal(
      result,
      `*[_type == "post"] {
  title,
  body
}`,
    )
  })

  t.test('Nested object - pretty', async (t) => {
    const tree = parse('*[_type == "post"]{title, author->{name}}')
    const result = serialize(tree)
    t.equal(
      result,
      `*[_type == "post"] {
  title,
  author-> {
    name
  }
}`,
    )
  })
})

t.test('Property name serialization', async (t) => {
  t.test('Should not add quotes for extractable property names', async (t) => {
    // Simple property access
    t.equal(serialize(parse('{name, age}')), '{\n  name,\n  age\n}')

    // Array filtering - should not add quotes
    t.equal(
      serialize(parse('{tags[type == "category"]}')),
      `{
  tags[type == "category"]
}`,
    )

    // Array element access - should not add quotes
    t.equal(
      serialize(parse('{author[0]}')),
      `{
  author[0]
}`,
    )

    // Complex expressions with array access - should not add quotes
    t.equal(
      serialize(parse('{author[0]->{name, bio}}')),
      `{
  author[0]-> {
    name,
    bio
  }
}`,
    )

    // Array slicing - should not add quotes
    t.equal(
      serialize(parse('{posts[0..5]}')),
      `{
  posts[0..5]
}`,
    )

    // Dereferencing - should not add quotes
    t.equal(
      serialize(parse('{author->}')),
      `{
  author->
}`,
    )

    // Projection - should not add quotes
    t.equal(
      serialize(parse('{posts{title}}')),
      `{
  posts {
    title
  }
}`,
    )
  })

  t.test('Should use quotes for non-extractable property names', async (t) => {
    // When property name doesn't match the expression, use explicit quotes
    t.equal(
      serialize(parse('{"custom": value}')),
      `{
  "custom": value
}`,
    )

    // When property name matches expression, use shorthand (even if original had quotes)
    t.equal(
      serialize(parse('{"title": title, author}')),
      `{
  title,
  author
}`,
    )
  })
})

t.skip('Preserves line comments', async (t) => {
  const query = `*[_type == "post"]{
  // This is a comment
  title,
  // Another comment
  author->{ name,
    // Author bio
    bio } }`

  const expected = `*[_type == "post"] {
  // This is a comment
  title,
  // Another comment
  author-> {
    name,
    // Author bio
    bio
  }
}`
  const result = serialize(parse(query))
  t.equal(result, expected)
})

t.skip('Preserves end of line comments', async (t) => {
  const query = `*[_type == "post"]{
  title, // A comment about title
  author->{ name,
    bio } }`

  const expected = `*[_type == "post"] {
  title, // A comment about title
  author-> {
    name,
    bio
  }
}`
  const result = serialize(parse(query))
  t.equal(result, expected)
})

t.test('Consecutive projections', async (t) => {
  t.test('Should serialize consecutive projections correctly', async (t) => {
    const query = `*[_type == "track"]{
  _id,
    courses[]->{
        ...,
            lessons[]
              }
            } {
                "tracks": @,
                  "courseIds": @.courses[][@._id]
                  }`
    const result = serialize(parse(query))
    const expected = `*[_type == "track"] {
  _id,
  courses[] -> {
    ...,
    lessons[]
  }
} {
  "tracks": @,
  "courseIds": @.courses[][@._id]
}`
    t.equal(result, expected)
  })
})

t.test('Round-trip serialization', async (t) => {
  const queries = [
    '*',
    '42',
    '"hello"',
    'true',
    'false',
    'null',
    '[]',
    '[1, 2, 3]',
    '{}',
    '{name}',
    'a + b',
    'a == b',
    'a && b',
    'count(*)',
    '* | order(name)',
  ]

  for (const query of queries) {
    t.test(`Round-trip: ${query}`, async (t) => {
      const tree = parse(query)
      const serialized = serialize(tree)
      const reparsed = parse(serialized)

      // The trees should be functionally equivalent
      // We'll do a simple string comparison of the serialized output
      t.equal(serialize(reparsed), serialized, `Round-trip failed for: ${query}`)
    })
  }
})

t.test('Indent customization', async (t) => {
  t.test('Should support custom indent strings', async (t) => {
    const tree = parse('{name, age}')

    // Test default indent (should be "  ")
    const defaultResult = serialize(tree)
    t.match(defaultResult, /^{\n  name,\n  age\n}$/, 'Default should use two spaces')

    // Test custom indent string
    const tabResult = serialize(tree, {indentString: '\t'})
    t.match(tabResult, /^{\n\tname,\n\tage\n}$/, 'Should use custom tab indent')

    // Test custom space indent
    const fourSpaceResult = serialize(tree, {indentString: '    '})
    t.match(fourSpaceResult, /^{\n    name,\n    age\n}$/, 'Should use four spaces')
  })
})
