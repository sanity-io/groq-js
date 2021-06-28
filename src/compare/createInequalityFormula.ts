import {LogicExprNode} from './compareTypes'
import {LogicExprNodeSet} from './LogicExprNodeSet'
import {disjunctiveNormalForm} from './disjunctiveNormalForm'
import {createNode} from './compare'
import {simplify} from './simplify'

type InequalityNode = Extract<
  LogicExprNode,
  {
    type: 'SingleVariableInequality' | 'MultiVariableInequality' | 'SingleVariableNumericEquality'
  }
>

type NumberNode = Extract<
  LogicExprNode,
  {type: 'SingleVariableInequality' | 'SingleVariableNumericEquality'}
>

interface InequalityDeduction {
  inclusive: boolean
  path: LogicExprNode[]
  group: string
  value: number
}

function connectPath(
  prevGroup: string,
  path: InequalityNode[]
): {inclusive: boolean; path: LogicExprNode[]} {
  const [node, ...rest] = path

  if (node.type === 'SingleVariableNumericEquality') {
    return {inclusive: true, path: [node]}
  }

  if (node.type === 'SingleVariableInequality') {
    return {inclusive: node.inclusive, path: [node]}
  }

  if (node.type === 'MultiVariableInequality') {
    if (prevGroup === node.groups[0]) {
      const next = connectPath(node.groups[1], rest)
      return {inclusive: node.inclusive && next.inclusive, path: [node, ...next.path]}
    }

    const next = connectPath(node.groups[0], rest)

    return {
      inclusive: !node.inclusive && next.inclusive,
      path: [createNode({type: 'Not', child: node}), ...next.path],
    }
  }

  throw new Error()
}

export function findInequalityTruths(
  clause: Extract<LogicExprNode, {type: 'And'}>
): InequalityDeduction[] {
  const nodesByValues = new Map<number, LogicExprNodeSet<NumberNode>>()
  const nodesByGroup = new Map<string, LogicExprNodeSet<InequalityNode>>()

  function findNodes(node: LogicExprNode) {
    if ('children' in node) {
      for (const child of node.children) {
        findNodes(child)
      }
    }

    if ('child' in node) {
      findNodes(node.child)
    }

    if (node.type === 'SingleVariableInequality') {
      const valueSet = nodesByValues.get(node.value) || new LogicExprNodeSet()
      valueSet.add(node)
      nodesByValues.set(node.value, valueSet)

      const map = nodesByGroup.get(node.group) || new LogicExprNodeSet()
      map.add(node)
      nodesByGroup.set(node.group, map)
    }

    if (node.type === 'MultiVariableInequality') {
      for (const group of node.groups) {
        const map = nodesByGroup.get(group) || new LogicExprNodeSet()
        map.add(node)
        nodesByGroup.set(group, map)
      }
    }

    if (node.type === 'SingleVariableNumericEquality') {
      const numberNodeSet = nodesByValues.get(node.value) || new LogicExprNodeSet()
      numberNodeSet.add(node)
      nodesByValues.set(node.value, numberNodeSet)
    }
  }

  function createFindPath(goalNumber: number) {
    const visited = new LogicExprNodeSet()

    function findPath(prevGroup: string, node: InequalityNode): Array<InequalityNode> | null {
      if (visited.has(node)) return null
      visited.add(node)

      switch (node.type) {
        case 'SingleVariableInequality':
        case 'SingleVariableNumericEquality': {
          if (node.value === goalNumber) return [node]
          return null
        }
        case 'MultiVariableInequality': {
          const nextGroup = prevGroup === node.groups[0] ? node.groups[1] : node.groups[0]
          const nextStuff = nodesByGroup.get(nextGroup) || new LogicExprNodeSet()

          for (const beep of nextStuff) {
            const found = findPath(nextGroup, beep)
            if (found) return [node, ...found]
          }
          return null
        }
        default: {
          return null
        }
      }
    }

    return findPath
  }

  findNodes(clause)

  return Array.from(nodesByGroup.keys())
    .flatMap((group) => {
      const allNodesOfThisGroup = nodesByGroup.get(group) || new LogicExprNodeSet()
      const targetValues = Array.from(nodesByValues.keys())

      const foundPathsPerTargetValue = targetValues.map((targetValue) => {
        for (const nodeOfThisGroup of allNodesOfThisGroup) {
          const findPathToTargetValue = createFindPath(targetValue)

          const path = findPathToTargetValue(group, nodeOfThisGroup)
          if (path) return {group, targetValue, path}
        }

        return null
      })

      return foundPathsPerTargetValue
    })
    .filter(<T>(t: T): t is NonNullable<T> => !!t)
    .map(({group, targetValue, path}) => ({
      group,
      value: targetValue,
      ...connectPath(group, path),
    }))
}

export function createInequalityFormula(inputNode: LogicExprNode) {
  const dnf = disjunctiveNormalForm(inputNode)

  const inequalityTruths =
    dnf.type === 'Or'
      ? Array.from(dnf.children)
          .filter((n): n is Extract<LogicExprNode, {type: 'And'}> => n.type === 'And')
          .flatMap(findInequalityTruths)
      : dnf.type === 'And'
      ? findInequalityTruths(dnf)
      : []

  const inequalityTruthsGrouped = inequalityTruths.reduce<Map<string, InequalityDeduction[]>>(
    (acc, next) => {
      const arr = acc.get(next.group) || []
      arr.push(next)
      acc.set(next.group, arr)
      return acc
    },
    new Map()
  )

  const ifThenNodes = Array.from(inequalityTruthsGrouped.values()).flatMap(
    (inequalityDeduction) => {
      const inequalityNodes = inequalityDeduction
        .map(({path, ...rest}) => ({
          ...rest,
          node: createNode({
            type: 'And',
            children: new LogicExprNodeSet(path),
          }),
        }))
        .sort((a, b) => b.value + (b.inclusive ? 0 : 0.5) - (a.value + (a.inclusive ? 0 : 0.5)))

      return inequalityNodes.slice(0, inequalityNodes.length - 1).map((node, index) => {
        const ifNode = createNode({type: 'Not', child: node.node})

        const thenNode = createNode({
          type: 'And',
          children: new LogicExprNodeSet(
            inequalityNodes
              .slice(index + 1)
              // don't add the rule if the node and value are exactly the same
              .filter((n) => !(n.value === node.value && n.inclusive === node.inclusive))
              .map((n) => n.node)
          ),
        })

        return createNode({
          type: 'Or',
          children: new LogicExprNodeSet(ifNode, thenNode),
        })
      })
    }
  )

  return simplify(
    createNode({
      type: 'And',
      children: new LogicExprNodeSet(ifThenNodes),
    })
  )
}
