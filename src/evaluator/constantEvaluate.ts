import {ExprNode} from '../nodeTypes'
import {NULL_VALUE, Value} from '../values'
import {evaluate} from './evaluate'
import {Scope} from './scope'

function canConstantEvaluate(node: ExprNode): boolean {
  switch (node.type) {
    case 'Group':
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
  null
)

export function tryConstantEvaluate(node: ExprNode): Value | null {
  if (!canConstantEvaluate(node)) {
    return null
  }

  return constantEvaluate(node)
}

function constantEvaluate(node: ExprNode): Value {
  const value = evaluate(node, DUMMY_SCOPE, constantEvaluate)
  if ('then' in value) {
    throw new Error('BUG: constant evaluate should never return a promise')
  }
  return value
}
