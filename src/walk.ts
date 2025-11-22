import {type ExprNode, type SelectorNode} from './nodeTypes'

// eslint-disable-next-line complexity
export function walkValidateCustomFunction<T extends ExprNode | SelectorNode>(
  node: T,
  level: number = 0,
): T {
  switch (node.type) {
    case 'Projection': {
      return {
        ...node,
        base: walkValidateCustomFunction(node.base, level),
        expr: walkValidateCustomFunction(node.expr, level + 1),
      }
    }
    case 'Filter': {
      return {
        ...node,
        base: walkValidateCustomFunction(node.base, level),
        expr: walkValidateCustomFunction(node.expr, level + 1),
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
      throw new Error(
        `Function parameters are not allowed outside function declarations: ${node.name}`,
      )
    }

    case 'Array':
      return {
        ...node,
        elements: node.elements.map((el) => ({
          ...el,
          value: walkValidateCustomFunction(el.value, level),
        })),
      }
    case 'PipeFuncCall': {
      return {
        ...node,
        base: walkValidateCustomFunction(node.base, level),
        args: node.args.map((arg) => walkValidateCustomFunction(arg, level)),
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
                value: walkValidateCustomFunction(attr.value, level),
              }
            case 'ObjectConditionalSplat':
              return {
                ...attr,
                condition: walkValidateCustomFunction(attr.condition, level),
                value: walkValidateCustomFunction(attr.value, level),
              }
            case 'ObjectSplat':
              return {
                ...attr,
                value: walkValidateCustomFunction(attr.value, level),
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
        expr: walkValidateCustomFunction(node.expr, level),
        base: walkValidateCustomFunction(node.base, level),
      }
    }
    case 'FuncCall': {
      return {
        ...node,
        args: node.args.map((arg) => walkValidateCustomFunction(arg, level)),
      }
    }
    case 'Tuple': {
      return {
        ...node,
        members: node.members.map((member) => walkValidateCustomFunction(member, level)),
      }
    }

    case 'Select': {
      const alternatives = node.alternatives.map((alt) => ({
        ...alt,
        condition: walkValidateCustomFunction(alt.condition, level),
        value: walkValidateCustomFunction(alt.value, level),
      }))
      if (node.fallback) {
        return {
          ...node,
          alternatives,
          fallback: walkValidateCustomFunction(node.fallback, level),
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
        base: walkValidateCustomFunction(node.base, level),
        nested: walkValidateCustomFunction(node.nested, level),
      }
    case 'SelectorFuncCall':
      return {
        ...node,
        arg: walkValidateCustomFunction(node.arg, level),
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
        base: walkValidateCustomFunction(node.base, level),
      }
    }

    case 'InRange':
      return {
        ...node,
        base: walkValidateCustomFunction(node.base, level),
        left: walkValidateCustomFunction(node.left, level),
        right: walkValidateCustomFunction(node.right, level),
      }
    case 'OpCall':
    case 'And':
    case 'Or':
      return {
        ...node,
        left: walkValidateCustomFunction(node.left, level),
        right: walkValidateCustomFunction(node.right, level),
      }

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
