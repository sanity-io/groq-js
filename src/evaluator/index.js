const Value = require('./value')
const functions = require('./functions')
const operators = require('./operators')

class Scope {
  constructor(params, source, value, parent) {
    this.params = params
    this.source = source
    this.value = value
    this.parent = parent
  }

  createNested(value) {
    return new Scope(this.params, this.source, value, this)
  }
}

function execute(node, scope) {
  const func = EXECUTORS[node.type]
  if (!func) throw new Error('No executor for node.type=' + node.type)
  return func(node, scope)
}

const EXECUTORS = {
  This(_, scope) {
    return new Value(scope.value)
  },

  Star(_, scope) {
    return scope.source.createSink()
  },

  OpCall({op, left, right}, scope) {
    let func = operators[op]
    if (!func) throw new Error("Unknown operator: " + op)
    return func(left, right, scope, execute)
  },

  FuncCall({name, args}, scope) {
    let func = functions[name]
    if (!func) throw new Error("Unknown function: " + name)
    return func(args, scope, execute)
  },

  Filter({base, query}, scope) {
    return new Value(async function*() {
      let b = execute(base, scope)
      for await (let value of b) {
        let newScope = scope.createNested(value)
        let didMatch = await execute(query, newScope).get()
        if (didMatch) yield value
      }
    })
  },

  Identifier({name}, scope) {
    return new Value(name in scope.value ? scope.value[name] : null)
  },

  GetIdentifier({base, name}, scope) {
    return new Value(async () => {
      let obj = await execute(base, scope).get()

      if (obj && typeof obj === 'object') {
        return obj[name]
      } else {
        return null
      }
    })
  },

  Value({value}) {
    return new Value(value)
  },

  Project({base, query}, scope) {
    let b = execute(base, scope)
    return new Value(async function*() {
      for await (let data of b) {
        let newScope = scope.createNested(data)
        let newData = await execute(query, newScope).get()
        yield newData
      }
    })
  },

  ArrProject({base, query}, scope) {
    let b = execute(base, scope)
    return new Value(async function*() {
      for await (let data of b) {
        let newScope = scope.createNested(data)
        let newData = await execute(query, newScope).get()
        yield newData
      }
    })
  },

  Object({properties}, scope) {
    return new Value(async () => {
      let result = {}
      for (let prop of properties) {
        switch (prop.type) {
          case 'ObjectSplat':
            Object.assign(result, scope.value)
            break

          case 'Property':
            let key = await execute(prop.key, scope).get()
            let value = await execute(prop.value, scope).get()
            result[key] = value
            break

          default:
            throw new Error("Unknown node type: " + prop.type)
        }
      }
      return result
    })
  },

  Array({elements}, scope) {
    return new Value(async function*() {
      for (let element of elements) {
        yield await execute(element, scope).get()
      }
    })
  },

  And({left, right}, scope) {
    return new Value(async () => {
      let leftData = await execute(left, scope).get()
      if (leftData === false) return false
      let rightData = await execute(right, scope).get()
      // TODO: Correct boolean semantics
      return rightData
    })
  }
}

class StaticSource {
  constructor(documents) {
    this.documents = documents
  }

  createSink() {
    return new Value(this.documents)
  }
}

function evaluate(tree, options = {}) {
  let source
  let params = {identity: 'groot'}

  if (options.documents != null) {
    source = new StaticSource(options.documents)
  } else {
    source = new StaticSource([])
  }

  if (options.params) {
    Object.assign(params, options.params)
  }

  let scope = new Scope(params, source, null, null)
  return execute(tree, scope)
}

exports.evaluate = evaluate
