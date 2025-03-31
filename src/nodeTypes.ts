import {type GroqFunction, type GroqPipeFunction} from './types'

/**
 * Any sort of node which appears as syntax
 * @public
 */
export type SyntaxNode = ExprNode | ArrayElementNode | ObjectAttributeNode | SelectAlternativeNode

/**
 * Represents any kind of object attribute in an object literal
 * @public
 */
export type ObjectAttributeNode =
  | ObjectAttributeValueNode
  | ObjectConditionalSplatNode
  | ObjectSplatNode

/**
 * A node which can be evaluated into a value.
 * @public
 */
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

/**
 * Supported operator types for operator calls
 * @public
 */
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

/**
 * The base interface for all syntax nodes.
 * @public
 */
export interface BaseNode {
  type: string
}

/**
 * Represents a logical AND operation between two expressions
 * @public
 */
export interface AndNode extends BaseNode {
  type: 'And'
  left: ExprNode
  right: ExprNode
}

/**
 * Represents an element in an array literal, which may be a regular value or a splat
 * @public
 */
export interface ArrayElementNode extends BaseNode {
  type: 'ArrayElement'
  value: ExprNode
  isSplat: boolean
}

/**
 * Represents an array literal
 * @public
 */
export interface ArrayNode extends BaseNode {
  type: 'Array'
  elements: ArrayElementNode[]
}

/**
 * Coerces a value to an array if not already an array
 * @public
 */
export interface ArrayCoerceNode extends BaseNode {
  type: 'ArrayCoerce'
  base: ExprNode
}

/**
 * Represents an ascending sort operation
 * @public
 */
export interface AscNode extends BaseNode {
  type: 'Asc'
  base: ExprNode
}

/**
 * Represents a context value, such as before() or after() in delta mode
 * @public
 */
export interface ContextNode extends BaseNode {
  type: 'Context'
  key: string
}

/**
 * Dereferences a reference by its _ref to find the actual document
 * @public
 */
export interface DerefNode extends BaseNode {
  type: 'Deref'
  base: ExprNode
}

/**
 * Represents a descending sort operation
 * @public
 */
export interface DescNode extends BaseNode {
  type: 'Desc'
  base: ExprNode
}

/**
 * Represents the entire dataset, using the '*' wildcard
 * @public
 */
export interface EverythingNode extends BaseNode {
  type: 'Everything'
}

/**
 * Represents a function call
 * @public
 */
export interface FuncCallNode extends BaseNode {
  type: 'FuncCall'
  func: GroqFunction
  namespace: string
  name: string
  args: ExprNode[]
}

/**
 * Represents a parenthesized expression
 * @public
 */
export interface GroupNode extends BaseNode {
  type: 'Group'
  base: ExprNode
}

/**
 * Checks if a value is within a range
 * @public
 */
export interface InRangeNode extends BaseNode {
  type: 'InRange'
  base: ExprNode
  left: ExprNode
  right: ExprNode
  isInclusive: boolean
}

/**
 * Represents a numeric negation operation
 * @public
 */
export interface NegNode extends BaseNode {
  type: 'Neg'
  base: ExprNode
}

/**
 * Represents a logical NOT operation
 * @public
 */
export interface NotNode extends BaseNode {
  type: 'Not'
  base: ExprNode
}

/**
 * Represents a key-value pair in an object literal
 * @public
 */
export interface ObjectAttributeValueNode extends BaseNode {
  type: 'ObjectAttributeValue'
  name: string
  value: ExprNode
}

/**
 * Represents a conditional object spread using \{...cond =\> expr\}
 * @public
 */
export interface ObjectConditionalSplatNode extends BaseNode {
  type: 'ObjectConditionalSplat'
  condition: ExprNode
  value: ExprNode
}

/**
 * Represents an object literal
 * @public
 */
export interface ObjectNode extends BaseNode {
  type: 'Object'
  attributes: ObjectAttributeNode[]
}

/**
 * Represents an object spread operation using \{...expr\}
 * @public
 */
export interface ObjectSplatNode extends BaseNode {
  type: 'ObjectSplat'
  value: ExprNode
}

/**
 * Represents a binary operator call
 * @public
 */
export interface OpCallNode extends BaseNode {
  type: 'OpCall'
  op: OpCall
  left: ExprNode
  right: ExprNode
}

/**
 * Represents a logical OR operation between two expressions
 * @public
 */
export interface OrNode extends BaseNode {
  type: 'Or'
  left: ExprNode
  right: ExprNode
}

/**
 * Represents a parameter reference using $name syntax
 * @public
 */
export interface ParameterNode extends BaseNode {
  type: 'Parameter'
  name: string
}

/**
 * Represents a parent scope reference using ^ or ^^ syntax
 * @public
 */
export interface ParentNode extends BaseNode {
  type: 'Parent'
  n: number
}

/**
 * Represents a pipe function call using | syntax
 * @public
 */
export interface PipeFuncCallNode extends BaseNode {
  type: 'PipeFuncCall'
  func: GroqPipeFunction
  base: ExprNode
  name: string
  args: ExprNode[]
}

/**
 * Represents a unary plus operation
 * @public
 */
export interface PosNode extends BaseNode {
  type: 'Pos'
  base: ExprNode
}

/**
 * Represents a conditional branch in a Select expression
 * @public
 */
export interface SelectAlternativeNode extends BaseNode {
  type: 'SelectAlternative'
  condition: ExprNode
  value: ExprNode
}

/**
 * Represents a select/case expression for conditional logic
 * @public
 */
export interface SelectNode extends BaseNode {
  type: 'Select'
  alternatives: SelectAlternativeNode[]
  fallback?: ExprNode
}

/**
 * Represents a selector for semantic search (currently unimplemented)
 * @public
 */
export interface SelectorNode extends BaseNode {
  type: 'Selector'
}

/**
 * Represents the current value in scope using 'this' or at-sign syntax
 * @public
 */
export interface ThisNode extends BaseNode {
  type: 'This'
}

/**
 * Represents a tuple of values
 * @public
 */
export interface TupleNode extends BaseNode {
  type: 'Tuple'
  members: Array<ExprNode>
}

/**
 * Represents a literal value (string, number, boolean, etc.)
 * @public
 */
export interface ValueNode<P = any> {
  type: 'Value'
  value: P
}

/**
 * Represents a flatMap operation that flattens the results of mapping
 * @public
 */
export interface FlatMapNode extends BaseNode {
  type: 'FlatMap'
  base: ExprNode
  expr: ExprNode
}

/**
 * Represents a map operation over an array
 * @public
 */
export interface MapNode extends BaseNode {
  type: 'Map'
  base: ExprNode
  expr: ExprNode
}

/**
 * Represents attribute access using dot notation
 * @public
 */
export interface AccessAttributeNode extends BaseNode {
  type: 'AccessAttribute'
  base?: ExprNode
  name: string
}

/**
 * Represents array element access using [] notation
 * @public
 */
export interface AccessElementNode extends BaseNode {
  type: 'AccessElement'
  base: ExprNode
  index: number
}

/**
 * Represents an array slice operation
 * @public
 */
export interface SliceNode extends BaseNode {
  type: 'Slice'
  base: ExprNode
  left: number
  right: number
  isInclusive: boolean
}

/**
 * Represents a filter operation using [] syntax
 * @public
 */
export interface FilterNode extends BaseNode {
  type: 'Filter'
  base: ExprNode
  expr: ExprNode
}

/**
 * Represents a projection from one object to another
 * @public
 */
export interface ProjectionNode extends BaseNode {
  type: 'Projection'
  base: ExprNode
  expr: ExprNode
}
