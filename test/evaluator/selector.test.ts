import t from 'tap'
import {evaluateSelector} from '../../src/evaluator/selector'
import {Scope} from '../../src/evaluator/scope'
import {type Context} from '../../src/evaluator/types'
import {fromJS} from '../../src/values'
import type {
  AccessAttributeNode,
  ArrayCoerceNode,
  FilterNode,
  GroupNode,
  SelectorFuncCallNode,
  SelectorNestedNode,
  SelectorNode,
  TupleNode,
} from '../../src/nodeTypes'

const dataset = {
  _type: 'foo',
  bar: {_type: 'bar', baz: 1},
  foo: {_type: 'bar', baz: 1, data: {_type: 'bar', baz: 2}},
  dot_attr: 1,
  array_attr: [{expr: 0}, {expr: 1}, {expr: 2}],
  base: {
    nested: [{expr: 0}, {expr: 1}, {expr: 2}],
  },
}
const context: Context = {timestamp: new Date(), identity: 'me', before: null, after: null}
const scope = new Scope({}, fromJS(dataset), fromJS(null), context, null).createHidden(
  fromJS(dataset),
)

t.test('evaluateSelector', async (t) => {
  t.test('attr', async (t) => {
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
      members: [
        {
          type: 'AccessAttribute',
          name: 'tuple1',
        },
        {
          type: 'AccessAttribute',
          name: 'tuple2',
        },
      ],
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, ['tuple1', 'tuple2'])
  })
  t.test('anywhere(_type == "foo")', async (t) => {
    const node: SelectorFuncCallNode = {
      type: 'SelectorFuncCall',
      name: 'anywhere',
      arg: {
        type: 'OpCall',
        left: {type: 'AccessAttribute', name: '_type'},
        right: {type: 'Value', value: 'foo'},
        op: '==',
      },
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, [''])
  })
  t.test('attr.dot_attr', async (t) => {
    const node: AccessAttributeNode<SelectorNode> = {
      type: 'AccessAttribute',
      base: {type: 'AccessAttribute', name: 'attr'},
      name: 'dot_attr',
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, ['attr.dot_attr'])
  })
  t.test('(attr_in_group).dot_attr', async (t) => {
    const node: AccessAttributeNode<SelectorNode> = {
      type: 'AccessAttribute',
      base: {type: 'Group', base: {type: 'AccessAttribute', name: 'attr_in_group'}},
      name: 'dot_attr',
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, ['attr_in_group.dot_attr'])
  })
  t.test('(tuple1, tuple2).dot_attr', async (t) => {
    const node: AccessAttributeNode<SelectorNode> = {
      type: 'AccessAttribute',
      base: {
        type: 'Tuple',
        members: [
          {type: 'AccessAttribute', name: 'tuple1'},
          {type: 'AccessAttribute', name: 'tuple2'},
        ],
      },
      name: 'dot_attr',
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, ['tuple1.dot_attr', 'tuple2.dot_attr'])
  })
  t.test('anywhere(_type == "foo").dot_attr', async (t) => {
    const node: AccessAttributeNode<SelectorNode> = {
      type: 'AccessAttribute',
      name: 'dot_attr',
      base: {
        type: 'SelectorFuncCall',
        name: 'anywhere',
        arg: {
          type: 'OpCall',
          left: {type: 'AccessAttribute', name: '_type'},
          right: {type: 'Value', value: 'foo'},
          op: '==',
        },
      },
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, ['dot_attr'])
  })
  t.test('(attr_in_group).(attr_in_dot_group)', async (t) => {
    const node: SelectorNestedNode = {
      type: 'SelectorNested',
      base: {type: 'Group', base: {type: 'AccessAttribute', name: 'attr_in_group'}},
      nested: {type: 'Group', base: {type: 'AccessAttribute', name: 'attr_in_dot_group'}},
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, ['attr_in_group.attr_in_dot_group'])
  })
  t.test('(tuple1, tuple2).(attr_in_dot_group)', async (t) => {
    const node: SelectorNestedNode = {
      type: 'SelectorNested',
      base: {
        type: 'Tuple',
        members: [
          {type: 'AccessAttribute', name: 'tuple1'},
          {type: 'AccessAttribute', name: 'tuple2'},
        ],
      },
      nested: {type: 'Group', base: {type: 'AccessAttribute', name: 'attr_in_dot_group'}},
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, ['tuple1.attr_in_dot_group', 'tuple2.attr_in_dot_group'])
  })
  t.test('array_attr[]', async (t) => {
    const node: ArrayCoerceNode<SelectorNode> = {
      type: 'ArrayCoerce',
      base: {type: 'AccessAttribute', name: 'array_attr'},
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, ['[0]', '[1]', '[2]'])
  })
  t.test('(array_attr)[]', async (t) => {
    const node: ArrayCoerceNode<SelectorNode> = {
      type: 'ArrayCoerce',
      base: {type: 'Group', base: {type: 'AccessAttribute', name: 'array_attr'}},
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, ['[0]', '[1]', '[2]'])
  })
  t.test('array_attr[expr == 1]', async (t) => {
    const node: FilterNode<SelectorNode> = {
      type: 'Filter',
      base: {type: 'AccessAttribute', name: 'array_attr'},
      expr: {
        type: 'OpCall',
        left: {type: 'AccessAttribute', name: 'expr'},
        right: {type: 'Value', value: 1},
        op: '==',
      },
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, ['[1]'])
  })
  t.test('(attr.dot_attr)', async (t) => {
    const node: GroupNode<SelectorNode> = {
      type: 'Group',
      base: {
        type: 'AccessAttribute',
        base: {type: 'AccessAttribute', name: 'attr'},
        name: 'dot_attr',
      },
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, ['attr.dot_attr'])
  })
  t.test('((tuple1, tuple2).(dot_tuple1, dot_tuple2))', async (t) => {
    const node: GroupNode<SelectorNode> = {
      type: 'Group',
      base: {
        type: 'SelectorNested',
        base: {
          type: 'Tuple',
          members: [
            {type: 'AccessAttribute', name: 'tuple1'},
            {type: 'AccessAttribute', name: 'tuple2'},
          ],
        },
        nested: {
          type: 'Tuple',
          members: [
            {type: 'AccessAttribute', name: 'dot_tuple1'},
            {type: 'AccessAttribute', name: 'dot_tuple2'},
          ],
        },
      },
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, [
      'tuple1.dot_tuple1',
      'tuple1.dot_tuple2',
      'tuple2.dot_tuple1',
      'tuple2.dot_tuple2',
    ])
  })
  t.test('base.nested[]', async (t) => {
    const node: SelectorNestedNode = {
      type: 'SelectorNested',
      base: {type: 'AccessAttribute', name: 'base'},
      nested: {type: 'ArrayCoerce', base: {type: 'AccessAttribute', name: 'nested'}},
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, ['base.nested[0]', 'base.nested[1]', 'base.nested[2]'])
  })
  t.test('base.nested[expr > 0]', async (t) => {
    const node: SelectorNestedNode = {
      type: 'SelectorNested',
      base: {type: 'AccessAttribute', name: 'base'},
      nested: {
        type: 'Filter',
        base: {type: 'AccessAttribute', name: 'nested'},
        expr: {
          type: 'OpCall',
          left: {type: 'AccessAttribute', name: 'expr'},
          right: {type: 'Value', value: 0},
          op: '>',
        },
      },
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, ['base.nested[1]', 'base.nested[2]'])
  })
  t.test('foo.(anywhere(_type == "bar")).baz', async (t) => {
    const node: SelectorNestedNode = {
      type: 'SelectorNested',
      base: {type: 'AccessAttribute', name: 'foo'},
      nested: {
        type: 'AccessAttribute',
        name: 'baz',
        base: {
          type: 'Group',
          base: {
            type: 'SelectorFuncCall',
            name: 'anywhere',
            arg: {
              type: 'OpCall',
              left: {type: 'AccessAttribute', name: '_type'},
              right: {type: 'Value', value: 'bar'},
              op: '==',
            },
          },
        },
      },
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, ['foo.baz', 'foo.data.baz'])
  })
})
