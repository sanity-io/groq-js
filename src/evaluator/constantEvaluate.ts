import {ExprNode} from '../nodeTypes'
import {evaluate} from './evaluate'
import {Scope} from './scope'
import {NULL_VALUE, Value} from '../values'

function canConstantEvaluate(node: ExprNode): boolean {
  switch (node.type) {
    case 'Group':
    case 'Value':
    case 'Parameter':
    case 'Pos':
    case 'Neg':
      return true
    case 'OpCall':
      switch (node.op) {
        case '+':
        case '-':
        case '*':
        case '/':
        case '%':
        case '**':
          return true
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

class ConstantEvaluateError extends Error {
  name = 'ConstantEvaluateError'
}

export function tryConstantEvaluate(node: ExprNode): Value | null {
  try {
    return constantEvaluate(node)
  } catch (err) {
    if (err.name === 'ConstantEvaluateError') {
      return null
    }
    throw err
  }
}

function constantEvaluate(node: ExprNode): Value {
  if (!canConstantEvaluate(node)) {
    throw new ConstantEvaluateError('cannot constant evaluate')
  }

  const value = evaluate(node, DUMMY_SCOPE, constantEvaluate)
  if ('then' in value) {
    throw new Error('BUG: constant evaluate should never return a promise')
  }
  return value
}
