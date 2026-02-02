import t from 'tap'

import {Scope} from '../../src/evaluator/scope'
import {evaluateSelector} from '../../src/evaluator/selector'
import {type Context} from '../../src/evaluator/types'
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
import {fromJS} from '../../src/values'

const dataset = {
  _type: 'foo',
  bar: {_type: 'bar', baz: 1},
  foo: {_type: 'bar', baz: 1, data: {_type: 'bar', baz: 2}},
  dotAttr: 1,
  arrayAttr: [{expr: 0}, {expr: 1}, {expr: 2}],
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

    t.match(result, [['attr']])
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

    t.match(result, [['attr']])
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

    t.match(result, [['tuple1'], ['tuple2']])
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

    t.match(result, [[]])
  })
  t.test('attr.dotAttr', async (t) => {
    const node: AccessAttributeNode<SelectorNode> = {
      type: 'AccessAttribute',
      base: {type: 'AccessAttribute', name: 'attr'},
      name: 'dotAttr',
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, [['attr', 'dotAttr']])
  })
  t.test('(attr_in_group).dotAttr', async (t) => {
    const node: AccessAttributeNode<SelectorNode> = {
      type: 'AccessAttribute',
      base: {type: 'Group', base: {type: 'AccessAttribute', name: 'attr_in_group'}},
      name: 'dotAttr',
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, [['attr_in_group', 'dotAttr']])
  })
  t.test('(tuple1, tuple2).dotAttr', async (t) => {
    const node: AccessAttributeNode<SelectorNode> = {
      type: 'AccessAttribute',
      base: {
        type: 'Tuple',
        members: [
          {type: 'AccessAttribute', name: 'tuple1'},
          {type: 'AccessAttribute', name: 'tuple2'},
        ],
      },
      name: 'dotAttr',
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, [
      ['tuple1', 'dotAttr'],
      ['tuple2', 'dotAttr'],
    ])
  })
  t.test('anywhere(_type == "foo").dotAttr', async (t) => {
    const node: AccessAttributeNode<SelectorNode> = {
      type: 'AccessAttribute',
      name: 'dotAttr',
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

    t.match(result, [['dotAttr']])
  })
  t.test('(attr_in_group).(attr_in_dot_group)', async (t) => {
    const node: SelectorNestedNode = {
      type: 'SelectorNested',
      base: {type: 'Group', base: {type: 'AccessAttribute', name: 'attr_in_group'}},
      nested: {type: 'Group', base: {type: 'AccessAttribute', name: 'attr_in_dot_group'}},
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, [['attr_in_group', 'attr_in_dot_group']])
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

    t.match(result, [
      ['tuple1', 'attr_in_dot_group'],
      ['tuple2', 'attr_in_dot_group'],
    ])
  })
  t.test('arrayAttr[]', async (t) => {
    const node: ArrayCoerceNode<SelectorNode> = {
      type: 'ArrayCoerce',
      base: {type: 'AccessAttribute', name: 'arrayAttr'},
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, [
      ['arrayAttr', 0],
      ['arrayAttr', 1],
      ['arrayAttr', 2],
    ])
  })
  t.test('(arrayAttr)[]', async (t) => {
    const node: ArrayCoerceNode<SelectorNode> = {
      type: 'ArrayCoerce',
      base: {type: 'Group', base: {type: 'AccessAttribute', name: 'arrayAttr'}},
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, [
      ['arrayAttr', 0],
      ['arrayAttr', 1],
      ['arrayAttr', 2],
    ])
  })
  t.test('arrayAttr[expr == 1]', async (t) => {
    const node: FilterNode<SelectorNode> = {
      type: 'Filter',
      base: {type: 'AccessAttribute', name: 'arrayAttr'},
      expr: {
        type: 'OpCall',
        left: {type: 'AccessAttribute', name: 'expr'},
        right: {type: 'Value', value: 1},
        op: '==',
      },
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, [['arrayAttr', 1]])
  })
  t.test('(attr.dotAttr)', async (t) => {
    const node: GroupNode<SelectorNode> = {
      type: 'Group',
      base: {
        type: 'AccessAttribute',
        base: {type: 'AccessAttribute', name: 'attr'},
        name: 'dotAttr',
      },
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, [['attr', 'dotAttr']])
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
      ['tuple1', 'dot_tuple1'],
      ['tuple1', 'dot_tuple2'],
      ['tuple2', 'dot_tuple1'],
      ['tuple2', 'dot_tuple2'],
    ])
  })
  t.test('((tuple1, tuple2).(dot_tuple1, dot_tuple2)).attr', async (t) => {
    const group: GroupNode<SelectorNode> = {
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
    const node: AccessAttributeNode<SelectorNode> = {
      type: 'AccessAttribute',
      base: group,
      name: 'attr',
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, [
      ['tuple1', 'dot_tuple1', 'attr'],
      ['tuple1', 'dot_tuple2', 'attr'],
      ['tuple2', 'dot_tuple1', 'attr'],
      ['tuple2', 'dot_tuple2', 'attr'],
    ])
  })
  t.test('base.nested[]', async (t) => {
    const node: SelectorNestedNode = {
      type: 'SelectorNested',
      base: {type: 'AccessAttribute', name: 'base'},
      nested: {type: 'ArrayCoerce', base: {type: 'AccessAttribute', name: 'nested'}},
    }
    const result = await evaluateSelector(node, scope.value, scope)

    t.match(result, [
      ['base', 'nested', 0],
      ['base', 'nested', 1],
      ['base', 'nested', 2],
    ])
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

    t.match(result, [
      ['base', 'nested', 1],
      ['base', 'nested', 2],
    ])
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

    t.match(result, [
      ['foo', 'baz'],
      ['foo', 'data', 'baz'],
    ])
  })
})
