import {constantExecutor} from '../evaluate'
import type {FunctionSet} from '.'

const media: FunctionSet = {}
media['aspect'] = constantExecutor(() => {
  throw new Error('not implemented')
})
media['aspect'].arity = 2

export default media
