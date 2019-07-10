const Value = require('./value')

exports.count = function count(args, scope, execute) {
  if (args.length !== 1) throw new Error("count: 1 argument required")

  return new Value(async () => {
    let num = 0
    let inner = execute(args[0], scope)
    for await (let _ of inner) {
      num++
    }
    return  num
  })
}

exports.defined = function defined(args, scope, execute) {
  if (args.length !== 1) throw new Error("count: 1 argument required")

  return new Value(async () => {
    let inner = await execute(args[0], scope).get()
    return inner != null
  })
}