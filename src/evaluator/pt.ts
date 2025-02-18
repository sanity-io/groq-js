import {co, fromJS, type Value} from '../values'

export function portableTextContent(
  value: Value,
  mode: 'sync' | 'async',
): string | null | PromiseLike<string | null> {
  return co<unknown>(function* (): Generator<
    string[] | PromiseLike<string[]>,
    string | null,
    string[]
  > {
    if (value.type === 'object') {
      return blockText(value.data)
    } else if (value.isArray()) {
      const texts = yield arrayText(value, mode)
      if (texts.length > 0) {
        return texts.join('\n\n')
      }
    }

    return null
  }) as string | null | PromiseLike<string | null>
}

function arrayText(value: Value, mode: 'sync' | 'async'): string[] | PromiseLike<string[]> {
  return co<unknown>(function* (): Generator<unknown, string[], unknown> {
    const result: string[] = []

    const data = (yield value.get()) as unknown[]
    for (const item of data) {
      const block = fromJS(item, mode)
      if (block.type === 'object') {
        const text = blockText(block.data)
        if (text !== null) result.push(text)
      } else if (block.isArray()) {
        const children = (yield arrayText(block, mode)) as string[]
        result.push(...children)
      }
    }

    return result
  }) as string[] | PromiseLike<string[]>
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
