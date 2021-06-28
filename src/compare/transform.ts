import {createNode} from './compare'
import {LogicExprNode} from './compareTypes'
import {ExprNode, AccessAttributeNode, OpCallNode} from '../nodeTypes'
import {hash} from './hash'
import {LogicExprNodeSet} from './LogicExprNodeSet'
import {objectHash} from './objectHash'

export function transform(node: ExprNode): LogicExprNode {
  switch (node.type) {
    case 'Group': {
      return transform(node.base)
    }

    case 'And': {
      return createNode({
        type: 'And',
        children: new LogicExprNodeSet(transform(node.left), transform(node.right)),
      })
    }

    case 'Or': {
      return createNode({
        type: 'Or',
        children: new LogicExprNodeSet(transform(node.left), transform(node.right)),
      })
    }

    case 'Not': {
      return createNode({type: 'Not', child: transform(node.base)})
    }

    case 'OpCall': {
      return transformOpCall(node)
    }

    case 'Value': {
      if (typeof node.value === 'boolean') {
        return {type: 'Literal', hash: node.value ? 'true' : 'false'}
      }

      return {type: 'UnknownExpression', hash: hash(node)}
    }

    default: {
      return {type: 'UnknownExpression', hash: hash(node)}
    }
  }
}

const isAttributeAccessNode = (n: ExprNode): n is AccessAttributeNode =>
  n.type === 'AccessAttribute'

