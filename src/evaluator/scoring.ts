import type {ExprNode, Value} from '../nodeTypes'
import {DateTime, isIterable} from '../values'
import {evaluate} from './evaluate'
import {matchPatternRegex, matchTokenize} from './matching'
import type {Scope} from './scope'
import type {Context} from './types'

export type Pattern = (tokens: string[] | IteratorObject<string>) => boolean

export function compare(a: Value, b: Value): number {
  // Allow null values to be compared if they are both null.
  // if (a === null && b === null) return 0

  // Check if both values have the same type.
  if (typeof a !== typeof b) {
    throw new Error('Cannot compare values of different types')
  }

  // For numbers and booleans.
  if (typeof a === 'number' || typeof a === 'boolean') {
    if (a < (b as number | boolean)) return -1
    if (a > (b as number | boolean)) return 1
    return 0
  }

  if (a instanceof DateTime && b instanceof DateTime) {
    return a.getTime() - b.getTime()
  }

  // For strings.
  if (typeof a === 'string' && typeof b === 'string') {
    if (a < b) return -1
    if (a > b) return 1
    return 0
  }

  // For unsupported types.
  throw new Error(
    'Unsupported type: only numbers, booleans, strings, DateTime instances and null are supported',
  )
}

export function isEqual(a: Value, b: Value): boolean {
  try {
    if (a === null && b === null) return true
    return compare(a, b) === 0
  } catch {
    return false
  }
}

const BM25k = 1.2

export function evaluateScore(node: ExprNode, scope: Scope, context: Context): number {
  if (node.type === 'OpCall' && node.op === 'match') {
    const left = evaluate(node.left, scope, context)
    const right = evaluate(node.right, scope, context)
    const tokens = (isIterable(left) ? Array.from(left) : [left])
      .filter((i) => typeof i === 'string')
      .flatMap(matchTokenize)

    const terms = (isIterable(right) ? Array.from(right) : [right])
      .filter((i) => typeof i === 'string')
      .flatMap(matchPatternRegex)

    // if either iterable is empty
    if (tokens.length === 0) return 0
    if (terms.length === 0) return 0

    return terms.reduce((score, re) => {
      const freq = Array.from(tokens).reduce((c, token) => c + (re.test(token) ? 1 : 0), 0)
      return score + (freq * (BM25k + 1)) / (freq + BM25k)
    }, 0)
  }

  if (node.type === 'FuncCall' && node.name === 'boost') {
    const [baseArg, boostArg] = node.args
    const score = evaluateScore(baseArg, scope, context)
    const boost = evaluate(boostArg, scope, context)
    if (typeof boost === 'number' && score > 0) return score + boost
    return 0
  }

  if (node.type === 'Or') {
    const leftScore = evaluateScore(node.left, scope, context)
    const rightScore = evaluateScore(node.right, scope, context)
    return leftScore + rightScore
  }

  if (node.type === 'And') {
    const leftScore = evaluateScore(node.left, scope, context)
    const rightScore = evaluateScore(node.right, scope, context)
    if (leftScore === 0 || rightScore === 0) return 0
    return leftScore + rightScore
  }

  return evaluate(node, scope, context) === true ? 1 : 0
}
