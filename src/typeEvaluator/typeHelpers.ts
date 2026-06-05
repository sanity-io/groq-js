import type {ExprNode} from '../shared/nodeTypes'
import {optimizeUnions} from './optimizations'
import type {Scope} from './scope'
import {
  type ArrayTypeNode,
  type BooleanTypeNode,
  type InlineTypeNode,
  type NullTypeNode,
  type NumberTypeNode,
  type ObjectAttribute,
  type ObjectTypeNode,
  STRING_TYPE_DATETIME,
  type StringTypeNode,
  type TypeNode,
  type UnionTypeNode,
  type UnknownTypeNode,
} from './types'

type UnionTypeMetadata = Pick<UnionTypeNode, 'declaredOf' | 'declaredTo' | 'name'>

/**
 * createReferenceTypeNode creates a ObjectTypeNode representing a reference type
 * it adds required attributes for a reference type.
 * @param name - The name of the reference type
 * @param inArray - Whether the reference is in an array
 * @returns A ObjectTypeNode representing a reference type
 * @internal
 */
export function createReferenceTypeNode(
  name: string,
  inArray: boolean = false,
  declaredTo?: InlineTypeNode[],
): ObjectTypeNode {
  const attributes: Record<string, ObjectAttribute> = {
    _ref: {
      type: 'objectAttribute',
      value: {
        type: 'string',
      },
    },
    _type: {
      type: 'objectAttribute',
      value: {
        type: 'string',
        value: 'reference',
      },
    },
    _weak: {
      type: 'objectAttribute',
      value: {
        type: 'boolean',
      },
      optional: true,
    },
  }

  if (inArray) {
    attributes['_key'] = {
      type: 'objectAttribute',
      value: {
        type: 'string',
      },
    } satisfies ObjectAttribute
  }

  const reference: ObjectTypeNode = {
    type: 'object',
    attributes,
    dereferencesTo: name,
  }

  if (declaredTo !== undefined) {
    reference.declaredTo = declaredTo
  }

  return reference
}

export function createObject(
  attributes: Record<string, ObjectAttribute<TypeNode>>,
): ObjectTypeNode {
  return {
    type: 'object',
    attributes,
  } satisfies ObjectTypeNode
}

export function createObjectAttribute(
  value: TypeNode,
  optional?: boolean,
): ObjectAttribute<TypeNode> {
  if (optional === undefined) {
    return {
      type: 'objectAttribute',
      value,
    } satisfies ObjectAttribute<TypeNode>
  }

  return {
    type: 'objectAttribute',
    value,
    optional,
  } satisfies ObjectAttribute<TypeNode>
}

export function nullUnion(node: TypeNode): TypeNode {
  if (node.type === 'union') {
    const metadata = getNullableUnionMetadata(node)
    if (metadata) {
      return unionOf([...node.of, {type: 'null'}], metadata)
    }

    return unionOf(...node.of, {type: 'null'})
  }

  const declaredTo = getDeclaredToMetadata(node)
  if (declaredTo) {
    return unionOf([node, {type: 'null'}], {declaredTo})
  }

  return unionOf(node, {type: 'null'})
}

export function unionOf<T extends TypeNode>(
  nodes: T[],
  metadata?: UnionTypeMetadata,
): UnionTypeNode<T>
export function unionOf(...nodes: TypeNode[]): TypeNode
export function unionOf(...args: unknown[]): TypeNode {
  const firstArg = args[0]
  const nodes = Array.isArray(firstArg) ? (firstArg as TypeNode[]) : (args as TypeNode[])
  const metadata = Array.isArray(firstArg) ? (args[1] as UnionTypeMetadata | undefined) : undefined

  if (nodes.length === 1) {
    if (!hasUnionMetadata(metadata)) {
      return nodes[0]!
    }
  }

  const union: UnionTypeNode = {
    type: 'union',
    of: nodes,
  }

  if (metadata?.name) {
    union.name = metadata.name
  }

  if (metadata?.declaredOf) {
    union.declaredOf = metadata.declaredOf
  }

  if (metadata?.declaredTo) {
    union.declaredTo = metadata.declaredTo
  }

  return union
}

function hasUnionMetadata(metadata: UnionTypeMetadata | undefined): boolean {
  return Boolean(metadata?.name || metadata?.declaredOf || metadata?.declaredTo)
}

function getNullableUnionMetadata(node: UnionTypeNode): UnionTypeMetadata | undefined {
  const declaredOf = getUnionDeclaredOf(node)
  const metadata: UnionTypeMetadata = {}

  if (declaredOf) {
    metadata.declaredOf = [...declaredOf, {type: 'null'}]
  }

  const declaredTo = getDeclaredToMetadata(node)
  if (declaredTo) {
    metadata.declaredTo = declaredTo
  }

  return hasUnionMetadata(metadata) ? metadata : undefined
}

