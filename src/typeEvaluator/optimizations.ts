import {isDateTime} from './typeHelpers'
import type {InlineTypeNode, ObjectTypeNode, TypeNode, UnionTypeNode} from './types'

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
    case 'number':
    case 'boolean': {
      if (field.value !== undefined) {
        return `${field.type}(${field.value})`
      }

      return `${field.type}`
    }

    case 'string':
      if (isDateTime(field) && field.value !== undefined) {
        return `${field.type}(${field.value}):datetime`
      }

      if (isDateTime(field)) {
        return `${field.type}:datetime`
      }

      if (field.value !== undefined) {
        return `${field.type}(${field.value})`
      }

      return `${field.type}`

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
      mergeDuplicateTypeNodeMetadata(newTypeNodes, hash, typeNode)
      continue
    }

    seenTypes.add(hash)
    newTypeNodes.push(typeNode)
  }

  return newTypeNodes
}

function mergeDuplicateTypeNodeMetadata(
  typeNodes: TypeNode[],
  hash: string,
  duplicate: TypeNode,
): void {
  if (duplicate.type !== 'inline' && duplicate.type !== 'object' && duplicate.type !== 'union') {
    return
  }

  const existing = typeNodes.find((typeNode) => hashField(typeNode) === hash)
  if (duplicate.type === 'inline' && existing?.type === 'inline') {
    mergeInlineMetadata(existing, duplicate)
    return
  }

  if (duplicate.type === 'union' && existing?.type === 'union') {
    mergeUnionMetadata(existing, duplicate)
    return
  }

  if (duplicate.type === 'object' && existing?.type === 'object') {
    mergeObjectMetadata(existing, duplicate)
  }
}

function mergeUnionMetadata(target: UnionTypeNode, source: UnionTypeNode): void {
  if (!target.name && source.name) {
    target.name = source.name
  }

  const declaredOf = mergeTypeNodeListMetadata(target.declaredOf, source.declaredOf)
  if (declaredOf !== undefined) {
    target.declaredOf = declaredOf
  }

  const declaredTo = mergeTypeNodeListMetadata(target.declaredTo, source.declaredTo)
  if (declaredTo !== undefined) {
    target.declaredTo = declaredTo
  }
}

function mergeObjectMetadata(target: ObjectTypeNode, source: ObjectTypeNode): void {
  const declaredTo = mergeTypeNodeListMetadata(target.declaredTo, source.declaredTo)
  if (declaredTo !== undefined) {
    target.declaredTo = declaredTo
  }
}

function mergeInlineMetadata(target: InlineTypeNode, source: InlineTypeNode): void {
  const declaredTo = mergeTypeNodeListMetadata(target.declaredTo, source.declaredTo)
  if (declaredTo !== undefined) {
    target.declaredTo = declaredTo
  }
}

function mergeTypeNodeListMetadata<T extends TypeNode>(
  target: T[] | undefined,
  source: T[] | undefined,
): T[] | undefined {
  if (source === undefined) {
    return target
  }

  if (target === undefined) {
    return source
  }

  const seen = new Set(target.map(hashField))
  const merged = [...target]

  for (const sourceNode of source) {
    const hash = hashField(sourceNode)
    if (seen.has(hash)) {
      continue
    }

    seen.add(hash)
    merged.push(sourceNode)
  }

  return merged
}

function unionHasMetadata(field: UnionTypeNode): boolean {
  return Boolean(field.name || field.declaredOf || field.declaredTo)
}

function declaredOfForUnionMember(field: TypeNode): TypeNode[] {
  if (field.type !== 'union') {
    return [field]
  }

  if (field.name) {
    return [{type: 'inline', name: field.name}]
  }

  if (field.declaredOf) {
    return field.declaredOf
  }

  return field.of
}

function shouldCollectDeclaredOf(field: UnionTypeNode): boolean {
  return field.of.some((member) => member.type === 'union' && unionHasMetadata(member))
}

function declaredToForUnionMember(field: TypeNode): InlineTypeNode[] {
  if (field.type !== 'inline' && field.type !== 'object' && field.type !== 'union') {
    return []
  }

  return field.declaredTo ?? []
}

function collectDeclaredTo(field: UnionTypeNode): InlineTypeNode[] | undefined {
  const declaredTo = field.of.flatMap(declaredToForUnionMember)

  return declaredTo.length > 0 ? declaredTo : undefined
}

export function optimizeUnions(field: TypeNode): TypeNode {
  if (field.type === 'union') {
    if (field.of.length === 0) {
      return field
    }

    if (!field.declaredOf && shouldCollectDeclaredOf(field)) {
      field.declaredOf = field.of.flatMap(declaredOfForUnionMember)
    }

    const declaredTo = mergeTypeNodeListMetadata(field.declaredTo, collectDeclaredTo(field))
    if (declaredTo !== undefined) {
      field.declaredTo = declaredTo
    }

    const flattened: TypeNode[] = []

    for (const member of field.of) {
      const subField = optimizeUnions(member)
      if (subField.type === 'union') {
        flattened.push(...subField.of)
        continue
      }

      flattened.push(subField)
    }

    field.of = removeDuplicateTypeNodes(flattened)

    if (field.of.length === 1 && !unionHasMetadata(field)) {
      return optimizeUnions(field.of[0]!)
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

      const attribute = field.attributes[idx]
      if (!attribute) {
        continue
      }

      attribute.value = optimizeUnions(attribute.value)
    }
    return field
  }

  return field
}
