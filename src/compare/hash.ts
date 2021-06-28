import {objectHash} from './objectHash'
import {ExprNode} from '../nodeTypes'

export function hash(node: ExprNode) {
  // TODO: this should normalize values and return a string representing it
  return objectHash(node)
}
