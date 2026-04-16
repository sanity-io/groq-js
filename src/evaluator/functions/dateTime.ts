import {DateTime, fromDateTime} from '../../shared/values'
import {constantExecutor} from '../evaluate'
import type {FunctionSet} from '.'

const dateTime: FunctionSet = {}
dateTime['now'] = constantExecutor((_, scope) =>
  fromDateTime(new DateTime(scope.context.timestamp)),
)

export default dateTime
