import type {FunctionSet} from '.'
import {fromNumber, NULL_VALUE} from '../../values'
import {arrayReducerExecutor, STOP_ITERATOR} from '../evaluate'

const math: FunctionSet = {}
math['min'] = arrayReducerExecutor(
  (args) => ({array: args[0]!}),
  () => undefined as undefined | number,
  (_, n, item) => {
    if (item === null) return n
    if (typeof item !== 'number') return STOP_ITERATOR
    if (n === undefined || item < n) return item
    return n
  },
  (n) => (n === undefined ? NULL_VALUE : fromNumber(n)),
)
math['min'].arity = 1

math['max'] = arrayReducerExecutor(
  (args) => ({array: args[0]!}),
  () => undefined as undefined | number,
  (_, n, item) => {
    if (item === null) return n
    if (typeof item !== 'number') return STOP_ITERATOR
    if (n === undefined || item > n) return item
    return n
  },
  (n) => (n === undefined ? NULL_VALUE : fromNumber(n)),
)
math['max'].arity = 1

math['sum'] = arrayReducerExecutor(
  (args) => ({array: args[0]!}),
  () => 0,
  (_, n, item) => {
    if (item === null) return n
    if (typeof item !== 'number') return STOP_ITERATOR
    return n + item
  },
  fromNumber,
)
math['sum'].arity = 1

math['avg'] = arrayReducerExecutor(
  (args) => ({array: args[0]!}),
  () => ({count: 0, sum: 0}),
  (_, {count, sum}, item) => {
    if (item === null) return {count, sum}
    if (typeof item !== 'number') return STOP_ITERATOR
    return {count: count + 1, sum: sum + item}
  },
  ({count, sum}) => (count === 0 ? NULL_VALUE : fromNumber(sum / count)),
)
math['avg'].arity = 1

export default math
