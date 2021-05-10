import {Value} from '../values'

export type Token = string

export type Pattern = (tokens: Token[]) => boolean

export function matchText(tokens: Token[], patterns: Pattern[]): boolean {
  if (tokens.length === 0 || patterns.length === 0) {
    return false
  }

  return patterns.every((pattern) => pattern(tokens))
}

export function matchTokenize(text: string): Token[] {
  return text.match(/[A-Za-z0-9]+/g) || []
}

const MAX_TERM_LENGTH = 1024

export function matchAnalyzePattern(text: string): Pattern {
  const termsRe = matchPatternRegex(text)
  return (tokens: Token[]) => termsRe.every((re) => tokens.some((token) => re.test(token)))
}

export function matchPatternRegex(text: string): RegExp[] {
  const terms = text.match(/[A-Za-z0-9*]+/g) || []
  return terms.map(
    (term) => new RegExp(`^${term.slice(0, MAX_TERM_LENGTH).replace(/\*/g, '.*')}$`, 'i')
  )
}

export async function gatherText(value: Value, cb: (str: string) => void): Promise<boolean> {
  if (value.type === 'string') {
    cb(value.data)
    return true
  }

  if (value.isArray()) {
    let success = true
    for await (const part of value) {
      if (part.type === 'string') {
        cb(part.data)
      } else {
        success = false
      }
    }
    return success
  }

  return false
}
