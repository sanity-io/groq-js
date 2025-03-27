import type {ExprNode, Value} from '../../nodeTypes'
import {isIterable, isRecord} from '../../values/utils'
import {evaluate} from '../evaluate'
import type {Scope} from '../scope'
import type {Context} from '../types'

interface PortableTextSpan {
  _type: 'span'
  text: string
}

const isSpan = (value: Value): value is PortableTextSpan & Record<string, Value> =>
  isRecord(value) && value['_type'] === 'span' && typeof value['text'] === 'string'

function portableTextContent(value: Value): string | null {
  if (isRecord(value)) {
    if (typeof value['_type'] !== 'string') return null
    const children = value['children']
    if (!isIterable(children)) return null
    return Array.from(
      Iterator.from(children)
        .filter(isSpan)
        .map((i) => i.text),
    ).join('')
  }

  if (isIterable(value)) {
    const blocks = Array.from(value)
      .map(portableTextContent)
      .filter((i) => i !== null)
    return blocks.length ? blocks.join('\n\n') : null
  }

  return null
}

export function text(args: ExprNode[], scope: Scope, context: Context): string | null {
  return portableTextContent(evaluate(args[0], scope, context))
}
text.arity = 1
