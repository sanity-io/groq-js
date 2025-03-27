import type {WithOptions} from '../types'

export function createStub({arity, mode}: WithOptions<object>) {
  function notImplemented(): never {
    throw new Error('Not implemented')
  }
  return Object.assign(notImplemented, {
    ...(arity && {arity}),
    ...(mode && {mode}),
  })
}
