import t from 'tap'
import {valueAtPath} from '../../src/evaluator/keyPath'
import {fromJS} from '../../src/values'

const obj: any = {left: {a: 1}, right: [{foo: 2}, [{bar: 3}]]}

t.test('valueAtPath', async (tt) => {
  await tt.test('no parts', async (ttt) => {
    const value = await valueAtPath(fromJS(obj), '')
    ttt.match(value, obj)
  })

  await tt.test('one part', async (ttt) => {
    const value = await valueAtPath(fromJS(obj), 'left')
    ttt.match(value, obj.left)
  })

  await tt.test('two parts', async (ttt) => {
    const value = await valueAtPath(fromJS(obj), 'left.a')
    ttt.match(value, obj.left.a)
  })

  await tt.test('array and object', async (ttt) => {
    const value = await valueAtPath(fromJS(obj), 'right[0].foo')
    ttt.match(value, obj.right[0].foo)
  })

  await tt.test('array and sub-array', async (ttt) => {
    const value = await valueAtPath(fromJS(obj), 'right[1][0]')
    ttt.match(value, obj.right[1][0])
  })

  await tt.test('array and sub-array and object', async (ttt) => {
    const value = await valueAtPath(fromJS(obj), 'right[1][0].bar')
    ttt.match(value, obj.right[1][0].bar)
  })
})
