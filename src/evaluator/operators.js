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

exports['in'] = function count(left, right, scope, execute) {
  return new Value(async () => {
    let a = await execute(left, scope).get()

    for await (let b of execute(right, scope)) {
      if (a == b) {
        return true
      }
    }

    return false
  })
}

exports ['match'] = function match(left, right, scope, execute) {
  return new Value(async () => {
    let a = await execute(left, scope).get()
    let b = await execute(right, scope).get()
    let regex = b.replace('*', '.*')

    return new RegExp(regex).test(a)
  })
}
