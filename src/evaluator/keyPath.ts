import {fromJS, type Value} from '../values'
import {deepEqual} from './equality'
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

export function startsWith(keyPath: KeyPath, prefix: KeyPath): boolean {
  return prefix.every((item, index) => keyPath[index] === item)
}

export async function* diffKeyPaths(before: Value, after: Value): AsyncGenerator<KeyPath> {
  // a queue of paths to investigate for differences
  const currPaths: KeyPath[] = [[]]
  while (currPaths.length > 0) {
    const currPath: KeyPath = currPaths.shift() || []
    const b = fromJS(await valueAtPath(before, currPath))
    const a = fromJS(await valueAtPath(after, currPath))

    if (a.type !== b.type) {
      yield currPath
    } else if (
      (a.type === 'string' && b.type === 'string') ||
      (a.type === 'boolean' && b.type === 'boolean') ||
      (a.type === 'null' && b.type === 'null') ||
      (a.type === 'number' && b.type === 'number')
    ) {
      if (a.data !== b.data) yield currPath
    } else if (a.type === 'datetime' && b.type === 'datetime') {
      if (!a.data.equals(b.data)) yield currPath
    } else if (a.type === 'object' && b.type === 'object') {
      if (!deepEqual(a.data, b.data)) {
        const aKeys = Object.keys(a.data)
        const bKeys = Object.keys(b.data)
        const keys = new Set(aKeys.concat(bKeys))
        keys.forEach((key) => {
          currPaths.push([...currPath, key])
        })
      }
    } else if (a.type === 'array' && b.type === 'array') {
      if (a.data.length !== b.data.length) {
        yield currPath
      } else if (!deepEqual(a.data, b.data)) {
        for (let i = 0; i < b.data.length; i++) {
          currPaths.push([...currPath, i])
        }
      }
    } else if (a.type === 'stream' && b.type === 'stream') {
      const arrayA = await a.get()
      const arrayB = await b.get()

      if (arrayA.length !== arrayB.length) {
        yield currPath
      } else if (!deepEqual(arrayA, arrayB)) {
        for (let i = 0; i < arrayB.length; i++) {
          currPaths.push([...currPath, i])
        }
      }
    }
  }
}
