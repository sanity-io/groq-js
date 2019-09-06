const getType = (exports.getType = function getType(data) {
  if (data == null) return 'null'
  if (Array.isArray(data)) return 'array'
  if (data instanceof Range) return 'range'
  return typeof data
})

/**
 * A type of a value in GROQ.
 *
 * This can be one of:
 * - 'null'
 * - 'boolean'
 * - 'number'
 * - 'string'
 * - 'array'
 * - 'object'
 * - 'range'
 * - 'pair'
 * @typedef {string} ValueType
 */

/** The result of an expression.
 *
 * @interface Value
 */
void 0

/**
 * Returns the type of the value.
 * @function
 * @name Value#getType
 * @return {ValueType}
 */

/**
 * Returns a JavaScript representation of the value.
 * @async
 * @function
 * @return {Promise}
 * @name Value#get
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

/** A StreamValue accepts a generator which yields values.
 *
 * @private
 */
class StreamValue {
  constructor(generator) {
    this._generator = generator
    this._ticker = null
    this._isDone = false
    this._data = []
  }

  getType() {
    return 'array'
  }

  async get() {
    let result = []
    for await (let value of this) {
      result.push(await value.get())
    }
    return result
  }

  async *[Symbol.asyncIterator]() {
    let i = 0
    while (true) {
      for (; i < this._data.length; i++) {
        yield this._data[i]
      }

      if (this._isDone) return

      await this._nextTick()
    }
  }

  getBoolean() {
    return false
  }

  _nextTick() {
    if (this._ticker) return this._ticker

    let currentResolver
    let setupTicker = () => {
      this._ticker = new Promise(resolve => {
        currentResolver = resolve
      })
    }

    let tick = () => {
      currentResolver()
      setupTicker()
    }

    let fetch = async () => {
      for await (let value of this._generator()) {
        this._data.push(value)
        tick()
      }

      this._isDone = true
      tick()
    }

    setupTicker()
    fetch()
    return this._ticker
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

  constructor(left, right, exclusive) {
    this.left = left
    this.right = right
    this.exclusive = exclusive
  }

  isExclusive() {
    return this.exclusive
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

function fromNumber(num) {
  if (Number.isFinite(num)) {
    return new StaticValue(num)
  } else {
    return exports.NULL_VALUE
  }
}

exports.StaticValue = StaticValue
exports.Range = Range
exports.Pair = Pair
exports.StreamValue = StreamValue
exports.MapperValue = MapperValue
exports.fromNumber = fromNumber
exports.NULL_VALUE = new StaticValue(null)
exports.TRUE_VALUE = new StaticValue(true)
exports.FALSE_VALUE = new StaticValue(false)
