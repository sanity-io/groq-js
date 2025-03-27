/* eslint-disable complexity */
/* eslint-disable max-statements */

import type {OpCallNode, Value} from '../nodeTypes'
import {DateTime, isIterable, isRecord} from '../values'
import {evaluate} from './evaluate'
import {match} from './matching'
import type {Scope} from './scope'
import {compare, isEqual} from './scoring'
import type {Context} from './types'

function* concat<T>(a: Iterable<T>, b: Iterable<T>): Generator<T> {
  for (const item of a) yield item
  for (const item of b) yield item
}

export function evaluateOpCall(node: OpCallNode, scope: Scope, context: Context): Value {
  switch (node.op) {
    case '==': {
      return isEqual(evaluate(node.left, scope, context), evaluate(node.right, scope, context))
    }

    case '!=': {
      return !isEqual(evaluate(node.left, scope, context), evaluate(node.right, scope, context))
    }

    case '>': {
      const left = evaluate(node.left, scope, context)
      const right = evaluate(node.right, scope, context)
      try {
        return compare(left, right) > 0
      } catch {
        return null
      }
    }

    case '>=': {
      const left = evaluate(node.left, scope, context)
      const right = evaluate(node.right, scope, context)
      try {
        return compare(left, right) >= 0
      } catch {
        return null
      }
    }

    case '<': {
      const left = evaluate(node.left, scope, context)
      const right = evaluate(node.right, scope, context)
      try {
        return compare(left, right) < 0
      } catch {
        return null
      }
    }

    case '<=': {
      const left = evaluate(node.left, scope, context)
      const right = evaluate(node.right, scope, context)
      try {
        return compare(left, right) <= 0
      } catch {
        return null
      }
    }

    case 'in': {
      const left = evaluate(node.left, scope, context)

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
        const pattern = evaluate(node.right.args[0], scope, context)

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

      const right = evaluate(node.right, scope, context)

      if (!isIterable(right)) return null
      return Iterator.from(right).some((item) => isEqual(left, item))
    }

    case 'match': {
      return match(evaluate(node.left, scope, context), evaluate(node.right, scope, context))
    }

    case '+': {
      const left = evaluate(node.left, scope, context)
      const right = evaluate(node.right, scope, context)

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
      const left = evaluate(node.left, scope, context)
      const right = evaluate(node.right, scope, context)

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
      const left = evaluate(node.left, scope, context)
      const right = evaluate(node.right, scope, context)
      if (typeof left !== 'number' || typeof right !== 'number') return null
      return left * right
    }

    case '/': {
      const left = evaluate(node.left, scope, context)
      const right = evaluate(node.right, scope, context)
      if (typeof left !== 'number' || typeof right !== 'number') return null
      if (right === 0) return null
      return left / right
    }

    case '%': {
      const left = evaluate(node.left, scope, context)
      const right = evaluate(node.right, scope, context)
      if (typeof left !== 'number' || typeof right !== 'number') return null
      return left % right
    }

    case '**': {
      const left = evaluate(node.left, scope, context)
      const right = evaluate(node.right, scope, context)
      if (typeof left !== 'number' || typeof right !== 'number') return null
      const result = left ** right
      return Number.isFinite(result) ? result : null
    }

    default: {
      throw new Error(`Unknown operator: ${node.op}`)
    }
  }
}
