const ArrayIterator = Array.prototype[Symbol.iterator]

function isIterator(obj) {
  return obj && typeof obj.next === 'function'
}

function isPromise(obj) {
  return obj && typeof obj.then === 'function'
}

const EmptyIterator = {
  next() {
    return {done: true}
  }
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
    } else if (isPromise(this.inner)) {
      return {
        iterator: null,
        promise: this.inner,
        async next() {
          if (!this.iterator) {
            let inner = await this.promise
            if (!Array.isArray(inner)) {
              return {done: true}
            }
            this.iterator = ArrayIterator.call(inner)
          }
          return this.iterator.next()
        }
      }
    } else {
      if (Array.isArray(this.inner)) {
        return ArrayIterator.call(this.inner)
      } else {
        return EmptyIterator
      }
    }
  }
}

module.exports = Value
