const Value = require('./value')

exports['=='] = function count(left, right, scope, execute) {
  return new Value(async () => {
    let a = await execute(left, scope).get()
    let b = await execute(right, scope).get()

    return a == b
  })
}

exports['!='] = function count(left, right, scope, execute) {
  return new Value(async () => {
    let a = await execute(left, scope).get()
    let b = await execute(right, scope).get()

    return a != b
  })
}

exports['>'] = function count(left, right, scope, execute) {
  return new Value(async () => {
    let a = await execute(left, scope).get()
    let b = await execute(right, scope).get()

    return a > b
  })
}

exports['>='] = function count(left, right, scope, execute) {
  return new Value(async () => {
    let a = await execute(left, scope).get()
    let b = await execute(right, scope).get()

    return a >= b
  })
}

exports['<'] = function count(left, right, scope, execute) {
  return new Value(async () => {
    let a = await execute(left, scope).get()
    let b = await execute(right, scope).get()

    return a < b
  })
}

exports['<='] = function count(left, right, scope, execute) {
  return new Value(async () => {
    let a = await execute(left, scope).get()
    let b = await execute(right, scope).get()

    return a <= b
  })
}