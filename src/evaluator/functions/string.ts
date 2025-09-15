import type {FunctionSet} from '.'
import {FALSE_VALUE, fromArray, fromString, NULL_VALUE, TRUE_VALUE} from '../../values'
import {mappedExecutor} from '../evaluate'

const string: FunctionSet = {}

string['lower'] = mappedExecutor(
  (args) => args,
  (_, value) => {
    if (value.type !== 'string') {
      return NULL_VALUE
    }

    return fromString(value.data.toLowerCase())
  },
)
string['lower'].arity = 1

string['upper'] = mappedExecutor(
  (args) => args,
  (_, value) => {
    if (value.type !== 'string') {
      return NULL_VALUE
    }

    return fromString(value.data.toUpperCase())
  },
)
string['upper'].arity = 1

string['split'] = mappedExecutor(
  (args) => args,
  (_, str, sep) => {
    if (str.type !== 'string') {
      return NULL_VALUE
    }
    if (sep.type !== 'string') {
      return NULL_VALUE
    }

    if (str.data.length === 0) {
      return fromArray([])
    }
    if (sep.data.length === 0) {
      // This uses a Unicode codepoint splitting algorithm
      return fromArray(Array.from(str.data))
    }
    return fromArray(str.data.split(sep.data))
  },
)
string['split'].arity = 2

string['startsWith'] = mappedExecutor(
  (args) => args,
  (_, str, prefix) => {
    if (str.type !== 'string') {
      return NULL_VALUE
    }

    if (prefix.type !== 'string') {
      return NULL_VALUE
    }

    return str.data.startsWith(prefix.data) ? TRUE_VALUE : FALSE_VALUE
  },
)
string['startsWith'].arity = 2

export default string
