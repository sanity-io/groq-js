import type {GroqPipeFunction, WithOptions} from '.'
import type {ExprNode} from '../../nodeTypes'
import {fromArray, fromJS, getType} from '../../values'
import {executeAsync, executeSync} from '../evaluate'
import {totalCompare} from '../ordering'
import {evaluateScoreAsync, evaluateScoreSync} from '../scoring'

type ObjectWithScore = Record<string, unknown> & {_score: number}

type Direction = 'asc' | 'desc'
type AuxItem = [unknown, number, ...unknown[]]

function extractOrderArgs(args: ExprNode[]): {mappers: ExprNode[]; directions: Direction[]} {
  const mappers = []
  const directions: Direction[] = []

  for (let mapper of args) {
    let direction: Direction = 'asc'

    if (mapper.type === 'Desc') {
      direction = 'desc'
      mapper = mapper.base
    } else if (mapper.type === 'Asc') {
      mapper = mapper.base
    }

    mappers.push(mapper)
    directions.push(direction)
  }
  return {mappers, directions}
}

function sortArray(aux: AuxItem[], directions: Direction[]): unknown[] {
  aux.sort((aTuple, bTuple) => {
    for (let i = 0; i < directions.length; i++) {
      let c = totalCompare(aTuple[i + 2], bTuple[i + 2])
      if (directions[i] === 'desc') {
        c = -c
      }
      if (c !== 0) {
        return c
      }
    }
    // Fallback to sorting on the original index for stable sorting.
    return aTuple[1] - bTuple[1]
  })

  return aux.map((v) => v[0])
}

const pipeFunctions: {[key: string]: WithOptions<GroqPipeFunction>} = {}

pipeFunctions['order'] = {
  executeSync({base, args}, scope) {
    const {mappers, directions} = extractOrderArgs(args)
    const aux: AuxItem[] = []

    let idx = 0
    const n = directions.length

    for (const value of base.data) {
      const newScope = scope.createNested(fromJS(value))
      const tuple: AuxItem = [value, idx]
      for (let i = 0; i < n; i++) {
        const result = executeSync(mappers[i]!, newScope)
        tuple.push(result.data)
      }
      aux.push(tuple)
      idx++
    }

    return fromArray(sortArray(aux, directions))
  },

  async executeAsync({base, args}, scope) {
    const {mappers, directions} = extractOrderArgs(args)
    const aux: AuxItem[] = []

    let idx = 0
    const n = directions.length

    for await (const value of base) {
      const newScope = scope.createNested(value)
      const tuple: AuxItem = [await value.get(), idx]
      for (let i = 0; i < n; i++) {
        const result = await executeAsync(mappers[i]!, newScope)
        tuple.push(await result.get())
      }
      aux.push(tuple)
      idx++
    }

    return fromArray(sortArray(aux, directions))
  },
}
pipeFunctions['order'].arity = (count) => count >= 1

// eslint-disable-next-line require-await
// eslint-disable-next-line require-await
pipeFunctions['score'] = {
  async executeAsync({base, args}, scope) {
    // Anything that isn't an object should be sorted first.
    const unknown: Array<any> = []
    const scored: Array<ObjectWithScore> = []

    for await (const value of base) {
      if (value.type !== 'object') {
        unknown.push(await value.get())
        continue
      }

      const newScope = scope.createNested(value)
      let valueScore = typeof value.data['_score'] === 'number' ? value.data['_score'] : 0

      for (const arg of args) {
        valueScore += await evaluateScoreAsync(arg, newScope)
      }

      const newObject = Object.assign({}, value.data, {_score: valueScore})
      scored.push(newObject)
    }

    scored.sort((a, b) => b._score - a._score)
    return fromJS(scored)
  },
  executeSync({base, args}, scope) {
    // Anything that isn't an object should be sorted first.
    const unknown: Array<any> = []
    const scored: Array<ObjectWithScore> = []

    for (const value of base.data) {
      if (getType(value) !== 'object') {
        unknown.push(value)
        continue
      }

      const valueObj = value as Record<string, unknown>

      const newScope = scope.createNested(fromJS(value))
      let valueScore = typeof valueObj['_score'] === 'number' ? valueObj['_score'] : 0

      for (const arg of args) {
        valueScore += evaluateScoreSync(arg, newScope)
      }

      const newObject = Object.assign({}, valueObj, {_score: valueScore})
      scored.push(newObject)
    }

    scored.sort((a, b) => b._score - a._score)
    return fromArray(scored)
  },
}
pipeFunctions['score'].arity = (count) => count >= 1

export default pipeFunctions
