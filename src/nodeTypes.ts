import type {GroqFunction, GroqPipeFunction} from './evaluator/functions'

/** Any sort of node which appears as syntax */
export type SyntaxNode =
  | ExprNode
  | ArrayElementNode
  | ObjectAttributeNode
  | SelectAlternativeNode
  | FunctionDeclarationNode

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
  | InlineFuncCallNode
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

export interface ArrayCoerceNode<Base = ExprNode> extends BaseNode {
  type: 'ArrayCoerce'
  base: Base
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
  namespace: string
  name: string
  args: ExprNode[]
}

export interface InlineFuncCallNode extends BaseNode {
  type: 'InlineFuncCall'
  namespace: string
  name: string
  args: ExprNode[]
}

export interface GroupNode<Base = ExprNode> extends BaseNode {
  type: 'Group'
  base: Base
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

export type SelectorNode =
  | AccessAttributeNode<SelectorNode>
  | SelectorFuncCallNode
  | GroupNode<SelectorNode>
  | TupleNode<SelectorNode>
  | ArrayCoerceNode<SelectorNode>
  | FilterNode<SelectorNode>
  | SelectorNestedNode
export function isSelectorNode(node: BaseNode): node is SelectorNode {
  return [
    'AccessAttribute',
    'SelectorFuncCall',
    'Group',
    'Tuple',
    'ArrayCoerce',
    'Filter',
    'SelectorNested',
  ].includes(node.type)
}

export interface SelectorFuncCallNode extends BaseNode {
  type: 'SelectorFuncCall'
  name: 'anywhere'
  arg: ExprNode
}

export type SelectorNested =
  | AccessAttributeNode<SelectorNode>
  | ArrayCoerceNode<SelectorNode>
  | FilterNode<SelectorNode>
  | GroupNode<SelectorNode>
  | TupleNode<SelectorNode>
export function isSelectorNested(node: BaseNode): node is SelectorNested {
  return ['AccessAttribute', 'ArrayCoerce', 'Filter', 'Group', 'Tuple', 'SelectorNested'].includes(
    node.type,
  )
}

export interface SelectorNestedNode extends BaseNode {
  type: 'SelectorNested'
  base: SelectorNode
  nested: SelectorNested
}

export interface ThisNode extends BaseNode {
  type: 'This'
}

export interface TupleNode<Base = ExprNode> extends BaseNode {
  type: 'Tuple'
  members: Array<Base>
}

export interface ValueNode<P = any> {
  type: 'Value'
  value: P
}

export interface FunctionDeclarationNode extends BaseNode {
  type: 'FuncDeclaration'
  namespace: string
  name: string
  params: ParameterNode[]
  body: ExprNode
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

export interface AccessAttributeNode<T = ExprNode> extends BaseNode {
  type: 'AccessAttribute'
  base?: T
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

export interface FilterNode<Base = ExprNode> extends BaseNode {
  type: 'Filter'
  base: Base
  expr: ExprNode
}

export interface ProjectionNode extends BaseNode {
  type: 'Projection'
  base: ExprNode
  expr: ExprNode
}

// eslint-disable-next-line complexity
export function walk<T extends ExprNode>(node: T, cb: (expr: ExprNode) => T): T {
  switch (node.type) {
    case 'And':
      return cb({
        ...node,
        left: walk(node.left, cb),
        right: walk(node.right, cb),
      })
    case 'Array':
      return cb({
        ...node,
        elements: node.elements.map((el) => ({
          ...el,
          value: walk(el.value, cb),
        })),
      })
    case 'ArrayCoerce':
      return cb({
        ...node,
        base: walk(node.base, cb),
      })
    case 'Asc':
      return cb({
        ...node,
        base: walk(node.base, cb),
      })
    case 'Context':
      return cb(node)
    case 'Deref':
      return cb({
        ...node,
        base: walk(node.base, cb),
      })
    case 'Desc':
      return cb({
        ...node,
        base: walk(node.base, cb),
      })
    case 'Everything':
      return cb(node)
    case 'FuncCall':
      return cb({
        ...node,
        args: node.args.map((arg) => walk(arg, cb)),
      })
    case 'InlineFuncCall':
      return cb({
        ...node,
        args: node.args.map((arg) => walk(arg, cb)),
      })
    case 'Group':
      return cb({
        ...node,
        base: walk(node.base, cb),
      })
    case 'InRange':
      return cb({
        ...node,
        base: walk(node.base, cb),
        left: walk(node.left, cb),
        right: walk(node.right, cb),
      })
    case 'Neg':
      return cb({
        ...node,
        base: walk(node.base, cb),
      })
    case 'Not':
      return cb({
        ...node,
        base: walk(node.base, cb),
      })
    case 'Object':
      return cb({
        ...node,
        attributes: node.attributes.map((attr) => {
          switch (attr.type) {
            case 'ObjectAttributeValue':
              return {
                ...attr,
                value: walk(attr.value, cb),
              }
            case 'ObjectConditionalSplat':
              return {
                ...attr,
                condition: walk(attr.condition, cb),
                value: walk(attr.value, cb),
              }
            case 'ObjectSplat':
              return {
                ...attr,
                value: walk(attr.value, cb),
              }
            default:
              return attr
          }
        }),
      })
    case 'OpCall':
      return cb({
        ...node,
        left: walk(node.left, cb),
        right: walk(node.right, cb),
      })
    case 'Or':
      return cb({
        ...node,
        left: walk(node.left, cb),
        right: walk(node.right, cb),
      })
    case 'Parameter':
      return cb(node)
    case 'Parent':
      return cb(node)
    case 'PipeFuncCall':
      return cb({
        ...node,
        base: walk(node.base, cb),
        args: node.args.map((arg) => walk(arg, cb)),
      })
    case 'Pos':
      return cb({
        ...node,
        base: walk(node.base, cb),
      })
    case 'Select': {
      const alternatives = node.alternatives.map((alt) => ({
        ...alt,
        condition: walk(alt.condition, cb),
        value: walk(alt.value, cb),
      }))
      if (node.fallback) {
        return cb({
          ...node,
          alternatives,
          fallback: walk(node.fallback, cb),
        })
      }
      return cb({
        ...node,
        alternatives,
      })
    }
    case 'SelectorNested':
      return cb(node)
    case 'SelectorFuncCall':
      return cb({
        ...node,
        arg: walk(node.arg, cb),
      })
    case 'This':
      return cb(node)
    case 'Tuple':
      return cb({
        ...node,
        members: node.members.map((member) => walk(member, cb)),
      })
    case 'Value':
      return cb(node)
    case 'FlatMap':
      return cb({
        ...node,
        base: walk(node.base, cb),
        expr: walk(node.expr, cb),
      })
    case 'Map':
      return cb({
        ...node,
        base: walk(node.base, cb),
        expr: walk(node.expr, cb),
      })
    case 'AccessAttribute':
      if (node.base) {
        return cb({
          ...node,
          base: walk(node.base, cb),
        })
      }
      return cb({
        ...node,
      })
    case 'AccessElement':
      return cb({
        ...node,
        base: walk(node.base, cb),
      })
    case 'Slice':
      return cb({
        ...node,
        base: walk(node.base, cb),
      })
    case 'Filter':
      return cb({
        ...node,
        base: walk(node.base, cb),
        expr: walk(node.expr, cb),
      })
    case 'Projection':
      return cb({
        ...node,
        base: walk(node.base, cb),
        expr: walk(node.expr, cb),
      })
    default:
      // @ts-expect-error - we want to ensure we handle all node types
      throw new Error(`Unknown node type ${node.type}`)
  }
}
