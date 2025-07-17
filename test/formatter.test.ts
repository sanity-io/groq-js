import t from 'tap'

import {format, parse} from '../src/1'

t.test('Basic formatting', async (t) => {
  t.test('Simple value', async (t) => {
    const tree = parse('42')
    const result = format(tree)
    t.equal(result, '42')
  })

  t.test('String value', async (t) => {
    const tree = parse('"hello"')
    const result = format(tree)
    t.equal(result, '"hello"')
  })

  t.test('Boolean values', async (t) => {
    t.equal(format(parse(' true ')), 'true')
    t.equal(format(parse('false ')), 'false')
    t.equal(format(parse('null')), 'null')
  })

  t.test('Everything selector', async (t) => {
    const tree = parse('*')
    const result = format(tree)
    t.equal(result, '*')
  })

  t.test('This reference', async (t) => {
    const tree = parse('@')
    const result = format(tree)
    t.equal(result, '@')
  })

  t.test('Parameter', async (t) => {
    const tree = parse('$param')
    const result = format(tree)
    t.equal(result, '$param')
  })
})

t.test('Array formatting', async (t) => {
  t.test('Empty array', async (t) => {
    const tree = parse('[ ]')
    const result = format(tree)
    t.equal(result, '[]')
  })

  t.test('Array with elements', async (t) => {
    const tree = parse('[1,2, 3]')
    const result = format(tree)
    t.equal(result, '[1, 2, 3]')
  })

  t.test('Array with spread', async (t) => {
    const tree = parse('[1,... arr]')
    const result = format(tree)
    t.equal(result, '[1, ...arr]')
  })
})

t.test('Object formatting', async (t) => {
  t.test('Empty object', async (t) => {
    const tree = parse('{}')
    const result = format(tree)
    t.equal(result, '{}')
  })

  t.test('Simple object', async (t) => {
    const tree = parse('{name,age}')
    const result = format(tree)
    t.equal(result, `{
  name,
  age
}`)
  })

  t.test('Object with explicit keys', async (t) => {
    const tree = parse('{"key":value}')
    const result = format(tree)
    t.equal(result, `{
  "key": value
}`)
  })
})

t.test('Operator formatting', async (t) => {
  t.test('Arithmetic operators', async (t) => {
    t.equal(format(parse('1 +2')), '1 + 2')
    t.equal(format(parse('3- 4')), '3 - 4')
    t.equal(format(parse('5*6')), '5 * 6')
    t.equal(format(parse('7/8')), '7 / 8')
    t.equal(format(parse('9 %10')), '9 % 10')
  })

  t.test('Comparison operators', async (t) => {
    t.equal(format(parse('a==b')), 'a == b')
    t.equal(format(parse('a !=b')), 'a != b')
    t.equal(format(parse('a> b')), 'a > b')
    t.equal(format(parse('a<b')), 'a < b')
    t.equal(format(parse('a>= b')), 'a >= b')
    t.equal(format(parse('a <=b')), 'a <= b')
  })

  t.test('Logical operators', async (t) => {
    t.equal(format(parse('a &&b')), 'a && b')
    t.equal(format(parse('a|| b')), 'a || b')
    t.equal(format(parse('!a')), '!a')
  })
})

t.test('Function calls', async (t) => {
  t.test('Simple function call', async (t) => {
    const tree = parse('count( *)')
    const result = format(tree)
    t.equal(result, 'count(*)')
  })

  t.test('Function with multiple arguments', async (t) => {
    const tree = parse('select( true=> 1,false =>2)')
    const result = format(tree)
    t.equal(result, 'select(true => 1, false => 2)')
  })

  t.test('Namespaced function', async (t) => {
    const tree = parse('string::split( "hello world"," ")')
    const result = format(tree)
    t.equal(result, 'string::split("hello world", " ")')
  })
})

t.test('Pipe operations', async (t) => {
  t.test('Simple pipe', async (t) => {
    const tree = parse('*|order( name)')
    const result = format(tree)
    t.equal(result, '* | order(name)')
  })

  t.test('Multiple pipes', async (t) => {
    const tree = parse('*|order(name)|score(0.5)')
    const result = format(tree)
    t.equal(result, '* | order(name) | score(0.5)')
  })
})

