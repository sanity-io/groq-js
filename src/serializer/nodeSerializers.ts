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
        return Array(node.n).fill('^').join('.')
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
        throw new Error("Can't serialize Selector")
      default:
        // @ts-expect-error handle all cases
        throw new Error(`Unknown node type: ${node.type}`)
    }
  }

  private serializeValue(node: ValueNode): string {
    return JSON.stringify(node.value)
  }

  private serializeAccessAttribute(node: AccessAttributeNode): string {
    if (node.base) {
      const baseStr = this.serializeNode(node.base)
      // If base is a dereference (ends with ->), don't add a dot
      if (node.base.type === 'Deref') {
        return `${baseStr}${node.name}`
      }
      // Use bracket notation if the name is not a valid identifier
      if (!this.isValidIdentifier(node.name)) {
        return `${baseStr}[${JSON.stringify(node.name)}]`
      }
      return `${baseStr}.${node.name}`
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
          return `${attr.name}-> ${this.serializeNode(attr.value.expr)}`
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
        // @ts-expect-error handle all cases
        throw new Error(`Unknown object attribute type: ${attr.type}`)
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
    // For dereference with This (@), we need to include the @ symbol
    if (node.base.type === 'This') {
      return '@->'
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
      // Check if projection base is a Deref with AccessAttribute(@, ...) pattern
      // In that case, we can serialize more cleanly by removing the redundant @
      if (
        node.expr.base.type === 'Deref' &&
        node.expr.base.base.type === 'AccessAttribute' &&
        node.expr.base.base.base?.type === 'This'
      ) {
        // Serialize the AccessAttribute without the @ prefix
        const attrName = node.expr.base.base.name
        const exprStr = this.serializeNode(node.expr.expr)
        const projStr = exprStr.startsWith('{')
          ? `${attrName}-> ${exprStr}`
          : `${attrName}->${exprStr}`
        return `${this.serializeNode(node.base)}.${projStr}`
      }

      // Check if projection base is Deref(This) - serialize as -> without @
      if (node.expr.base.type === 'Deref' && node.expr.base.base.type === 'This') {
        const baseStr = this.serializeNode(node.base)
        const exprStr = this.serializeNode(node.expr.expr)
        const projStr = exprStr.startsWith('{') ? `-> ${exprStr}` : `->${exprStr}`
        return `${baseStr}${projStr}`
      }

      // This is a projection like *[condition] {...} or chained projections
      // Add space between base and projection
      return `${this.serializeNode(node.base)} ${this.serializeNode(node.expr)}`
    }

    // Special case for Deref(This) in Map context - serialize as -> without @
    if (node.expr.type === 'Deref' && node.expr.base.type === 'This') {
      return `${this.serializeNode(node.base)}->`
    }

    // Check if this is a property access chain that starts with This (@)
    if (this.isPropertyAccessFromThis(node.expr)) {
      // Serialize the expression without the @ prefix
      const exprStr = this.serializeNode(node.expr)
      // Remove the leading @ if present
      const cleanExpr = exprStr.startsWith('@') ? exprStr.slice(1) : exprStr
      return `${this.serializeNode(node.base)}${cleanExpr}`
    }

    return `${this.serializeNode(node.base)}[${this.serializeNode(node.expr)}]`
  }

  private isPropertyAccessFromThis(node: ExprNode): boolean {
    // Check if this expression represents a simple property access chain starting from This (@)
    // Map nodes are not considered simple property access even if they contain property access
    if (node.type === 'Map' || node.type === 'FlatMap') {
      return false
    }
    if (node.type === 'AccessAttribute') {
      return !node.base || node.base.type === 'This' || this.isPropertyAccessFromThis(node.base)
    }
    if (node.type === 'Deref') {
      return this.isPropertyAccessFromThis(node.base)
    }
    if (node.type === 'ArrayCoerce') {
      return this.isPropertyAccessFromThis(node.base)
    }
    return false
  }

  private serializeFlatMap(node: FlatMapNode): string {
    // First try serializing the expression
    const exprStr = this.serializeNode(node.expr)

    // If the expression starts with @ (This reference), we can potentially combine it
    if (exprStr.startsWith('@')) {
      // Remove the @ prefix and combine with base
      const cleanExpr = exprStr.slice(1)
      return `${this.serializeNode(node.base)}${cleanExpr}`
    }

    // If the expression doesn't start with @, it might be a complex expression
    // that still represents a valid property access chain
    if (node.expr.type === 'ArrayCoerce' && this.isPropertyAccessFromThis(node.expr)) {
      return `${this.serializeNode(node.base)}${exprStr}`
    }

    // If the expression is a Map/FlatMap that produces valid property access syntax,
    // we can combine it directly
    if (
      (node.expr.type === 'Map' || node.expr.type === 'FlatMap') &&
      !exprStr.startsWith('@') &&
      !exprStr.includes('[]@')
    ) {
      return `${this.serializeNode(node.base)}${exprStr}`
    }

    return `${this.serializeNode(node.base)}[]${this.serializeNode(node.expr)}`
  }

  private serializeContext(node: ContextNode): string {
    return `${node.key}()`
  }

  private isValidIdentifier(name: string): boolean {
    const IDENT = /^[a-zA-Z_][a-zA-Z_0-9]*/
    return IDENT.test(name)
  }
}
