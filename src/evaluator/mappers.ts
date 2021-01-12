import {execute, Scope} from '.'
import {Mapper, SliceMapper, SyntaxNode} from '../nodeTypes'
import {NULL_VALUE, StaticValue, StreamValue, Value} from './value'

export async function applyMapper(scope: Scope, value: Value, mapper: Mapper): Promise<Value> {
  switch (mapper.type) {
    case 'Attribute':
      return applyAttribute(value, mapper.key)
    case 'Apply':
      return applyNested(scope, value, mapper.mapper)
    case 'Filter':
      return applyFilter(scope, value, mapper.expr)
    case 'Deref':
      return applyDeref(scope, value)
    case 'Compound': {
      for (let m of mapper.mappers) {
        value = await applyMapper(scope, value, m)
      }
      return value
    }
    case 'Slice':
      return applySlice(scope, value, mapper)
    case 'Projection':
      return applyProjection(scope, value, mapper.expr)
  }
}

async function applyAttribute(value: Value, key: string) {
  if (value.getType() === 'object') {
    let data = await value.get()
    if (data.hasOwnProperty(key)) {
      return new StaticValue(data[key])
    }
  }

  return NULL_VALUE
}

async function applyNested(scope: Scope, value: Value, mapper: Mapper) {
  if (value.getType() !== 'array') return NULL_VALUE

  return new StreamValue(async function*() {
    for await (let element of value) {
      yield await applyMapper(scope, element, mapper)
    }
  })
}

async function applyFilter(scope: Scope, value: Value, expr: SyntaxNode) {
  if (value.getType() !== 'array') return NULL_VALUE

  return new StreamValue(async function*() {
    for await (let element of value) {
      let newScope = scope.createNested(element)
      let condValue = await execute(expr, newScope)
      if (condValue.getBoolean()) yield element
    }
  })
}

async function applySlice(scope: Scope, value: Value, {left, right, isExclusive}: SliceMapper) {
  if (value.getType() !== 'array') return NULL_VALUE

  let leftIdxValue = await execute(left, scope)
  let rightIdxValue = await execute(right, scope)

  if (leftIdxValue.getType() !== 'number' || rightIdxValue.getType() !== 'number') {
    return NULL_VALUE
  }

  // OPT: Here we can optimize when either indices are >= 0
  let array = (await value.get()) as any[]
  let leftIdx = (await leftIdxValue.get()) as number
  let rightIdx = (await rightIdxValue.get()) as number

  // Handle negative index
  if (leftIdx < 0) leftIdx = array.length + leftIdx
  if (rightIdx < 0) rightIdx = array.length + rightIdx

  // Convert from inclusive to exclusive index
  if (!isExclusive) rightIdx++

  if (leftIdx < 0) leftIdx = 0
  if (rightIdx < 0) rightIdx = 0

  // Note: At this point the indices might point out-of-bound, but
  // .slice handles this correctly.

  return new StaticValue(array.slice(leftIdx, rightIdx))
}

async function applyDeref(scope: Scope, value: Value) {
  if (scope.source.getType() !== 'array') return NULL_VALUE
  if (value.getType() !== 'object') return NULL_VALUE

  let id = (await value.get())._ref
  if (typeof id !== 'string') return NULL_VALUE

  for await (let doc of scope.source) {
    if (id === doc.data._id) {
      return doc
    }
  }

  return NULL_VALUE
}

async function applyProjection(scope: Scope, value: Value, expr: SyntaxNode) {
  if (value.getType() === 'null') return NULL_VALUE

  let newScope = scope.createNested(value)
  return await execute(expr, newScope)
}
