import type {
  AccessAttributeNode,
  AccessElementNode,
  ArrayCoerceNode,
  ArrayNode,
  AscNode,
  ContextNode,
  DerefNode,
  DescNode,
  ExprNode,
  FilterNode,
  FlatMapNode,
  FuncCallNode,
  GroupNode,
  InRangeNode,
  MapNode,
  ObjectAttributeNode,
  ObjectNode,
  OpCallNode,
  PipeFuncCallNode,
  ProjectionNode,
  SelectAlternativeNode,
  SelectNode,
  SliceNode,
  TupleNode,
  ValueNode,
} from '../nodeTypes'

class IndentationManager {
  private currentIndent = 0

  constructor(indentString?: string) {
    this.indentString = indentString ?? '  '
  }

  private indentString: string

  indent(): void {
    this.currentIndent++
  }

  unindent(): void {
    this.currentIndent--
  }

  current(): string {
    return this.indentString.repeat(this.currentIndent)
  }

  newLine(): string {
    return `\n${this.current()}`
  }
}
export interface NodeSerializerOptions {
  indentString?: string
}

export class NodeSerializer {
  constructor(private options: NodeSerializerOptions = {}) {}

  serialize(node: ExprNode): string {
    // Create fresh IndentationManager for each serialization
    this.indent = new IndentationManager(this.options.indentString)
    return this.serializeNode(node)
  }

  private indent!: IndentationManager

  // eslint-disable-next-line complexity
  private serializeNode(node: ExprNode): string {
    switch (node.type) {
      case 'Value':
        return this.serializeValue(node)
      case 'Everything':
        return '*'
      case 'This':
        return '@'
      case 'Parent':
        return '^'.repeat(node.n)
      case 'Parameter':
        return `$${node.name}`
      case 'AccessAttribute':
        return this.serializeAccessAttribute(node)
      case 'AccessElement':
        return this.serializeAccessElement(node)
      case 'Array':
        return this.serializeArray(node)
      case 'ArrayCoerce':
        return this.serializeArrayCoerce(node)
      case 'Object':
        return this.serializeObject(node)
      case 'OpCall':
        return this.serializeOpCall(node)
      case 'And':
        return this.serializeBinaryOp(node.left, '&&', node.right)
      case 'Or':
        return this.serializeBinaryOp(node.left, '||', node.right)
      case 'Not':
        return this.serializeUnaryOp('!', node.base)
      case 'Neg':
        return this.serializeUnaryOp('-', node.base)
      case 'Pos':
        return this.serializeUnaryOp('+', node.base)
      case 'Group':
        return this.serializeGroup(node)
      case 'FuncCall':
        return this.serializeFuncCall(node)
      case 'PipeFuncCall':
        return this.serializePipeFuncCall(node)
      case 'Deref':
        return this.serializeDeref(node)
      case 'Filter':
        return this.serializeFilter(node)
      case 'Projection':
        return this.serializeProjection(node)
      case 'Slice':
        return this.serializeSlice(node)
      case 'InRange':
        return this.serializeInRange(node)
      case 'Select':
        return this.serializeSelect(node)
      case 'Asc':
        return this.serializeAsc(node)
      case 'Desc':
        return this.serializeDesc(node)
      case 'Tuple':
        return this.serializeTuple(node)
      case 'Map':
        return this.serializeMap(node)
      case 'FlatMap':
        return this.serializeFlatMap(node)
      case 'Context':
        return this.serializeContext(node)
      case 'Selector':
        return '<selector>'
      default:
        // @ts-expect-error handle all cases
        throw new Error(`Unknown node type: ${node.type}`)
    }
  }

  private serializeValue(node: ValueNode): string {
    const value = node.value
    if (typeof value === 'string') {
      // https://spec.groq.dev/GROQ-1.revision3/#sec-String
      const backspace = String.fromCharCode(8) // U+0008 backspace
      return `"${value
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(new RegExp(backspace, 'g'), '\\b')
        .replace(/\f/g, '\\f')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')}"`
    }
    return String(value)
  }

