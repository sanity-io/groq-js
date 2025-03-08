import type {TypeNode} from './types'

const {compare} = new Intl.Collator('en')
function typeNodesSorter(a: TypeNode, b: TypeNode): number {
  if (a.type === 'null') {
    return 1
  }
  return compare(hashField(a), hashField(b))
}

const hashCache = new WeakMap<TypeNode, string>()

export function hashField(field: TypeNode): string {
  if (hashCache.has(field)) {
    return hashCache.get(field)!
  }
  const hash = calculateFieldHash(field)
  hashCache.set(field, hash)
  return hash
}

function calculateFieldHash(field: TypeNode): string {
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
      const attributes = Object.entries(field.attributes)
      attributes.sort(([a], [b]) => compare(a, b)) // sort them by name
      return `${field.type}:(${attributes
        .map(
          ([key, value]) =>
            `${key}:${hashField(value.value)}(${value.optional ? 'optional' : 'non-optional'})`,
        )
        .join(',')}):ref-${field.dereferencesTo}:${field.rest ? hashField(field.rest) : 'no-rest'}`
    }

    case 'union': {
      const sorted = [...field.of]
      sorted.sort(typeNodesSorter)
      return `${field.type}(${sorted.map(hashField).join(',')})`
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

  const sortedTypeNodes = [...typeNodes]
  sortedTypeNodes.sort(typeNodesSorter)

  for (const typeNode of sortedTypeNodes) {
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
    if (field.of.length === 0) {
      return field
    }

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
