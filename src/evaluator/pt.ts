import type {AnyStaticValue} from '../values'

export function portableTextContent(value: AnyStaticValue): string | null {
  if (value.type === 'object') {
    return blockText(value.data)
  } else if (value.type === 'array') {
    const texts = arrayText(value.data)
    if (texts.length > 0) {
      return texts.join('\n\n')
    }
  }

  return null
}

function arrayText(value: unknown[], result: string[] = []): string[] {
  for (const block of value) {
    if (Array.isArray(block)) {
      arrayText(block, result)
    } else if (typeof block === 'object' && block) {
      const text = blockText(block as Record<string, unknown>)
      if (text !== null) result.push(text)
    }
  }

  return result
}

function blockText(obj: Record<string, unknown>): string | null {
  if (typeof obj['_type'] !== 'string') return null
  const children = obj['children']
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