  private serializeAccessAttribute(node: AccessAttributeNode): string {
    if (node.base) {
      return `${this.serializeNode(node.base)}.${node.name}`
    }
    return node.name
  }

  private serializeAccessElement(node: AccessElementNode): string {
    return `${this.serializeNode(node.base)}[${node.index}]`
  }

  private serializeArray(node: ArrayNode): string {
    const elements = node.elements.map((elem) => {
      let result = this.serializeNode(elem.value)
      if (elem.isSplat) {
        result = `...${result}`
      }
      return result
    })

    return `[${elements.join(', ')}]`
  }

  private serializeArrayCoerce(node: ArrayCoerceNode): string {
    return `${this.serializeNode(node.base)}[]`
  }

  private serializeObject(node: ObjectNode): string {
    if (node.attributes.length === 0) {
      return '{}'
    }

    this.indent.indent()
    const attributes = node.attributes.map((attr: ObjectAttributeNode) => {
      return this.serializeObjectAttribute(attr)
    })
    const innerContent = this.indent.newLine() + attributes.join(`,${this.indent.newLine()}`)
    this.indent.unindent()
    return `{${innerContent}${this.indent.newLine()}}`
  }

  private serializeObjectAttribute(attr: ObjectAttributeNode): string {
    switch (attr.type) {
      case 'ObjectAttributeValue': {
        // Check if this is a simple property or a complex expression
        const simpleKey = this.extractSimplePropertyName(attr.value)
        if (simpleKey && attr.name === simpleKey) {
          return this.serializeNode(attr.value)
        }

        // Special handling for dereferencing projections: author->{...}
        // Only use shorthand if property name matches the field being dereferenced
        if (
          attr.value.type === 'Projection' &&
          attr.value.base.type === 'Deref' &&
          attr.value.base.base.type === 'AccessAttribute' &&
          attr.value.base.base.name === attr.name
        ) {
          const space = ' '
          return `${attr.name}->${space}${this.serializeNode(attr.value.expr)}`
        }

        // Special handling for simple dereferencing operations
        // Only use shorthand if property name matches the field being dereferenced
        if (
          attr.value.type === 'Deref' &&
          attr.value.base.type === 'AccessAttribute' &&
          attr.value.base.name === attr.name
        ) {
          return `${attr.name}->`
        }

        // For all other cases, always use quotes for explicit property names
        return `"${attr.name}": ${this.serializeNode(attr.value)}`
      }
      case 'ObjectSplat':
        // For object spread, omit 'This' (@) since it's implicit
        if (attr.value.type === 'This') {
          return '...'
        }
        return `...${this.serializeNode(attr.value)}`
      case 'ObjectConditionalSplat':
        return `${this.serializeNode(attr.condition)} => ${this.serializeNode(attr.value)}`
      default:
        throw new Error(`Unknown object attribute type: ${(attr as ObjectAttributeNode).type}`)
    }
  }

  private extractSimplePropertyName(node: ExprNode): string | null {
    // This implements the GROQ spec's DetermineName() algorithm
    // See section 4.6 Object in the GROQ specification
    // https://spec.groq.dev/GROQ-1.revision3/#DetermineName()

    // If node is a ThisAttribute (simple property access)
    if (node.type === 'AccessAttribute' && !node.base) {
      return node.name
    }

    // If node is ArrayPostfix, Dereference, ElementAccess, Filter, Map, Projection, SelectorGroup, or Slice
    // Get the base expression and recurse
    if (
      node.type === 'ArrayCoerce' ||
      node.type === 'Deref' ||
      node.type === 'AccessElement' ||
      node.type === 'Filter' ||
      node.type === 'Map' ||
      node.type === 'Projection' ||
      node.type === 'Group' ||
      node.type === 'Slice'
    ) {
      return this.extractSimplePropertyName(node.base)
    }

    return null
  }

  private serializeOpCall(node: OpCallNode): string {
    return this.serializeBinaryOp(node.left, node.op, node.right)
  }

