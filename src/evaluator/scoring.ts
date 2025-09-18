import type {ExprNode} from '../nodeTypes'
import type {Value} from '../values'
import {executeAsync, executeSync} from './evaluate'
import {
  gatherText,
  matchPatternRegex,
  matchTokenize,
  type GatheredText,
  type Token,
} from './matching'
import {Scope} from './scope'

// BM25 similarity constants
const BM25k = 1.2

export async function evaluateScoreAsync(node: ExprNode, scope: Scope): Promise<number> {
  if (node.type === 'OpCall' && node.op === 'match') {
    return evaluateMatchScoreAsync(node.left, node.right, scope)
  }

  if (node.type === 'FuncCall' && node.name === 'boost') {
    const innerScore = await evaluateScoreAsync(node.args[0]!, scope)
    const boost = await executeAsync(node.args[1]!, scope)
    if (boost.type === 'number' && innerScore > 0) {
      return innerScore + boost.data
    }

    return 0
  }

  switch (node.type) {
    case 'Or': {
      const leftScore = await evaluateScoreAsync(node.left, scope)
      const rightScore = await evaluateScoreAsync(node.right, scope)
      return leftScore + rightScore
    }
    case 'And': {
      const leftScore = await evaluateScoreAsync(node.left, scope)
      const rightScore = await evaluateScoreAsync(node.right, scope)
      if (leftScore === 0 || rightScore === 0) return 0
      return leftScore + rightScore
    }
    default: {
      const res = await executeAsync(node, scope)
      return res.type === 'boolean' && res.data === true ? 1 : 0
    }
  }
}

export function evaluateScoreSync(node: ExprNode, scope: Scope): number {
  if (node.type === 'OpCall' && node.op === 'match') {
    return evaluateMatchScoreSync(node.left, node.right, scope)
  }

  if (node.type === 'FuncCall' && node.name === 'boost') {
    const innerScore = evaluateScoreSync(node.args[0]!, scope)
    const boost = executeSync(node.args[1]!, scope)
    if (boost.type === 'number' && innerScore > 0) {
      return innerScore + boost.data
    }

    return 0
  }

  switch (node.type) {
    case 'Or': {
      const leftScore = evaluateScoreSync(node.left, scope)
      const rightScore = evaluateScoreSync(node.right, scope)
      return leftScore + rightScore
    }
    case 'And': {
      const leftScore = evaluateScoreSync(node.left, scope)
      const rightScore = evaluateScoreSync(node.right, scope)
      if (leftScore === 0 || rightScore === 0) return 0
      return leftScore + rightScore
    }
    default: {
      const res = executeSync(node, scope)
      return res.type === 'boolean' && res.data === true ? 1 : 0
    }
  }
}

function evaluateMatchScoreSync(left: ExprNode, right: ExprNode, scope: Scope): number {
  const text = executeSync(left, scope)
  const pattern = executeSync(right, scope)
  const result = processMatchScore(text, pattern)
  if (typeof result === 'number') return result
  throw new Error('Found synchronous value in match()')
}

async function evaluateMatchScoreAsync(
  left: ExprNode,
  right: ExprNode,
  scope: Scope,
): Promise<number> {
  const text = await executeAsync(left, scope)
  const pattern = await executeAsync(right, scope)
  return processMatchScore(text, pattern)
}

function processMatchScore(text: Value, pattern: Value): Promise<number> | number {
  const tokens = gatherText(text, (part) => matchTokenize(part))
  const terms = gatherText(pattern, (part) => matchPatternRegex(part))

  const process = (tokens: GatheredText<Token>, terms: GatheredText<RegExp>): number => {
    if (!terms.success) return 0

    if (tokens.parts.length === 0 || terms.parts.length === 0) {
      return 0
    }

    let score = 0

    for (const re of terms.parts) {
      const freq = tokens.parts.reduce((c, token) => c + (re.test(token) ? 1 : 0), 0)
      score += (freq * (BM25k + 1)) / (freq + BM25k)
    }

    return score
  }

  if ('then' in tokens || 'then' in terms) {
    return (async () => process(await tokens, await terms))()
  }

  return process(tokens, terms)
}
