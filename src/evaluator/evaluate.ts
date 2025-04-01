import {type ExprNode, type Value} from '../nodeTypes'
import {DateTime, isIterable, isRecord} from '../values/utils'
import {type EvaluateContext, type EvaluateOptions} from '../types'
import {iteratorFrom} from '../values/iteratorFrom'
import {evaluateOpCall} from './operators'
import {Scope} from './scope'
import {compare} from './scoring'

function _evaluate(node: ExprNode, context: EvaluateContext): Value {
  const {scope, dataset, params, evaluate} = context

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
      return dataset
    }

    case 'Parameter': {
      return params?.[node.name] ?? null
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
      return evaluateOpCall(node, context)
    }

    case 'Select': {
      for (const alternative of node.alternatives) {
        if (evaluate(alternative.condition, context) === true) {
          return evaluate(alternative.value, context)
        }
      }
      if (node.fallback) return evaluate(node.fallback, context)
      return null
    }

    case 'InRange': {
      const base = evaluate(node.base, context)
      const left = evaluate(node.left, context)
      const right = evaluate(node.right, context)

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
      const base = evaluate(node.base, context)
      if (!isIterable(base)) return null
      return iteratorFrom(base).filter((item) =>
        evaluate(node.expr, {...context, scope: scope.createNested(item)}),
      )
    }

    case 'Projection': {
      const base = evaluate(node.base, context)
      if (!isRecord(base)) return null
      return evaluate(node.expr, {...context, scope: scope.createNested(base)})
    }

    case 'FuncCall': {
      return node.func(node.args, context)
    }

    case 'PipeFuncCall': {
      return node.func(evaluate(node.base, context), node.args, context)
    }

    case 'AccessAttribute': {
      const value = node.base ? evaluate(node.base, context) : scope.value
      if (isRecord(value) && node.name in value) return value[node.name]
      return null
    }

    case 'AccessElement': {
      const base = evaluate(node.base, context)
      if (!isIterable(base)) return null
      const index = node.index
      if (index < 0) return Array.from(base).at(index) ?? null
      return iteratorFrom(base).drop(index).next().value ?? null
    }

    case 'Slice': {
      const base = evaluate(node.base, context)
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
      return arr.slice(left, right + 1)
    }

    case 'Deref': {
      const base = evaluate(node.base, context)
      const {dataset} = context
      if (!isIterable(dataset)) return null
      if (!isRecord(base)) return null
      if (!('_ref' in base) || typeof base['_ref'] !== 'string') return null

      return (
        iteratorFrom(dataset).find(
          (doc) => isRecord(doc) && typeof doc['_id'] === 'string' && doc['_id'] === base['_ref'],
        ) ?? null
      )
    }

    case 'Value': {
      return node.value
    }

    case 'Group': {
      return evaluate(node.base, context)
    }

    case 'Object': {
      return node.attributes.reduce<Record<string, Value>>((acc, attribute) => {
        switch (attribute.type) {
          case 'ObjectAttributeValue': {
            acc[attribute.name] = evaluate(attribute.value, context)
            return acc
          }

          case 'ObjectConditionalSplat': {
            if (evaluate(attribute.condition, context) === true) {
              const value = evaluate(attribute.value, context)
              if (isRecord(value)) {
                Object.assign(acc, value)
              }
            }
            return acc
          }

          case 'ObjectSplat': {
            const value = evaluate(attribute.value, context)
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
        const value = evaluate(element.value, context)
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
      const left = evaluate(node.left, context)
      if (left === true) return true
      const right = evaluate(node.right, context)
      if (right === true) return true
      if (typeof left !== 'boolean' || typeof right !== 'boolean') return null
      return false
    }

    case 'And': {
      const left = evaluate(node.left, context)
      if (left === false) return false
      const right = evaluate(node.right, context)
      if (right === false) return false
      if (typeof left !== 'boolean' || typeof right !== 'boolean') return null
      return true
    }

    case 'Not': {
      const base = evaluate(node.base, context)
      if (typeof base !== 'boolean') return null
      return !base
    }

    case 'Neg': {
      const base = evaluate(node.base, context)
      if (typeof base !== 'number') return null
      return -base
    }

    case 'Pos': {
      const base = evaluate(node.base, context)
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
      const base = evaluate(node.base, context)
      if (isIterable(base)) return base
      return null
    }

    case 'Map': {
      const base = evaluate(node.base, context)
      if (!isIterable(base)) return null

      return iteratorFrom(base).map((item) =>
        evaluate(node.expr, {...context, scope: scope.createHidden(item)}),
      )
    }

    case 'FlatMap': {
      const base = evaluate(node.base, context)
      if (!isIterable(base)) return null
      return iteratorFrom(base).flatMap((item) => {
        const child = evaluate(node.expr, {...context, scope: scope.createHidden(item)})
        if (isIterable(child)) {
          return iteratorFrom(child)
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

/**
 * @public
 */
function evaluateQuery(tree: ExprNode, options: EvaluateOptions = {}): Value {
  const {
    identity = 'me',
    params = {},
    dataset = [],
    root = null,
    timestamp = DateTime.now(),
    evaluate: customEvaluate,
    ...context
  } = options

  return _evaluate(tree, {
    dataset: dataset as Iterable<Value>,
    identity,
    params,
    timestamp: DateTime.from(timestamp) ?? DateTime.now(),
    scope: Scope.create(root),
    evaluate: customEvaluate ?? _evaluate,
    ...context,
  })
}

export {evaluateQuery as evaluate}
