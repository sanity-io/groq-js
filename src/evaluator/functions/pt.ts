import {fromString, NULL_VALUE} from '../../values'
import {mappedExecutor} from '../evaluate'
import {portableTextContent} from '../pt'
import type {FunctionSet} from '.'

const pt: FunctionSet = {}
pt['text'] = mappedExecutor(
  (args) => args,
  (_, value) => {
    const text = portableTextContent(value)

    if (text === null) {
      return NULL_VALUE
    }

    return fromString(text)
  },
)

pt['text'].arity = 1

export default pt
