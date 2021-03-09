/* eslint-disable max-statements */
/* eslint-disable complexity */
import {execute, Scope} from '.'
import {Mapper} from '../mappers'
import {NULL_VALUE, StaticValue, StreamValue, Value} from './value'

export async function applyMapper(scope: Scope, value: Value, mapper: Mapper): Promise<Value> {
  switch (mapper.type) {
    case 'Attribute': {
      if (value.getType() === 'object') {
        const data = await value.get()
        if (data.hasOwnProperty(mapper.name)) {
          return new StaticValue(data[mapper.name])
        }
      }

      return NULL_VALUE
    }

    case 'Chain': {
      let result = value
      for (const innerMapper of mapper.mappers) {
        result = await applyMapper(scope, result, innerMapper)
      }
      return result
    }

    case 'Filter': {
      if (value.getType() !== 'array') {
        return NULL_VALUE
      }

      return new StreamValue(async function* () {
        for await (const element of value) {
          const newScope = scope.createNested(element)
          const condValue = await execute(mapper.expr, newScope)
          if (condValue.getBoolean()) {
            yield element
          }
        }
      })
    }

    case 'Slice': {
      if (value.getType() !== 'array') {
        return NULL_VALUE
      }

      const leftIdxValue = await execute(mapper.left, scope)
      const rightIdxValue = await execute(mapper.right, scope)

      if (leftIdxValue.getType() !== 'number' || rightIdxValue.getType() !== 'number') {
        return NULL_VALUE
      }

      // OPT: Here we can optimize when either indices are >= 0
      const array = (await value.get()) as any[]
      let leftIdx = (await leftIdxValue.get()) as number
      let rightIdx = (await rightIdxValue.get()) as number

      // Handle negative index
      if (leftIdx < 0) {
        leftIdx = array.length + leftIdx
      }
      if (rightIdx < 0) {
        rightIdx = array.length + rightIdx
      }

      // Convert from inclusive to exclusive index
      if (!mapper.isExclusive) {
        rightIdx++
      }

      if (leftIdx < 0) {
        leftIdx = 0
      }
      if (rightIdx < 0) {
        rightIdx = 0
      }

      // Note: At this point the indices might point out-of-bound, but
      // .slice handles this correctly.

      return new StaticValue(array.slice(leftIdx, rightIdx))
    }

    case 'Map': {
      if (value.getType() !== 'object') {
        return NULL_VALUE
      }

      const newScope = scope.createNested(value)
      return execute(mapper.expr, newScope)
    }

    case 'ArrayMap': {
      if (value.getType() !== 'array') {
        return NULL_VALUE
      }

      return new StreamValue(async function* () {
        for await (const element of value) {
          yield await applyMapper(scope, element, mapper.inner)
        }
      })
    }

    case 'FlatMap': {
      if (value.getType() !== 'array') {
        return NULL_VALUE
      }

      return new StreamValue(async function* () {
        for await (let element of value) {
          element = await applyMapper(scope, element, mapper.inner)
          if (element.getType() === 'array') {
            for await (const inner of element) {
              yield inner
            }
          } else {
            yield NULL_VALUE
          }
        }
      })
    }

    case 'Deref': {
      if (scope.source.getType() !== 'array') {
        return NULL_VALUE
      }

      if (value.getType() !== 'object') {
        return NULL_VALUE
      }

      const id = (await value.get())._ref
      if (typeof id !== 'string') {
        return NULL_VALUE
      }

      for await (const doc of scope.source) {
        if (id === doc.data._id) {
          return doc
        }
      }

      return NULL_VALUE
    }

    case 'Element': {
      if (value.getType() !== 'array') {
        return NULL_VALUE
      }

      const idxValue = await execute(mapper.index, scope)
      if (idxValue.getType() !== 'number') {
        return NULL_VALUE
      }

      // OPT: Here we can optimize when idx >= 0
      const array = await value.get()
      let idx = await idxValue.get()

      if (idx < 0) {
        idx = array.length + idx
      }

      if (idx >= 0 && idx < array.length) {
        return new StaticValue(array[idx])
      }
      // Make sure we return `null` for out-of-bounds access
      return NULL_VALUE
    }

    default:
      throw new Error(`Unknown mapper: ${(mapper as any).type}`)
  }
}
