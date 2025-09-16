import type {FunctionSet} from '.'
import {FALSE_VALUE, fromJS, fromString, getType, NULL_VALUE, TRUE_VALUE} from '../../values'
import {isEqual} from '../equality'
import {arrayExecutor, mappedExecutor} from '../evaluate'

const array: FunctionSet = {}

array['join'] = mappedExecutor(
  (args) => args,
  (_, arr, sep) => {
    if (arr.type !== 'array') {
      return NULL_VALUE
    }
    if (sep.type !== 'string') {
      return NULL_VALUE
    }
    let buf = ''
    let needSep = false
    for (const elem of arr.data) {
      if (needSep) {
        buf += sep.data
      }
      switch (getType(elem)) {
        case 'number':
        case 'string':
        case 'boolean':
        case 'datetime':
          buf += `${elem}`
          break
        default:
          return NULL_VALUE
      }
      needSep = true
    }
    return fromString(buf)
  },
)
array['join'].arity = 2

array['compact'] = arrayExecutor(
  ([array]) => ({array: array!}),
  function* (_, item) {
    if (item !== null) yield item
  },
)
array['compact'].arity = 1

array['unique'] = arrayExecutor(
  (args) => ({array: args[0]!, state: new Set()}),
  function* (_node, iter, _inner, added) {
    switch (getType(iter)) {
      case 'number':
      case 'string':
      case 'boolean':
      case 'datetime':
        if (!added!.has(iter)) {
          added!.add(iter)
          yield iter
        }
        break
      default:
        yield iter
    }
  },
)
array['unique'].arity = 1

array['intersects'] = mappedExecutor(
  (args) => args,
  (_, arr1, arr2) => {
    // Intersects returns true if the two arrays have at least one element in common. Only
    // primitives are supported; non-primitives are ignored.
    if (arr1.type !== 'array' || arr2.type !== 'array') {
      return NULL_VALUE
    }

    for (const v1 of arr1.data) {
      for (const v2 of arr2.data) {
        if (isEqual(fromJS(v1), fromJS(v2))) {
          return TRUE_VALUE
        }
      }
    }

    return FALSE_VALUE
  },
)
array['intersects'].arity = 2

export default array
