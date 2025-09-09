import type {FunctionSet} from '.'
import {DateTime, fromDateTime} from '../../values'
import {constantExecutor} from '../evaluate'

const dateTime: FunctionSet = {}
dateTime['now'] = constantExecutor((_, scope) =>
  fromDateTime(new DateTime(scope.context.timestamp)),
)
dateTime['now'].arity = 0

export default dateTime
