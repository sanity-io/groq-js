import {toPlainText} from '@portabletext/toolkit'
import type {ArbitraryTypedObject, PortableTextBlock} from '@portabletext/types'

import type {ExprNode} from '../nodeTypes'
import {evaluate, isIso8601, isIterable} from './evaluate'
import {compare, getTypeRank} from './ordering'
import {evaluateScore} from './scoring'
import type {Context} from './types'

function hasReference(value: unknown, paths: Set<string>): boolean {
  if (isIterable(value)) {
    for (const child of value) {
      if (hasReference(child, paths)) return true
    }
  }

  if (typeof value !== 'object' || !value) return false

  if ('_ref' in value && typeof value._ref === 'string') {
    return paths.has(value._ref)
  }

  for (const child of Object.values(value)) {
    if (hasReference(child, paths)) return true
  }

  return false
}

function countUTF8(str: string): number {
  let count = 0
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i)
    if (code >= 0xd800 && code <= 0xdbff) {
      // High surrogate. Don't count this.
      // By only counting the low surrogate we will correctly
      // count the number of UTF-8 code points.
      continue
    }
    count++
  }
  return count
}

function createStub({arity, mode}: WithOptions<object>) {
  function notImplemented(): never {
    throw new Error('Not implemented')
  }
  return Object.assign(notImplemented, {
    ...(arity && {arity}),
    ...(mode && {mode}),
  })
}

/** @public */
export type GroqFunctionArg = ExprNode
type WithOptions<T> = T & {
  arity?: GroqFunctionArity
  mode?: 'normal' | 'delta'
}

export type GroqFunctionArity = number | ((count: number) => boolean)

/** @public */
export interface GroqFunctionOptions extends Context {
  args: GroqFunctionArg[]
}

/** @public */
export type GroqFunction = (options: GroqFunctionOptions) => unknown

export type FunctionSet = Record<string, WithOptions<GroqFunction> | undefined>

export type NamespaceSet = Record<string, FunctionSet | undefined>

export type GroqPipeFunctionOptions = GroqFunctionOptions & {base: unknown}
export type GroqPipeFunction = (options: GroqPipeFunctionOptions) => unknown
type ObjectWithScore = Record<string, unknown> & {_score: number}

function anywhere(): never {
  throw new Error('not implemented')
}
anywhere.arity = 1

function coalesce({args, ...context}: GroqFunctionOptions): unknown {
  for (const arg of args) {
    const value = evaluate({...context, node: arg})
    if (value !== null && value !== undefined) return value
  }
  return null
}
coalesce.arity = 1

function count({args: [arg], ...context}: GroqFunctionOptions): number | null {
  const base = evaluate({...context, node: arg})
  if (!isIterable(base)) return null
  return Iterator.from(base).reduce<number>((count) => count + 1, 0)
}
count.arity = 1

function dateTime({args: [arg], ...context}: GroqFunctionOptions): string | null {
  const base = evaluate({...context, node: arg})
  if (typeof base !== 'string') return null
  if (isIso8601(base)) return base
  return new Date(base).toISOString()
}
dateTime.arity = 1

function defined({args: [arg], ...context}: GroqFunctionOptions): boolean {
  const base = evaluate({...context, node: arg})
  return base !== null && base !== undefined
}
defined.arity = 1

function identity({identity}: GroqFunctionOptions): string {
  return identity
}
identity.arity = 0

function length({args: [baseArg], ...context}: GroqFunctionOptions): number | null {
  const base = evaluate({...context, node: baseArg})
  if (typeof base === 'string') return countUTF8(base)
  if (isIterable(base)) return Iterator.from(base).reduce<number>((length) => length + 1, 0)
  return null
}
length.arity = 1

function path({args: [baseArg], ...context}: GroqFunctionOptions): string | null {
  const base = evaluate({...context, node: baseArg})
  if (typeof base !== 'string') return null
  return base
}
path.arity = 1

