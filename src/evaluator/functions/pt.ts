import type {FunctionSet} from '.'
import {fromString, NULL_VALUE} from '../../values'
import {portableTextContent} from '../pt'
import {mappedExecutor} from '../evaluate'

const pt: FunctionSet = {}
pt['text'] = mappedExecutor(
  (args) => args,
  function (_, value) {
    const text = portableTextContent(value)

    if (text === null) {
      return NULL_VALUE
    }

    return fromString(text)
  },
)

pt['text'].arity = 1

export default pt
