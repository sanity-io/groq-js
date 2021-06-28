import {LogicExprNodeSet} from './LogicExprNodeSet'

export type LogicExprNode =
  | {
      type: 'And'
      children: LogicExprNodeSet
      hash: string
    }
  | {
      type: 'Or'
      children: LogicExprNodeSet
      hash: string
    }
  | {
      type: 'Not'
      child: LogicExprNode
      hash: string
    }
  | {
      type: 'Literal'
      hash: 'true' | 'false'
    }
  | {
      type: 'SingleVariableEquality'
      hash: string
      group: string
    }
  | {
      type: 'SingleVariableNumericEquality'
      hash: string
      group: string
      value: number
    }
  | {
      type: 'MultiVariableEquality'
      hash: string
      groups: [string, string]
    }
  | {
      type: 'MultiVariableInequality'
      hash: string
      groups: [string, string]
      inclusive: boolean
    }
  | {
      type: 'SingleVariableInequality'
      hash: string
      group: string
      value: number
      inclusive: boolean
    }
  | {
      // TODO: rename to LeafExpression?
      type: 'UnknownExpression'
      hash: string
    }

export type LogicExprNodeTransform = (node: LogicExprNode) => LogicExprNode
export type LogicExprNodeMiddleware = (fn: LogicExprNodeTransform) => LogicExprNodeTransform

export const LITERAL_FALSE: Extract<LogicExprNode, {type: 'Literal'}> = {
  type: 'Literal',
  hash: 'false',
}
export const LITERAL_TRUE: Extract<LogicExprNode, {type: 'Literal'}> = {
  type: 'Literal',
  hash: 'true',
}
