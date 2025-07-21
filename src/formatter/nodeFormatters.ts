import type {
  ArrayElementNode,
  ExprNode,
  ObjectAttributeNode,
  SelectAlternativeNode,
} from '../nodeTypes'
import type {FormatContext} from './context'
import {IndentationManager} from './context'
import {escapeString} from './utils'

export class NodeFormatter {
  private indent: IndentationManager

  constructor(context: FormatContext) {
    this.indent = new IndentationManager(context)
  }

  format(node: ExprNode): string {
    return this.formatNode(node)
  }

  // eslint-disable-next-line complexity
  private formatNode(node: ExprNode): string {
    switch (node.type) {
      case 'Value':
        return this.formatValue(node)
      case 'Everything':
        return '*'
      case 'This':
        return '@'
      case 'Parent':
        return '^'.repeat(node.n)
      case 'Parameter':
        return `$${  node.name}`
      case 'AccessAttribute':
        return this.formatAccessAttribute(node)
      case 'AccessElement':
        return this.formatAccessElement(node)
      case 'Array':
        return this.formatArray(node)
      case 'ArrayCoerce':
        return this.formatArrayCoerce(node)
      case 'Object':
        return this.formatObject(node)
      case 'OpCall':
        return this.formatOpCall(node)
      case 'And':
        return this.formatBinaryOp(node.left, '&&', node.right)
      case 'Or':
        return this.formatBinaryOp(node.left, '||', node.right)
      case 'Not':
        return this.formatUnaryOp('!', node.base)
      case 'Neg':
        return this.formatUnaryOp('-', node.base)
      case 'Pos':
        return this.formatUnaryOp('+', node.base)
      case 'Group':
        return this.formatGroup(node)
      case 'FuncCall':
        return this.formatFuncCall(node)
      case 'PipeFuncCall':
        return this.formatPipeFuncCall(node)
      case 'Deref':
        return this.formatDeref(node)
      case 'Filter':
        return this.formatFilter(node)
      case 'Projection':
        return this.formatProjection(node)
      case 'Slice':
        return this.formatSlice(node)
      case 'InRange':
        return this.formatInRange(node)
      case 'Select':
        return this.formatSelect(node)
      case 'Asc':
        return this.formatAsc(node)
      case 'Desc':
        return this.formatDesc(node)
      case 'Tuple':
        return this.formatTuple(node)
      case 'Map':
        return this.formatMap(node)
      case 'FlatMap':
        return this.formatFlatMap(node)
      case 'Context':
        return this.formatContext(node)
      case 'Selector':
        return '<selector>'
      default:
        throw new Error(`Unknown node type: ${(node as any).type}`)
    }
  }

  private formatValue(node: any): string {
    const value = node.value
    if (value === null) return 'null'
    if (value === true) return 'true'
    if (value === false) return 'false'
    if (typeof value === 'string') return `"${escapeString(value)}"`
    if (typeof value === 'number') return String(value)
    return String(value)
  }

  private formatAccessAttribute(node: any): string {
    if (node.base) {
      return `${this.formatWithParens(node.base)  }.${  node.name}`
    }
    return node.name
  }

  private formatAccessElement(node: any): string {
    return `${this.formatWithParens(node.base)  }[${  node.index  }]`
  }

  private formatArray(node: any): string {
    if (node.elements.length === 0) {
      return '[]'
    }

    const elements = node.elements.map((elem: ArrayElementNode) => {
      let result = this.formatNode(elem.value)
      if (elem.isSplat) {
        result = `...${  result}`
      }
      return result
    })

    return `[${  elements.join(', ')  }]`
  }

  private formatArrayCoerce(node: any): string {
    return `${this.formatWithParens(node.base)  }[]`
  }

  private formatObject(node: any): string {
    if (node.attributes.length === 0) {
      return '{}'
    }

    this.indent.indent()
    const attributes = node.attributes.map((attr: ObjectAttributeNode) => {
      return this.formatObjectAttribute(attr)
    })
    const innerContent = this.indent.newLine() + attributes.join(`,${  this.indent.newLine()}`)
    this.indent.unindent()
    return `{${  innerContent  }${this.indent.newLine()  }}`
  }

