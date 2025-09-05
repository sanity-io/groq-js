import type {FunctionSet} from '.'
import {FALSE_VALUE, fromJS, fromString, NULL_VALUE, TRUE_VALUE} from '../../values'

const string: FunctionSet = {}

string['lower'] = async function (args, scope, execute) {
  const value = await execute(args[0], scope)

  if (value.type !== 'string') {
    return NULL_VALUE
  }

  return fromString(value.data.toLowerCase())
}
string['lower'].arity = 1

string['upper'] = async function (args, scope, execute) {
  const value = await execute(args[0], scope)

  if (value.type !== 'string') {
    return NULL_VALUE
  }

  return fromString(value.data.toUpperCase())
}
string['upper'].arity = 1

string['split'] = async function (args, scope, execute) {
  const str = await execute(args[0], scope)
  if (str.type !== 'string') {
    return NULL_VALUE
  }
  const sep = await execute(args[1], scope)
  if (sep.type !== 'string') {
    return NULL_VALUE
  }

  if (str.data.length === 0) {
    return fromJS([])
  }
  if (sep.data.length === 0) {
    // This uses a Unicode codepoint splitting algorithm
    return fromJS(Array.from(str.data))
  }
  return fromJS(str.data.split(sep.data))
}
string['split'].arity = 2

string['startsWith'] = async function (args, scope, execute) {
  const str = await execute(args[0], scope)
  if (str.type !== 'string') {
    return NULL_VALUE
  }

  const prefix = await execute(args[1], scope)
  if (prefix.type !== 'string') {
    return NULL_VALUE
  }

  return str.data.startsWith(prefix.data) ? TRUE_VALUE : FALSE_VALUE
}
string['startsWith'].arity = 2

export default string