  private serializeBinaryOp(left: ExprNode, op: string, right: ExprNode): string {
    const leftStr = this.serializeNode(left)
    const rightStr = this.serializeNode(right)

    if (op === ':') {
      return `${leftStr}: ${rightStr}`
    }

    return `${leftStr} ${op} ${rightStr}`
  }

  private serializeUnaryOp(op: string, operand: ExprNode): string {
    return op + this.serializeNode(operand)
  }

  private serializeGroup(node: GroupNode): string {
    return `(${this.serializeNode(node.base)})`
  }

  private serializeFuncCall(node: FuncCallNode): string {
    const namespace = node.namespace === 'global' ? '' : `${node.namespace}::`
    const args = node.args.map((arg: ExprNode) => this.serializeNode(arg))
    return `${namespace + node.name}(${args.join(', ')})`
  }

  private serializePipeFuncCall(node: PipeFuncCallNode): string {
    const baseStr = this.serializeNode(node.base)
    const args = node.args.map((arg: ExprNode) => this.serializeNode(arg))
    const argsStr = args.length > 0 ? `(${args.join(', ')})` : ''
    return `${baseStr} | ${node.name}${argsStr}`
  }

  private serializeDeref(node: DerefNode): string {
    // For dereference, omit 'This' (@) since it's implicit
    if (node.base.type === 'This') {
      return '->'
    }
    return `${this.serializeNode(node.base)}->`
  }

  private serializeFilter(node: FilterNode): string {
    return `${this.serializeNode(node.base)}[${this.serializeNode(node.expr)}]`
  }

  private serializeProjection(node: ProjectionNode): string {
    // Handle projections - if base is This (@), omit it for cleaner output
    if (node.base.type === 'This') {
      return this.serializeNode(node.expr)
    }

    const baseStr = this.serializeNode(node.base)
    const exprStr = this.serializeNode(node.expr)

    // Add space before { in projections for better readability
    if (exprStr.startsWith('{')) {
      return `${baseStr} ${exprStr}`
    }

    return baseStr + exprStr
  }

  private serializeSlice(node: SliceNode): string {
    const operator = node.isInclusive ? '..' : '...'
    return `${this.serializeNode(node.base)}[${node.left}${operator}${node.right}]`
  }

  private serializeInRange(node: InRangeNode): string {
    const operator = node.isInclusive ? '..' : '...'
    return `${this.serializeNode(node.base)} in ${this.serializeNode(node.left)}${
      operator
    }${this.serializeNode(node.right)}`
  }

  private serializeSelect(node: SelectNode): string {
    const alternatives = node.alternatives.map((alt: SelectAlternativeNode) => {
      return `${this.serializeNode(alt.condition)} => ${this.serializeNode(alt.value)}`
    })

    const args = alternatives
    if (node.fallback) {
      args.push(this.serializeNode(node.fallback))
    }

    return `select(${args.join(', ')})`
  }

  private serializeAsc(node: AscNode): string {
    return `${this.serializeNode(node.base)} asc`
  }

  private serializeDesc(node: DescNode): string {
    return `${this.serializeNode(node.base)} desc`
  }

  private serializeTuple(node: TupleNode): string {
    const members = node.members.map((member: ExprNode) => this.serializeNode(member))
    return `(${members.join(', ')})`
  }

  private serializeMap(node: MapNode): string {
    // Map operations - handle projections specially
    if (node.expr.type === 'Projection') {
      // This is a projection like *[condition] {...} or chained projections
      // Add space only in pretty mode
      const space = ' '
      return this.serializeNode(node.base) + space + this.serializeNode(node.expr)
    }
    return `${this.serializeNode(node.base)}[${this.serializeNode(node.expr)}]`
  }

  private serializeFlatMap(node: FlatMapNode): string {
    return `${this.serializeNode(node.base)}[]${this.serializeNode(node.expr)}`
  }

  private serializeContext(node: ContextNode): string {
    return `${node.key}()`
  }

}
