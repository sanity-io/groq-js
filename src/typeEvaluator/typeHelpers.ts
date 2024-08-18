import type {ExprNode} from '../nodeTypes'
import {optimizeUnions} from './optimizations'
import type {Scope} from './scope'
import type {
  ArrayTypeNode,
  BooleanTypeNode,
  InlineTypeNode,
  NullTypeNode,
  NumberTypeNode,
  ObjectAttribute,
  ObjectTypeNode,
  StringTypeNode,
  TypeNode,
  UnionTypeNode,
  UnknownTypeNode,
} from './types'

/**
 * createReferenceTypeNode creates a ObjectTypeNode representing a reference type
 * it adds required attributes for a reference type.
 * @param name - The name of the reference type
 * @param inArray - Whether the reference is in an array
 * @returns A ObjectTypeNode representing a reference type
 * @internal
 */
export function createReferenceTypeNode(name: string, inArray: boolean = false): ObjectTypeNode {
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

  return {
    type: 'object',
    attributes,
    dereferencesTo: name,
  } satisfies ObjectTypeNode
}

export function nullUnion(node: TypeNode): UnionTypeNode {
  if (node.type === 'union') {
    return unionOf(...node.of, {type: 'null'})
  }

  return unionOf(node, {type: 'null'})
}

export function unionOf(...nodes: TypeNode[]): UnionTypeNode {
  return {
    type: 'union',
    of: nodes,
  } satisfies UnionTypeNode
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
 * mapConcrete extracts a _concrete type_ from a type node, applies the mapping
 * function to it and returns. Most notably, this will work through unions
 * (applying the mapping function for each variant) and inline (resolving the
 * reference).
 *
 * An `unknown` input type causes it to return `unknown`, without applying the mapping function.
 *
 * After encountering unions the resulting types gets passed into `mergeUnions`.
 * By default this will just union them together again.
 */
export function mapConcrete(
  node: TypeNode,
  scope: Scope,
  mapper: (node: ConcreteTypeNode) => TypeNode,
  mergeUnions: (nodes: TypeNode[]) => TypeNode = (nodes) =>
    optimizeUnions({type: 'union', of: nodes}),
): TypeNode {
  return mapUnion(
    node,
    scope,
    (node) => {
      if (node.type === 'unknown') {
        return node
      }
      return mapper(node)
    },
    mergeUnions,
  )
}

/**
 * mapUnion extracts a _concrete type_ OR an unknown type from a type node, applies the mapping
 * function to it and returns. Most notably, this will work through unions
 * (applying the mapping function for each variant) and inline (resolving the
 * reference).
 * This method should _only_ be used if you need to handle unknown types, ie when resolving two sides of an and node, and we don't want to abort if one side is unknown.
 * In most cases, you should use `mapConcrete` instead.
 **/
export function mapUnion<T extends TypeNode = TypeNode>(
  node: TypeNode,
  scope: Scope,
  mapper: (node: ConcreteTypeNode | UnknownTypeNode) => T,
  mergeUnions: (nodes: TypeNode[]) => TypeNode = (nodes) =>
    optimizeUnions({type: 'union', of: nodes}),
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
      return mergeUnions(node.of.map((inner) => mapUnion(inner, scope, mapper), mergeUnions))
    case 'inline': {
      const resolvedInline = resolveInline(node, scope)
      return mapUnion(resolvedInline, scope, mapper, mergeUnions)
    }
    default:
      // @ts-expect-error - all types should be handled
      throw new Error(`Unknown type: ${node.type}`)
  }
}

export function isFuncCall(node: ExprNode, name: string): boolean {
  if (node.type === 'Group') {
    return isFuncCall(node.base, name)
  }

  return node.type === 'FuncCall' && `${node.namespace}::${node.name}` === name
}
