const {getType} = require('./value')

const TYPE_ORDER = {
  number: 1,
  string: 2,
  boolean: 3
}

function partialCompare(a, b) {
  let aType = getType(a)
  let bType = getType(b)

  if (aType != bType) return null

  switch (aType) {
    case 'number':
    case 'boolean':
      return a - b
    case 'string':
      return a < b ? -1 : a > b ? 1 : 0
  }

  return null
}

function totalCompare(a, b) {
  let aType = getType(a)
  let bType = getType(b)

  let aTypeOrder = TYPE_ORDER[aType] || 100
  let bTypeOrder = TYPE_ORDER[bType] || 100

  if (aTypeOrder != bTypeOrder) {
    return aTypeOrder - bTypeOrder
  }

  let result = partialCompare(a, b)
  if (result == null) result = 0
  return result
}

exports.partialCompare = partialCompare
exports.totalCompare = totalCompare
