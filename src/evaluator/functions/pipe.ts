import type {ExprNode, Value} from '../../nodeTypes'
import {DateTime, isIterable, isRecord} from '../../values'
import {evaluate} from '../evaluate'
import type {Scope} from '../scope'
import {compare, evaluateScore} from '../scoring'
import type {Context} from '../types'

function getTypeRank(value: unknown): number {
  if (value instanceof DateTime) return 1
  if (typeof value === 'number') return 2
  if (typeof value === 'string') return 3
  if (typeof value === 'boolean') return 4
  return 100
}

export function order(
  base: Value,
  args: ExprNode[],
  scope: Scope,
  context: Context,
): Iterable<Value> | null {
  if (!isIterable(base)) return null

  return Array.from(base)
    .map((value, index) => ({value, index}))
    .sort((a, b) => {
      const scopeA = scope.createNested(a.value)
      const scopeB = scope.createNested(b.value)

      for (const ordering of args) {
        const direction = ordering.type === 'Desc' ? -1 : 1
        const fieldNode =
          ordering.type === 'Asc' || ordering.type === 'Desc' ? ordering.base : ordering

        const aResult = evaluate(fieldNode, scopeA, context)
        const bResult = evaluate(fieldNode, scopeB, context)

        try {
          const result = compare(aResult, bResult)
          if (result === 0) continue
          return result * direction
        } catch {
          // if `compare` threw due to type mismatches, we can default to
          // sorting by type if they differ
          const aTypeRank = getTypeRank(aResult)
          const bTypeRank = getTypeRank(bResult)
          if (aTypeRank === bTypeRank) continue
          return (aTypeRank - bTypeRank) * direction
        }
      }

      return a.index - b.index
    })
    .map((i) => i.value)
}
order.arity = (count: number) => count >= 1

type ObjectWithScore = Record<string, Value> & {_score: number}

export function score(
  base: Value,
  args: ExprNode[],
  scope: Scope,
  context: Context,
): ObjectWithScore[] | null {
  if (!isIterable(base)) return null

  return Array.from(
    Iterator.from(base)
      .filter(isRecord)
      .map((item) => {
        const prevScore = typeof item['_score'] === 'number' ? item['_score'] : 0
        const score = args.reduce(
          (acc, arg) => acc + evaluateScore(arg, scope.createNested(item), context),
          prevScore,
        )
        return Object.assign({}, item, {_score: score})
      }),
  ).sort((a, b) => b._score - a._score)
}
score.arity = (count: number) => count >= 1
