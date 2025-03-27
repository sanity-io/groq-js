import type {ExprNode, Value} from '../../nodeTypes'
import {isIterable, isRecord} from '../../values/utils'
import {evaluate} from '../evaluate'
import type {Scope} from '../scope'
import type {Context} from '../types'

export function projectId(_args: ExprNode[], _scope: Scope, context: Context): Value {
  return context.sanity?.projectId ?? null
}
projectId.arity = 0

export function dataset(_args: ExprNode[], _scope: Scope, context: Context): Value {
  return context.sanity?.dataset ?? null
}
dataset.arity = 0

export function versionOf(args: ExprNode[], scope: Scope, context: Context): Value {
  const {dataset} = context
  if (!isIterable(dataset)) return null

  const baseId = evaluate(args[0], scope, context)
  if (typeof baseId !== 'string') return null

  return Iterator.from(dataset)
    .filter((value): value is Record<string, Value> & {_id: string} => {
      if (!isRecord(value)) return false
      if (typeof value['_id'] !== 'string') return false
      const id = value['_id']

      // Handle three cases:
      // 1. Exact match with baseId
      // 2. IDs starting with "versions.releaseId."
      // 3. IDs starting with "drafts."
      const components = id.split('.')
      return (
        id === baseId ||
        (components.length >= 3 &&
          components[0] === 'versions' &&
          components.slice(2).join('.') === baseId) ||
        (components.length >= 2 &&
          components[0] === 'drafts' &&
          components.slice(1).join('.') === baseId)
      )
    })
    .map((i) => i['_id'])
}
versionOf.arity = 1

export function partOfRelease(args: ExprNode[], scope: Scope, context: Context): Value {
  const {dataset} = context
  if (!isIterable(dataset)) return null

  const baseId = evaluate(args[0], scope, context)
  if (typeof baseId !== 'string') return null

  return Iterator.from(dataset)
    .filter((value): value is Record<string, Value> & {_id: string} => {
      if (!isRecord(value)) return false
      if (typeof value['_id'] !== 'string') return false
      const id = value['_id']

      // A document is part of a release if its ID is of the form versions.{baseId}.*
      const components = id.split('.')
      return components.length >= 3 && components[0] === 'versions' && components[1] === baseId
    })
    .map((i) => i['_id'])
}
partOfRelease.arity = 1
