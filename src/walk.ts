import {type ExprNode, type ParameterNode, type SelectorNode} from './shared/nodeTypes'

// eslint-disable-next-line complexity
export function walkValidateCustomFunction<T extends ExprNode | SelectorNode>(
  node: T,
  functionParameters: ParameterNode[],
  level: number = 0,
): T {
  switch (node.type) {
    case 'Projection': {
      return {
        ...node,
        base: walkValidateCustomFunction(node.base, functionParameters, level),
        expr: walkValidateCustomFunction(node.expr, functionParameters, level + 1),
      }
    }
    case 'Filter': {
      return {
        ...node,
        base: walkValidateCustomFunction(node.base, functionParameters, level),
        expr: walkValidateCustomFunction(node.expr, functionParameters, level + 1),
      }
    }
    case 'Parent': {
      if (level - node.n < 0) {
        throw new Error(
          `Invalid use of parent operator (^). No parent n ${node.n} at level ${level}.`,
        )
      }
      return node
    }

    case 'Parameter': {
      if (functionParameters.find((p) => p.name === node.name)) {
        throw new Error(
          `Function parameters are not allowed outside function declarations: ${node.name}`,
        )
      }
      return node
    }

    case 'Array':
      return {
        ...node,
        elements: node.elements.map((el) => ({
          ...el,
          value: walkValidateCustomFunction(el.value, functionParameters, level),
        })),
      }
    case 'PipeFuncCall': {
      return {
        ...node,
        base: walkValidateCustomFunction(node.base, functionParameters, level),
        args: node.args.map((arg) => walkValidateCustomFunction(arg, functionParameters, level)),
      }
    }

    case 'Object':
      return {
        ...node,
        attributes: node.attributes.map((attr) => {
          switch (attr.type) {
            case 'ObjectAttributeValue':
              return {
                ...attr,
                value: walkValidateCustomFunction(attr.value, functionParameters, level),
              }
            case 'ObjectConditionalSplat':
              return {
                ...attr,
                condition: walkValidateCustomFunction(attr.condition, functionParameters, level),
                value: walkValidateCustomFunction(attr.value, functionParameters, level),
              }
            case 'ObjectSplat':
              return {
                ...attr,
                value: walkValidateCustomFunction(attr.value, functionParameters, level),
              }
            default:
              return attr
          }
        }),
      }

    case 'FlatMap':
    case 'Map': {
      return {
        ...node,
        expr: walkValidateCustomFunction(node.expr, functionParameters, level),
        base: walkValidateCustomFunction(node.base, functionParameters, level),
      }
    }
    case 'FuncCall': {
      return {
        ...node,
        args: node.args.map((arg) => walkValidateCustomFunction(arg, functionParameters, level)),
      }
    }
    case 'Tuple': {
      return {
        ...node,
        members: node.members.map((member) =>
          walkValidateCustomFunction(member, functionParameters, level),
        ),
      }
    }

    case 'Select': {
      const alternatives = node.alternatives.map((alt) => ({
        ...alt,
        condition: walkValidateCustomFunction(alt.condition, functionParameters, level),
        value: walkValidateCustomFunction(alt.value, functionParameters, level),
      }))
      if (node.fallback) {
        return {
          ...node,
          alternatives,
          fallback: walkValidateCustomFunction(node.fallback, functionParameters, level),
        }
      }
      return {
        ...node,
        alternatives,
      }
    }
    case 'SelectorNested':
      return {
        ...node,
        base: walkValidateCustomFunction(node.base, functionParameters, level),
        nested: walkValidateCustomFunction(node.nested, functionParameters, level),
      }
    case 'SelectorFuncCall':
      return {
        ...node,
        arg: walkValidateCustomFunction(node.arg, functionParameters, level),
      }

    case 'AccessAttribute':
    case 'AccessElement':
    case 'ArrayCoerce':
    case 'Asc':
    case 'Desc':
    case 'Deref':
    case 'Group':
    case 'Neg':
    case 'Not':
    case 'Slice':
    case 'Pos': {
      if (!node.base) {
        return node
      }
      return {
        ...node,
        base: walkValidateCustomFunction(node.base, functionParameters, level),
      }
    }

    case 'InRange':
      return {
        ...node,
        base: walkValidateCustomFunction(node.base, functionParameters, level),
        left: walkValidateCustomFunction(node.left, functionParameters, level),
        right: walkValidateCustomFunction(node.right, functionParameters, level),
      }
    case 'OpCall':
    case 'And':
    case 'Or':
      return {
        ...node,
        left: walkValidateCustomFunction(node.left, functionParameters, level),
        right: walkValidateCustomFunction(node.right, functionParameters, level),
      }

    case 'Parameter':
    case 'Everything':
    case 'This':
    case 'Value':
    case 'Context': {
      return node
    }

    default: {
      // @ts-expect-error - we want to ensure we handle all node types
      throw new Error(`Handle all cases: ${node.type}`)
    }
  }
}
