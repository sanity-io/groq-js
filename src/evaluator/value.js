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
    if (this.data == null) return 'null'
    if (Array.isArray(this.data)) return 'array'
    return typeof this.data
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

exports.StaticValue = StaticValue
exports.StreamValue = StreamValue
exports.NULL_VALUE = new StaticValue(null)
exports.TRUE_VALUE = new StaticValue(true)
exports.FALSE_VALUE = new StaticValue(false)
