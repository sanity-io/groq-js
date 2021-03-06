import {GroqFunction, GroqPipeFunction} from './evaluator/functions'
import {Mapper} from './mappers'

export type SyntaxNode =
  | AndNode
  | ArrayNode
  | ArrayElementNode
  | AscNode
  | DescNode
  | FuncCallNode
  | IdentifierNode
  | MapperNode
  | NegNode
  | NotNode
  | ObjectNode
  | ObjectAttributeNode
  | ObjectConditionalSplatNode
  | ObjectSplatNode
  | OpCallNode
  | OrNode
  | PairNode
  | ParameterNode
  | ParentNode
  | ParenthesisNode
  | PipeFuncCallNode
  | PosNode
  | ProjectionNode
  | RangeNode
  | StarNode
  | ThisNode
  | ValueNode

export type OpCall = '+' | '-' | '*' | '/' | '%' | '**'

export type NodeName =
  | 'And'
  | 'Array'
  | 'ArrayElement'
  | 'Asc'
  | 'Desc'
  | 'FuncCall'
  | 'Identifier'
  | 'Mapper'
  | 'Neg'
  | 'Not'
  | 'Object'
  | 'ObjectAttribute'
  | 'ObjectConditionalSplat'
  | 'ObjectSplat'
  | 'OpCall'
  | 'Or'
  | 'Pair'
  | 'Parameter'
  | 'Parent'
  | 'Parenthesis'
  | 'PipeFuncCall'
  | 'Pos'
  | 'Projection'
  | 'Range'
  | 'Star'
  | 'This'
  | 'Value'

export interface AndNode {
  type: 'And'
  left: SyntaxNode
  right: SyntaxNode
}

export interface ArrayNode {
  type: 'Array'
  elements: ArrayElementNode[]
}

export interface ArrayElementNode {
  type: 'ArrayElement'
  value: SyntaxNode
  isSplat: boolean
}

export interface AscNode {
  type: 'Asc'
  base: SyntaxNode
}

export interface DescNode {
  type: 'Desc'
  base: SyntaxNode
}

export interface FuncCallNode {
  type: 'FuncCall'
  func: GroqFunction
  name: string
  args: SyntaxNode[]
}

export interface IdentifierNode {
  type: 'Identifier'
  name: string
}

export interface MapperNode {
  type: 'Mapper'
  base: SyntaxNode
  mapper: Mapper
}

export interface NegNode {
  type: 'Neg'
  base: SyntaxNode
}

export interface NotNode {
  type: 'Not'
  base: SyntaxNode
}

export interface ObjectNode {
  type: 'Object'
  attributes: (ObjectAttributeNode | ObjectConditionalSplatNode | ObjectSplatNode)[]
}

export interface ObjectAttributeNode {
  type: 'ObjectAttribute'
  key: ValueNode<string>
  value: ValueNode
}

export interface ObjectConditionalSplatNode {
  type: 'ObjectConditionalSplat'
  condition: SyntaxNode
  value: SyntaxNode
}

export interface ObjectSplatNode {
  type: 'ObjectSplat'
  value: SyntaxNode
}

export interface OpCallNode {
  type: 'OpCall'
  op: OpCall
  left: SyntaxNode
  right: SyntaxNode
}

export interface OrNode {
  type: 'Or'
  left: SyntaxNode
  right: SyntaxNode
}

export interface PairNode {
  type: 'Pair'
  left: SyntaxNode
  right: SyntaxNode
}

export interface ParameterNode {
  type: 'Parameter'
  name: string
}

export interface ParentNode {
  type: 'Parent'
  n: number
}

export interface ParenthesisNode {
  type: 'Parenthesis'
  base: SyntaxNode
}

export interface PipeFuncCallNode {
  type: 'PipeFuncCall'
  func: GroqPipeFunction
  base: SyntaxNode
  name: string
  args: SyntaxNode[]
}

export interface PosNode {
  type: 'Pos'
  base: SyntaxNode
}

export interface ProjectionNode {
  type: 'Projection'
  base: SyntaxNode
  query: SyntaxNode
}

export interface RangeNode {
  type: 'Range'
  left: ValueNode<number>
  right: ValueNode<number>
  isExclusive: boolean
}

export interface StarNode {
  type: 'Star'
}

export interface ThisNode {
  type: 'This'
}

export interface ValueNode<P = any> {
  type: 'Value'
  value: P
}
