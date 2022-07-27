import t from 'tap'
import {ExprNode} from '../src/nodeTypes'

import {
  TraversalResult,
  traverseArray,
  traverseElement,
  traversePlain,
  traverseProjection,
} from '../src/traversal'

import {throwsWithMessage} from './testUtils'

t.test('traverseProjection', async (t) => {
  t.test('throws when the right hand side type is unknown', async (t) => {
    const traversal = (base: ExprNode) => {
      return {type: 'Tuple', members: []} as ExprNode
    }

    // @ts-ignore (we intentionally want to use an invalid `type` property for testing purposes)
    const right = {type: 'c-c', build: traversal} as TraversalResult

    throwsWithMessage(t, () => traverseProjection(traversal, right), 'unknown type: c-c')
  })

  t.test('handles `b-a` type traversals correctly', async (t) => {
    const traversal = (base: ExprNode) => {
      return {type: 'Tuple', members: []} as ExprNode
    }

    const right = {type: 'b-a', build: traversal} as TraversalResult
    const finalTraversalResult = traverseProjection(traversal, right)

    t.same(finalTraversalResult.type, 'b-a')
    // This is a slightly hacky way to test that the `build` property is a Traversal,
    // since traversals are just a type of function.
    t.type(finalTraversalResult.build, 'function')
  })
})

t.test('traverseElement', async (t) => {
  t.test('throws when the right hand side type is unknown', async (t) => {
    const traversal = (base: ExprNode) => {
      return {type: 'Tuple', members: []} as ExprNode
    }

    // @ts-ignore (we intentionally want to use an invalid `type` property for testing purposes)
    const right = {type: 'c-c', build: traversal} as TraversalResult

    throwsWithMessage(t, () => traverseElement(traversal, right), 'unknown type: c-c')
  })
})

t.test('traversePlain', async (t) => {
  t.test('throws when the right hand side type is unknown', async (t) => {
    const traversal = (base: ExprNode) => {
      return {type: 'Tuple', members: []} as ExprNode
    }

    // @ts-ignore (we intentionally want to use an invalid `type` property for testing purposes)
    const right = {type: 'c-c', build: traversal} as TraversalResult

    throwsWithMessage(t, () => traversePlain(traversal, right), 'unknown type: c-c')
  })
})

t.test('traverseArray', async (t) => {
  t.test('throws when the right hand side type is unknown', async (t) => {
    const traversal = (base: ExprNode) => {
      return {type: 'Tuple', members: []} as ExprNode
    }

    // @ts-ignore (we intentionally want to use an invalid `type` property for testing purposes)
    const right = {type: 'c-c', build: traversal} as TraversalResult

    throwsWithMessage(t, () => traverseArray(traversal, right), 'unknown type: c-c')
  })
})
