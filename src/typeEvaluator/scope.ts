import type {InlineTypeNode, NullTypeNode, Schema, TypeNode, UnionTypeNode} from './types'

export class Context {
  readonly schema: Schema

  constructor(schema: Schema) {
    this.schema = schema
  }

  lookupRef(refTo: string): TypeNode {
    for (const val of this.schema) {
      if (val.type === 'document') {
        if (val.name === refTo) {
          return {
            type: 'object',
            attributes: val.attributes,
          }
        }
      }
    }
    return {type: 'null'} satisfies NullTypeNode
  }

  lookupTypeDeclaration(alias: InlineTypeNode): TypeNode {
    for (const val of this.schema) {
      if (val.type === 'type') {
        if (val.name === alias.name) {
          return val.value
        }
      }
    }
    return {type: 'null'} satisfies NullTypeNode
  }
}

export class Scope {
  public value: UnionTypeNode
  public parent: Scope | undefined
  public context: Context
  public isHidden: boolean

  constructor(value: TypeNode[], parent?: Scope, context?: Context) {
    this.value = {type: 'union', of: value} satisfies UnionTypeNode
    this.parent = parent
    this.context = context || parent?.context || new Context([])
    this.isHidden = false
  }

  createNested(value: TypeNode[]): Scope {
    if (this.isHidden) {
      return new Scope(value, this.parent, this.context)
    }
    return new Scope(value, this, this.context)
  }

  createHidden(value: TypeNode[]): Scope {
    const result = this.createNested(value)
    result.isHidden = true
    return result
  }
}
