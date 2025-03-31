/**
 * Represents a document structure with a fixed type 'document', a name, and a collection of attributes.
 * @public
 */
export interface Document {
  /** The type identifier for this node, always 'document' */
  type: 'document'
  /** The name of the document */
  name: string
  /** A collection of attributes defined as key-value pairs */
  attributes: Record<string, ObjectAttribute>
}

/**
 * Defines a type declaration with a specific name and a value that describes the structure of the type.
 * @public
 */
export interface TypeDeclaration {
  /** The type identifier for this node, always 'type' */
  type: 'type'
  /** The name of the type */
  name: string
  /** The value that describes the structure of the type */
  value: TypeNode
}

/**
 * A schema consisting of a list of Document or TypeDeclaration items, allowing for complex type definitions.
 * @public
 */
export type Schema = (Document | TypeDeclaration)[]

/**
 * Describes a type node for string values, optionally including a specific string value.
 * @public
 */
export interface StringTypeNode {
  /** The type identifier for this node, always 'string' */
  type: 'string'
  /** An optional value that, if provided, indicates this string will always have the given value */
  value?: string
}

/**
 * Describes a type node for number values, optionally including a specific numeric value.
 * @public
 */
export interface NumberTypeNode {
  /** The type identifier for this node, always 'number' */
  type: 'number'
  /** An optional value that, if provided, indicates this number will always have the given value */
  value?: number
}

/**
 * Describes a type node for boolean values, optionally including a specific boolean value.
 * @public
 */
export interface BooleanTypeNode {
  /** The type identifier for this node, always 'boolean' */
  type: 'boolean'
  /** An optional value that, if provided, indicates this boolean will always have the given value */
  value?: boolean
}

/**
 * Union of all primitive type nodes.
 * @public
 */
export type PrimitiveTypeNode = StringTypeNode | NumberTypeNode | BooleanTypeNode

/**
 * Describes a type node for null values.
 * @public
 */
export interface NullTypeNode {
  /** The type identifier for this node, always 'null' */
  type: 'null'
}

/**
 * Describes a type node that references another type by name.
 * @public
 */
export interface InlineTypeNode {
  /** The type identifier for this node, always 'inline' */
  type: 'inline'
  /** The name of the referenced type */
  name: string
}

/**
 * Describes a type node for object values, including attributes and optional extensions.
 *
 * The rest value can be:
 * - An ObjectTypeNode: the object can have additional attributes of that type
 * - An UnknownTypeNode: the object has unknown additional attributes
 * - An InlineTypeNode: the object includes attributes from the referenced type
 * @public
 */
export interface ObjectTypeNode<T extends TypeNode = TypeNode> {
  /** The type identifier for this node, always 'object' */
  type: 'object'
  /** A collection of attributes for this object */
  attributes: Record<string, ObjectAttribute<T>>
  /** An optional rest value for additional attributes */
  rest?: ObjectTypeNode | UnknownTypeNode | InlineTypeNode
  /** An optional reference to the document this object dereferences to */
  dereferencesTo?: string
}

/**
 * Describes an attribute of an object type, including its type and optional flag.
 * @public
 */
export interface ObjectAttribute<T extends TypeNode = TypeNode> {
  /** The type identifier for this node, always 'objectAttribute' */
  type: 'objectAttribute'
  /** The type of this attribute */
  value: T
  /** Whether this attribute is optional on the object */
  optional?: boolean
}

/**
 * Describes a type node for union values, which can be any of the provided types.
 * @public
 */
export interface UnionTypeNode<T extends TypeNode = TypeNode> {
  /** The type identifier for this node, always 'union' */
  type: 'union'
  /** The collection of possible types for this union */
  of: T[]
}

/**
 * Describes a type node for array values, specifying the type of elements.
 * @public
 */
export interface ArrayTypeNode<T extends TypeNode = TypeNode> {
  /** The type identifier for this node, always 'array' */
  type: 'array'
  /** The type of the array elements */
  of: T
}

/**
 * Describes a type node for unknown values, where the type cannot be determined.
 * @public
 */
export type UnknownTypeNode = {
  /** The type identifier for this node, always 'unknown' */
  type: 'unknown'
}

/**
 * Union of all possible type nodes.
 * @public
 */
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
