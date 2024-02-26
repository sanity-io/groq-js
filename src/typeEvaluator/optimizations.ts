import {ReferenceTypeNode, TypeNode} from './types'

export function optimizeDocumentReferences(field: TypeNode): TypeNode {
  if (field.type === 'document') {
    return {
      type: 'reference',
      to: field.name,
      resolved: true,
    } satisfies ReferenceTypeNode
  }
  if (field.type === 'optional') {
    field.value = optimizeDocumentReferences(field.value)
    return field
  }

  if (field.type === 'array' && field.of !== undefined) {
    field.of = optimizeDocumentReferences(field.of)
    return field
  }

  if (field.type === 'object') {
    for (const idx in field.fields) {
      if (!Object.hasOwn(field.fields, idx)) {
        continue
      }

      field.fields[idx].value = optimizeDocumentReferences(field.fields[idx].value)
    }
  }

  if (field.type === 'union') {
    field.of = field.of.map((subField) => optimizeDocumentReferences(subField))
    return field
  }

  return field
}

export function hashField(field: TypeNode): string | null {
  switch (field.type) {
    case 'string':
    case 'number':
    case 'boolean': {
      return `${field.type}:${field.value}`
    }

    case 'null':
    case 'unknown':
    case 'never': {
      return field.type
    }

    case 'parameter': {
      return `${field.type}:${field.name}`
    }

    case 'reference': {
      return `${field.type}:${field.to}`
    }

    case 'optional': {
      return `${field.type}:${hashField(field.value)}`
    }

    case 'concatenation': {
      return `${field.type}:${field.fields.map(hashField).join(',')}`
    }

    case 'array': {
      return `${field.type}:${hashField(field.of)}`
    }

    case 'object': {
      return `${field.type}:${Object.entries(field.fields)
        .map(([key, value]) => `${key}:${hashField(value.value)}`)
        .join(',')}`
    }

    case 'union': {
      return `${field.type}:${field.of.map(hashField).join(',')}`
    }

    case 'document': {
      return `${field.type}:${field.name}`
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

    if (field.of.length === 1) {
      return optimizeUnions(field.of[0])
    }

    let hasOptional = false
    // flatten union
    for (let idx = 0; field.of.length > idx; idx++) {
      const subField = field.of[idx]
      if (subField.type === 'union') {
        field.of.splice(idx, 1, ...subField.of)
        idx--
        continue
      }

      if (subField.type === 'optional') {
        field.of.splice(idx, 1, subField.value)
        hasOptional = true
        idx--
        continue
      }

      field.of[idx] = optimizeUnions(subField)
    }

    if (hasOptional) {
      return {
        type: 'optional',
        value: field,
      }
    }

    return field
  }

  if (field.type === 'array') {
    field.of = optimizeUnions(field.of)
    return field
  }

  if (field.type === 'object') {
    for (const idx in field.fields) {
      if (!Object.hasOwn(field.fields, idx)) {
        continue
      }

      field.fields[idx].value = optimizeUnions(field.fields[idx].value)
    }
    return field
  }

  if (field.type === 'optional') {
    field.value = optimizeUnions(field.value)
    return field
  }

  return field
}
