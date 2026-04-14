import {constantExecutor} from '../evaluate'
import type {FunctionSet} from '.'

const media: FunctionSet = {}
media['aspect'] = constantExecutor(() => {
  throw new Error('not implemented')
})

export default media
