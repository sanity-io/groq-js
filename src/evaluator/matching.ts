const CHARS = /([^!@#$%^&*(),\\/?";:{}|[\]+<>\s-])+/g
const CHARS_WITH_WILDCARD = /([^!@#$%^&(),\\/?";:{}|[\]+<>\s-])+/g
const EDGE_CHARS = /(\b\.+|\.+\b)/g
const MAX_TERM_LENGTH = 1024

export type Pattern = (tokens: string[]) => boolean

export function matchText(tokens: string[], patterns: Pattern[]): boolean {
  if (tokens.length === 0 || patterns.length === 0) {
    return false
  }

  return patterns.every((pattern) => pattern(tokens))
}

export function matchTokenize(text: string): string[] {
  return text.replace(EDGE_CHARS, '').match(CHARS) || []
}

export function matchAnalyzePattern(text: string): Pattern[] {
  const termsRe = matchPatternRegex(text)
  return termsRe.map((re) => (tokens: string[]) => tokens.some((token) => re.test(token)))
}

export function matchPatternRegex(text: string): RegExp[] {
  const terms = text.replace(EDGE_CHARS, '').match(CHARS_WITH_WILDCARD) || []
  return terms.map(
    (term) => new RegExp(`^${term.slice(0, MAX_TERM_LENGTH).replace(/\*/g, '.*')}$`, 'i'),
  )
}
