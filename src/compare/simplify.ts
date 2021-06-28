import {
  LogicExprNodeTransform,
  LogicExprNode,
  LogicExprNodeMiddleware,
  LITERAL_FALSE,
  LITERAL_TRUE,
} from './compareTypes'
import {withMemoization} from './utils'
import {createNode} from './compare'
import {LogicExprNodeSet} from './LogicExprNodeSet'

const hasSelfNegation = (node: LogicExprNode) => {
  if (!('children' in node)) return false

  const negated = node.children.map((child) => createNode({type: 'Not', child}))

  for (const current of node.children) {
    if (negated.has(current)) return true
  }

  return false
}

/**
 * ```
 * (A or  (B or  C)) ==> (A or  B or  C)
 * (A and (B and C)) ==> (A and B and C)
 * ```
 */
const flatten: LogicExprNodeTransform = (node) => {
  if (!('children' in node)) return node

  const flattened = node.children.reduce((flattened, child) => {
    if (child.type === node.type) {
      for (const nestedChild of child.children) {
        flattened.add(nestedChild)
      }
    } else {
      flattened.add(child)
    }
    return flattened
  }, new LogicExprNodeSet())

  // @ts-expect-error this is an error with the types of `createNode`
  return createNode({type: node.type, children: flattened})
}

/**
 * ```
 * or(A)  ==> A
 * and(A) ==> A
 * ```
 */
const unwrapSizeOfOneChildren: LogicExprNodeTransform = (node) => {
  if (!('children' in node)) return node
  if (node.children.size !== 1) return node
  return node.children.first()!
}

/**
 * ```
 * (A and !A) ==> false
 * (A or  !A) ==> true
 * ```
 */
const simplifyToLiteralOnSelfNegation: LogicExprNodeTransform = (node) => {
  if (!hasSelfNegation(node)) return node
  if (node.type === 'And') return LITERAL_FALSE
  if (node.type === 'Or') return LITERAL_TRUE
  return node
}

/**
 * ```
 * (A and false) ==> false
 * ```
 */
const simplifyToFalseInConjunction: LogicExprNodeTransform = (node) => {
  if (node.type !== 'And') return node
  if (node.children.has(LITERAL_FALSE)) return LITERAL_FALSE
  return node
}

/**
 * ```
 * (A or true) ==> true
 * ```
 */
const simplifyToTrueInUnion: LogicExprNodeTransform = (node) => {
  if (node.type !== 'Or') return node
  if (node.children.has(LITERAL_TRUE)) return LITERAL_TRUE
  return node
}

/**
 * ```
 * (A or B or false) ==> A or B
 * ```
 */
const removeFalseInUnion: LogicExprNodeTransform = (node) => {
  if (node.type !== 'Or') return node
  if (!node.children.has(LITERAL_FALSE)) return node

  const children = node.children.clone()
  children.delete(LITERAL_FALSE)
  return createNode({type: 'Or', children})
}

/**
 * ```
 * (A and B and true) ==> A and B
 * ```
 */
const removeTrueInConjunction: LogicExprNodeTransform = (node) => {
  if (node.type !== 'And') return node
  if (!node.children.has(LITERAL_TRUE)) return node

  const children = node.children.clone()
  children.delete(LITERAL_TRUE)
  return createNode({type: 'And', children})
}

/**
 * ```
 * !!A => A
 * ```
 */
const removeNotNot: LogicExprNodeTransform = (node) => {
  if (node.type !== 'Not') return node
  if (node.child.type === 'Not') return node.child.child
  return node
}

/**
 * ```
 * (A or (!A and B)) ==> (A or B)
 * ```
 */
const removeNestedConjunctionInUnion: LogicExprNodeTransform = (node) => {
  if (node.type !== 'Or') return node

  return createNode({
    type: 'Or',
    children: node.children.filter((andNode) => {
      if (andNode.type !== 'And') return true

      for (const currentChild of node.children) {
        if (currentChild === andNode) continue

        const negation = createNode({type: 'Not', child: currentChild})
        if (andNode.children.has(negation)) return false
      }
      return true
    }),
  })
}

/**
 * A function wrapper that runs the result of the input function through all of
 * the simplification functions
 *
 *
 */
const withSimplifications: LogicExprNodeMiddleware = (fn) => (node) => {
  const init = fn(node)

  const simplifications: LogicExprNodeTransform[] = [
    flatten,
    removeFalseInUnion,
    removeNotNot,
    simplifyToLiteralOnSelfNegation,
    removeTrueInConjunction,
    simplifyToFalseInConjunction,
    removeNestedConjunctionInUnion,
    simplifyToTrueInUnion,
    unwrapSizeOfOneChildren,
  ]

  return simplifications.reduce<LogicExprNode>((acc, f) => f(acc), init)
}

export const simplify = withMemoization(
  withSimplifications((n) => {
    if (n.type === 'And') return createNode({type: 'And', children: n.children.map(simplify)})
    if (n.type === 'Or') return createNode({type: 'Or', children: n.children.map(simplify)})
    if (n.type === 'Not') return createNode({type: 'Not', child: simplify(n.child)})
    return n
  })
)
