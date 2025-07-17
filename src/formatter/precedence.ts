import type {ExprNode} from '../nodeTypes'
import {PRECEDENCE_CONSTANTS} from '../rawParser'

// Use the same precedence constants as the parser
const {
  PREC_PAIR,
  PREC_OR,
  PREC_AND,
  PREC_COMP,
  PREC_ORDER,
  PREC_ADD,
  PREC_SUB,
  PREC_MUL,
  PREC_DIV,
  PREC_MOD,
  PREC_POW,
  PREC_POS,
  PREC_NOT,
  PREC_NEG
} = PRECEDENCE_CONSTANTS

// Operator precedence mapping using parser constants
// Only includes operators that are actually handled with precedence in the parser
export const PRECEDENCE: Record<string, number> = {
  // Pipe operator (hardcoded as 11 in parser line 418)
  '|': 11,

  // Exponentiation
  '**': PREC_POW,

  // Multiplication, division, modulo
  '*': PREC_MUL,
  '/': PREC_DIV,
  '%': PREC_MOD,

  // Addition, subtraction
  '+': PREC_ADD,
  '-': PREC_SUB,

  // Comparison operators
  '==': PREC_COMP,
  '!=': PREC_COMP,
  '<': PREC_COMP,
  '<=': PREC_COMP,
  '>': PREC_COMP,
  '>=': PREC_COMP,
  'match': PREC_COMP,
  'in': PREC_COMP,

  // Logical AND
  '&&': PREC_AND,

  // Logical OR
  '||': PREC_OR,

  // Rocket operator (uses PREC_PAIR)
  '=>': PREC_PAIR,

  // Order operators
  'asc': PREC_ORDER,
  'desc': PREC_ORDER,
}

export function getNodePrecedence(node: ExprNode): number {
  switch (node.type) {
    case 'OpCall':
      return PRECEDENCE[node.op] ?? 0
    case 'And':
      return PREC_AND
    case 'Or':
      return PREC_OR
    case 'Not':
      return PREC_NOT
    case 'Neg':
      return PREC_NEG
    case 'Pos':
      return PREC_POS
    case 'PipeFuncCall':
      return PRECEDENCE['|']
    // Note: Deref, AccessAttribute, InRange are handled in parseTraversal, not main precedence
    default:
      return 0 // Default precedence for other nodes
  }
}

export function needsParentheses(parent: ExprNode, child: ExprNode): boolean {
  const parentPrecedence = getNodePrecedence(parent)
  const childPrecedence = getNodePrecedence(child)

  // If child has lower precedence, it needs parentheses
  if (childPrecedence < parentPrecedence) {
    return true
  }

  // Groups always need parentheses preserved
  if (child.type === 'Group') {
    return true
  }

  return false
}
