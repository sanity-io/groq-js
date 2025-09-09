import type {FunctionSet} from '.'
import {constantExecutor} from '../evaluate'

const geo: FunctionSet = {}
geo['latLng'] = constantExecutor(() => {
  throw new Error('not implemented')
})
geo['contains'] = constantExecutor(() => {
  throw new Error('not implemented')
})
geo['intersects'] = constantExecutor(() => {
  throw new Error('not implemented')
})
geo['distance'] = constantExecutor(() => {
  throw new Error('not implemented')
})

export default geo
