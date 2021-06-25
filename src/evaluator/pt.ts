import {NULL_VALUE, Value} from '../values'

export async function portableTextContent(value: Value): Promise<string | null> {
  if (value.type === 'object') {
    return blockText(value.data)
  } else if (value.isArray()) {
    const texts = await arrayText(value)
    if (texts.length > 0) {
      return texts.join('\n\n')
    }
  }

  return null
}

async function arrayText(value: Value, result: string[] = []): Promise<string[]> {
  for await (const block of value) {
    if (block.type === 'object') {
      const text = blockText(block.data)
      if (text !== null) result.push(text)
    } else if (block.isArray()) {
      await arrayText(block, result)
    }
  }

  return result
}

function blockText(obj: Record<string, unknown>): string | null {
  if (typeof obj._type !== 'string') return null
  const children = obj.children
  if (!Array.isArray(children)) return null

  let result = ''
  for (const child of children) {
    if (
      child &&
      typeof child === 'object' &&
      typeof child._type === 'string' &&
      child._type === 'span' &&
      typeof child.text === 'string'
    ) {
      result += child.text
    }
  }
  return result
}
