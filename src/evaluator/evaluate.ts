/* eslint-disable max-statements */
/* eslint-disable complexity */
import type {ExprNode, Value} from '../nodeTypes'
import {DateTime, isIterable, isRecord} from '../values'
import {evaluateOpCall} from './operators'
import {Scope} from './scope'
import {compare} from './scoring'
import type {Context, EvaluateOptions} from './types'

export function evaluate(node: ExprNode, scope: Scope, context: Context): Value {
  switch (node.type) {
    case 'This': {
      return scope.value
    }

    case 'Selector': {
      // These should be evaluated separately using a different evaluator.
      // At the moment we haven't implemented this.
      throw new Error('Selectors can not be evaluated')
    }

    case 'Everything': {
      return context.dataset
    }

    case 'Parameter': {
      return context.params?.[node.name] ?? null
    }

    case 'Context': {
      if (node.key === 'before' || node.key === 'after') {
        return context?.[node.key] ?? null
      }
      throw new Error(`unknown context key: ${node.key}`)
    }

    case 'Parent': {
      return scope.getParent(node.n)?.value ?? null
    }

    case 'OpCall': {
      return evaluateOpCall(node, scope, context)
    }

    case 'Select': {
      for (const alternative of node.alternatives) {
        if (evaluate(alternative.condition, scope, context) === true) {
          return evaluate(alternative.value, scope, context)
        }
      }
      if (node.fallback) return evaluate(node.fallback, scope, context)
      return null
    }

    case 'InRange': {
      const base = evaluate(node.base, scope, context)
      const left = evaluate(node.left, scope, context)
      const right = evaluate(node.right, scope, context)

      try {
        if (node.isInclusive) {
          return compare(base, left) >= 0 && compare(base, right) <= 0
        }
        return compare(base, left) >= 0 && compare(base, right) < 0
      } catch {
        return null
      }
    }

    case 'Filter': {
      const base = evaluate(node.base, scope, context)
      if (!isIterable(base)) return null
      return Iterator.from(base).filter((item) =>
        evaluate(node.expr, scope.createNested(item), context),
      )
    }

    case 'Projection': {
      const base = evaluate(node.base, scope, context)
      if (!isRecord(base)) return null
      return evaluate(node.expr, scope.createNested(base), context)
    }

    case 'FuncCall': {
      return node.func(node.args, scope, context)
    }

    case 'PipeFuncCall': {
      return node.func(evaluate(node.base, scope, context), node.args, scope, context)
    }

    case 'AccessAttribute': {
      const value = node.base ? evaluate(node.base, scope, context) : scope.value
      if (isRecord(value) && node.name in value) return value[node.name]
      return null
    }

    case 'AccessElement': {
      const base = evaluate(node.base, scope, context)
      if (!isIterable(base)) return null
      const index = node.index
      if (index < 0) return Array.from(base).at(index) ?? null
      return Iterator.from(base).drop(index).next().value ?? null
    }

    case 'Slice': {
      const base = evaluate(node.base, scope, context)
      if (!isIterable(base)) return null

      // Ensure we have an array for length calculations
      const arr = Array.isArray(base) ? base : Array.from(base)
      const len = arr.length
      if (len === 0) return []

      // Process left index
      let left = node.left
      if (left < 0) left += len
      left = Math.max(0, Math.min(left, len - 1))

      // Process right index
      let right = node.right
      if (right < 0) right += len
      if (!node.isInclusive) right -= 1
      right = Math.max(0, Math.min(right, len - 1))

      if (left > right) return []

      // Use lazy evaluation if possible
      // if (Array.isArray(base)) {
      //   return Iterator.from(arr)
      //     .drop(left)
      //     .take(right - left + 1)
      // }
      return arr.slice(left, right + 1)
    }

    case 'Deref': {
      const base = evaluate(node.base, scope, context)
      const {dataset} = context
      if (!isIterable(dataset)) return null
      if (!isRecord(base)) return null
      if (!('_ref' in base) || typeof base['_ref'] !== 'string') return null

      return (
        Iterator.from(dataset).find(
          (doc) => isRecord(doc) && typeof doc['_id'] === 'string' && doc['_id'] === base['_ref'],
        ) ?? null
      )
    }

    case 'Value': {
      return node.value
    }

    case 'Group': {
      return evaluate(node.base, scope, context)
    }

    case 'Object': {
      return node.attributes.reduce<Record<string, Value>>((acc, attribute) => {
        switch (attribute.type) {
          case 'ObjectAttributeValue': {
            acc[attribute.name] = evaluate(attribute.value, scope, context)
            return acc
            // Object.defineProperty(acc, attribute.name, {
            //   enumerable: true,
            //   get: () => evaluate(attribute.value, scope, context),
            // })
            // return acc
          }

          case 'ObjectConditionalSplat': {
            if (evaluate(attribute.condition, scope, context) === true) {
              const value = evaluate(attribute.value, scope, context)
              if (isRecord(value)) {
                Object.assign(acc, value)
              }
            }
            return acc
          }

          case 'ObjectSplat': {
            const value = evaluate(attribute.value, scope, context)
            if (isRecord(value)) {
              Object.assign(acc, value)
            }
            return acc
          }

          default: {
            throw new Error(
              `Unknown node type: ${
                // @ts-expect-error this type should not exist
                attribute.type
              }`,
            )
          }
        }
      }, {})
    }

    case 'Array': {
      return node.elements.flatMap((element) => {
        const value = evaluate(element.value, scope, context)
        if (element.isSplat) {
          if (isIterable(value)) return Array.from(value)
          return []
        }
        return [value]
      })
    }

    case 'Tuple': {
      throw new Error('tuples can not be evaluated')
    }

    case 'Or': {
      const left = evaluate(node.left, scope, context)
      if (left === true) return true
      const right = evaluate(node.right, scope, context)
      if (right === true) return true
      if (typeof left !== 'boolean' || typeof right !== 'boolean') return null
      return false
    }

    case 'And': {
      const left = evaluate(node.left, scope, context)
      if (left === false) return false
      const right = evaluate(node.right, scope, context)
      if (right === false) return false
      if (typeof left !== 'boolean' || typeof right !== 'boolean') return null
      return true
    }

    case 'Not': {
      const base = evaluate(node.base, scope, context)
      if (typeof base !== 'boolean') return null
      return !base
    }

    case 'Neg': {
      const base = evaluate(node.base, scope, context)
      if (typeof base !== 'number') return null
      return -base
    }

    case 'Pos': {
      const base = evaluate(node.base, scope, context)
      if (typeof base !== 'number') return null
      return base
    }

    case 'Asc': {
      return null
    }

    case 'Desc': {
      return null
    }

    case 'ArrayCoerce': {
      const base = evaluate(node.base, scope, context)
      if (isIterable(base)) return base
      return null
    }

    case 'Map': {
      const base = evaluate(node.base, scope, context)
      if (!isIterable(base)) return null

      return Iterator.from(base).map((item) =>
        evaluate(node.expr, scope.createHidden(item), context),
      )
    }

    case 'FlatMap': {
      const base = evaluate(node.base, scope, context)
      if (!isIterable(base)) return null
      return Iterator.from(base).flatMap((item) => {
        const child = evaluate(node.expr, scope.createHidden(item), context)
        if (isIterable(child)) {
          return Iterator.from(child)
        }
        return [child]
      })
    }

    default: {
      throw new Error(
        `Unrecognized node type: ${
          // @ts-expect-error should be of type `never` since this is a fallback
          node?.type
        }`,
      )
    }
  }
}

export function evaluateQuery(tree: ExprNode, options: EvaluateOptions = {}): Value {
  const {
    identity = 'me',
    params = {},
    dataset = [],
    root = null,
    timestamp = DateTime.now(),
    ...context
  } = options
  return evaluate(tree, Scope.create(root), {
    dataset: dataset as Iterable<Value>,
    identity,
    params,
    timestamp: DateTime.from(timestamp) ?? DateTime.now(),
    ...context,
  })
}
