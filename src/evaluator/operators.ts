/* eslint-disable complexity */
/* eslint-disable max-statements */

import type {OpCallNode} from '../nodeTypes'
import {isEqual} from './equality'
import {evaluate, isIso8601, isIterable} from './evaluate'
import {matchAnalyzePattern, matchText, matchTokenize} from './matching'
import {compare} from './ordering'
import type {Context} from './types'

interface EvaluateOpCallOptions extends Context {
  node: OpCallNode
}

function* concat<T>(a: Iterable<T>, b: Iterable<T>): Generator<T> {
  for (const item of a) yield item
  for (const item of b) yield item
}

export function evaluateOpCall({node, ...context}: EvaluateOpCallOptions): unknown {
  switch (node.op) {
    case '==': {
      return isEqual(
        evaluate({...context, node: node.left}),
        evaluate({...context, node: node.right}),
      )
    }

    case '!=': {
      return !isEqual(
        evaluate({...context, node: node.left}),
        evaluate({...context, node: node.right}),
      )
    }

    case '>': {
      const left = evaluate({...context, node: node.left})
      const right = evaluate({...context, node: node.right})
      try {
        return compare(left, right) > 0
      } catch {
        return null
      }
    }

    case '>=': {
      const left = evaluate({...context, node: node.left})
      const right = evaluate({...context, node: node.right})
      try {
        return compare(left, right) >= 0
      } catch {
        return null
      }
    }

    case '<': {
      const left = evaluate({...context, node: node.left})
      const right = evaluate({...context, node: node.right})
      try {
        return compare(left, right) < 0
      } catch {
        return null
      }
    }

    case '<=': {
      const left = evaluate({...context, node: node.left})
      const right = evaluate({...context, node: node.right})
      try {
        return compare(left, right) <= 0
      } catch {
        return null
      }
    }

    case 'in': {
      const left = evaluate({...context, node: node.left})

      // for `path` functions we don't evaluate it because evaluating a `path`
      // function in all other scenarios returns the value inside the `path`
      // function if it's a string (null otherwise). we check the node before
      // evaluating to ensure that what we're checking is within a path function
      if (
        node.right.type === 'FuncCall' &&
        node.right.name === 'path' &&
        node.right.namespace === 'global'
      ) {
        if (typeof left !== 'string') return null
        const pattern = evaluate({...context, node: node.right.args[0]})

        if (typeof pattern !== 'string') return null
        return new RegExp(
          `^${pattern
            .split('.')
            .map((part) => {
              if (part === '*') return '[^.]+'
              if (part === '**') return '.*'
              return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            })
            .join('.')}$`,
        ).test(left)
      }

      const right = evaluate({...context, node: node.right})

      if (!isIterable(right)) return null
      return Iterator.from(right).some((item) => isEqual(left, item))
    }

    case 'match': {
      const left = evaluate({...context, node: node.left})
      const right = evaluate({...context, node: node.right})

      const tokens = (isIterable(left) ? Iterator.from(left) : [left].values())
        .filter((i) => typeof i === 'string')
        .flatMap(matchTokenize)
      const patterns = (isIterable(right) ? Iterator.from(right) : [right].values())
        .filter((i) => typeof i === 'string')
        .flatMap(matchAnalyzePattern)

      // if there are no patterns or tokens return false
      if (!patterns.some(() => true)) return false
      if (!tokens.some(() => true)) return false

      return patterns.every((pattern) => pattern(tokens))
    }

    case '+': {
      const left = evaluate({...context, node: node.left})
      const right = evaluate({...context, node: node.right})

      if (isIso8601(left) && typeof right === 'number') {
        return new Date(new Date(left).getTime() + right * 1000).toISOString()
      }
      if (typeof left === 'number' && typeof right === 'number') return left + right
      if (typeof left === 'string' && typeof right === 'string') return `${left}${right}`
      if (isIterable(left) && isIterable(right)) return concat(left, right)
      if (typeof left === 'object' && left && typeof right === 'object' && right) {
        return {...left, ...right}
      }
      return null
    }

    case '-': {
      const left = evaluate({...context, node: node.left})
      const right = evaluate({...context, node: node.right})

      if (isIso8601(left) && typeof right === 'number') {
        return new Date(new Date(left).getTime() - right * 1000).toISOString()
      }

      if (isIso8601(left) && isIso8601(right)) {
        return (new Date(left).getTime() - new Date(right).getTime()) / 1000
      }

      if (typeof left === 'number' && typeof right === 'number') return left - right
      return null
    }

    case '*': {
      const left = evaluate({...context, node: node.left})
      const right = evaluate({...context, node: node.right})
      if (typeof left !== 'number' || typeof right !== 'number') return null
      return left * right
    }

    case '/': {
      const left = evaluate({...context, node: node.left})
      const right = evaluate({...context, node: node.right})
      if (typeof left !== 'number' || typeof right !== 'number') return null
      return left / right
    }

    case '%': {
      const left = evaluate({...context, node: node.left})
      const right = evaluate({...context, node: node.right})
      if (typeof left !== 'number' || typeof right !== 'number') return null
      return left % right
    }

    case '**': {
      const left = evaluate({...context, node: node.left})
      const right = evaluate({...context, node: node.right})
      if (typeof left !== 'number' || typeof right !== 'number') return null
      return left ** right
    }

    default: {
      throw new Error(`Unknown operator: ${node.op}`)
    }
  }
}
