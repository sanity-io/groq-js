import type {ExprNode} from '../nodeTypes'
import {executeAsync} from './evaluate'
import {gatherText, matchPatternRegex, matchTokenize, type Token} from './matching'
import {Scope} from './scope'

// BM25 similarity constants
const BM25k = 1.2

export async function evaluateScore(node: ExprNode, scope: Scope): Promise<number> {
  if (node.type === 'OpCall' && node.op === 'match') {
    return evaluateMatchScore(node.left, node.right, scope)
  }

  if (node.type === 'FuncCall' && node.name === 'boost') {
    const innerScore = await evaluateScore(node.args[0], scope)
    const boost = await executeAsync(node.args[1], scope)
    if (boost.type === 'number' && innerScore > 0) {
      return innerScore + boost.data
    }

    return 0
  }

  switch (node.type) {
    case 'Or': {
      const leftScore = await evaluateScore(node.left, scope)
      const rightScore = await evaluateScore(node.right, scope)
      return leftScore + rightScore
    }
    case 'And': {
      const leftScore = await evaluateScore(node.left, scope)
      const rightScore = await evaluateScore(node.right, scope)
      if (leftScore === 0 || rightScore === 0) return 0
      return leftScore + rightScore
    }
    default: {
      const res = await executeAsync(node, scope)
      return res.type === 'boolean' && res.data === true ? 1 : 0
    }
  }
}

async function evaluateMatchScore(left: ExprNode, right: ExprNode, scope: Scope): Promise<number> {
  const text = await executeAsync(left, scope)
  const pattern = await executeAsync(right, scope)

  let tokens: Token[] = []
  let terms: RegExp[] = []

  await gatherText(text, (part) => {
    tokens = tokens.concat(matchTokenize(part))
  })

  const didSucceed = await gatherText(pattern, (part) => {
    terms = terms.concat(matchPatternRegex(part))
  })

  if (!didSucceed) {
    return 0
  }

  if (tokens.length === 0 || terms.length === 0) {
    return 0
  }

  let score = 0

  for (const re of terms) {
    const freq = tokens.reduce((c, token) => c + (re.test(token) ? 1 : 0), 0)
    score += (freq * (BM25k + 1)) / (freq + BM25k)
  }

  return score
}
