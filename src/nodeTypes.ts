import {GroqFunction, GroqPipeFunction} from './evaluator/functions'

/** Any sort of node which appears as syntax */
export type SyntaxNode = ExprNode | ArrayElementNode | ObjectAttributeNode | SelectAlternativeNode

export type ObjectAttributeNode =
  | ObjectAttributeValueNode
  | ObjectConditionalSplatNode
  | ObjectSplatNode

/** A node which can be evaluated into a value. */
export type ExprNode =
  | AccessAttributeNode
  | AccessElementNode
  | AndNode
  | ArrayNode
  | ArrayCoerceNode
  | AscNode
  | ContextNode
  | DerefNode
  | DescNode
  | EverythingNode
  | FilterNode
  | FlatMapNode
  | FuncCallNode
  | GroupNode
  | InRangeNode
  | MapNode
  | NegNode
  | NotNode
  | ObjectNode
  | OpCallNode
  | OrNode
  | ParameterNode
  | ParentNode
  | PipeFuncCallNode
  | PosNode
  | ProjectionNode
  | SelectNode
  | SelectorNode
  | SliceNode
  | ThisNode
  | TupleNode
  | ValueNode

export type OpCall =
  | '=='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | '+'
  | '-'
  | '*'
  | '/'
  | '%'
  | '**'
  | 'in'
  | 'match'

/** The base interface for SyntaxNode. */
export interface BaseNode {
  type: string
}

export interface AndNode extends BaseNode {
  type: 'And'
  left: ExprNode
  right: ExprNode
}

export interface ArrayElementNode extends BaseNode {
  type: 'ArrayElement'
  value: ExprNode
  isSplat: boolean
}

export interface ArrayNode extends BaseNode {
  type: 'Array'
  elements: ArrayElementNode[]
}

export interface ArrayCoerceNode extends BaseNode {
  type: 'ArrayCoerce'
  base: ExprNode
}

export interface AscNode extends BaseNode {
  type: 'Asc'
  base: ExprNode
}

export interface ContextNode extends BaseNode {
  type: 'Context'
  key: string
}

export interface DerefNode extends BaseNode {
  type: 'Deref'
  base: ExprNode
}

export interface DescNode extends BaseNode {
  type: 'Desc'
  base: ExprNode
}

export interface EverythingNode extends BaseNode {
  type: 'Everything'
}

export interface FuncCallNode extends BaseNode {
  type: 'FuncCall'
  func: GroqFunction
  name: string
  args: ExprNode[]
}

export interface GroupNode extends BaseNode {
  type: 'Group'
  base: ExprNode
}

export interface InRangeNode extends BaseNode {
  type: 'InRange'
  base: ExprNode
  left: ExprNode
  right: ExprNode
  isInclusive: boolean
}

export interface NegNode extends BaseNode {
  type: 'Neg'
  base: ExprNode
}

export interface NotNode extends BaseNode {
  type: 'Not'
  base: ExprNode
}

export interface ObjectAttributeValueNode extends BaseNode {
  type: 'ObjectAttributeValue'
  name: string
  value: ExprNode
}

export interface ObjectConditionalSplatNode extends BaseNode {
  type: 'ObjectConditionalSplat'
  condition: ExprNode
  value: ExprNode
}

export interface ObjectNode extends BaseNode {
  type: 'Object'
  attributes: ObjectAttributeNode[]
}

export interface ObjectSplatNode extends BaseNode {
  type: 'ObjectSplat'
  value: ExprNode
}

export interface OpCallNode extends BaseNode {
  type: 'OpCall'
  op: OpCall
  left: ExprNode
  right: ExprNode
}

export interface OrNode extends BaseNode {
  type: 'Or'
  left: ExprNode
  right: ExprNode
}

export interface ParameterNode extends BaseNode {
  type: 'Parameter'
  name: string
}

export interface ParentNode extends BaseNode {
  type: 'Parent'
  n: number
}

export interface PipeFuncCallNode extends BaseNode {
  type: 'PipeFuncCall'
  func: GroqPipeFunction
  base: ExprNode
  name: string
  args: ExprNode[]
}

export interface PosNode extends BaseNode {
  type: 'Pos'
  base: ExprNode
}

export interface SelectAlternativeNode extends BaseNode {
  type: 'SelectAlternative'
  condition: ExprNode
  value: ExprNode
}

export interface SelectNode extends BaseNode {
  type: 'Select'
  alternatives: SelectAlternativeNode[]
  fallback?: ExprNode
}

export interface SelectorNode extends BaseNode {
  type: 'Selector'
}

export interface ThisNode extends BaseNode {
  type: 'This'
}

export interface TupleNode extends BaseNode {
  type: 'Tuple'
  members: Array<ExprNode>
}

export interface ValueNode<P = any> {
  type: 'Value'
  value: P
}

export interface FlatMapNode extends BaseNode {
  type: 'FlatMap'
  base: ExprNode
  expr: ExprNode
}

export interface MapNode extends BaseNode {
  type: 'Map'
  base: ExprNode
  expr: ExprNode
}

export interface AccessAttributeNode extends BaseNode {
  type: 'AccessAttribute'
  base?: ExprNode
  name: string
}

export interface AccessElementNode extends BaseNode {
  type: 'AccessElement'
  base: ExprNode
  index: number
}

export interface SliceNode extends BaseNode {
  type: 'Slice'
  base: ExprNode
  left: number
  right: number
  isInclusive: boolean
}

export interface FilterNode extends BaseNode {
  type: 'Filter'
  base: ExprNode
  expr: ExprNode
}

export interface ProjectionNode extends BaseNode {
  type: 'Projection'
  base: ExprNode
  expr: ExprNode
}
