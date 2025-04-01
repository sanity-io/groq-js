import {type OpCallNode, type Value} from '../nodeTypes'
import {DateTime, isIterable, isRecord} from '../values/utils'
import {type EvaluateContext} from '../types'
import {matchPatternRegex, matchText, matchTokenize} from './matching'
import {compare, isEqual} from './scoring'

function* concat<T>(a: Iterable<T>, b: Iterable<T>): Generator<T> {
  for (const item of a) yield item
  for (const item of b) yield item
}

export function evaluateOpCall(node: OpCallNode, context: EvaluateContext): Value {
  const {evaluate} = context

  switch (node.op) {
    case '==': {
      return isEqual(evaluate(node.left, context), evaluate(node.right, context))
    }

    case '!=': {
      return !isEqual(evaluate(node.left, context), evaluate(node.right, context))
    }

    case '>': {
      const left = evaluate(node.left, context)
      const right = evaluate(node.right, context)
      try {
        return compare(left, right) > 0
      } catch {
        return null
      }
    }

    case '>=': {
      const left = evaluate(node.left, context)
      const right = evaluate(node.right, context)
      try {
        return compare(left, right) >= 0
      } catch {
        return null
      }
    }

    case '<': {
      const left = evaluate(node.left, context)
      const right = evaluate(node.right, context)
      try {
        return compare(left, right) < 0
      } catch {
        return null
      }
    }

    case '<=': {
      const left = evaluate(node.left, context)
      const right = evaluate(node.right, context)
      try {
        return compare(left, right) <= 0
      } catch {
        return null
      }
    }

    case 'in': {
      const left = evaluate(node.left, context)

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
        const pattern = evaluate(node.right.args[0], context)

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

      const right = evaluate(node.right, context)

      if (!isIterable(right)) return null
      return Iterator.from(right).some((item) => isEqual(left, item))
    }

    case 'match': {
      const left = evaluate(node.left, context)
      const right = evaluate(node.right, context)
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

      return matchText(Array.from(source), terms)
    }

    case '+': {
      const left = evaluate(node.left, context)
      const right = evaluate(node.right, context)

      if (left instanceof DateTime && typeof right === 'number') {
        return DateTime.from(new Date(left.getTime() + right * 1000))
      }
      if (typeof left === 'number' && typeof right === 'number') return left + right
      if (typeof left === 'string' && typeof right === 'string') return `${left}${right}`
      if (isIterable(left) && isIterable(right)) return concat(left, right)
      if (isRecord(left) && isRecord(right)) return {...left, ...right}
      return null
    }

    case '-': {
      const left = evaluate(node.left, context)
      const right = evaluate(node.right, context)

      if (left instanceof DateTime && typeof right === 'number') {
        return DateTime.from(new Date(left.getTime() - right * 1000))
      }

      if (left instanceof DateTime && right instanceof DateTime) {
        return (left.getTime() - right.getTime()) / 1000
      }

      if (typeof left === 'number' && typeof right === 'number') return left - right
      return null
    }

    case '*': {
      const left = evaluate(node.left, context)
      const right = evaluate(node.right, context)
      if (typeof left !== 'number' || typeof right !== 'number') return null
      return left * right
    }

    case '/': {
      const left = evaluate(node.left, context)
      const right = evaluate(node.right, context)
      if (typeof left !== 'number' || typeof right !== 'number') return null
      if (right === 0) return null
      return left / right
    }

    case '%': {
      const left = evaluate(node.left, context)
      const right = evaluate(node.right, context)
      if (typeof left !== 'number' || typeof right !== 'number') return null
      return left % right
    }

    case '**': {
      const left = evaluate(node.left, context)
      const right = evaluate(node.right, context)
      if (typeof left !== 'number' || typeof right !== 'number') return null
      const result = left ** right
      return Number.isFinite(result) ? result : null
    }

    default: {
      throw new Error(`Unknown operator: ${node.op}`)
    }
  }
}
