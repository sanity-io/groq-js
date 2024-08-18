import {
  matchAnalyzePattern,
  matchText,
  matchTokenize,
  type Pattern,
  type Token,
} from '../evaluator/matching'
import type {ConcreteTypeNode} from './typeHelpers'

export function match(left: ConcreteTypeNode, right: ConcreteTypeNode): boolean | undefined {
  let tokens: Token[] = []
  let patterns: Pattern[] = []
  if (left.type === 'string') {
    if (left.value === undefined) {
      return undefined
    }
    tokens = tokens.concat(matchTokenize(left.value))
  }
  if (left.type === 'array') {
    if (left.of.type === 'unknown') {
      return undefined
    }
    if (left.of.type === 'string') {
      // eslint-disable-next-line max-depth
      if (left.of.value === undefined) {
        return undefined
      }

      tokens = tokens.concat(matchTokenize(left.of.value))
    }
    if (left.of.type === 'union') {
      // eslint-disable-next-line max-depth
      for (const node of left.of.of) {
        // eslint-disable-next-line max-depth
        if (node.type === 'string' && node.value !== undefined) {
          tokens = tokens.concat(matchTokenize(node.value))
        }
      }
    }
  }

  if (right.type === 'string') {
    if (right.value === undefined) {
      return undefined
    }
    patterns = patterns.concat(matchAnalyzePattern(right.value))
  }
  if (right.type === 'array') {
    if (right.of.type === 'unknown') {
      return undefined
    }
    if (right.of.type === 'string') {
      // eslint-disable-next-line max-depth
      if (right.of.value === undefined) {
        return undefined
      }
      patterns = patterns.concat(matchAnalyzePattern(right.of.value))
    }
    if (right.of.type === 'union') {
      // eslint-disable-next-line max-depth
      for (const node of right.of.of) {
        // eslint-disable-next-line max-depth
        if (node.type === 'string') {
          // eslint-disable-next-line max-depth
          if (node.value === undefined) {
            return undefined
          }
          patterns = patterns.concat(matchAnalyzePattern(node.value))
        }

        // eslint-disable-next-line max-depth
        if (node.type !== 'string') {
          return false
        }
      }
    }
  }
  return matchText(tokens, patterns)
}
