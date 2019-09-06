module.exports = async function equality(a, b) {
  let aType = a.getType()
  let bType = b.getType()
  if (aType != bType) return false
  if (aType == 'number' || aType == 'string' || aType == 'boolean' || aType == 'null') {
    return (await a.get()) === (await b.get())
  }
  return false
}
