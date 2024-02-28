export interface Document {
  type: 'document'
  name: string
  attributes: Record<string, ObjectAttribute>
}

export interface TypeDeclaration {
  type: 'type'
  name: string
  value: TypeNode
}

export type Schema = (Document | TypeDeclaration)[]

export interface StringTypeNode {
  type: 'string'
  value?: string
}
export interface NumberTypeNode {
  type: 'number'
  value?: number
}
export interface BooleanTypeNode {
  type: 'boolean'
  value?: boolean
}

export type PrimitiveTypeNode = StringTypeNode | NumberTypeNode | BooleanTypeNode

export interface NullTypeNode {
  type: 'null'
}

export interface ObjectTypeNode<T extends TypeNode = TypeNode> {
  type: 'object'
  attributes: Record<string, ObjectAttribute<T>>
}

export interface ObjectAttribute<T extends TypeNode = TypeNode> {
  type: 'objectAttribute'
  value: T
  optional?: boolean
}

export interface ReferenceTypeNode {
  type: 'reference'
  to: string
  resolved?: boolean
}

export interface UnionTypeNode<T extends TypeNode = TypeNode> {
  type: 'union'
  of: T[]
}

export interface ArrayTypeNode<T extends TypeNode = TypeNode> {
  type: 'array'
  of: T
}

export type UnknownTypeNode = {type: 'unknown'}

export type TypeNode =
  | ObjectTypeNode
  | StringTypeNode
  | NullTypeNode
  | NumberTypeNode
  | BooleanTypeNode
  | ArrayTypeNode
  | UnionTypeNode
  | ReferenceTypeNode
  | UnknownTypeNode
