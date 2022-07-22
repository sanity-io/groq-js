import t from 'tap'
import * as NodeTypes from '../src/nodeTypes'
import {MarkProcessor, MarkVisitor} from '../src/markProcessor'
import {throwsWithMessage} from './testUtils'

const TestVisitor: MarkVisitor<NodeTypes.ExprNode> = {
  valid(p) {
    return {type: 'Everything'}
  },
}

t.test('MarkProcessor', async (t) => {
  t.test('throws when an unknown handler is called', async () => {
    const marks = [{name: 'invalid', position: 0}]
    const input = ''
    const processor = new MarkProcessor(input, marks, {})

    throwsWithMessage(t, () => processor.process(TestVisitor), 'Unknown handler: invalid')
  })
})
