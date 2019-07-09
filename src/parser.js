const {parse: rawParse} = require('./rawParser')
const MarkProcessor = require('./markProcessor')

const BUILDER = {
  filter(p, mark) {
    let base = p.process()
    let query = p.process()
    return {
      type: 'Filter',
      base: base,
      query: query
    }
  },

  project(p, mark) {
    let base = p.process()
    let query = p.process()
    return {
      type: 'Project',
      base: base,
      query: query
    }
  },

  star(p, mark) {
    return {type: 'Star'}
  },

  this(p, mark) {
    return {type: 'This'}
  },

  ident(p, mark) {
    let name = p.processStringEnd()
    return {
      type: 'Identifier',
      name: name
    }
  },

  attr_ident(p, mark) {
    let base = p.process()
    let name = p.processString()
    return {
      type: 'GetIdentifier',
      base,
      name
    }
  },

  arr_expr(p, mark) {
    let base = p.process()
    return {
      type: 'ArrProject',
      base,
      query: {type: 'This'}
    }
  },

  inc_range(p, mark) {
    let left = p.process()
    let right = p.process()
    return {
      type: 'Range',
      left,
      right
    }
  },

  neg(p, mark) {
    let base = p.process()

    if (base.type === "Value") {
      return {
        type: "Value",
        value: -base.value
      }
    }

    return {
      type: "Neg",
      base,
    }
  },

  deref(p, mark) {
    let base = p.process()

    let nextMark = p.getMark()

    if (nextMark && nextMark.name === 'deref_field') {
      throw new Error('TODO: Handle deref properly')
    }

    return {
      type: "Deref",
      base,
    }
  },

  comp(p, mark) {
    let left = p.process()
    let op = p.processString()
    let right = p.process()
    return {
      type: 'OpCall',
      op: op,
      left: left,
      right: right
    }
  },

  str_begin(p, mark) {
    let value = p.processStringEnd()
    return {
      type: 'Value',
      value: value
    }
  },

  integer(p, mark) {
    let strValue = p.processStringEnd()
    return {
      type: 'Value',
      value: Number(strValue)
    }
  },

  object(p, mark) {
    let properties = []
    while (p.getMark().name !== 'object_end') {
      properties.push(p.process())
    }
    p.shift()
    return {
      type: 'Object',
      properties: properties
    }
  },

  object_expr(p, mark) {
    let value = p.process()
    return {
      type: 'Property',
      key: {
        type: 'Value',
        value: extractPropertyKey(value)
      },
      value: value
    }
  },

  object_pair(p, mark) {
    let key = p.process()
    let value = p.process()
    return {
      type: 'Property',
      key: key,
      value: value
    }
  },

  object_splat(p, mark) {
    return {
      type: 'ObjectSplat',
    }
  },

  array(p, mark) {
    let elements = []
    while (p.getMark().name !== 'array_end') {
      elements.push(p.process())
    }
    p.shift()
    return {
      type: 'Array',
      elements: elements
    }
  }
}

function extractPropertyKey(node) {
  if (node.type === 'Identifier') {
    return node.name
  }

  throw new Error('Cannot determine property key for type: ' + node.type)
}

function parse(input) {
  let result = rawParse(input)
  if (result.type === 'error') throw new Error('Syntax error in GROQ query')
  let processor = new MarkProcessor(BUILDER, input, result.marks)
  return processor.process()
}

exports.parse = parse
