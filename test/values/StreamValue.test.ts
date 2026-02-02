import t from 'tap'

import {fromJS} from '../../src/values'
import {StreamValue} from '../../src/values/StreamValue'

t.test('StreamValue', async (t) => {
  t.test('handles exceptions during fetch', async (t) => {
    const value = new StreamValue(async function* () {
      throw new Error('test')
    })

    t.rejects(() => value.get(), 'blah')
  })

  t.test('returns yielded results', async (t) => {
    const value = new StreamValue(async function* () {
      yield fromJS(1)
      yield fromJS(2)
      yield fromJS(3)
    })

    const result = await value.get()
    t.equal(result.length, 3)
    t.equal(await result[0], 1)
    t.equal(await result[1], 2)
    t.equal(await result[2], 3)
  })
})
