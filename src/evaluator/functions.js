const {StaticValue, getType, TRUE_VALUE, FALSE_VALUE, NULL_VALUE} = require('./value')

const functions = (exports.functions = {})
const pipeFunctions = (exports.pipeFunctions = {})

functions.count = async function count(args, scope, execute) {
  if (args.length !== 1) throw new Error('count: 1 argument required')

  let inner = await execute(args[0], scope)

  let num = 0
  for await (let _ of inner) {
    num++
  }
  return new StaticValue(num)
}

functions.defined = async function defined(args, scope, execute) {
  if (args.length !== 1) throw new Error('defined: 1 argument required')

  let inner = await execute(args[0], scope)
  return inner.getType() == 'null' ? FALSE_VALUE : TRUE_VALUE
}

const TYPE_ORDER = {
  number: 0,
  string: 1,
  boolean: 2,
  null: 3
}

function compare(a, b) {
  let aType = getType(a)
  let bType = getType(b)

  if (aType != bType) {
    return TYPE_ORDER[aType] - TYPE_ORDER[bType]
  }

  switch (aType) {
    case 'number':
    case 'boolean':
      return a - b
    case 'string':
      return a < b ? -1 : a > b ? 1 : 0
  }

  return 0
}

pipeFunctions.order = async function order(base, args, scope, execute) {
  if (args.length == 0) throw new Error('order: at least one argument required')
  if (base.getType() != 'array') return NULL_VALUE

  let mappers = []
  let directions = []
  let n = 0

  for (let mapper of args) {
    let direction = 'asc'

    if (mapper.type == 'Desc') {
      direction = 'desc'
      mapper = mapper.base
    } else if (mapper.type == 'Asc') {
      mapper = mapper.base
    }

    mappers.push(mapper)
    directions.push(direction)
    n++
  }

  let aux = []

  for await (let value of base) {
    let newScope = scope.createNested(value)
    let tuple = [await value.get()]
    for (let i = 0; i < n; i++) {
      let result = await execute(mappers[i], newScope)
      tuple.push(await result.get())
    }
    aux.push(tuple)
  }

  aux.sort((aTuple, bTuple) => {
    for (let i = 0; i < n; i++) {
      let c = compare(aTuple[i + 1], bTuple[i + 1])
      if (directions[i] == 'desc') c = -c
      if (c != 0) return c
    }
    return 0
  })

  return new StaticValue(aux.map(v => v[0]))
}
