import type {ObjectAttribute, ObjectTypeNode, TypeNode, UnionTypeNode} from './types'

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
    attributes._key = {
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
    return {
      type: 'union',
      of: [...node.of, {type: 'null'}],
    } satisfies UnionTypeNode
  }

  return {
    type: 'union',
    of: [node, {type: 'null'}],
  } satisfies UnionTypeNode
}
