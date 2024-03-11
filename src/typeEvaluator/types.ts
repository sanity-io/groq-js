/** Represents a document structure with a fixed type 'document', a name, and a collection of attributes.*/
export interface Document {
  /** can be used to identify the type of the node, in this case it's always 'document' */
  type: 'document'
  /** the name of the document */
  name: string
  /** ttributes is defined by a key-value pair where the key is a string and the value is an ObjectAttribute. */
  attributes: Record<string, ObjectAttribute>
}

/** Defines a type declaration with a specific name and a value that describes the structure of the type using a TypeNode. */
export interface TypeDeclaration {
  /** can be used to identify the type of the node, in this case it's always 'type' */
  type: 'type'
  /** the name of the type */
  name: string
  /** the value that describes the structure of the type */
  value: TypeNode
}

/** A schema consisting of a list of Document or TypeDeclaration items, allowing for complex type definitions. */
export type Schema = (Document | TypeDeclaration)[]

/** Describes a type node for string values, optionally including a value. If a value is provided it will always be the given string value. */
export interface StringTypeNode {
  /** can be used to identify the type of the node, in this case it's always 'string' */
  type: 'string'
  /** an optional value of the string, if provided it will always be the given string value */
  value?: string
}

/** Describes a type node for number values, optionally including a value. If a value is provided it will always be the given numeric value.*/
export interface NumberTypeNode {
  /** can be used to identify the type of the node, in this case it's always 'number' */
  type: 'number'
  /** an optional value of the number, if provided it will always be the given numeric value */
  value?: number
}

/** Describes a type node for boolean values, optionally including a value. If a value is provided it will always be the given boolean value. */
export interface BooleanTypeNode {
  /** can be used to identify the type of the node, in this case it's always 'boolean' */
  type: 'boolean'
  /** an optional value of the boolean, if provided it will always be the given boolean value */
  value?: boolean
}

/** Union of any primitive type nodes. */
export type PrimitiveTypeNode = StringTypeNode | NumberTypeNode | BooleanTypeNode

/** Describes a type node for null values, always being the null value. */
export interface NullTypeNode {
  /** can be used to identify the type of the node, in this case it's always 'null' */
  type: 'null'
}

/** Describes a type node for inline values, including a name that references another type. */
export interface InlineTypeNode {
  /** can be used to identify the type of the node, in this case it's always 'inline' */
  type: 'inline'
  /** the name of the referenced type */
  name: string
}

/**
 * Describes a type node for object values, including a collection of attributes and an optional rest value.
 * The rest value can be another ObjectTypeNode, an UnknownTypeNode, or an InlineTypeNode.
 * If the rest value is an ObjectTypeNode, it means that the object can have additional attributes.
 * If the rest value is an UnknownTypeNode, the entire object is unknown.
 * If the rest value is an InlineTypeNode, it means that the object has additional attributes from the referenced type.
 */
export interface ObjectTypeNode<T extends TypeNode = TypeNode> {
  /** can be used to identify the type of the node, in this case it's always 'object' */
  type: 'object'
  /** a collection of attributes */
  attributes: Record<string, ObjectAttribute<T>>
  /** an optional rest value */
  rest?: ObjectTypeNode | UnknownTypeNode | InlineTypeNode
  /* an optional reference to the document this object dereferences to */
  dereferencesTo?: string
}

/** Describes a type node for object attributes, including a type and an optional flag for being optional. */
export interface ObjectAttribute<T extends TypeNode = TypeNode> {
  /** can be used to identify the type of the node, in this case it's always 'objectAttribute' */
  type: 'objectAttribute'
  /** the type of the attribute */
  value: T
  /** an optional flag if the attribute is optional set on the object */
  optional?: boolean
}

/** Describes a type node for union values. */
export interface UnionTypeNode<T extends TypeNode = TypeNode> {
  /** can be used to identify the type of the node, in this case it's always 'union' */
  type: 'union'
  /** a collection of types */
  of: T[]
}

/** Describes a type node for array values. */
export interface ArrayTypeNode<T extends TypeNode = TypeNode> {
  /** can be used to identify the type of the node, in this case it's always 'array' */
  type: 'array'
  /** the type of the array elements */
  of: T
}

/** Describes a type node for unknown value. */
export type UnknownTypeNode = {
  /** can be used to identify the type of the node, in this case it's always 'unknown' */
  type: 'unknown'
}

/** All possible type nodes. */
export type TypeNode =
  | ObjectTypeNode
  | StringTypeNode
  | NullTypeNode
  | NumberTypeNode
  | BooleanTypeNode
  | ArrayTypeNode
  | UnionTypeNode
  | InlineTypeNode
  | UnknownTypeNode