function getUnionDeclaredOf(node: UnionTypeNode): TypeNode[] | undefined {
  if (node.name) {
    return [{type: 'inline', name: node.name}]
  }

  return node.declaredOf
}

function getDeclaredToMetadata(node: TypeNode): InlineTypeNode[] | undefined {
  if (node.type !== 'inline' && node.type !== 'object' && node.type !== 'union') {
    return undefined
  }

  return node.declaredTo && node.declaredTo.length > 0 ? node.declaredTo : undefined
}

export function dateTimeString(): StringTypeNode {
  return {
    type: 'string',
    [STRING_TYPE_DATETIME]: true,
  }
}

export type ConcreteTypeNode =
  | BooleanTypeNode
  | NullTypeNode
  | NumberTypeNode
  | StringTypeNode
  | ArrayTypeNode
  | ObjectTypeNode

export function resolveInline(node: TypeNode, scope: Scope): Exclude<TypeNode, InlineTypeNode> {
  if (node.type === 'inline') {
    const resolvedInline = scope.context.lookupTypeDeclaration(node)
    return resolveInline(resolvedInline, scope)
  }

  return node
}

/**
 * mapNode extracts either a _concrete type_ OR an _unknown type_ from a type node, applies the mapping
 * function to it and returns. Most notably, this will work through unions
 * (applying the mapping function for each variant) and inline (resolving the
 * reference).
 **/
export function mapNode<T extends TypeNode = TypeNode>(
  node: TypeNode,
  scope: Scope,
  mapper: (node: ConcreteTypeNode | UnknownTypeNode) => T,
  mergeUnions: (nodes: TypeNode[], metadata?: UnionTypeMetadata) => TypeNode = (nodes, metadata) =>
    optimizeUnions(unionOf(nodes, metadata)),
): TypeNode {
  switch (node.type) {
    case 'boolean':
    case 'array':
    case 'null':
    case 'object':
    case 'string':
    case 'number':
    case 'unknown':
      return mapper(node)
    case 'union':
      return mergeUnions(
        node.of.map((inner) => mapNode(inner, scope, mapper), mergeUnions),
        getMappedUnionMetadata(node),
      )
    case 'inline': {
      const resolvedInline = resolveInline(node, scope)
      return mapNode(resolvedInline, scope, mapper, mergeUnions)
    }
    default:
      // @ts-expect-error - all types should be handled
      throw new Error(`Unknown type: ${node.type}`)
  }
}

function getMappedUnionMetadata(node: UnionTypeNode): UnionTypeMetadata | undefined {
  const metadata: UnionTypeMetadata = {}

  if (node.name) {
    metadata.declaredOf = [{type: 'inline', name: node.name}]
  } else if (node.declaredOf) {
    metadata.declaredOf = node.declaredOf
  }

  if (node.declaredTo) {
    metadata.declaredTo = node.declaredTo
  }

  return hasUnionMetadata(metadata) ? metadata : undefined
}

export function isFuncCall(node: ExprNode, name: string): boolean {
  if (node.type === 'Group') {
    return isFuncCall(node.base, name)
  }

  return node.type === 'FuncCall' && `${node.namespace}::${node.name}` === name
}

export function isString(
  node: TypeNode,
): node is StringTypeNode & {[STRING_TYPE_DATETIME]?: undefined} {
  if (node.type === 'string' && !node[STRING_TYPE_DATETIME]) return true
  return false
}

export function isDateTime(
  node: TypeNode,
): node is StringTypeNode & {[STRING_TYPE_DATETIME]: true} {
  if (node.type === 'string' && node[STRING_TYPE_DATETIME]) return true
  return false
}

export function containsDateTime(node: TypeNode): boolean {
  if (isDateTime(node)) return true
  if (node.type === 'array') {
    if (isDateTime(node.of)) return true
    if (node.of.type === 'union') {
      return node.of.of.some((member) => isDateTime(member))
    }
  }
  return false
}

export function createGeoJson(type: 'Point' | 'LineString' | 'Polygon' = 'Point'): ObjectTypeNode {
  let coordinateAttribute: ArrayTypeNode = {
    type: 'array',
    of: {
      type: 'number',
    },
  }
  if (type === 'LineString') {
    coordinateAttribute = {
      type: 'array',
      of: {
        type: 'array',
        of: {
          type: 'number',
        },
      },
    } satisfies ArrayTypeNode
  }
  if (type === 'Polygon') {
    coordinateAttribute = {
      type: 'array',
      of: {
        type: 'array',
        of: {
          type: 'array',
          of: {
            type: 'number',
          },
        },
      },
    }
  }
  return {
    type: 'object',
    attributes: {
      type: {
        type: 'objectAttribute',
        value: {
          type: 'string',
          value: type,
        },
      },
      coordinates: {
        type: 'objectAttribute',
        value: coordinateAttribute,
      },
    },
  } satisfies ObjectTypeNode
}
