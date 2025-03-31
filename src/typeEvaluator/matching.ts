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
      if (left.of.value === undefined) {
        return undefined
      }

      tokens = tokens.concat(matchTokenize(left.of.value))
    }
    if (left.of.type === 'union') {
      for (const node of left.of.of) {
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
      if (right.of.value === undefined) {
        return undefined
      }
      patterns = patterns.concat(matchAnalyzePattern(right.of.value))
    }
    if (right.of.type === 'union') {
      for (const node of right.of.of) {
        if (node.type === 'string') {
          if (node.value === undefined) {
            return undefined
          }
          patterns = patterns.concat(matchAnalyzePattern(node.value))
        }

        if (node.type !== 'string') {
          return false
        }
      }
    }
  }
  return matchText(tokens, patterns)
}
