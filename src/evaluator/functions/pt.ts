import type {FunctionSet} from '.'
import {fromString, NULL_VALUE} from '../../values'
import {portableTextContent} from '../pt'

const pt: FunctionSet = {}
pt['text'] = async function (args, scope, execute) {
  const value = await execute(args[0], scope)
  const text = await portableTextContent(value)

  if (text === null) {
    return NULL_VALUE
  }

  return fromString(text)
}

pt['text'].arity = 1

export default pt
