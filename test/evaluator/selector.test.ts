import t from 'tap'
import {evaluateSelector} from '../../src/evaluator/selector'
import {Scope} from '../../src/evaluator/scope'
import {type Context} from '../../src/evaluator/types'
import {fromJS} from '../../src/values'
import type {AccessAttributeNode, GroupNode, SelectorFuncCallNode, SelectorNode, TupleNode} from '../../src/nodeTypes'

const dataset = [{
  _type: "foo",
  foo: {
    bar: 1
  }
}]
const context: Context = {timestamp: new Date(), identity: 'me', before: null, after: null}
const scope = new Scope({}, fromJS(dataset), fromJS(null), context, null).createHidden(fromJS(dataset))

t.test('evaluateSelector', async (t) => {
  t.test('attr', async (t) => {
    // Selector: attr
    const node: AccessAttributeNode<SelectorNode> = {
      type: 'AccessAttribute',
      name: 'attr',
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, ['attr'])
  })
  t.test('attr in group', async (t) => {
    // Selector: (attr)
    const node: GroupNode<AccessAttributeNode<SelectorNode>> = {
      type: 'Group',
      base: {
        type: 'AccessAttribute',
        name: 'attr',
      },
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, ['attr'])
  })
  t.test('tuple', async (t) => {
    // Selector: (tuple1, tuple2)
    const node: TupleNode<AccessAttributeNode<SelectorNode>> = {
      type: 'Tuple',
      members: [{
        type: 'AccessAttribute',
        name: 'tuple1',
      }, {
        type: 'AccessAttribute',
        name: 'tuple2',
      }],
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, ['tuple1', 'tuple2'])
  })
  t.test('anywhere(_type == "foo")', async (t) => {
    // Selector: anywhere(_type == 'foo')
    const node: SelectorFuncCallNode = {
      type: 'SelectorFuncCall',
      name: 'anywhere',
      arg: {
        type: 'OpCall',
        left: {type: 'AccessAttribute', name: '_type'},
        right: {type: 'Value', value: 'foo'},
        op: '=='
      }
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, ['[0]'])
  })
  t.test('attr.dot_attr', async (t) => {
    // Selector: attr.dot_attr
    const node: AccessAttributeNode<SelectorNode> = {
      type: 'AccessAttribute',
      base: {type: 'AccessAttribute', name: 'attr'},
      name: 'dot_attr'
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, ['attr.dot_attr'])
  })
})
