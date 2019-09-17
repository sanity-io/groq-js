const {StaticValue, TRUE_VALUE, FALSE_VALUE, NULL_VALUE, fromNumber} = require('./value')
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

  switch (choices.getType()) {
    case 'array':
      for await (let b of choices) {
        if (await isEqual(a, b)) {
          return TRUE_VALUE
        }
      }
      return FALSE_VALUE
    case 'range':
      let value = await a.get()
      let range = await choices.get()
      let leftCmp = partialCompare(value, range.left)
      if (leftCmp == null) return NULL_VALUE
      let rightCmp = partialCompare(value, range.right)
      if (rightCmp == null) return NULL_VALUE

      if (range.isExclusive()) {
        return leftCmp >= 0 && rightCmp < 0 ? TRUE_VALUE : FALSE_VALUE
      } else {
        return leftCmp >= 0 && rightCmp <= 0 ? TRUE_VALUE : FALSE_VALUE
      }
    case 'path':
      if (a.getType() != 'string') return NULL_VALUE
      let str = await a.get()
      let path = await choices.get()
      return path.matches(str) ? TRUE_VALUE : FALSE_VALUE
  }

  return NULL_VALUE
}

async function gatherText(value, cb) {
  switch (value.getType()) {
    case 'string':
      cb(await value.get())
      return true

    case 'array':
      for await (let part of value) {
        if (part.getType() == 'string') {
          cb(await part.get())
        } else {
          return false
        }
      }
      return true
  }

  return false
}

exports['match'] = async function match(left, right, scope, execute) {
  let text = await execute(left, scope)
  let pattern = await execute(right, scope)

  let tokens = []
  let patterns = []

  let didSucceed = await gatherText(text, part => {
    tokens = tokens.concat(part.match(/[A-Za-z0-9]+/g))
  })
  if (!didSucceed) return NULL_VALUE

  didSucceed = await gatherText(pattern, part => {
    patterns = patterns.concat(part.match(/[A-Za-z0-9*]+/g))
  })
  if (!didSucceed) return NULL_VALUE

  let matched = patterns.every(p => {
    let regexp = new RegExp('^' + p.replace('*', '.*') + '$', 'i')
    return tokens.some(token => regexp.test(token))
  })

  return matched ? TRUE_VALUE : FALSE_VALUE
}

exports['+'] = async function plus(left, right, scope, execute) {
  let a = await execute(left, scope)
  let b = await execute(right, scope)
  let aType = a.getType()
  let bType = b.getType()

  if ((aType == 'number' && bType == 'number') || (aType == 'string' && bType == 'string')) {
    return new StaticValue((await a.get()) + (await b.get()))
  }

  return NULL_VALUE
}

function numericOperator(impl) {
  return async function(left, right, scope, execute) {
    let a = await execute(left, scope)
    let b = await execute(right, scope)
    let aType = a.getType()
    let bType = b.getType()

    if (aType == 'number' && bType == 'number') {
      let result = impl(await a.get(), await b.get())
      return fromNumber(result)
    }

    return NULL_VALUE
  }
}

exports['-'] = numericOperator((a, b) => a - b)
exports['*'] = numericOperator((a, b) => a * b)
exports['/'] = numericOperator((a, b) => a / b)
exports['%'] = numericOperator((a, b) => a % b)
exports['**'] = numericOperator((a, b) => Math.pow(a, b))
