import type {GroqPipeFunction, WithOptions} from '.'
import {fromJS, NULL_VALUE} from '../../values'
import {totalCompare} from '../ordering'
import {evaluateScore} from '../scoring'

type ObjectWithScore = Record<string, unknown> & {_score: number}

const pipeFunctions: {[key: string]: WithOptions<GroqPipeFunction>} = {}

pipeFunctions['order'] = async function order(base, args, scope, execute) {
  // eslint-disable-next-line max-len
  // This is a workaround for https://github.com/rpetrich/babel-plugin-transform-async-to-promises/issues/59
  await true

  if (!base.isArray()) {
    return NULL_VALUE
  }

  const mappers = []
  const directions: string[] = []
  let n = 0

  for (let mapper of args) {
    let direction = 'asc'

    if (mapper.type === 'Desc') {
      direction = 'desc'
      mapper = mapper.base
    } else if (mapper.type === 'Asc') {
      mapper = mapper.base
    }

    mappers.push(mapper)
    directions.push(direction)
    n++
  }

  const aux = []
  let idx = 0

  for await (const value of base) {
    const newScope = scope.createNested(value)
    const tuple = [await value.get(), idx]
    for (let i = 0; i < n; i++) {
      const result = await execute(mappers[i], newScope)
      tuple.push(await result.get())
    }
    aux.push(tuple)
    idx++
  }

  aux.sort((aTuple, bTuple) => {
    for (let i = 0; i < n; i++) {
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

  return fromJS(aux.map((v) => v[0]))
}
pipeFunctions['order'].arity = (count) => count >= 1

// eslint-disable-next-line require-await
// eslint-disable-next-line require-await
pipeFunctions['score'] = async function score(base, args, scope, execute) {
  if (!base.isArray()) return NULL_VALUE

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
      valueScore += await evaluateScore(arg, newScope, execute)
    }

    const newObject = Object.assign({}, value.data, {_score: valueScore})
    scored.push(newObject)
  }

  scored.sort((a, b) => b._score - a._score)
  return fromJS(scored)
}

pipeFunctions['score'].arity = (count) => count >= 1

export default pipeFunctions