function string({args: [arg], ...context}: GroqFunctionOptions): string | null {
  const base = evaluate({...context, node: arg})
  switch (typeof base) {
    case 'number':
    case 'string':
    case 'boolean': {
      return `${base}`
    }
    default: {
      return null
    }
  }
}
string.arity = 1

function references({args, ...context}: GroqFunctionOptions): boolean {
  const paths = new Set(
    args.flatMap((arg) => {
      const base = evaluate({...context, node: arg})
      return (isIterable(base) ? Array.from(base) : [base]).filter((i) => typeof i === 'string')
    }),
  )
  return hasReference(context.scope.at(-1), paths)
}
references.arity = (c: number) => c >= 1

function round({args: [baseArg, precisionArg], ...context}: GroqFunctionOptions): number | null {
  const base = evaluate({...context, node: baseArg})
  if (typeof base !== 'number') return null

  let precision = 0
  if (precisionArg) {
    const p = evaluate({...context, node: precisionArg})
    if (typeof p !== 'number' || p < 0 || !Number.isInteger(p)) {
      return null
    }
    precision = p
  }

  if (precision === 0) {
    // Round half away from zero for negative values
    return base < 0 ? -Math.round(-base) : Math.round(base)
  }

  return Number(base.toFixed(precision))
}
round.arity = (c: number) => c >= 1 && c <= 2

function boost(): never {
  throw new Error('Unexpected boost call')
}
boost.arity = 2

function lower({args: [baseArg], ...context}: GroqFunctionOptions): string | null {
  const base = evaluate({...context, node: baseArg})
  if (typeof base !== 'string') return null
  return base.toLowerCase()
}
lower.arity = 1

function upper({args: [baseArg], ...context}: GroqFunctionOptions): string | null {
  const base = evaluate({...context, node: baseArg})
  if (typeof base !== 'string') return null
  return base.toUpperCase()
}
upper.arity = 1

function split({args: [baseArg, separatorArg], ...context}: GroqFunctionOptions): string[] | null {
  const base = evaluate({...context, node: baseArg})
  if (typeof base !== 'string') return null
  const separator = evaluate({...context, node: separatorArg})
  if (typeof separator !== 'string') return null
  if (!base.length) return []

  if (!separator.length) return Array.from(base)
  return base.split(separator)
}
split.arity = 2

function startsWith({args: [baseArg, prefixArg], ...context}: GroqFunctionOptions): boolean | null {
  const base = evaluate({...context, node: baseArg})
  if (typeof base !== 'string') return null
  const prefix = evaluate({...context, node: prefixArg})
  if (typeof prefix !== 'string') return null
  return base.startsWith(prefix)
}
startsWith.arity = 2

