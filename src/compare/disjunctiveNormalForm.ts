import {LogicExprNode, LogicExprNodeMiddleware} from './compareTypes'
import {createNode} from './compare'
import {withMemoization} from './utils'
import {simplify} from './simplify'
import {LogicExprNodeSet} from './LogicExprNodeSet'

const withSimplify: LogicExprNodeMiddleware = (fn) => (node) => simplify(fn(node))

export const disjunctiveNormalForm = withMemoization(
  withSimplify((node) => {
    if (node.type === 'And') {
      const children = node.children.map(disjunctiveNormalForm)
      const firstOrChild = Array.from(children).find(
        (n): n is Extract<LogicExprNode, {type: 'Or'}> => n.type === 'Or'
      )

      if (!firstOrChild) return createNode({type: 'And', children})

      const next = children.clone()
      next.delete(firstOrChild)
      const [first, ...rest] = Array.from(next)

      const result: LogicExprNode = createNode({
        type: 'Or',
        children: firstOrChild.children.map((orChild) =>
          createNode({
            type: 'And',
            children: new LogicExprNodeSet(orChild, first),
          })
        ),
      })

      if (!rest.length) return disjunctiveNormalForm(result)

      return disjunctiveNormalForm(
        createNode({
          type: 'And',
          children: new LogicExprNodeSet(result, rest),
        })
      )
    }

    if (node.type === 'Or') {
      return createNode({
        type: 'Or',
        children: node.children.map(disjunctiveNormalForm),
      })
    }

    if (node.type === 'Not' && (node.child.type === 'Or' || node.child.type === 'And')) {
      // @ts-expect-error TODO write comment
      return createNode({
        type: node.child.type === 'Or' ? 'And' : 'Or',
        children: node.child.children.map((n) =>
          disjunctiveNormalForm(createNode({type: 'Not', child: n}))
        ),
      })
    }

    return node
  })
)
