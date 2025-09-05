import type {FunctionSet} from '.'

const geo: FunctionSet = {}
geo['latLng'] = () => {
  throw new Error('not implemented')
}
geo['contains'] = () => {
  throw new Error('not implemented')
}
geo['intersects'] = () => {
  throw new Error('not implemented')
}
geo['distance'] = () => {
  throw new Error('not implemented')
}

export default geo
