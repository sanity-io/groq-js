import {type GroqFunction, type WithOptions} from '../../types'

export function createStub({arity, mode}: WithOptions<object>): GroqFunction {
  function notImplemented(): never {
    throw new Error('not implemented')
  }
  return Object.assign(notImplemented, {
    ...(arity && {arity}),
    ...(mode && {mode}),
  })
}
