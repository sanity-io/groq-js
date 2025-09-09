import type {ExprNode} from '../nodeTypes'
import {NULL_VALUE, type AnyStaticValue} from '../values'
import {executeSync} from './evaluate'
import {Scope} from './scope'

function canConstantEvaluate(node: ExprNode): boolean {
  switch (node.type) {
    case 'Group':
      return canConstantEvaluate(node.base)
    case 'Value':
    case 'Parameter':
      return true
    case 'Pos':
    case 'Neg':
      return canConstantEvaluate(node.base)
    case 'OpCall':
      switch (node.op) {
        case '+':
        case '-':
        case '*':
        case '/':
        case '%':
        case '**':
          return canConstantEvaluate(node.left) && canConstantEvaluate(node.right)
        default:
          return false
      }
    default:
      return false
  }
}

const DUMMY_SCOPE = new Scope(
  {},
  NULL_VALUE,
  NULL_VALUE,
  {timestamp: new Date(0), identity: 'me', before: null, after: null},
  null,
)

export function tryConstantEvaluate(node: ExprNode): AnyStaticValue | null {
  if (!canConstantEvaluate(node)) {
    return null
  }

  return constantEvaluate(node)
}

function constantEvaluate(node: ExprNode): AnyStaticValue {
  return executeSync(node, DUMMY_SCOPE)
}
