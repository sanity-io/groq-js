import {formatRFC3339, parseRFC3339} from './dateHelpers'
import {Path} from './Path'
import {StreamValue} from './StreamValue'
import type {BooleanValue, GroqType, NullValue, Value} from './types'

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

  get(): any {
    return this.data
  }

  first<R extends Value>(predicate: (value: Value) => value is R): R | undefined
  first(predicate?: (value: Value) => boolean): Value | undefined
  first(predicate: (value: Value) => boolean = () => true): Value | undefined {
    if (!this.isArray()) {
      throw new Error('`first` can only be called on array `StaticValue`s')
    }

    const array = this.get() as unknown[]
    for (const item of array) {
      const value = fromJS(item, 'sync')
      if (predicate(value)) {
        return value
      }
    }

    return undefined
  }

  reduce<R>(reducer: (acc: R, value: Value) => R, initial: R): R {
    if (!this.isArray()) {
      throw new Error('`reduce` can only be called on array `StaticValue`s')
    }
    const array = this.get() as unknown[]
    let accumulator = initial
    for (const item of array) {
      const value = fromJS(item, 'sync')
      accumulator = reducer(accumulator, value)
    }
    return accumulator
  }

  [Symbol.asyncIterator](): Generator<Value, void, unknown> {
    if (Array.isArray(this.data)) {
      return (function* (data) {
        for (const element of data) {
          yield fromJS(element, 'async')
        }
      })(this.data)
    }
    throw new Error(`Cannot iterate over: ${this.type}`)
  }
}

export const NULL_VALUE: NullValue = new StaticValue(null, 'null')
export const TRUE_VALUE: BooleanValue = new StaticValue(true, 'boolean')
export const FALSE_VALUE: BooleanValue = new StaticValue(false, 'boolean')

export class DateTime {
  date: Date

  constructor(date: Date) {
    this.date = date
  }

  static parseToValue(str: string): Value {
    const date = parseRFC3339(str)
    if (date) {
      return new StaticValue(new DateTime(date), 'datetime')
    }
    return NULL_VALUE
  }

  equals(other: DateTime): boolean {
    return this.date.getTime() == other.date.getTime()
  }

  add(secs: number): DateTime {
    const copy = new Date(this.date.getTime())
    copy.setTime(copy.getTime() + secs * 1000)
    return new DateTime(copy)
  }

  difference(other: DateTime): number {
    return (this.date.getTime() - other.date.getTime()) / 1000
  }

  compareTo(other: DateTime): number {
    return this.date.getTime() - other.date.getTime()
  }

  toString(): string {
    return formatRFC3339(this.date)
  }

  toJSON(): string {
    return this.toString()
  }
}

export function fromNumber(num: number): Value {
  if (Number.isFinite(num)) {
    return new StaticValue(num, 'number')
  }
  return NULL_VALUE
}

export function fromString(str: string): Value {
  return new StaticValue(str, 'string')
}

export function fromDateTime(dt: DateTime): Value {
  return new StaticValue(dt, 'datetime')
}

export function fromPath(path: Path): Value {
  return new StaticValue(path, 'path')
}

function isIterator(obj?: Iterator<any>) {
  return obj && typeof obj.next === 'function'
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function fromJS(val: any, mode: 'sync' | 'async'): Value {
  if (isIterator(val) && mode !== 'sync') {
    return new StreamValue(async function* () {
      for await (const value of val) {
        yield fromJS(value, 'async')
      }
    })
  } else if (val === null || val === undefined) {
    return NULL_VALUE
  }
  return new StaticValue(val, getType(val)) as any
}

/**
 * Returns the type of the value.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getType(data: any): GroqType {
  if (data === null || typeof data === 'undefined') {
    return 'null'
  }
  if (Array.isArray(data)) {
    return 'array'
  }
  if (data instanceof Path) {
    return 'path'
  }
  if (data instanceof DateTime) {
    return 'datetime'
  }
  return typeof data as GroqType
}

export const isPromiseLike = <T>(value: T | PromiseLike<T>): value is PromiseLike<T> =>
  typeof value === 'object' && !!value && 'then' in value && typeof value.then === 'function'

/**
 * Executes a generator function that yields either plain values or
 * Promise-like values, allowing asynchronous code to be written in a
 * synchronous style without explicit `await`.
 *
 * The generator function is expected to yield values of type `T` or
 * Promise-like objects resolving to `T`, and to eventually return a value
 * of type `T`. However, because the type of the value resumed into the
 * generator (i.e. the result of each `yield`) is determined by the yielded
 * expression, TypeScript’s type inference can be awkward. In practice, you
 * might need to use type assertions or manual type checks inside the
 * generator to correctly handle the unwrapped types.
 *
 * For example, consider a generator where the first yield yields a Promise
 * and its resumed value is asserted:
 *
 * ```ts
 * co<unknown>(function* (): Generator<unknown, Value, unknown> {
 *   const baseValue = (yield execute(base, scope)) as Value
 *   // ...
 *   const array = (yield baseValue.get()) as unknown[]
 *   // ...
 *   return fromJS(array.slice(leftIdx, rightIdx))
 * }) as Value | PromiseLike<Value>
 * ```
 *
 * In the above, the types for `yield` operations require manual assertions
 * because the actual value received from each `yield` depends on what was
 * yielded, which TypeScript cannot automatically infer or narrow.
 */
export function co<T = unknown>(
  coroutine: () => Generator<T | PromiseLike<T>, T, T>,
): T | PromiseLike<T> {
  const gen = coroutine()
  // Begin the generator without sending a value.
  const initial = gen.next()
  if (initial.done) {
    return initial.value
  }

  // `step` resumes the generator with a resolved value from the previous yield.
  function step(lastValue: T): T | PromiseLike<T> {
    const result = gen.next(lastValue)
    if (result.done) {
      return result.value
    }
    const yielded = result.value
    if (yielded && isPromiseLike(yielded)) {
      return yielded.then(step)
    }
    return step(yielded)
  }

  // Process the first yielded value.
  const yielded = initial.value
  if (yielded && isPromiseLike(yielded)) {
    return yielded.then(step)
  }
  return step(yielded)
}