function transformOpCall(node: OpCallNode): LogicExprNode {
  switch (node.op) {
    case '==': {
      if (isAttributeAccessNode(node.left) && isAttributeAccessNode(node.right)) {
        return {
          type: 'MultiVariableEquality',
          groups: [node.left.name, node.right.name].sort((a, b) => a.localeCompare(b, 'en')) as [
            string,
            string
          ],
          hash: hash(node),
        }
      }

      const accessAttributeNode = [node.left, node.right].find(isAttributeAccessNode)

      if (accessAttributeNode) {
        return {
          type: 'SingleVariableEquality',
          group: accessAttributeNode.name,
          hash: hash(node),
        }
      }

      return {
        type: 'UnknownExpression',
        hash: hash(node),
      }
    }

    case '!=': {
      return createNode({
        type: 'Not',
        child: transformOpCall({
          ...node,
          op: '==',
        }),
      })
    }

    case '<':
    case '<=':
    case '>=':
    case '>': {
      // these nodes are normalized such that the group names are sorted in
      // the same order and the inequality is always pointing upward
      if (isAttributeAccessNode(node.left) && isAttributeAccessNode(node.right)) {
        const [first, second] = [node.left.name, node.right.name].sort((a, b) =>
          a.localeCompare(b, 'en')
        )
        const swappedOrder = first !== node.left.name

        if (!swappedOrder && (node.op === '>' || node.op === '>=')) {
          // good | (x > y)
          return {
            type: 'MultiVariableInequality',
            groups: [first, second],
            hash: hash(node),
            inclusive: node.op === '>=',
          }
        }

        if (!swappedOrder && (node.op === '<' || node.op === '<=')) {
          // bad (needs negate) | (y > x) <==> !(x > y)
          return createNode({
            type: 'Not',
            child: {
              type: 'MultiVariableInequality',
              groups: [first, second],
              hash: hash(node),
              inclusive: node.op === '<',
            },
          })
        }

        if (swappedOrder && (node.op === '>' || node.op === '>=')) {
          // bad (needs flip + negate) | (y > x) <==> (x < y) <==> !(x >= y)
          return createNode({
            type: 'Not',
            child: {
              type: 'MultiVariableInequality',
              groups: [first, second],
              hash: hash(node),
              inclusive: node.op === '>',
            },
          })
        }

        // otherwise: !identifierOnLeftHandSide && (node.op === '<' || node.op === '<=')
        // bad (needs flip) | (y < x) <==> (x > y)
        return {
          type: 'MultiVariableInequality',
          groups: [first, second],
          hash: hash(node),
          inclusive: node.op === '<=',
        }
      }

      const accessAttributeNode = [node.left, node.right].find(isAttributeAccessNode)
      const otherNode = node.left === accessAttributeNode ? node.right : node.left

      if (
        accessAttributeNode &&
        otherNode.type === 'Value' &&
        typeof otherNode.value === 'number'
      ) {
        const identifierOnLeftHandSide = accessAttributeNode === node.left

        if (identifierOnLeftHandSide && (node.op === '>' || node.op === '>=')) {
          // good | (x > 0)
          return {
            type: 'SingleVariableInequality',
            group: accessAttributeNode.name,
            value: otherNode.value,
            hash: hash(node),
            inclusive: node.op === '>=',
          }
        }

        if (identifierOnLeftHandSide && (node.op === '<' || node.op === '<=')) {
          // bad (needs negate) | (x < 0) <==> !(x >= 0)
          return createNode({
            type: 'Not',
            child: {
              type: 'SingleVariableInequality',
              group: accessAttributeNode.name,
              value: otherNode.value,
              hash: hash(node),
              inclusive: node.op === '<',
            },
          })
        }

        if (!identifierOnLeftHandSide && (node.op === '>' || node.op === '>=')) {
          // bad (needs flip + negate) | (0 > x) <==> (x < 0) <==> !(x >= 0)
          return createNode({
            type: 'Not',
            child: {
              type: 'SingleVariableInequality',
              group: accessAttributeNode.name,
              value: otherNode.value,
              hash: hash(node),
              inclusive: node.op === '>',
            },
          })
        }

        // otherwise: !identifierOnLeftHandSide && (node.op === '<' || node.op === '<=')
        // bad (needs flip) | (0 < x) <==> (x > 0)
        return {
          type: 'SingleVariableInequality',
          group: accessAttributeNode.name,
          value: otherNode.value,
          hash: hash(node),
          inclusive: node.op === '<=',
        }
      }

      return {type: 'UnknownExpression', hash: hash(node)}
    }

    case 'in': {
      if (node.right.type === 'Array') {
        return createNode({
          type: 'Or',
          children: new LogicExprNodeSet(
            node.right.elements.map((item) =>
              item.isSplat
                ? transformOpCall({
                    type: 'OpCall',
                    op: 'in',
                    left: node.left,
                    right: item.value,
                  })
                : transformOpCall({
                    type: 'OpCall',
                    op: '==',
                    left: node.left,
                    right: item.value,
                  })
            )
          ),
        })
      }

      if (node.right.type === 'Slice') {
        const base = transformOpCall({
          type: 'OpCall',
          op: 'in',
          left: node.left,
          right: node.right.base,
        })

        return createNode({
          type: 'And',
          children: new LogicExprNodeSet(
            base,
            createNode({
              type: 'SingleVariableInequality',
              group: `MembershipSlice_${base.hash}`,
              hash: objectHash(['MembershipSliceLowerBound', base.hash, node.right.left]),
              inclusive: true,
              value: node.right.left,
            }),
            createNode({
              type: 'Not',
              child: createNode({
                type: 'SingleVariableInequality',
                group: `MembershipSlice_${base.hash}`,
                hash: objectHash([
                  'MembershipSliceUpperBound',
                  base.hash,
                  node.right.right,
                  node.right.isInclusive,
                ]),
                // since it's negated, we switch the inclusive flag
                inclusive: !node.right.isInclusive,
                value: node.right.right,
              }),
            })
          ),
        })
      }

      return createNode({
        type: 'And',
        children: new LogicExprNodeSet(
          createNode({
            type: 'UnknownExpression',
            hash: objectHash(['MemberOf', hash(node.right)]),
          }),
          createNode({
            type: 'UnknownExpression',
            hash: objectHash(['MemberValue', hash(node.left)]),
          })
        ),
      })
    }

    default: {
      return {type: 'UnknownExpression', hash: hash(node)}
    }
  }
}
