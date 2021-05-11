import {NULL_VALUE, Value} from '../values'

export async function portableTextContent(value: Value): Promise<string | null> {
  if (value.type === 'object') {
    return blockText(value.data)
  }

  let result = ''
  let first = true

  if (value.isArray()) {
    for await (const block of value) {
      if (block.type !== 'object') continue

      const text = blockText(block.data)
      if (text === null) continue

      if (!first) {
        result += '\n\n'
      }
      first = false
      result += text
    }
  }

  // If there were no blocks => Return null.
  if (first) return null

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
