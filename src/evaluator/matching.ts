import type {Value} from '../values'

const CHARS = /([^!@#$%^&*(),\\/?";:{}|[\]+<>\s-])+/g
const CHARS_WITH_WILDCARD = /([^!@#$%^&(),\\/?";:{}|[\]+<>\s-])+/g
const EDGE_CHARS = /(\b\.+|\.+\b)/g
const MAX_TERM_LENGTH = 1024

export type Token = string

export type Pattern = (tokens: Token[]) => boolean

export function matchText(tokens: Token[], patterns: Pattern[]): boolean {
  if (tokens.length === 0 || patterns.length === 0) {
    return false
  }

  return patterns.every((pattern) => pattern(tokens))
}

export function matchTokenize(text: string): Token[] {
  return text.replace(EDGE_CHARS, '').match(CHARS) || []
}

export function matchAnalyzePattern(text: string): Pattern[] {
  const termsRe = matchPatternRegex(text)
  return termsRe.map((re) => (tokens: Token[]) => tokens.some((token) => re.test(token)))
}

export function matchPatternRegex(text: string): RegExp[] {
  const terms = text.replace(EDGE_CHARS, '').match(CHARS_WITH_WILDCARD) || []
  return terms.map(
    (term) => new RegExp(`^${term.slice(0, MAX_TERM_LENGTH).replace(/\*/g, '.*')}$`, 'i'),
  )
}

export type GatheredText<T> = {
  parts: T[]
  /** This is true if all of the values in the array were strings. */
  success: boolean
}

export function gatherText<T>(
  value: Value,
  flatMap: (str: string) => T[],
): Promise<GatheredText<T>> | GatheredText<T> {
  if (value.type === 'string') {
    return {parts: flatMap(value.data), success: true}
  }

  if (value.type === 'array') {
    let success = true
    const parts: T[] = []

    for (const part of value.data) {
      if (typeof part === 'string') {
        parts.push(...flatMap(part))
      } else {
        success = false
      }
    }

    return {parts, success}
  }

  if (value.type === 'stream') {
    return (async () => {
      let success = true
      const parts: T[] = []

      for await (const part of value) {
        if (part.type === 'string') {
          parts.push(...flatMap(part.data))
        } else {
          success = false
        }
      }
      return {parts, success}
    })()
  }

  return {parts: [], success: false}
}
