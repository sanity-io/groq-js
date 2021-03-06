import {Value} from './value'

export const isEqual = equality

async function equality(a: Value, b: Value): Promise<boolean> {
  const aType = a.getType()
  const bType = b.getType()
  if (aType !== bType) {
    return false
  }
  if (aType === 'number' || aType === 'string' || aType === 'boolean' || aType === 'null') {
    return (await a.get()) === (await b.get())
  }
  if (aType === 'datetime') {
    return (await a.get()).equals(await b.get())
  }
  return false
}
