const {parse: rawParse} = require('./rawParser')
const MarkProcessor = require('./markProcessor')

function isNumber(node) {
  return node.type == 'Value' && typeof node.value == 'number'
}

function isString(node) {
  return node.type == 'Value' && typeof node.value == 'string'
}

const BUILDER = {
  filter(p, mark) {
    let base = p.process()
    let query = p.process()

    if (isNumber(query)) {
      return {
        type: 'Slice',
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
        type: 'RangeSlice',
        base,
        left: query.left,
        right: query.right,
        isExclusive: query.isExclusive
      }
    }

    return unwrapArrProjection(base, base => ({
      type: 'Filter',
      base,
      query
    }))
  },

  project(p, mark) {
    let base = p.process()
    let query = p.process()
    return unwrapArrProjection(base, base => ({
      type: 'Project',
      base,
      query
    }))
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

    return unwrapArrProjection(base, base => ({
      type: 'Attribute',
      base,
      name
    }))
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

    if (nextMark && nextMark.name === 'deref_field') {
      throw new Error('TODO: Handle deref properly')
    }

    return unwrapArrProjection(base, base => ({
      type: 'Deref',
      base
    }))
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
      type: 'ObjectSplat'
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

  and(p, mark) {
    let left = p.process()
    let right = p.process()
    return {
      type: 'And',
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
  }
}

function extractPropertyKey(node) {
  if (node.type === 'Identifier') {
    return node.name
  }

  if (node.type === 'Deref' || node.type === 'ArrProject') {
    return extractPropertyKey(node.base)
  }

  throw new Error('Cannot determine property key for type: ' + node.type)
}

function unwrapArrProjection(base, func) {
  if (base.type === 'ArrProject') {
    return {
      type: 'ArrProject',
      base: base.base,
      query: func(base.query)
    }
  } else {
    return func(base)
  }
}

function parse(input) {
  let result = rawParse(input)
  if (result.type === 'error') throw new Error('Syntax error in GROQ query')
  let processor = new MarkProcessor(BUILDER, input, result.marks)
  return processor.process()
}

exports.parse = parse
