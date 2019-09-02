const {TRUE_VALUE, FALSE_VALUE, NULL_VALUE} = require('./value')
const isEqual = require('./equality')
const {partialCompare} = require('./ordering')

function isComparable(a, b) {
  let aType = a.getType()
  let bType = b.getType()
  return aType == bType && (aType == 'number' || aType == 'string' || aType == 'boolean')
}

exports['=='] = async function eq(left, right, scope, execute) {
  let a = await execute(left, scope)
  let b = await execute(right, scope)
  let result = await isEqual(a, b)
  return result ? TRUE_VALUE : FALSE_VALUE
}

exports['!='] = async function neq(left, right, scope, execute) {
  let a = await execute(left, scope)
  let b = await execute(right, scope)
  let result = await isEqual(a, b)
  return result ? FALSE_VALUE : TRUE_VALUE
}

exports['>'] = async function gt(left, right, scope, execute) {
  let a = await (await execute(left, scope)).get()
  let b = await (await execute(right, scope)).get()
  let result = partialCompare(a, b)

  if (result == null) {
    return NULL_VALUE
  } else {
    return result > 0 ? TRUE_VALUE : FALSE_VALUE
  }
}

exports['>='] = async function gte(left, right, scope, execute) {
  let a = await (await execute(left, scope)).get()
  let b = await (await execute(right, scope)).get()
  let result = partialCompare(a, b)

  if (result == null) {
    return NULL_VALUE
  } else {
    return result >= 0 ? TRUE_VALUE : FALSE_VALUE
  }
}

exports['<'] = async function lt(left, right, scope, execute) {
  let a = await (await execute(left, scope)).get()
  let b = await (await execute(right, scope)).get()
  let result = partialCompare(a, b)

  if (result == null) {
    return NULL_VALUE
  } else {
    return result < 0 ? TRUE_VALUE : FALSE_VALUE
  }
}

exports['<='] = async function lte(left, right, scope, execute) {
  let a = await (await execute(left, scope)).get()
  let b = await (await execute(right, scope)).get()
  let result = partialCompare(a, b)

  if (result == null) {
    return NULL_VALUE
  } else {
    return result <= 0 ? TRUE_VALUE : FALSE_VALUE
  }
}

exports['in'] = async function inop(left, right, scope, execute) {
  let a = await execute(left, scope)
  let choices = await execute(right, scope)

  for await (let b of choices) {
    if (isComparable(a, b) && a.data == b.data) {
      return TRUE_VALUE
    }
  }

  return FALSE_VALUE
}

exports['match'] = async function match(left, right, scope, execute) {
  let a = await execute(left, scope)
  let b = await execute(right, scope)
  if (a.getType() != 'string' || b.getType() == 'string') return NULL_VALUE

  // TODO: More correct semantics
  let regex = b.data.replace('*', '.*')
  return new RegExp(regex).test(a.data) ? TRUE_VALUE : FALSE_VALUE
}
