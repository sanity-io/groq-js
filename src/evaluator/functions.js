const {StaticValue, TRUE_VALUE, FALSE_VALUE} = require('./value')

exports.count = async function count(args, scope, execute) {
  if (args.length !== 1) throw new Error('count: 1 argument required')

  let inner = await execute(args[0], scope)

  let num = 0
  for await (let _ of inner) {
    num++
  }
  return new StaticValue(num)
}

exports.defined = async function defined(args, scope, execute) {
  if (args.length !== 1) throw new Error('defined: 1 argument required')

  let inner = await execute(args[0], scope)
  return inner.getType() == 'null' ? FALSE_VALUE : TRUE_VALUE
}
