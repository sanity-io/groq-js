import {LogicExprNode, LogicExprNodeMiddleware} from './compareTypes'

export const withMemoization: LogicExprNodeMiddleware = (fn) => {
  const memo = new Map<string, LogicExprNode>()

  return (node) => {
    if (memo.has(node.hash)) return memo.get(node.hash)!

    const result = fn(node)
    memo.set(node.hash, result)

    return result
  }
}
