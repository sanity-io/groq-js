import {type ExprNode, type Value} from '../../nodeTypes'
import {DateTime, isIterable, isRecord} from '../../values/utils'
import {compare, evaluateScore} from '../scoring'
import {type EvaluateContext} from '../../types'
import {iteratorFrom} from '../../values/iteratorFrom'

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
  context: EvaluateContext,
): Iterable<Value> | null {
  if (!isIterable(base)) return null

  return Array.from(base)
    .map((value, index) => ({value, index}))
    .sort((a, b) => {
      const contextA = {...context, scope: context.scope.createNested(a.value)}
      const contextB = {...context, scope: context.scope.createNested(b.value)}

      for (const ordering of args) {
        const direction = ordering.type === 'Desc' ? -1 : 1
        const fieldNode =
          ordering.type === 'Asc' || ordering.type === 'Desc' ? ordering.base : ordering

        const aResult = contextA.evaluate(fieldNode, contextA)
        const bResult = contextB.evaluate(fieldNode, contextB)

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
  context: EvaluateContext,
): ObjectWithScore[] | null {
  const {scope} = context
  if (!isIterable(base)) return null

  return Array.from(
    iteratorFrom(base)
      .filter(isRecord)
      .map((item) => {
        const prevScore = typeof item['_score'] === 'number' ? item['_score'] : 0
        const score = args.reduce(
          (acc, arg) => acc + evaluateScore(arg, {...context, scope: scope.createNested(item)}),
          prevScore,
        )
        return Object.assign({}, item, {_score: score})
      }),
  ).sort((a, b) => b._score - a._score)
}
score.arity = (count: number) => count >= 1
