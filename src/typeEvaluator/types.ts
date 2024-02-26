export interface Document {
  type: 'document'
  name: string
  fields: ObjectKeyValue<TypeNode>[]
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
  fields: ObjectKeyValue<T>[]
}

export interface ObjectKeyValue<T extends TypeNode = TypeNode> {
  type: 'objectKeyValue'
  key: string
  value: T
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
export interface ConcatenationTypeNode {
  type: 'concatenation'
  fields: Array<TypeNode>
}
export interface OptionalTypeNode<T extends TypeNode = TypeNode> {
  type: 'optional'
  value: T
}

export type UnknownTypeNode = {type: 'unknown'}
export type NeverTypeNode = {type: 'never'}
export type ParameterTypeNode = {type: 'parameter'; name: string}

export type TypeNode =
  | ObjectTypeNode
  | StringTypeNode
  | NullTypeNode
  | NumberTypeNode
  | BooleanTypeNode
  | ArrayTypeNode
  | UnionTypeNode
  | Document
  | ReferenceTypeNode
  | ConcatenationTypeNode
  | UnknownTypeNode
  | NeverTypeNode
  | OptionalTypeNode
  | ParameterTypeNode
