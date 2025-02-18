import type {ExprNode} from '../nodeTypes'
import {co, type Value} from '../values'
import {evaluate} from './evaluate'
import {matchPatternRegex, matchTokenize} from './matching'
import {Scope} from './scope'

// BM25 similarity constants
const BM25k = 1.2

export function evaluateScore(
  node: ExprNode,
  scope: Scope,
  mode: 'sync' | 'async',
): number | PromiseLike<number> {
  return co<unknown>(function* () {
    if (node.type === 'OpCall' && node.op === 'match') {
      const left = (yield evaluate(node.left, scope, mode)) as Value
      const right = (yield evaluate(node.right, scope, mode)) as Value
      return evaluateMatchScore(left, right)
    }

    if (node.type === 'FuncCall' && node.name === 'boost') {
      const innerScore = (yield evaluateScore(node.args[0], scope, mode)) as number
      const boost = (yield evaluate(node.args[1], scope, mode)) as Value
      if (boost.type === 'number' && innerScore > 0) {
        return innerScore + boost.data
      }

      return 0
    }

    switch (node.type) {
      case 'Or': {
        const leftScore = (yield evaluateScore(node.left, scope, mode)) as number
        const rightScore = (yield evaluateScore(node.right, scope, mode)) as number
        return leftScore + rightScore
      }
      case 'And': {
        const leftScore = (yield evaluateScore(node.left, scope, mode)) as number
        const rightScore = (yield evaluateScore(node.right, scope, mode)) as number
        if (leftScore === 0 || rightScore === 0) return 0
        return leftScore + rightScore
      }
      default: {
        const res = (yield evaluate(node, scope, mode)) as Value
        return res.type === 'boolean' && res.data === true ? 1 : 0
      }
    }
  }) as number | PromiseLike<number>
}

function evaluateMatchScore(left: Value, right: Value): number | PromiseLike<number> {
  return co<unknown>(function* (): Generator<unknown, number, unknown> {
    const leftData = yield left.get()
    const rightData = yield right.get()

    let leftStrings: string[] = []
    if (Array.isArray(leftData)) {
      leftStrings = leftData.filter((i) => typeof i === 'string')
    } else if (typeof leftData === 'string') {
      leftStrings = [leftData]
    }

    let rightStrings: string[] | undefined
    if (Array.isArray(rightData)) {
      rightStrings = rightData.filter((i) => typeof i === 'string')
    } else if (typeof rightData === 'string') {
      rightStrings = [rightData]
    }

    if (!rightStrings?.length) {
      return 0
    }

    const tokens = leftStrings.flatMap(matchTokenize)
    const terms = rightStrings.flatMap(matchPatternRegex)

    if (tokens.length === 0 || terms.length === 0) {
      return 0
    }

    let score = 0

    for (const re of terms) {
      const freq = tokens.reduce((c, token) => c + (re.test(token) ? 1 : 0), 0)
      score += (freq * (BM25k + 1)) / (freq + BM25k)
    }

    return score
  }) as number | PromiseLike<number>
}