t.test('Formatting improvements', async (t) => {
  t.test('Function argument spacing', async (t) => {
    // Test that missing spaces are added
    t.equal(format(parse('count(*)')), 'count(*)')
    t.equal(format(parse('select(true=>1,false=>2)')), 'select(true => 1, false => 2)')
    t.equal(format(parse('string::split("hello world"," ")')), 'string::split("hello world", " ")')
    t.equal(format(parse('array::join(tags,", ")')), 'array::join(tags, ", ")')
    t.equal(format(parse('length(name)')), 'length(name)')
  })

  t.test('Operator spacing normalization', async (t) => {
    // Test that operators get proper spacing
    t.equal(format(parse('a==b')), 'a == b')
    t.equal(format(parse('a!=b')), 'a != b')
    t.equal(format(parse('a>=b')), 'a >= b')
    t.equal(format(parse('a<=b')), 'a <= b')
    t.equal(format(parse('a+b*c')), 'a + (b * c)')
    t.equal(format(parse('a&&b||c')), 'a && b || c')
  })

  t.test('GROQ query spacing', async (t) => {
    // Test that GROQ queries get proper spacing
    t.equal(format(parse('*[_type=="post"]')), '*[_type == "post"]')
    t.equal(format(parse('*[_type=="post"]{title,body}')), `*[_type == "post"] {
  title,
  body
}`)
    t.equal(format(parse('*|order(name)')), '* | order(name)')
    t.equal(format(parse('author->{name,bio}')), `author-> {
  name,
  bio
}`)
  })

  t.test('Array and object spacing', async (t) => {
    // Test that arrays and objects get proper spacing
    t.equal(format(parse('[1,2,3]')), '[1, 2, 3]')
    t.equal(format(parse('[1,...more]')), '[1, ...more]')
    t.equal(format(parse('{name,age}')), `{
  name,
  age
}`)
    t.equal(format(parse('{"key":value}')), `{
  "key": value
}`)
  })

  t.test('Complex nested formatting', async (t) => {
    // Test complex nested structures
    const messy = '*[_type=="post"&&published==true]{title,author->{name,bio},tags[type=="category"]}'
    const clean = `*[_type == "post" && (published == true)] {
  title,
  author-> {
    name,
    bio
  },
  tags[type == "category"]
}`
    t.equal(format(parse(messy)), clean)
  })
})

t.test('Pretty formatting', async (t) => {
  t.test('Simple object formatting', async (t) => {
    const query = '{name,age,email}'
    const expected = `{
  name,
  age,
  email
}`
    t.equal(format(parse(query)), expected)
  })

  t.test('Nested projection formatting', async (t) => {
    const query = '*[_type=="post"]{title,author->{name,bio}}'
    const expected = `*[_type == "post"] {
  title,
  author-> {
    name,
    bio
  }
}`
    t.equal(format(parse(query)), expected)
  })

  t.test('Complex query formatting', async (t) => {
    const query = '*[_type=="post"&&published==true]{title,"excerpt":body[0...100],author->{name,bio},"tags":tags[type=="category"]}'
    const expected = `*[_type == "post" && (published == true)] {
  title,
  "excerpt": body[0...100],
  author-> {
    name,
    bio
  },
  tags[type == "category"]
}`
    t.equal(format(parse(query)), expected)
  })
})

t.test('Complex queries', async (t) => {
  t.test('Filter with projection', async (t) => {
    const tree = parse('*[_type == "post"]{title, body}')
    const result = format(tree)
    t.equal(result, `*[_type == "post"] {
  title,
  body
}`)
  })

  t.test('Nested object - pretty', async (t) => {
    const tree = parse('*[_type == "post"]{title, author->{name}}')
    const result = format(tree)
    t.equal(result, `*[_type == "post"] {
  title,
  author-> {
    name
  }
}`)
  })
})

t.test('Property name formatting', async (t) => {
  t.test('Should not add quotes for extractable property names', async (t) => {
    // Simple property access
    t.equal(format(parse('{name, age}')), '{\n  name,\n  age\n}')
    
    // Array filtering - should not add quotes
    t.equal(format(parse('{tags[type == "category"]}')), `{
  tags[type == "category"]
}`)
    
    // Array element access - should not add quotes
    t.equal(format(parse('{author[0]}')), `{
  author[0]
}`)
    
    // Complex expressions with array access - should not add quotes
    t.equal(format(parse('{author[0]->{name, bio}}')), `{
  author[0]-> {
    name,
    bio
  }
}`)
    
    // Array slicing - should not add quotes
    t.equal(format(parse('{posts[0..5]}')), `{
  posts[0..5]
}`)
    
    // Dereferencing - should not add quotes
    t.equal(format(parse('{author->}')), `{
  author->
}`)
    
    // Projection - should not add quotes
    t.equal(format(parse('{posts{title}}')), `{
  posts {
    title
  }
}`)
  })
  
  t.test('Should use quotes for non-extractable property names', async (t) => {
    // When property name doesn't match the expression, use explicit quotes
    t.equal(format(parse('{"custom": value}')), `{
  "custom": value
}`)
    
    // When property name matches expression, use shorthand (even if original had quotes)
    t.equal(format(parse('{"title": title, author}')), `{
  title,
  author
}`)
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
  const result = format(parse(query))
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
  const result = format(parse(query))
  t.equal(result, expected)
})

t.test('Consecutive projections', async (t) => {
  t.test('Should format consecutive projections correctly', async (t) => {
    const query =
`*[_type == "track"]{
  _id,
    courses[]->{
        ...,
            lessons[]
              }
            } {
                "tracks": @,
                  "courseIds": @.courses[][@._id]
                  }`
    const result = format(parse(query))
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

t.test('Round-trip formatting', async (t) => {
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
      const formatted = format(tree)
      const reparsed = parse(formatted)

      // The trees should be functionally equivalent
      // We'll do a simple string comparison of the formatted output
      t.equal(format(reparsed), formatted, `Round-trip failed for: ${query}`)
    })
  }
})
