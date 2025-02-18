import type {Value} from './types'

export class StreamValue {
  type: 'stream' = 'stream'
  private generator: () => AsyncGenerator<Value, void, unknown>
  private ticker: Promise<void> | null
  private isDone: boolean
  private data: Value[]

  constructor(generator: () => AsyncGenerator<Value, void, unknown>) {
    this.generator = generator
    this.ticker = null
    this.isDone = false
    this.data = []
  }

  // eslint-disable-next-line class-methods-use-this
  isArray(): boolean {
    return true
  }

  async get(): Promise<any> {
    const result = []
    for await (const value of this) {
      result.push(await value.get())
    }
    return result
  }

  async first<R extends Value>(predicate: (value: Value) => value is R): Promise<R | undefined>
  async first(predicate?: (value: Value) => boolean): Promise<Value | undefined>
  async first(predicate: (value: Value) => boolean = () => true): Promise<Value | undefined> {
    for await (const value of this) {
      if (predicate(value)) {
        return value
      }
    }
    return undefined
  }

  async reduce<R>(reducer: (acc: R, value: Value) => R | Promise<R>, initial: R): Promise<R> {
    let accumulator = initial
    for await (const value of this) {
      accumulator = await reducer(accumulator, value)
    }
    return accumulator
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<Value, void, unknown> {
    let i = 0
    while (true) {
      for (; i < this.data.length; i++) {
        yield this.data[i]
      }

      if (this.isDone) {
        return
      }

      await this._nextTick()
    }
  }

  _nextTick(): Promise<void> {
    if (this.ticker) {
      return this.ticker
    }

    let currentResolver: (value?: void | PromiseLike<void> | undefined) => void
    const setupTicker = () => {
      this.ticker = new Promise((resolve) => {
        currentResolver = resolve
      })
    }

    const tick = () => {
      currentResolver()
      setupTicker()
    }

    const fetch = async () => {
      for await (const value of this.generator()) {
        this.data.push(value)
        tick()
      }

      this.isDone = true
      tick()
    }

    setupTicker()
    fetch()
    return this.ticker!
  }
}
