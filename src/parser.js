const {parse: rawParse} = require('./rawParser')
const MarkProcessor = require('./markProcessor')

function isNumber(node) {
  return node.type == 'Value' && typeof node.value == 'number'
}

function isString(node) {
  return node.type == 'Value' && typeof node.value == 'string'
}

const BUILDER = {
  paren(p) {
    let inner = p.process()
    return {
      type: 'Parenthesis',
      base: inner
    }
  },

  filter(p, mark) {
    let base = p.process()
    let query = p.process()

    if (isNumber(query)) {
      return {
        type: 'Element',
        base,
        index: query
      }
    }

    if (isString(query)) {
      return {
        type: 'Attribute',
        base,
        name: query.value
      }
    }

    if (query.type == 'Range') {
      return {
        type: 'Slice',
        base,
        left: query.left,
        right: query.right,
        isExclusive: query.isExclusive
      }
    }

    return {
      type: 'Filter',
      base,
      query
    }
  },

  project(p, mark) {
    let base = p.process()
    let query = p.process()
    return {
      type: 'Projection',
      base,
      query
    }
  },

  star(p, mark) {
    return {type: 'Star'}
  },

  this(p, mark) {
    return {type: 'This'}
  },

  parent(p, mark) {
    return {type: 'Parent'}
  },

  ident(p, mark) {
    let name = p.processStringEnd()

    if (name === 'null') return {type: 'Value', value: null}
    if (name === 'true') return {type: 'Value', value: true}
    if (name === 'false') return {type: 'Value', value: false}

    return {
      type: 'Identifier',
      name: name
    }
  },

  attr_ident(p, mark) {
    let base = p.process()
    let name = p.processString()

    return {
      type: 'Attribute',
      base,
      name
    }
  },

  arr_expr(p, mark) {
    let base = p.process()
    return {
      type: 'Mapper',
      base
    }
  },

  inc_range(p, mark) {
    let left = p.process()
    let right = p.process()
    return {
      type: 'Range',
      left,
      right,
      isExclusive: false
    }
  },

  exc_range(p, mark) {
    let left = p.process()
    let right = p.process()
    return {
      type: 'Range',
      left,
      right,
      isExclusive: true
    }
  },

  neg(p, mark) {
    let base = p.process()

    if (base.type === 'Value') {
      return {
        type: 'Value',
        value: -base.value
      }
    }

    return {
      type: 'Neg',
      base
    }
  },

  deref(p, mark) {
    let base = p.process()

    let nextMark = p.getMark()
    let result = {type: 'Deref', base}

    if (nextMark && nextMark.name === 'deref_field') {
      let name = p.processString()
      result = {
        type: 'Attribute',
        base: result,
        name
      }
    }

    return result
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

  float(p, mark) {
    let strValue = p.processStringEnd()
    return {
      type: 'Value',
      value: Number(strValue)
    }
  },

  pair(p, mark) {
    let left = p.process()
    let right = p.process()
    return {
      type: 'Pair',
      left,
      right
    }
  },

  object(p, mark) {
    let attributes = []
    while (p.getMark().name !== 'object_end') {
      attributes.push(p.process())
    }
    p.shift()
    return {
      type: 'Object',
      attributes
    }
  },

  object_expr(p, mark) {
    let value = p.process()

    if (value.type == 'Pair') {
      return {
        type: 'ObjectConditionalSplat',
        condition: value.left,
        value: value.right
      }
    }

    return {
      type: 'ObjectAttribute',
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
      type: 'ObjectAttribute',
      key: key,
      value: value
    }
  },

  object_splat(p, mark) {
    let value = p.process()

    return {
      type: 'ObjectSplat',
      value
    }
  },

  object_splat_this(p, mark) {
    return {
      type: 'ObjectSplat',
      value: {type: 'This'}
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
  },

  func_call(p, mark) {
    let name = p.processStringEnd()
    let args = []
    while (p.getMark().name !== 'func_args_end') {
      args.push(p.process())
    }
    p.shift()
    return {
      type: 'FuncCall',
      name,
      args
    }
  },

  pipecall(p, mark) {
    let base = p.process()
    let func = p.process()
    return {
      ...func,
      type: 'PipeFuncCall',
      base
    }
  },

  and(p, mark) {
    let left = p.process()
    let right = p.process()
    return {
      type: 'And',
      left,
      right
    }
  },

  or(p, mark) {
    let left = p.process()
    let right = p.process()
    return {
      type: 'Or',
      left,
      right
    }
  },

  not(p, mark) {
    let base = p.process()
    return {
      type: 'Not',
      base
    }
  },

  asc(p, mark) {
    let base = p.process()

    return {
      type: 'Asc',
      base
    }
  },

  desc(p, mark) {
    let base = p.process()

    return {
      type: 'Desc',
      base
    }
  }
}

function extractPropertyKey(node) {
  if (node.type === 'Identifier') {
    return node.name
  }

  if (node.type === 'Deref' || node.type === 'Projection' || node.type == 'Mapper') {
    return extractPropertyKey(node.base)
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
