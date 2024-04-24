import {optimizeUnions} from './optimizations'
import type {Scope} from './scope'
import type {
  ArrayTypeNode,
  BooleanTypeNode,
  NullTypeNode,
  NumberTypeNode,
  ObjectAttribute,
  ObjectTypeNode,
  StringTypeNode,
  TypeNode,
  UnionTypeNode,
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

type ConcreteTypeNode =
  | BooleanTypeNode
  | NullTypeNode
  | NumberTypeNode
  | StringTypeNode
  | ArrayTypeNode
  | ObjectTypeNode

/**
 * mapConcrete extracts a _concrete type_ from a type node, applies the mapping
 * function to it and returns. Most notably, this will work through unions
 * (applying the mapping function for each variant) and inline (resolving the
 * reference).
 *
 * An `unknown` input type causes it to return `unknown` as well.
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
  switch (node.type) {
    case 'boolean':
    case 'array':
    case 'null':
    case 'object':
    case 'string':
    case 'number':
      return mapper(node)
    case 'unknown':
      return node
    case 'union':
      return mergeUnions(node.of.map((inner) => mapConcrete(inner, scope, mapper), mergeUnions))
    case 'inline': {
      const resolvedInline = scope.context.lookupTypeDeclaration(node)
      return mapConcrete(resolvedInline, scope, mapper, mergeUnions)
    }
    default:
      // @ts-expect-error - all types should be handled
      throw new Error(`Unknown type: ${node.type}`)
  }
}
