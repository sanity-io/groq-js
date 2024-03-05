import {TypeNode} from './types'

export function hashField(field: TypeNode): string {
  switch (field.type) {
    case 'string':
    case 'number':
    case 'boolean': {
      if (field.value !== undefined) {
        return `${field.type}:${field.value}`
      }
      return `${field.type}`
    }

    case 'null':
    case 'unknown': {
      return field.type
    }

    case 'array': {
      return `${field.type}:${hashField(field.of)}`
    }

    case 'object': {
      return `${field.type}:ref-${field.dereferencesTo}:${Object.entries(field.attributes)
        .map(([key, value]) => `${key}:${hashField(value.value)}`)
        .join(',')}:${field.rest ? hashField(field.rest) : 'no-rest'}`
    }

    case 'union': {
      return `${field.type}:${field.of.map(hashField).join(',')}`
    }

    case 'inline': {
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
