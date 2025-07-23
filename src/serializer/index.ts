import type {ExprNode} from '../nodeTypes'
import {NodeSerializer} from './nodeSerializers'

export interface SerializeOptions {
  /** Indentation string (default: "  ") */
  indentString?: string
}

/**
 * Serialize a GROQ AST node into formatted string
 */
export function serialize(node: ExprNode, options: SerializeOptions = {}): string {
  const serializer = new NodeSerializer({ indentString: options.indentString })
  return serializer.serialize(node)
}
