import type {FunctionSet} from '.'
import {DateTime, fromDateTime} from '../../values'

const dateTime: FunctionSet = {}
dateTime['now'] = async function now(_args, scope) {
  return fromDateTime(new DateTime(scope.context.timestamp))
}
dateTime['now'].arity = 0

export default dateTime
