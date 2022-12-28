import t from 'tap'

import {MarkProcessor, MarkVisitor} from '../src/markProcessor'
import {ExprNode} from '../src/nodeTypes'
import {throwsWithMessage} from './testUtils'

const TestVisitor: MarkVisitor<ExprNode> = {
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
