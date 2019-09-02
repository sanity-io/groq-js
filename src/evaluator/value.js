const getType = (exports.getType = function getType(data) {
  if (data == null) return 'null'
  if (Array.isArray(data)) return 'array'
  if (data instanceof Range) return 'range'
  return typeof data
})

/* A Value represents a value that can be produced during execution of a query.
 *
 * Value provides a `get()` method for returning the whole data, but also
 * implements the async iterator protocol for streaming data.
 */

class StaticValue {
  constructor(data) {
    this.data = data
  }

  getType() {
    return getType(this.data)
  }

  async get() {
    return this.data
  }

  [Symbol.asyncIterator]() {
    if (Array.isArray(this.data)) {
      return (function*(data) {
        for (let element of data) {
          yield new StaticValue(element)
        }
      })(this.data)
    } else {
      throw new Error('Cannot iterate over: ' + this.getType())
    }
  }

  getBoolean() {
    return this.data === true
  }
}

/** A StreamValue accepts a generator which yields values. */
class StreamValue {
  constructor(generator) {
    this.iterator = generator()
  }

  getType() {
    return 'array'
  }

  async get() {
    let result = []
    for await (let element of this.iterator) {
      result.push(await element.get())
    }
    return result
  }

  [Symbol.asyncIterator]() {
    return this.iterator
  }

  getBoolean() {
    return false
  }
}

class MapperValue {
  constructor(value) {
    this.value = value
  }

  getType() {
    return 'array'
  }

  async get() {
    return await this.value.get()
  }

  [Symbol.asyncIterator]() {
    return this.value[Symbol.asyncIterator].call(this.value)
  }

  getBoolean() {
    return false
  }
}

class Range {
  static isConstructible(leftType, rightType) {
    if (leftType == rightType) {
      if (leftType == 'number') return true
      if (leftType == 'string') return true
    }
    return false
  }

  constructor(left, right) {
    this.left = left
    this.right = right
  }

  toJSON() {
    return [this.left, this.right]
  }
}

class Pair {
  constructor(first, second) {
    this.first = first
    this.second = second
  }

  toJSON() {
    return [this.first, this.second]
  }
}

exports.StaticValue = StaticValue
exports.Range = Range
exports.Pair = Pair
exports.StreamValue = StreamValue
exports.MapperValue = MapperValue
exports.NULL_VALUE = new StaticValue(null)
exports.TRUE_VALUE = new StaticValue(true)
exports.FALSE_VALUE = new StaticValue(false)
