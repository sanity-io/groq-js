import {Value} from '../values'

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
      if (!text) continue
      if (!first) {
        result += '\n\n'
        first = false
      }
      result += text
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
    if (child && typeof child === 'object' && typeof child.text === 'string') {
      result += child.text
    }
  }
  return result
}
