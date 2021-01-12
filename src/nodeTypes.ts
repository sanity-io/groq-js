import {GroqFunction, GroqPipeFunction} from './evaluator/functions'

export type SyntaxNode =
  | AndNode
  | ArrayNode
  | ArrayElementNode
  | AscNode
  | DescNode
  | ElementNode
  | FuncCallNode
  | IdentifierNode
  | MapNode
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
  | RangeNode
  | StarNode
  | ThisNode
  | ValueNode

export type OpCall = '+' | '-' | '*' | '/' | '%' | '**'

export type NodeName = SyntaxNode['type']

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

export interface ElementNode {
  type: 'Element'
  base: SyntaxNode
  index: ValueNode
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

export interface MapNode {
  type: 'Map'
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

export type Mapper =
  | ApplyMapper
  | AttributeMapper
  | DerefMapper
  | CompoundMapper
  | FilterMapper
  | ProjectionMapper
  | SliceMapper

export interface ApplyMapper {
  type: 'Apply'
  mapper: Mapper
}

export interface AttributeMapper {
  type: 'Attribute'
  key: string
}

export interface DerefMapper {
  type: 'Deref'
}

export interface SliceMapper {
  type: 'Slice'
  left: SyntaxNode
  right: SyntaxNode
  isExclusive: boolean
}

export interface ProjectionMapper {
  type: 'Projection'
  expr: SyntaxNode
}

export interface FilterMapper {
  type: 'Filter'
  expr: SyntaxNode
}

export interface CompoundMapper {
  type: 'Compound'
  mappers: Mapper[]
}
