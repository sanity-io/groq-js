import type {ExprNode, Value} from '../../nodeTypes'
import {DateTime, isIterable} from '../../values'
import {evaluate} from '../evaluate'
import type {Scope} from '../scope'
import type {Context} from '../types'

export function join([baseArg, separatorArg]: ExprNode[], scope: Scope, context: Context): Value {
  const base = evaluate(baseArg, scope, context)
  if (!isIterable(base)) return null

  const separator = evaluate(separatorArg, scope, context)
  if (typeof separator !== 'string') return null

  const mapped: string[] = []
  for (const item of base) {
    switch (typeof item) {
      case 'boolean':
      case 'number':
      case 'string': {
        mapped.push(`${item}`)
        break
      }
      default: {
        // early exit on invalid input
        return null
      }
    }
  }

  return mapped.join(separator)
}
join.arity = 2

export function compact(args: ExprNode[], scope: Scope, context: Context): Value {
  const base = evaluate(args[0], scope, context)
  if (!isIterable(base)) return null
  return Iterator.from(base).filter((i = null) => i !== null)
}
compact.arity = 1

export function unique(args: ExprNode[], scope: Scope, context: Context): Value {
  const base = evaluate(args[0], scope, context)
  if (!isIterable(base)) return null

  const resultMap = new Map()

  for (const item of Iterator.from(base)) {
    let key
    if (item instanceof DateTime) {
      key = `dateTime:${item.toString()}`
    } else {
      const type = typeof item
      if (type === 'number' || type === 'boolean' || type === 'string') {
        key = `${type}:${item.toString()}`
      } else {
        key = item
      }
    }
    if (!resultMap.has(key)) {
      resultMap.set(key, item)
    }
  }

  return resultMap.values()
}
unique.arity = 1

export function intersects(args: ExprNode[], scope: Scope, context: Context): Value {
  const left = evaluate(args[0], scope, context)
  if (!isIterable(left)) return null
  const right = evaluate(args[1], scope, context)
  if (!isIterable(right)) return null

  const createSet = (iterable: Iterable<unknown>) =>
    new Set(
      Iterator.from(iterable)
        .filter(
          (i) =>
            i === null ||
            typeof i === 'boolean' ||
            typeof i === 'number' ||
            typeof i === 'string' ||
            i instanceof DateTime,
        )
        .map((i) =>
          // Add prefix to datetime strings to avoid collisions with regular strings
          i instanceof DateTime ? `dateTime:${i}` : `${typeof i}:${i}`,
        ),
    )

  const leftSet = createSet(left)
  const rightSet = createSet(right)

  // TODO: ensure polyfills for this are here
  return !leftSet.isDisjointFrom(rightSet)
}
intersects.arity = 2
