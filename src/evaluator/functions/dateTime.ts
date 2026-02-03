import {DateTime, fromDateTime} from '../../values'
import {constantExecutor} from '../evaluate'
import type {FunctionSet} from '.'

const dateTime: FunctionSet = {}
dateTime['now'] = constantExecutor((_, scope) =>
  fromDateTime(new DateTime(scope.context.timestamp)),
)
dateTime['now'].arity = 0

export default dateTime
