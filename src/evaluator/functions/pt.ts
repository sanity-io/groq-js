import {type ExprNode, type Value} from '../../nodeTypes'
import {isIterable, isRecord} from '../../values/utils'
import {type EvaluateContext} from '../../types'
import {iteratorFrom} from '../../values/iteratorFrom'

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
      iteratorFrom(children)
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

export function text(args: ExprNode[], context: EvaluateContext): string | null {
  const {evaluate} = context
  return portableTextContent(evaluate(args[0], context))
}
