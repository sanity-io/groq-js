import type {Value} from '../nodeTypes'
import {isIterable} from '../values/utils'

const CHARS = /([^!@#$%^&*(),\\/?";:{}|[\]+<>\s-])+/g
const CHARS_WITH_WILDCARD = /([^!@#$%^&(),\\/?";:{}|[\]+<>\s-])+/g
const EDGE_CHARS = /(\b\.+|\.+\b)/g
const MAX_TERM_LENGTH = 1024

export function matchTokenize(text: string): string[] {
  return text.replace(EDGE_CHARS, '').match(CHARS) || []
}

export function matchPatternRegex(text: string): RegExp[] {
  const terms = text.replace(EDGE_CHARS, '').match(CHARS_WITH_WILDCARD) || []
  return terms.map(
    (term) => new RegExp(`^${term.slice(0, MAX_TERM_LENGTH).replace(/\*/g, '.*')}$`, 'i'),
  )
}

export function match(left: Value, right: Value): boolean {
  // Convert right side to array of patterns, handling both iterable and single values
  const patterns = isIterable(right) ? Array.from(right) : [right]
  // If any pattern is null, return null to indicate no match is possible
  if (patterns.some((i) => i === null)) return false

  const terms = patterns.filter((i) => typeof i === 'string').flatMap(matchPatternRegex)
  const source = new Set(
    (isIterable(left) ? Array.from(left) : [left])
      .filter((i) => typeof i === 'string')
      .flatMap(matchTokenize),
  )

  // if there are no patterns or tokens return false
  if (!terms.length) return false
  if (!source.size) return false

  return terms.every((term) => source.values().some((input) => term.test(input)))
}
