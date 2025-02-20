/* eslint-disable max-statements */
/* eslint-disable complexity */
import type {ExprNode} from '../nodeTypes'
import {evaluateOpCall} from './operators'
import {compare} from './ordering'
import type {Context, EvaluateQueryOptions} from './types'

interface EvaluateOptions extends Context {
  node: ExprNode
}

export function isIterable(value: unknown): value is Iterable<unknown> {
  if (value === null || value === undefined) {
    return false
  }
  if (typeof value !== 'object' && typeof value !== 'function') {
    return false
  }
  const iteratorMethod = (value as {[Symbol.iterator]?: unknown})[Symbol.iterator]
  return typeof iteratorMethod === 'function'
}

const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/
export const isIso8601 = (str: unknown): str is string =>
  typeof str === 'string' && iso8601Regex.test(str)

export function evaluate({node, ...context}: EvaluateOptions): unknown {
  switch (node.type) {
    case 'This': {
      return context.scope.at(-1)
    }

    case 'Selector': {
      // These should be evaluated separately using a different evaluator.
      // At the moment we haven't implemented this.
      throw new Error('Selectors can not be evaluated')
    }

    case 'Everything': {
      return context.scope.at(0)
    }

    case 'Parameter': {
      return context.params?.[node.name] ?? null
    }

    case 'Context': {
      if (node.key === 'before' || node.key === 'after') {
        return context[node.key] ?? null
      }
      throw new Error(`Unknown context key: ${node.key}`)
    }

    case 'Parent': {
      return context.scope.at(-node.n) ?? null
    }

    case 'OpCall': {
      return evaluateOpCall({...context, node})
    }

    case 'Select': {
      for (const alternative of node.alternatives) {
        if (evaluate({...context, node: alternative.condition}) === true) {
          return evaluate({...context, node: alternative.value})
        }
      }
      if (node.fallback) return evaluate({...context, node: node.fallback})
      return null
    }

    case 'InRange': {
      const base = evaluate({...context, node: node.base})
      const left = evaluate({...context, node: node.left})
      const right = evaluate({...context, node: node.right})

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
      const base = evaluate({...context, node: node.base})
      if (!isIterable(base)) return null
      return Iterator.from(base).filter((item) =>
        evaluate({
          ...context,
          node: node.expr,
          scope: [...context.scope, item],
        }),
      )
    }

    case 'Projection': {
      const base = evaluate({...context, node: node.base})
      if (typeof base !== 'object' || !base) return null
      return evaluate({
        ...context,
        node: node.expr,
        scope: [...context.scope, base],
      })
    }

    case 'FuncCall': {
      return node.func({args: node.args, ...context})
    }

    case 'PipeFuncCall': {
      return node.func({
        ...context,
        base: evaluate({...context, node: node.base}),
        args: node.args,
      })
    }

    case 'AccessAttribute': {
      const value = node.base ? evaluate({...context, node: node.base}) : context.scope.at(-1)
      if (typeof value === 'object' && !!value && node.name in value) {
        return value[node.name as keyof typeof value]
      }
      return null
    }

    case 'AccessElement': {
      const base = evaluate({...context, node: node.base})
      if (!isIterable(base)) return null
      const index = node.index
      if (index < 0) return Array.from(base).at(index)
      return Iterator.from(base).drop(index).next().value
    }

    case 'Slice': {
      const base = evaluate({...context, node: node.base})
      if (!isIterable(base)) return null
      const start = node.left
      const end = node.isInclusive ? node.right + 1 : node.right

      // negative slices require buffering the entire iterable into an array
      if (start < 0 || end < 0) {
        return Array.from(base).slice(start, end)
      }

      return Iterator.from(base)
        .drop(start)
        .take(end - start)
    }

    case 'Deref': {
      const base = evaluate({...context, node: node.base})
      const root = context.scope.at(0)
      if (!isIterable(root)) return null
      if (typeof base !== 'object' || !base) return null
      if (!('_ref' in base) || typeof base._ref !== 'string') return null

      return Iterator.from(root).find(
        (doc: unknown) =>
          typeof doc === 'object' &&
          !!doc &&
          '_id' in doc &&
          typeof doc._id === 'string' &&
          doc._id === base._ref,
      )
    }

    case 'Value': {
      return node.value
    }

    case 'Group': {
      return evaluate({...context, node: node.base})
    }

    case 'Object': {
      return node.attributes.reduce<Record<string, unknown>>((acc, attribute) => {
        switch (attribute.type) {
          case 'ObjectAttributeValue': {
            Object.defineProperty(acc, attribute.name, {
              enumerable: true,
              get: () => evaluate({...context, node: attribute.value}),
            })
            return acc
          }

          case 'ObjectConditionalSplat': {
            if (evaluate({...context, node: attribute.condition}) === true) {
              const value = evaluate({...context, node: attribute.value})
              if (typeof value === 'object' && !!value) {
                Object.assign(acc, value)
              }
            }
            return acc
          }

          case 'ObjectSplat': {
            const value = evaluate({...context, node: attribute.value})
            if (typeof value === 'object' && !!value) {
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
      return Iterator.from(node.elements).flatMap(function* (element) {
        const value = evaluate({...context, node: element.value})
        if (element.isSplat && isIterable(value)) {
          yield* Iterator.from(value)
        } else {
          yield value
        }
      })
    }

    case 'Tuple': {
      throw new Error('tuples can not be evaluated')
    }

    case 'Or': {
      const left = evaluate({...context, node: node.left})
      if (left === true) return true
      const right = evaluate({...context, node: node.right})
      if (right === true) return true
      if (typeof left !== 'boolean' || typeof right !== 'boolean') return null
      return false
    }

    case 'And': {
      const left = evaluate({...context, node: node.left})
      if (left === false) return false
      const right = evaluate({...context, node: node.right})
      if (right === false) return false
      if (typeof left !== 'boolean' || typeof right !== 'boolean') return null
      return true
    }

    case 'Not': {
      const base = evaluate({...context, node: node.base})
      if (typeof base !== 'boolean') return null
      return base
    }

    case 'Neg': {
      const base = evaluate({...context, node: node.base})
      if (typeof base !== 'number') return null
      return -base
    }

    case 'Pos': {
      const base = evaluate({...context, node: node.base})
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
      const base = evaluate({...context, node: node.base})
      if (isIterable(base)) return base
      return null
    }

    case 'Map': {
      const base = evaluate({...context, node: node.base})
      if (!isIterable(base)) return null

      return Iterator.from(base).map((item) =>
        evaluate({
          ...context,
          node: node.expr,
          scope: [...context.scope.slice(0, -1), item],
        }),
      )
    }

    case 'FlatMap': {
      const base = evaluate({...context, node: node.base})
      if (!isIterable(base)) return null
      return Iterator.from(base).flatMap(function* (item) {
        const child = evaluate({
          ...context,
          node: node.expr,
          scope: [...context.scope.slice(0, -1), item],
        })
        if (isIterable(child)) {
          yield* Iterator.from(child)
        } else {
          yield child
        }
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

export function evaluateQuery(tree: ExprNode, options: EvaluateQueryOptions = {}): unknown {
  return evaluate({
    identity: options.identity ?? 'me',
    scope: [options.dataset ?? []],
    timestamp: new Date().toISOString(),
    ...options,
    node: tree,
  })
}
