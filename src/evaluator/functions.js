const {StaticValue, fromNumber, TRUE_VALUE, FALSE_VALUE, NULL_VALUE} = require('./value')
const {totalCompare} = require('./ordering')

const functions = (exports.functions = {})
const pipeFunctions = (exports.pipeFunctions = {})

functions.count = async function count(args, scope, execute) {
  if (args.length !== 1) return NULL_VALUE

  let inner = await execute(args[0], scope)
  if (inner.getType() != 'array') return NULL_VALUE

  let num = 0
  for await (let _ of inner) {
    num++
  }
  return new StaticValue(num)
}

functions.defined = async function defined(args, scope, execute) {
  if (args.length !== 1) return NULL_VALUE
  
  let inner = await execute(args[0], scope)
  return inner.getType() == 'null' ? FALSE_VALUE : TRUE_VALUE
}

functions.identity = async function identity(args, scope, execute) {
  if (args.length !== 0) return NULL_VALUE
  return new StaticValue("me")
}

function countUTF8(str) {
  let count = 0
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i)
    if (code >= 0xD800 && code <= 0xDBFF) {
      // High surrogate. Don't count this.
      // By only counting the low surrogate we will correctly
      // count the number of UTF-8 code points.
      continue
    }
    count++
  }
  return count
}

functions.length = async function length(args, scope, execute) {
  if (args.length !== 1) return NULL_VALUE

  let inner = await execute(args[0], scope)

  if (inner.getType() == 'string') {
    let data = await inner.get()
    return fromNumber(countUTF8(data))
  }

  if (inner.getType() == 'array') {
    let num = 0
    for await (let _ of inner) {
      num++
    }
    return fromNumber(num)
  }

  return NULL_VALUE
}

functions.select = async function select(args, scope, execute) {
  // First check if everything is valid:
  let seenFallback = false
  for (let arg of args) {
    if (seenFallback) return NULL_VALUE

    if (arg.type == 'Pair') {
      // This is fine.
    } else {
      seenFallback = true
    }
  }

  for (let arg of args) {
    if (arg.type == 'Pair') {
      let cond = await execute(arg.left, scope)
      if (cond.getBoolean()) {
        return await execute(arg.right, scope)
      }
    } else {
      return await execute(arg, scope)
    }
  }

  return NULL_VALUE
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
      let c = totalCompare(aTuple[i + 1], bTuple[i + 1])
      if (directions[i] == 'desc') c = -c
      if (c != 0) return c
    }
    return 0
  })

  return new StaticValue(aux.map(v => v[0]))
}
