import {LogicExprNode} from './compareTypes'
import {parse} from '../parser'
import {objectHash, unorderedHash} from './objectHash'
import {simplify} from './simplify'
import {transform} from './transform'
import {createInequalityFormula} from './createInequalityFormula'
import {LogicExprNodeSet} from './LogicExprNodeSet'

function arrayEquals(a: any[], b: any[]) {
  if (a.length !== b.length) return false
  return a.every((ai, index) => ai === b[index])
}

type X = 'And' | 'Or' | 'Not'
type Y = {
  [P in LogicExprNode['type']]: P extends X
    ? Omit<Extract<LogicExprNode, {type: P}>, 'hash'>
    : LogicExprNode
}
type Z = Y[keyof Y]

export function createNode(node: Z): LogicExprNode {
  if (node.type === 'And') {
    return {
      ...node,
      hash: objectHash(['And', unorderedHash(Array.from(node.children).map((i) => i.hash))]),
    }
  }
  if (node.type === 'Or') {
    return {
      ...node,
      hash: objectHash(['Or', unorderedHash(Array.from(node.children).map((i) => i.hash))]),
    }
  }
  if (node.type === 'Not') return {...node, hash: objectHash(['Not', node.child.hash])}
  return node
}

export function hashify(node: any): LogicExprNode {
  switch (node.type) {
    case 'And':
    case 'Or': {
      return createNode({
        ...node,
        children: new LogicExprNodeSet(Array.from(node.children).map(hashify)),
      })
    }
    case 'Not': {
      return createNode({...node, child: hashify(node.not)})
    }
    default: {
      return createNode(node)
    }
  }
}

export function generate(node: LogicExprNode): string {
  if (node.type === 'And') {
    return `(${Array.from(node.children)
      .map(generate)
      .sort((a, b) => a.localeCompare(b, 'en'))
      .join(' and ')})`
  }
  if (node.type === 'Or') {
    return `(${Array.from(node.children)
      .map(generate)
      .sort((a, b) => a.localeCompare(b, 'en'))
      .join(' or ')})`
  }
  if (node.type === 'Not') {
    return `!(${generate(node.child)})`
  }

  if (node.type === 'SingleVariableInequality') {
    return `${node.group} ${node.inclusive ? '≥' : '>'} ${node.value}`
  }

  if (node.type === 'MultiVariableInequality') {
    return `${node.groups[0]} ${node.inclusive ? '≥' : '>'} ${node.groups[1]}`
  }

  return node.hash
}

function evaluate(expression: LogicExprNode, interpretation: Set<string>): boolean {
  switch (expression.type) {
    case 'And': {
      return Array.from(expression.children).every((i) => evaluate(i, interpretation))
    }
    case 'Or': {
      return Array.from(expression.children).some((i) => evaluate(i, interpretation))
    }
    case 'Not': {
      return !evaluate(expression.child, interpretation)
    }
    case 'Literal': {
      return expression.hash === 'true'
    }
    default: {
      return interpretation.has(expression.hash)
    }
  }
}

function compare(treeA: LogicExprNode, treeB: LogicExprNode) {
  const variables = new Map<string, Extract<LogicExprNode, {hash: string}>>()
  const constrainedVariableMap = new Map<string, Set<string>>()

  function findHashes(n: LogicExprNode) {
    if (n.type === 'And') {
      for (const i of n.children) findHashes(i)
      return
    }

    if (n.type === 'Or') {
      for (const i of n.children) findHashes(i)
      return
    }

    if (n.type === 'Not') {
      findHashes(n.child)
      return
    }

    if (n.type === 'Literal') {
      return
    }

    variables.set(n.hash, n)

    if (n.type === 'SingleVariableEquality') {
      const set = constrainedVariableMap.get(n.group) || new Set()
      set.add(n.hash)
      constrainedVariableMap.set(n.group, set)
    }

    // TODO:
    // if (n.type === 'MultiVariableEquality') {
    //   for (const group of n.groups) {
    //     const set = constrainedVariableMap.get(group) || new Set()
    //     set.add(n.hash)
    //     constrainedVariableMap.set(group, set)
    //   }
    // }
  }

  findHashes(treeA)
  findHashes(treeB)

  const constrainedVariableSets = Array.from(constrainedVariableMap.values()).filter(
    (i) => i.size > 1
  )

  const constrainedVariableSet = new Set(
    constrainedVariableSets
      .map((set) => Array.from(set))
      .reduce<string[]>((flattened, next) => {
        for (const i of next) flattened.push(i)
        return flattened
      }, [])
  )
  const unconstrainedVariables = Array.from(variables.keys()).filter(
    (variable) => !constrainedVariableSet.has(variable)
  )

  function generateInterpretations([first, ...rest]: Set<string>[]): Set<string>[] {
    const interpretations: Set<string>[] = []

    if (!first) {
      if (!unconstrainedVariables.length) return [new Set()]

      for (let i = 0; i < 2 ** unconstrainedVariables.length; i++) {
        const state = new Set<string>()

        // TODO
        const currentUnconstrainedState = i
          .toString(2)
          .padStart(unconstrainedVariables.length, '0')
          .split('')
          .map((i) => i === '1')

        for (let j = 0; j < currentUnconstrainedState.length; j++) {
          const value = currentUnconstrainedState[j]
          const variable = unconstrainedVariables[j]

          if (value) {
            state.add(variable)
          }
        }

        interpretations.push(state)
      }

      return interpretations
    }

    const currentConstraint = Array.from(first)
    const result = generateInterpretations(rest)

    for (let i = -1; i < currentConstraint.length; i++) {
      const constrainedVariable = i === -1 ? null : currentConstraint[i]

      for (let j = 0; j < result.length; j++) {
        const state = new Set(result[j])

        if (constrainedVariable) {
          state.add(constrainedVariable)
        }

        interpretations.push(state)
      }
    }

    return interpretations
  }

  const interpretations = generateInterpretations(constrainedVariableSets)

  const inequalityFormula = createInequalityFormula(
    createNode({
      type: 'Or',
      children: new LogicExprNodeSet(treeA, treeB),
    })
  )

  const treeAWithInequalities = createNode({
    type: 'And',
    children: new LogicExprNodeSet(inequalityFormula, treeA),
  })
  const treeBWithInequalities = createNode({
    type: 'And',
    children: new LogicExprNodeSet(inequalityFormula, treeB),
  })

  const interpretationsA = interpretations.map((truthTable) =>
    evaluate(treeAWithInequalities, truthTable)
  )
  const interpretationsB = interpretations.map((truthTable) =>
    evaluate(treeBWithInequalities, truthTable)
  )

  if (arrayEquals(interpretationsA, interpretationsB)) return 'equal'

  const intersectionWithInequalities = simplify(
    createNode({
      type: 'And',
      children: new LogicExprNodeSet(
        createNode({
          type: 'And',
          children: new LogicExprNodeSet(treeA, treeB),
        }),
        inequalityFormula
      ),
    })
  )

  const interpretationsAB = interpretations.map((truthTable) =>
    evaluate(intersectionWithInequalities, truthTable)
  )

  if (interpretationsAB.every((i) => !i)) return 'disjoint'
  if (arrayEquals(interpretationsAB, interpretationsA)) return 'subset'
  if (arrayEquals(interpretationsAB, interpretationsB)) return 'superset'
  return 'overlap'
}

function exportedCompare(a: string, b: string) {
  return compare(transform(parse(a)), transform(parse(b)))
}

export {exportedCompare as compare}
