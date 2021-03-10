import {Executor, Scope} from '.'
import {SyntaxNode} from '../nodeTypes'
import {gatherText, matchPatternRegex, matchTokenize, Token} from './matching'

// BM25 similarity constants
const BM25k = 1.2

export async function evaluateScore(
  node: SyntaxNode,
  scope: Scope,
  execute: Executor
): Promise<number> {
  if (node.type === 'OpCall' && node.op === 'match') {
    return evaluateMatchScore(node.left, node.right, scope, execute)
  }

  switch (node.type) {
    case 'OpCall':
    case 'Not': {
      const res = await execute(node, scope)
      return res.getBoolean() ? 2 : 1
    }
    case 'Or': {
      const leftScore = await evaluateScore(node.left, scope, execute)
      const rightScore = await evaluateScore(node.right, scope, execute)
      return leftScore + rightScore
    }
    case 'And': {
      const leftScore = await evaluateScore(node.left, scope, execute)
      const rightScore = await evaluateScore(node.right, scope, execute)
      if (leftScore === 1 || rightScore === 1) return 1
      return leftScore + rightScore
    }
    default:
  }

  return 1
}

async function evaluateMatchScore(
  left: SyntaxNode,
  right: SyntaxNode,
  scope: Scope,
  execute: Executor
): Promise<number> {
  const text = await execute(left, scope)
  const pattern = await execute(right, scope)

  let tokens: Token[] = []
  let terms: RegExp[] = []

  await gatherText(text, (part) => {
    tokens = tokens.concat(matchTokenize(part))
  })

  const didSucceed = await gatherText(pattern, (part) => {
    terms = terms.concat(matchPatternRegex(part))
  })

  if (!didSucceed) {
    return 1
  }

  if (tokens.length === 0 || terms.length === 0) {
    return 1
  }

  let score = 0

  for (const re of terms) {
    const freq = tokens.reduce((c, token) => c + (re.test(token) ? 1 : 0), 0)
    score += (freq * (BM25k + 1)) / (freq + BM25k)
  }

  return score
}
