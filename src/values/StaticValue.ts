import {GroqType, Value} from './types'
import {fromJS} from './utils'

export class StaticValue<P, T extends GroqType> {
  data: P
  type: T

  constructor(data: P, type: T) {
    this.data = data
    this.type = type
  }

  isArray(): boolean {
    return this.type === 'array'
  }

  // eslint-disable-next-line require-await
  async get(): Promise<any> {
    return this.data
  }

  [Symbol.asyncIterator](): Generator<Value, void, unknown> {
    if (Array.isArray(this.data)) {
      return (function* (data) {
        for (const element of data) {
          yield fromJS(element)
        }
      })(this.data)
    }
    throw new Error(`Cannot iterate over: ${this.type}`)
  }
}
