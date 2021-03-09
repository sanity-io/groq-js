/* eslint-disable camelcase */
import {MarkProcessor} from './markProcessor'
import {isNumber, isString} from './nodeHelpers'
import * as NodeTypes from './nodeTypes'

export type Mapper =
  | {type: 'ArrayMap'; inner: Mapper}
  | {type: 'Attribute'; name: string}
  | {type: 'Deref'}
  | {type: 'Element'; index: NodeTypes.ValueNode<number>}
  | {
      type: 'Slice'
      left: NodeTypes.ValueNode<number>
      right: NodeTypes.ValueNode<number>
      isExclusive: boolean
    }
  | {type: 'Chain'; mappers: Mapper[]}
  | {type: 'Map'; expr: NodeTypes.SyntaxNode}
  | {type: 'FlatMap'; inner: Mapper}
  | {type: 'Filter'; expr: NodeTypes.SyntaxNode}

/**
 * Join combines two mappers, returning a mapper which is the result of first
 * applying `a` and then applying `b`.
 */
function join(a: Mapper, b: Mapper): Mapper {
  const mappers: Mapper[] = []

  if (a.type === 'Chain') {
    mappers.push(...a.mappers)
  } else {
    mappers.push(a)
  }

  if (b.type === 'Chain') {
    mappers.push(...b.mappers)
  } else {
    mappers.push(b)
  }

  if (mappers.length === 1) {
    return mappers[0]
  }

  return {type: 'Chain', mappers}
}

/**
 * Map returns a new mapper which will the inner mappe to each element of the array.
 */
function map(inner: Mapper): Mapper {
  return {type: 'ArrayMap', inner}
}

function flatMap(inner: Mapper): Mapper {
  return {type: 'FlatMap', inner}
}

type MapperResult = {
  type: 'a-a' | 'a-b' | 'b-a' | 'b-b'
  mapper: Mapper
}

type MapperBuilder = (rhs: MapperResult | null) => MapperResult

function mapArray(mapper: Mapper, right: MapperResult | null): MapperResult {
  if (!right) {
    return {
      type: 'a-a',
      mapper,
    }
  }

  switch (right.type) {
    case 'a-a':
      return {
        type: 'a-a',
        mapper: join(mapper, right.mapper),
      }

    case 'a-b':
      return {
        type: 'a-b',
        mapper: join(mapper, right.mapper),
      }

    case 'b-b':
      return {
        type: 'a-a',
        mapper: join(mapper, map(right.mapper)),
      }

    case 'b-a':
      return {
        type: 'a-a',
        mapper: join(mapper, flatMap(right.mapper)),
      }

    default:
      throw new Error(`unknown type: ${right.type}`)
  }
}

function mapBasic(mapper: Mapper, right: MapperResult | null): MapperResult {
  if (!right) {
    return {
      type: 'b-b',
      mapper,
    }
  }

  switch (right.type) {
    case 'a-a':
    case 'b-a':
      return {
        type: 'b-a',
        mapper: join(mapper, right.mapper),
      }

    case 'a-b':
    case 'b-b':
      return {
        type: 'b-b',
        mapper: join(mapper, right.mapper),
      }

    default:
      throw new Error(`unknown type: ${right.type}`)
  }
}

function mapElement(mapper: Mapper, right: MapperResult | null): MapperResult {
  if (!right) {
    return {
      type: 'a-b',
      mapper,
    }
  }

  switch (right.type) {
    case 'a-a':
    case 'b-a':
      return {
        type: 'a-a',
        mapper: join(mapper, right.mapper),
      }

    case 'a-b':
    case 'b-b':
      return {
        type: 'a-b',
        mapper: join(mapper, right.mapper),
      }

    default:
      throw new Error(`unknown type: ${right.type}`)
  }
}

function mapProjection(mapper: Mapper, right: MapperResult | null): MapperResult {
  if (!right) {
    return {
      type: 'b-b',
      mapper,
    }
  }

  switch (right.type) {
    case 'a-a':
      return {
        type: 'a-a',
        mapper: join(map(mapper), right.mapper),
      }
    case 'a-b':
      return {
        type: 'a-b',
        mapper: join(map(mapper), right.mapper),
      }
    case 'b-a':
      return {
        type: 'b-a',
        mapper: join(mapper, right.mapper),
      }
    case 'b-b':
      return {
        type: 'b-b',
        mapper: join(mapper, right.mapper),
      }
    default:
      throw new Error(`unknown type: ${right.type}`)
  }
}

export const MAP_BUILDER: Record<string, undefined | ((p: MarkProcessor) => MapperBuilder)> = {
  filter(p): MapperBuilder {
    const expr = p.process() as NodeTypes.SyntaxNode

    if (isNumber(expr)) {
      const numberExpr = expr
      return (right) =>
        mapElement(
          {
            type: 'Element',
            index: numberExpr,
          },
          right
        )
    }

    if (isString(expr)) {
      const stringExpr = expr
      return (right) =>
        mapBasic(
          {
            type: 'Attribute',
            name: stringExpr.value,
          },
          right
        )
    }

    if (expr.type === 'Range') {
      const rangeExpr = expr
      return (right) =>
        mapArray(
          {
            type: 'Slice',
            left: rangeExpr.left,
            right: rangeExpr.right,
            isExclusive: rangeExpr.isExclusive,
          },
          right
        )
    }

    return (right) =>
      mapArray(
        {
          type: 'Filter',
          expr,
        },
        right
      )
  },

  attr_ident(p) {
    const name = p.processString()

    return (right) =>
      mapBasic(
        {
          type: 'Attribute',
          name,
        },
        right
      )
  },

  arr_expr(p) {
    return (right) => mapArray({type: 'Chain', mappers: []}, right)
  },

  deref(p) {
    const nextMark = p.getMark()

    let mapper: Mapper = {type: 'Deref'}

    if (nextMark && nextMark.name === 'deref_field') {
      const name = p.processString()
      mapper = {type: 'Chain', mappers: [mapper, {type: 'Attribute', name}]}
    }

    return (right) => mapBasic(mapper, right)
  },

  project(p) {
    const expr = p.process()

    return (right) =>
      mapProjection(
        {
          type: 'Map',
          expr,
        },
        right
      )
  },
}

export function processMapper(
  p: MarkProcessor,
  builder: (p2: MarkProcessor) => MapperBuilder
): NodeTypes.SyntaxNode {
  const result = processMapperInternal(p, builder)
  let mapper = result.result(null)

  if (
    result.base.type === 'Star' ||
    result.base.type === 'Array' ||
    result.base.type === 'PipeFuncCall'
  ) {
    mapper = mapArray({type: 'Chain', mappers: []}, mapper)
  }

  return {type: 'Mapper', base: result.base, mapper: mapper.mapper}
}

function processMapperInternal(
  p: MarkProcessor,
  builder: (p2: MarkProcessor) => MapperBuilder
): {
  result: (right: MapperResult | null) => MapperResult
  base: NodeTypes.SyntaxNode
} {
  const nextBuilder = MAP_BUILDER[p.getMark().name]

  if (nextBuilder) {
    p.shift()
    const inner = processMapperInternal(p, nextBuilder)
    const current = builder(p)

    return {
      result: (rhs) => inner.result(current(rhs)),
      base: inner.base,
    }
  }
  const base = p.process()
  const current = builder(p)
  return {
    result: (rhs) => current(rhs),
    base,
  }
}
