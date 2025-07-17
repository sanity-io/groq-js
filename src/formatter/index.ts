import type {ExprNode} from '../nodeTypes'
import {createFormatContext} from './context'
import {NodeFormatter} from './nodeFormatters'

export interface FormatOptions {
  /** Indentation string (default: "  ") */
  indent?: string
}

/**
 * Format a GROQ AST node into pretty format
 */
export function format(node: ExprNode, options: FormatOptions = {}): string {
  const context = createFormatContext(options)
  const formatter = new NodeFormatter(context)
  return formatter.format(node)
}
