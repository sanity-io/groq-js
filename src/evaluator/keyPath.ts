import type {Value} from '../values'
import type {KeyPath} from './types'

export async function valueAtPath(arg: Value, keyPath: KeyPath): Promise<any> {
  function tryAccessor(arg: any, accessor: string | number): any | undefined {
    try {
      return arg[accessor]
    } catch {
      // ignore the error
      return undefined
    }
  }

  let current = await arg.get()
  for (const part of keyPath) {
    current = tryAccessor(current, part)
    if (!current) break
  }
  return current
}
