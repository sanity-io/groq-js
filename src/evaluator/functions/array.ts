import type {FunctionSet} from '.'
import {FALSE_VALUE, fromJS, NULL_VALUE, StreamValue, TRUE_VALUE} from '../../values'
import {isEqual} from '../equality'
import {asyncOnlyExecutor, executeAsync} from '../evaluate'

const array: FunctionSet = {}

array['join'] = asyncOnlyExecutor(async function (args, scope) {
  const arr = await executeAsync(args[0], scope)
  if (!arr.isArray()) {
    return NULL_VALUE
  }
  const sep = await executeAsync(args[1], scope)
  if (sep.type !== 'string') {
    return NULL_VALUE
  }
  let buf = ''
  let needSep = false
  for await (const elem of arr) {
    if (needSep) {
      buf += sep.data
    }
    switch (elem.type) {
      case 'number':
      case 'string':
      case 'boolean':
      case 'datetime':
        buf += `${elem.data}`
        break
      default:
        return NULL_VALUE
    }
    needSep = true
  }
  return fromJS(buf)
})
array['join'].arity = 2

array['compact'] = asyncOnlyExecutor(async function (args, scope) {
  const arr = await executeAsync(args[0], scope)
  if (!arr.isArray()) {
    return NULL_VALUE
  }

  return new StreamValue(async function* () {
    for await (const elem of arr) {
      if (elem.type !== 'null') {
        yield elem
      }
    }
  })
})
array['compact'].arity = 1

array['unique'] = asyncOnlyExecutor(async function (args, scope) {
  const value = await executeAsync(args[0], scope)
  if (!value.isArray()) {
    return NULL_VALUE
  }

  return new StreamValue(async function* () {
    const added = new Set()
    for await (const iter of value) {
      switch (iter.type) {
        case 'number':
        case 'string':
        case 'boolean':
        case 'datetime':
          if (!added.has(iter.data)) {
            added.add(iter.data)
            yield iter
          }
          break
        default:
          yield iter
      }
    }
  })
})
array['unique'].arity = 1

array['intersects'] = asyncOnlyExecutor(async function (args, scope) {
  // Intersects returns true if the two arrays have at least one element in common. Only
  // primitives are supported; non-primitives are ignored.
  const arr1 = await executeAsync(args[0], scope)
  if (!arr1.isArray()) {
    return NULL_VALUE
  }

  const arr2 = await executeAsync(args[1], scope)
  if (!arr2.isArray()) {
    return NULL_VALUE
  }

  for await (const v1 of arr1) {
    for await (const v2 of arr2) {
      if (isEqual(v1, v2)) {
        return TRUE_VALUE
      }
    }
  }

  return FALSE_VALUE
})
array['intersects'].arity = 2

export default array
