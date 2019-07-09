
const ArrayIterator = Array.prototype[Symbol.iterator]

function isIterator(obj) {
  return typeof obj === 'object' && typeof obj.next === 'function'
}

/** A Value represents a value that can be produced during execution of a query.
 *
 * Value provides a `get()` method for returning the whole data, but also
 * implements the async iterator protocol for streaming data.
 */
class Value {
  /** Constructs a new Value.
   *
   * The `inner` parameter can take the following types:
   *
   * (a) JSON-data
   * (b) Promise which resolves to JSON-data
   * (c) Function which returns (a) or (b). This function will be invoked synchronously.
   * (d) Generator function which yields JSON-data
  */
  constructor(inner) {
    this.inner = typeof inner === 'function' ? inner() : inner
  }

  /** Returns the data inside the Value. */
  async get() {
    if (isIterator(this.inner)) {
      let result = []
      for await (let data of this.inner) {
        result.push(data)
      }
      return result
    } else {
      return this.inner
    }
  }

  /** Iterates over every element in the Value. */
  [Symbol.asyncIterator]() {
    if (isIterator(this.inner)) {
      return this.inner
    } else {
      // TODO: Support promise here as well
      return ArrayIterator.call(this.inner)
    }
  }
}

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
    return scope.value
  },

  Star(_, scope) {
    return scope.source.createSink()
  },

  OpCall({op, left, right}, scope) {
    return new Value(async () => {
      let a = await execute(left, scope).get()
      let b = await execute(right, scope).get()
      if (op == '==') {
        return a == b
      }

      throw new Error('unknown operator: ' + op)
    })
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
    return new Value(scope.value[name])
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

  Object({properties}, scope) {
    return new Value(async () => {
      let result = {}
      for (let prop of properties) {
        let key = await execute(prop.key, scope).get()
        let value = await execute(prop.value, scope).get()
        result[key] = value
      }
      return result
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
