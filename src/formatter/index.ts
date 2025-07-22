import type {ExprNode} from '../nodeTypes'
import {NodeFormatter} from './nodeFormatters'

export interface FormatOptions {
  /** Indentation string (default: "  ") */
  indent?: string
}

/**
 * Format a GROQ AST node into pretty format
 */
export function format(node: ExprNode, options: FormatOptions = {}): string {
  const formatter = new NodeFormatter(options.indent ?? '  ')
  return formatter.format(node)
}
