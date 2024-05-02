import type {TypeNode} from './types'

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

export function hoistDuplicateTypeNodes(src: TypeNode[]): TypeNode[] {
  const times = new Map<string, number>()
  const srcLength = src.length
  for (let idx = 0; src.length > idx; idx++) {
    if (!Object.hasOwn(src, idx)) {
      continue
    }
    const typeNode = src[idx]
    if (typeNode.type === 'union') {
      for (const subTypeNode of typeNode.of) {
        const hash = hashField(subTypeNode)

        times.set(hash, (times.get(hash) || 0) + 1)
      }
    }
  }
  if (times.size === 0) {
    return src
  }

  const hoisted = new Set<string>()
  for (let outer = 0; src.length > outer; outer++) {
    if (!Object.hasOwn(src, outer)) {
      continue
    }
    const typeNode = src[outer]
    if (typeNode.type !== 'union') {
      continue
    }

    for (let inner = 0; typeNode.of.length > inner; inner++) {
      if (!Object.hasOwn(typeNode.of, inner)) {
        continue
      }
      const subTypeNode = typeNode.of[inner]
      const hash = hashField(subTypeNode)

      const hashSeen = times.get(hash) || 0
      if (hashSeen !== srcLength || hashSeen === 1) {
        continue
      }
      typeNode.of.splice(inner, 1)
      if (!hoisted.has(hash)) {
        src.push(subTypeNode)
        hoisted.add(hash)
      }
    }

    if (typeNode.of.length === 0) {
      src.splice(outer, 1)
    }
  }

  return src
}

export function optimizeUnions(field: TypeNode): TypeNode {
  if (field.type === 'union') {
    field.of = removeDuplicateTypeNodes(field.of)
    field.of = hoistDuplicateTypeNodes(field.of)

    if (field.of.length === 1) {
      return optimizeUnions(field.of[0])
    }

    // optimize sub type nodes in union
    let unionTypeIndex = 0
    let unionTypes = 0
    for (let idx = 0; field.of.length > idx; idx++) {
      const subField = field.of[idx]
      if (subField.type === 'union') {
        unionTypeIndex = idx
        unionTypes++
      }

      field.of[idx] = optimizeUnions(subField)
    }

    // flatten if there is only one union inside a union
    if (unionTypes === 1) {
      const unionType = field.of[unionTypeIndex]
      // this is only to make the type checker happy
      if (unionType.type === 'union') {
        field.of.splice(unionTypeIndex, 1, ...unionType.of)
      }
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