function join({args: [baseArg, separatorArg], ...context}: GroqFunctionOptions): string | null {
  const base = evaluate({...context, node: baseArg})
  if (!isIterable(base)) return null
  const separator = evaluate({...context, node: separatorArg})
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

function compact({
  args: [baseArg],
  ...context
}: GroqFunctionOptions): IteratorObject<unknown> | null {
  const base = evaluate({...context, node: baseArg})
  if (!isIterable(base)) return null
  return Iterator.from(base).filter((i = null) => i !== null)
}
compact.arity = 1

function unique({args: [baseArg], ...context}: GroqFunctionOptions): unknown[] | null {
  const base = evaluate({...context, node: baseArg})
  if (!isIterable(base)) return null

  // `Set`s preserve the order in which those unique values were first inserted
  return Array.from(
    new Set(
      Iterator.from(base).map((item) => {
        switch (typeof item) {
          case 'boolean':
          case 'number':
          case 'string': {
            return `${item}`
          }
          default: {
            return item
          }
        }
      }),
    ),
  )
}
unique.arity = 1

function intersects({args: [leftArg, rightArg], ...context}: GroqFunctionOptions): boolean | null {
  const left = evaluate({...context, node: leftArg})
  if (!isIterable(left)) return null
  const right = evaluate({...context, node: rightArg})
  if (!isIterable(right)) return null

  const createSet = (iterable: Iterable<unknown>) =>
    new Set(
      Iterator.from(iterable)
        .filter(
          (i) =>
            i === undefined ||
            i === null ||
            typeof i === 'boolean' ||
            typeof i === 'number' ||
            typeof i === 'string',
        )
        .map((i) => `${i}`),
    )

  const leftSet = createSet(left)
  const rightSet = createSet(right)

  // TODO: ensure polyfills for this are here
  return !leftSet.isDisjointFrom(rightSet)
}
intersects.arity = 2

function text({args: [baseArg], ...context}: GroqFunctionOptions): string | null {
  const base = evaluate({...context, node: baseArg})
  try {
    // TODO: this may not work anymore ...
    return toPlainText(base as PortableTextBlock | ArbitraryTypedObject[] | PortableTextBlock[])
  } catch {
    return null
  }
}
text.arity = 1

function projectId({sanity}: GroqFunctionOptions): string | null {
  return sanity?.projectId ?? null
}
projectId.arity = 0

function dataset({sanity}: GroqFunctionOptions): string | null {
  return sanity?.dataset ?? null
}
dataset.arity = 0

function versionsOf({
  args: [baseArg],
  ...context
}: GroqFunctionOptions): IteratorObject<unknown> | null {
  const root = context.scope.at(0)
  if (!isIterable(root)) return null

  const baseId = evaluate({...context, node: baseArg})
  if (typeof baseId !== 'string') return null

  return Iterator.from(root)
    .filter((value: unknown): value is {_id: string; _version: unknown} => {
      if (!value) return false
      if (typeof value !== 'object') return false
      if (!('_id' in value) || typeof value._id !== 'string') return false
      const id = value._id
      //  1. Document ID is of the form bundleId.documentGroupId
      const idIsVersionOfBaseId = id.split('.').length === 2 && id.endsWith(`.${baseId}`)
      if (!idIsVersionOfBaseId) return false

      //  2. And, they have a field called _version which is an object.
      return '_version' in value && typeof value._version === 'object'
    })
    .map((i) => i._id)
}
versionsOf.arity = 1

function partOfRelease({
  args: [baseArg],
  ...context
}: GroqFunctionOptions): IteratorObject<string> | null {
  const root = context.scope.at(0)
  if (!isIterable(root)) return null

  const baseId = evaluate({...context, node: baseArg})
  if (typeof baseId !== 'string') return null

  return Iterator.from(root)
    .filter((value: unknown): value is {_id: string; _version: unknown} => {
      // A document belongs to a bundle ID if:
      if (!value) return false
      if (typeof value !== 'object') return false
      if (!('_id' in value) || typeof value._id !== 'string') return false
      const id = value._id

      //  1. Document ID is of the form bundleId.documentGroupId
      const idIsVersionOfBaseId = id.split('.').length === 2 && id.startsWith(`${baseId}.`)
      if (!idIsVersionOfBaseId) return false

      //  2. And, they have a field called _version which is an object.
      return '_version' in value && typeof value._version === 'object'
    })
    .map((value) => value._id)
}
partOfRelease.arity = 1

function order({base, args, ...context}: GroqPipeFunctionOptions): unknown[] | null {
  if (!isIterable(base)) return null

  return Array.from(base)
    .map((value, index) => ({value, index}))
    .sort((a, b) => {
      for (const ordering of args) {
        const direction = ordering.type === 'Desc' ? -1 : 1
        const fieldNode =
          ordering.type === 'Asc' || ordering.type === 'Desc' ? ordering.base : ordering

        const aResult = evaluate({...context, scope: [...context.scope, a.value], node: fieldNode})
        const bResult = evaluate({...context, scope: [...context.scope, b.value], node: fieldNode})

        try {
          const result = compare(aResult, bResult)
          if (result !== 0) return result * direction
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

function score({base, args, ...context}: GroqPipeFunctionOptions): ObjectWithScore[] | null {
  if (!isIterable(base)) return null

  return Array.from(
    Iterator.from(base)
      .filter((item: unknown): item is object => typeof item !== 'object' && !!item)
      .map((item) => {
        const prevScore = '_score' in item && typeof item._score === 'number' ? item._score : 0
        const score = args.reduce((acc, arg) => {
          return (
            acc +
            evaluateScore({
              ...context,
              node: arg,
              scope: [...context.scope, item],
            })
          )
        }, prevScore)
        return Object.assign({}, item, {_score: score})
      }),
  ).sort((a, b) => a._score - b._score)
}
score.arity = (count: number) => count >= 1

function operation({after, before}: GroqFunctionOptions): 'update' | 'create' | 'delete' | null {
  if (after && before) return 'update'
  if (after) return 'create'
  if (before) return 'delete'
  return null
}

function min({args: [baseArg], ...context}: GroqFunctionOptions): number | null {
  const base = evaluate({...context, node: baseArg})
  if (!isIterable(base)) return null

  let min = Infinity
  for (const item of base) {
    if (item === null || item === undefined) continue
    // early exit if a non-null, non-number is found
    if (typeof item !== 'number') return null
    if (item < min) {
      min = item
    }
  }

  if (min === Infinity) return null
  return min
}
min.arity = 1

function max({args: [baseArg], ...context}: GroqFunctionOptions): number | null {
  const base = evaluate({...context, node: baseArg})
  if (!isIterable(base)) return null

  let max = -Infinity
  for (const item of base) {
    if (item === undefined || item === null) continue
    // early exit if a non-null, non-number is found
    if (typeof item !== 'number') return null
    if (item > max) {
      max = item
    }
  }
  if (max === -Infinity) return null
  return max
}
max.arity = 1

function sum({args: [baseArg], ...context}: GroqFunctionOptions): number | null {
  const base = evaluate({...context, node: baseArg})
  if (!isIterable(base)) return null

  let sum = 0
  let foundNumber = false
  for (const item of base) {
    if (item === undefined || item === null) continue
    // early exit if a non-null, non-number is found
    if (typeof item !== 'number') return null
    foundNumber = true
    sum += item
  }

  if (!foundNumber) return null
  return sum
}
sum.arity = 1

function avg({args: [baseArg], ...context}: GroqFunctionOptions): number | null {
  const base = evaluate({...context, node: baseArg})
  if (!isIterable(base)) return null

  let sum = 0
  let count = 0
  for (const item of base) {
    if (item === undefined || item === null) continue
    // early exit if a non-null, non-number is found
    if (typeof item !== 'number') return null
    count += 1
    sum += item
  }

  if (count === 0) return null
  return sum / count
}
avg.arity = 1

function now({timestamp}: GroqFunctionOptions): string {
  return timestamp
}
now.arity = 0

export const pipeFunctions: {[key: string]: WithOptions<GroqPipeFunction>} = {order, score}

export const namespaces: NamespaceSet = {
  global: {
    anywhere,
    coalesce,
    count,
    dateTime,
    defined,
    identity,
    length,
    path,
    string,
    references,
    round,
    now,
    boost,
    lower,
    upper,
  },
  string: {lower, upper, split, startsWith},
  array: {join, compact, unique, intersects},
  pt: {text},
  delta: {
    operation,
    changedAny: createStub({arity: 1, mode: 'delta'}),
    changedOnly: createStub({arity: 1, mode: 'delta'}),
  },
  diff: {
    changedAny: createStub({arity: 3}),
    changedOnly: createStub({arity: 3}),
  },
  sanity: {projectId, dataset, versionsOf, partOfRelease},
  math: {min, max, sum, avg},
  dateTime: {now},
}
