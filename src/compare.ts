import {parse} from './parser'
import {ExprNode, OrNode} from './nodeTypes'

function isExprNode(value: unknown): value is ExprNode {
  if (typeof value !== 'object') return false
  if (!value) return false
  return 'type' in value
}

function normalizeUnknown(value: unknown): unknown {
  if (typeof value !== 'object') return value
  if (!value) return value

  if (Array.isArray(value)) {
    return value.map((item) => (isExprNode(item) ? normalize(item) : normalizeUnknown(item)))
  }

  return Object.entries(value)
    .map(([k, v]) => [k, isExprNode(v) ? normalize(v) : normalizeUnknown(v)] as const)
    .reduce<Record<string, unknown>>((acc, [key, value]) => {
      acc[key] = value
      return acc
    }, {})
}

function normalize(node: ExprNode): ExprNode {
  if (node.type === 'Group') return normalize(node.base)
  if (node.type !== 'OpCall') return normalizeUnknown(node) as ExprNode

  switch (node.op) {
    case 'in': {
      const {right} = node

      // e.g. `_type in ['book', 'movie']`
      if (
        right.type === 'Array' &&
        right.elements.every((element) => !element.isSplat) &&
        right.elements.length > 0
      ) {
        const [firstElement, ...restOfElements] = right.elements

        const firstOr: OrNode = {
          type: 'Or',
          left: {type: 'Value', value: false},
          right: normalize({
            type: 'OpCall',
            op: '==',
            left: node.left,
            right: firstElement.value,
          }),
        }

        return restOfElements.reduce(
          (acc, next) => ({
            type: 'Or',
            left: acc,
            right: normalize({
              type: 'OpCall',
              op: '==',
              left: node.left,
              right: next.value,
            }),
          }),
          firstOr
        )
      }

      return {
        ...node,
        left: normalize(node.left),
        right: normalize(node.right),
      }
    }

    case '!=': {
      return {
        type: 'Not',
        base: normalize({
          type: 'OpCall',
          op: '==',
          left: node.left,
          right: node.right,
        }),
      }
    }

    case '<': {
      return normalize({
        type: 'OpCall',
        op: '>',
        left: node.right,
        right: node.left,
      })
    }

    case '<=': {
      return normalize({
        type: 'OpCall',
        op: '>=',
        left: node.right,
        right: node.left,
      })
    }

    default: {
      return {
        ...node,
        left: normalize(node.left),
        right: normalize(node.right),
      }
    }
  }
}

// https://github.com/darkskyapp/string-hash/blob/cb38ab492aba198b9658b286bb2391278bb6992b/index.js
function stringHash(str: string) {
  let hash = 5381
  let i = str.length
  while (i) hash = (hash * 33) ^ str.charCodeAt(--i)
  return (hash >>> 0).toString(36)
}

/**
 * a very simple object hash function. designed for low churn but not meant to be perfect
 */
function hash(obj: unknown): string {
  if (typeof obj !== 'object') return stringHash(`__${typeof obj}_${obj}`)
  if (obj === null) return stringHash(`__null_${obj}`)
  if (Array.isArray(obj)) return hash(obj.map(hash).join('_'))
  return hash(
    Object.entries(obj)
      .map(([k, v]) => [k, hash(v)])
      .sort(([a], [b]) => a.toString().localeCompare(b.toString(), 'en'))
  )
}

function arrayEquals(a: any[], b: any[]) {
  if (a.length !== b.length) return false
  return a.every((ai, index) => ai === b[index])
}

type BooleanNode =
  | {type: 'And'; and: BooleanNode[]}
  | {type: 'Or'; or: BooleanNode[]}
  | {type: 'Not'; not: BooleanNode}
  | {type: 'Literal'; value: boolean}
  | {type: 'Leaf'; hash: string; groupHash: string | null}

function transform(node: ExprNode): BooleanNode {
  if (node.type === 'And') return {type: 'And', and: [transform(node.left), transform(node.right)]}
  if (node.type === 'Or') return {type: 'Or', or: [transform(node.left), transform(node.right)]}
  if (node.type === 'Not') return {type: 'Not', not: transform(node.base)}

  if (node.type === 'Value' && typeof node.value === 'boolean') {
    return {type: 'Literal', value: node.value}
  }

  const groupHash = (() => {
    if (node.type !== 'OpCall') return null
    if (node.left.type !== 'AccessAttribute') return null
    return node.left.name
  })()

  return {
    type: 'Leaf',
    hash: hash(node),
    groupHash,
  }
}

function compare(a: ExprNode, b: ExprNode) {
  const treeA = transform(a)
  const treeB = transform(b)

  const hashes = new Set<string>()
  const groupHashes = new Map<string, Set<string>>()

  function findHashes(n: BooleanNode) {
    if (n.type === 'And') {
      for (const i of n.and) findHashes(i)
      return
    }

    if (n.type === 'Or') {
      for (const i of n.or) findHashes(i)
      return
    }

    if (n.type === 'Not') {
      findHashes(n.not)
      return
    }

    if (n.type === 'Literal') {
      return
    }

    hashes.add(n.hash)

    if (n.groupHash) {
      const set = groupHashes.get(n.groupHash) || new Set()
      set.add(n.hash)
      groupHashes.set(n.groupHash, set)
    }
  }

  findHashes(treeA)
  findHashes(treeB)

  const states: number[] = []
  const orderedHashes = Array.from(hashes).sort((a, b) => a.localeCompare(b, 'en'))

  const hashIndexMap = orderedHashes.reduce<{[hash: string]: number}>((acc, next, index) => {
    acc[next] = index
    return acc
  }, {})

  const masks = Array.from(groupHashes.values())
    .filter((hashes) => hashes.size > 1)
    .map((hashes) =>
      Array.from(hashes)
        .map((hash) => hashIndexMap[hash])
        .reduce((acc, next) => acc + 2 ** next, 0)
    )

  const isValid = (x: number) =>
    masks.every((mask) => {
      const result = x & mask
      return (result & (result - 1)) === 0
    })

  // 2^n… oof
  for (let i = 0; i < 2 ** hashes.size; i++) {
    if (isValid(i)) {
      states.push(i)
    }
  }

  function evaluate(tree: BooleanNode, truthTable: number): boolean {
    if (tree.type === 'And') return tree.and.every((i) => evaluate(i, truthTable))
    if (tree.type === 'Or') return tree.or.some((i) => evaluate(i, truthTable))
    if (tree.type === 'Not') return !evaluate(tree.not, truthTable)
    if (tree.type === 'Literal') return tree.value
    const index = hashIndexMap[tree.hash]

    return ((2 ** index) & truthTable) !== 0
  }

  const truthTableA = states.map((truthTable) => evaluate(treeA, truthTable))
  const truthTableB = states.map((truthTable) => evaluate(treeB, truthTable))
  if (arrayEquals(truthTableA, truthTableB)) return 'equal'

  const intersection = states.map((truthTable) =>
    evaluate({type: 'And', and: [treeA, treeB]}, truthTable)
  )
  if (intersection.every((i) => !i)) return 'disjoint'

  if (arrayEquals(intersection, truthTableA)) return 'subset'
  if (arrayEquals(intersection, truthTableB)) return 'superset'

  return 'overlap'
}

function exportedCompare(a: string, b: string) {
  return compare(normalize(parse(a)), normalize(parse(b)))
}

export {exportedCompare as compare}
