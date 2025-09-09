import type {FunctionSet} from '.'
import {fromJS, NULL_VALUE} from '../../values'
import {asyncOnlyExecutor, executeAsync} from '../evaluate'

const math: FunctionSet = {}
math['min'] = asyncOnlyExecutor(async function (args, scope) {
  const arr = await executeAsync(args[0], scope)
  if (!arr.isArray()) {
    return NULL_VALUE
  }

  let n: number | undefined
  for await (const elem of arr) {
    if (elem.type === 'null') continue
    if (elem.type !== 'number') {
      return NULL_VALUE
    }
    if (n === undefined || elem.data < n) {
      n = elem.data
    }
  }
  return fromJS(n)
})
math['min'].arity = 1

math['max'] = asyncOnlyExecutor(async function (args, scope) {
  const arr = await executeAsync(args[0], scope)
  if (!arr.isArray()) {
    return NULL_VALUE
  }

  let n: number | undefined
  for await (const elem of arr) {
    if (elem.type === 'null') continue
    if (elem.type !== 'number') {
      return NULL_VALUE
    }
    if (n === undefined || elem.data > n) {
      n = elem.data
    }
  }
  return fromJS(n)
})
math['max'].arity = 1

math['sum'] = asyncOnlyExecutor(async function (args, scope) {
  const arr = await executeAsync(args[0], scope)
  if (!arr.isArray()) {
    return NULL_VALUE
  }

  let n = 0
  for await (const elem of arr) {
    if (elem.type === 'null') continue
    if (elem.type !== 'number') {
      return NULL_VALUE
    }
    n += elem.data
  }
  return fromJS(n)
})
math['sum'].arity = 1

math['avg'] = asyncOnlyExecutor(async function (args, scope) {
  const arr = await executeAsync(args[0], scope)
  if (!arr.isArray()) {
    return NULL_VALUE
  }

  let n = 0
  let c = 0
  for await (const elem of arr) {
    if (elem.type === 'null') continue
    if (elem.type !== 'number') {
      return NULL_VALUE
    }
    n += elem.data
    c++
  }
  if (c === 0) {
    return NULL_VALUE
  }
  return fromJS(n / c)
})
math['avg'].arity = 1

export default math
