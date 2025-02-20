import type {ExprNode} from '../nodeTypes'
import {evaluate, isIterable} from './evaluate'
import {matchPatternRegex, matchTokenize} from './matching'
import type {Context} from './types'

// BM25 similarity constants
const BM25k = 1.2

interface EvaluateScoreOptions extends Context {
  node: ExprNode
}

export function evaluateScore({node, ...context}: EvaluateScoreOptions): number {
  if (node.type === 'OpCall' && node.op === 'match') {
    const left = evaluate({...context, node: node.left})
    const right = evaluate({...context, node: node.right})
    const tokens = (isIterable(left) ? Iterator.from(left) : [left].values())
      .filter((i) => typeof i === 'string')
      .flatMap(matchTokenize)
    const terms = (isIterable(right) ? Iterator.from(right) : [right].values())
      .filter((i) => typeof i === 'string')
      .flatMap(matchPatternRegex)

    // if either iterable is empty
    if (!tokens.some(() => true)) return 0
    if (!terms.some(() => true)) return 0

    return terms.reduce((score, re) => {
      const freq = tokens.reduce((c, token) => c + (re.test(token) ? 1 : 0), 0)
      return score + (freq * (BM25k + 1)) / (freq + BM25k)
    }, 0)
  }

  if (node.type === 'FuncCall' && node.name === 'boost') {
    const [baseArg, boostArg] = node.args
    const score = evaluateScore({...context, node: baseArg})
    const boost = evaluate({...context, node: boostArg})
    if (typeof boost === 'number' && score > 0) return score + boost
    return 0
  }

  if (node.type === 'Or') {
    const leftScore = evaluateScore({...context, node: node.left})
    const rightScore = evaluateScore({...context, node: node.right})
    return leftScore + rightScore
  }

  if (node.type === 'And') {
    const leftScore = evaluateScore({...context, node: node.left})
    const rightScore = evaluateScore({...context, node: node.right})
    if (leftScore === 0 || rightScore === 0) return 0
    return leftScore + rightScore
  }

  return evaluate({...context, node}) === true ? 1 : 0
}
