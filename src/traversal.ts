/* eslint-disable camelcase */
import {ExprNode} from './nodeTypes'

export type Traversal = (base: ExprNode) => ExprNode

/**
 * Join combines two traversals, returning a mapper which is the result of first
 * applying `a` and then applying `b`.
 */
function join(a: Traversal, b: Traversal): Traversal {
  return (base: ExprNode) => b(a(base))
}

/**
 * Map returns a new mapper which will the inner mappe to each element of the array.
 */
function map(inner: Traversal): Traversal {
  return (base: ExprNode) => ({type: 'Map', base, expr: inner({type: 'This'})})
}

function flatMap(inner: Traversal): Traversal {
  return (base: ExprNode) => ({type: 'FlatMap', base, expr: inner({type: 'This'})})
}

export type TraversalResult = {
  type: 'a-a' | 'a-b' | 'b-a' | 'b-b'
  build: Traversal
}

export function traverseArray(build: Traversal, right: TraversalResult | null): TraversalResult {
  if (!right) {
    return {
      type: 'a-a',
      build: build,
    }
  }

  switch (right.type) {
    case 'a-a':
      return {
        type: 'a-a',
        build: join(build, right.build),
      }

    case 'a-b':
      return {
        type: 'a-b',
        build: join(build, right.build),
      }

    case 'b-b':
      return {
        type: 'a-a',
        build: join(build, map(right.build)),
      }

    case 'b-a':
      return {
        type: 'a-a',
        build: join(build, flatMap(right.build)),
      }

    default:
      throw new Error(`unknown type: ${right.type}`)
  }
}

export function traversePlain(mapper: Traversal, right: TraversalResult | null): TraversalResult {
  if (!right) {
    return {
      type: 'b-b',
      build: mapper,
    }
  }

  switch (right.type) {
    case 'a-a':
    case 'b-a':
      return {
        type: 'b-a',
        build: join(mapper, right.build),
      }

    case 'a-b':
    case 'b-b':
      return {
        type: 'b-b',
        build: join(mapper, right.build),
      }

    default:
      throw new Error(`unknown type: ${right.type}`)
  }
}

export function traverseElement(mapper: Traversal, right: TraversalResult | null): TraversalResult {
  if (!right) {
    return {
      type: 'a-b',
      build: mapper,
    }
  }

  switch (right.type) {
    case 'a-a':
    case 'b-a':
      return {
        type: 'a-a',
        build: join(mapper, right.build),
      }

    case 'a-b':
    case 'b-b':
      return {
        type: 'a-b',
        build: join(mapper, right.build),
      }

    default:
      throw new Error(`unknown type: ${right.type}`)
  }
}

export function traverseProjection(
  mapper: Traversal,
  right: TraversalResult | null
): TraversalResult {
  if (!right) {
    return {
      type: 'b-b',
      build: mapper,
    }
  }

  switch (right.type) {
    case 'a-a':
      return {
        type: 'a-a',
        build: join(map(mapper), right.build),
      }
    case 'a-b':
      return {
        type: 'a-b',
        build: join(map(mapper), right.build),
      }
    case 'b-a':
      return {
        type: 'b-a',
        build: join(mapper, right.build),
      }
    case 'b-b':
      return {
        type: 'b-b',
        build: join(mapper, right.build),
      }
    default:
      throw new Error(`unknown type: ${right.type}`)
  }
}