  private formatObjectAttribute(attr: ObjectAttributeNode): string {
    switch (attr.type) {
      case 'ObjectAttributeValue': {
        // Check if this is a simple property or a complex expression
        const simpleKey = this.extractSimplePropertyName(attr.value)
        if (simpleKey && attr.name === simpleKey) {
          return this.formatNode(attr.value)
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
          return `${attr.name}->${space}${this.formatNode(attr.value.expr)}`
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
        return `"${attr.name}": ${this.formatNode(attr.value)}`
      }
      case 'ObjectSplat':
        // For object spread, omit 'This' (@) since it's implicit
        if (attr.value.type === 'This') {
          return '...'
        }
        return `...${  this.formatNode(attr.value)}`
      case 'ObjectConditionalSplat':
        return `${this.formatNode(attr.condition)} => ${this.formatNode(attr.value)}`
      default:
        throw new Error(`Unknown object attribute type: ${(attr as any).type}`)
    }
  }

  private extractSimplePropertyName(node: ExprNode): string | null {
    // This implements the GROQ spec's DetermineName() algorithm
    // See section 4.6 Object in the GROQ specification
    
    // If node is a ThisAttribute (simple property access)
    if (node.type === 'AccessAttribute' && !node.base) {
      return node.name
    }
    
    // If node is ArrayPostfix, Dereference, ElementAccess, Filter, Map, Projection, SelectorGroup, or Slice
    // Get the base expression and recurse
    if (node.type === 'ArrayCoerce' || 
        node.type === 'Deref' || 
        node.type === 'AccessElement' || 
        node.type === 'Filter' || 
        node.type === 'Map' || 
        node.type === 'Projection' || 
        node.type === 'Group' || 
        node.type === 'Slice') {
      return this.extractSimplePropertyName((node as any).base)
    }
    
    return null
  }

  private formatOpCall(node: any): string {
    return this.formatBinaryOp(node.left, node.op, node.right)
  }

  private formatBinaryOp(left: ExprNode, op: string, right: ExprNode): string {
    const leftStr = this.formatWithParens(left)
    const rightStr = this.formatWithParens(right)

    if (op === ':') {
      return `${leftStr  }: ${  rightStr}`
    }

    return `${leftStr  } ${  op  } ${  rightStr}`
  }

  private formatUnaryOp(op: string, operand: ExprNode): string {
    return op + this.formatWithParens(operand)
  }

  private formatGroup(node: any): string {
    return `(${  this.formatNode(node.base)  })`
  }

  private formatFuncCall(node: any): string {
    const namespace = node.namespace !== 'global' ? `${node.namespace  }::` : ''
    const args = node.args.map((arg: ExprNode) => this.formatNode(arg))
    return `${namespace + node.name  }(${  args.join(', ')  })`
  }

  private formatPipeFuncCall(node: any): string {
    const baseStr = this.formatWithParens(node.base)
    const args = node.args.map((arg: ExprNode) => this.formatNode(arg))
    const argsStr = args.length > 0 ? `(${  args.join(', ')  })` : ''
    return `${baseStr  } | ${  node.name  }${argsStr}`
  }

  private formatDeref(node: any): string {
    // For dereference, omit 'This' (@) since it's implicit
    if (node.base.type === 'This') {
      return '->'
    }
    return `${this.formatWithParens(node.base)  }->`
  }

  private formatFilter(node: any): string {
    return `${this.formatWithParens(node.base)  }[${  this.formatNode(node.expr)  }]`
  }

  private formatProjection(node: any): string {
    // Handle projections - if base is This (@), omit it for cleaner output
    if (node.base.type === 'This') {
      return this.formatNode(node.expr)
    }
    
    const baseStr = this.formatWithParens(node.base)
    const exprStr = this.formatNode(node.expr)
    
    // Add space before { in projections for better readability
    if (exprStr.startsWith('{')) {
      return baseStr + ' ' + exprStr
    }
    
    return baseStr + exprStr
  }

  private formatSlice(node: any): string {
    const operator = node.isInclusive ? '..' : '...'
    return `${this.formatWithParens(node.base)  }[${  node.left  }${operator  }${node.right  }]`
  }

  private formatInRange(node: any): string {
    const operator = node.isInclusive ? '..' : '...'
    return (
      `${this.formatNode(node.base) 
      } in ${ 
      this.formatNode(node.left) 
      }${operator 
      }${this.formatNode(node.right)}`
    )
  }

  private formatSelect(node: any): string {
    const alternatives = node.alternatives.map((alt: SelectAlternativeNode) => {
      return `${this.formatNode(alt.condition)  } => ${  this.formatNode(alt.value)}`
    })

    const args = alternatives
    if (node.fallback) {
      args.push(this.formatNode(node.fallback))
    }

    return `select(${  args.join(', ')  })`
  }

  private formatAsc(node: any): string {
    return `${this.formatNode(node.base)} asc`
  }

  private formatDesc(node: any): string {
    return `${this.formatNode(node.base)} desc`
  }

  private formatTuple(node: any): string {
    const members = node.members.map((member: ExprNode) => this.formatNode(member))
    return `(${  members.join(', ')  })`
  }

  private formatMap(node: any): string {
    // Map operations - handle projections specially
    if (node.expr.type === 'Projection') {
      // This is a projection like *[condition] {...} or chained projections
      // Add space only in pretty mode
      const space = ' '
      return this.formatWithParens(node.base) + space + this.formatNode(node.expr)
    }
    return `${this.formatWithParens(node.base)  }[${  this.formatNode(node.expr)  }]`
  }

  private formatFlatMap(node: any): string {
    return `${this.formatWithParens(node.base)  }[]${  this.formatNode(node.expr)}`
  }

  private formatContext(node: any): string {
    return `${node.key  }()`
  }

  private formatWithParens(node: ExprNode): string {
    // Only preserve explicit parentheses from the original AST (Group nodes)
    // Don't add any new parentheses based on precedence
    return this.formatNode(node)
  }
}
