import type {InlineTypeNode, ObjectTypeNode, TypeNode, UnionTypeNode} from './types'

function hashObjectTypeNode(object: ObjectTypeNode, ignoreRest: boolean = false) {
  return `${object.type}:(${Object.entries(object.attributes)
    .map(([key, value]) => `${key}:${hashField(value.value)}`)
    .join(
      ',',
    )}):ref-${object.dereferencesTo}:${!ignoreRest && object.rest ? hashField(object.rest) : 'no-rest'}`
}

export function hashField(field: TypeNode): string {
  switch (field.type) {
    case 'string':
    case 'number':
    case 'boolean': {
      if (field.value !== undefined) {
        return `${field.type}(${field.value})`
      }
      return `${field.type}`
    }

    case 'null':
    case 'unknown': {
      return field.type
    }

    case 'array': {
      return `${field.type}(${hashField(field.of)})`
    }

    case 'object': {
      return hashObjectTypeNode(field)
    }

    case 'union': {
      return `${field.type}(${field.of.map(hashField).join(',')})`
    }

    case 'inline': {
      return `${field.type}(${field.name})`
    }

    default: {
      // @ts-expect-error - we should never reach this, make sure we cover all type cases
      return field.type
    }
  }
}

export function removeDuplicateTypeNodes(typeNodes: TypeNode[]): TypeNode[] {
  const seenTypes = new Set<string>()
  const newTypeNodes = []

  for (const typeNode of typeNodes) {
    const hash = hashField(typeNode)
    if (hash === null) {
      newTypeNodes.push(typeNode)
      continue
    }
    if (seenTypes.has(hash)) {
      continue
    }

    seenTypes.add(hash)
    newTypeNodes.push(typeNode)
  }

  return newTypeNodes
}

export function optimizeUnions(field: TypeNode): TypeNode {
  if (field.type === 'union') {
    field.of = removeDuplicateTypeNodes(field.of)

    // empty union, abort early
    if (field.of.length === 0) {
      return field
    }

    // single element union, optimize
    if (field.of.length === 1) {
      return optimizeUnions(field.of[0])
    }

    //
    if (field.of[0].type === 'object' && field.of[0].rest?.type === 'inline') {
      const objectAttributeHash = hashObjectTypeNode(field.of[0], true)
      if (
        field.of.every(
          (node) =>
            node.type === 'object' &&
            node.rest?.type === 'inline' &&
            hashObjectTypeNode(node, true) === objectAttributeHash,
        )
      ) {
        const inlines: InlineTypeNode[] = []
        for (const obj of field.of) {
          // eslint-disable-next-line
          if (obj.type !== 'object' || obj.rest === undefined || obj.rest.type !== 'inline') {
            continue
          }
          inlines.push(obj.rest)
        }

        const rest = optimizeUnions({
          type: 'union',
          of: inlines,
        }) as UnionTypeNode<InlineTypeNode> | InlineTypeNode // todo: fix me

        return {
          type: 'object',
          attributes: field.of[0].attributes,
          rest,
        } satisfies ObjectTypeNode
      }
    }

    // flatten union
    for (let idx = 0; field.of.length > idx; idx++) {
      const subField = field.of[idx]
      if (subField.type === 'union') {
        field.of.splice(idx, 1, ...subField.of)
        idx--
        continue
      }

      field.of[idx] = optimizeUnions(subField)
    }

    const compare = new Intl.Collator('en').compare
    field.of.sort((a, b) => {
      if (a.type === 'null') {
        return 1
      }
      return compare(hashField(a), hashField(b))
    })

    return field
  }

  if (field.type === 'array') {
    field.of = optimizeUnions(field.of)
    return field
  }

  if (field.type === 'object') {
    for (const idx in field.attributes) {
      if (!Object.hasOwn(field.attributes, idx)) {
        continue
      }

      field.attributes[idx].value = optimizeUnions(field.attributes[idx].value)
    }
    return field
  }

  return field
}
