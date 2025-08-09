import type { Value } from "../values"

const partRegex = /^([a-zA-Z_][a-zA-Z_0-9]*)?((?:\[(?:\d+|"(?:[^"]|\\")*"|'(?:[^']|\\')*')\])*)$/

export async function valueAtPath(arg: Value, keyPath: string, options?: {throwOnReferenceError?: boolean}): Promise<any> {
  function tryAccessor(arg: any, accessor: string | number): any | undefined {
    try {
      return arg[accessor]
    } catch {
      if (options?.throwOnReferenceError) throw new Error(`Cannot read property ${accessor}`)
    }
    return undefined
  }

  const parts = keyPath.split('.')
  let current = await arg.get()
  for (const part of parts) {
    const match = part.match(partRegex)
    if (match === null) {
      throw new Error(`Invalid part in key path ${part}`)
    }

    const ident = match[1]
    const accessors = match[2]

    if (ident) {
      current = tryAccessor(current, ident)
    }
    if (accessors) {
      const accessorList = accessors.substring(1).split('[')

      for (let accessor of accessorList) {
        accessor = accessor.substring(0, accessor.length-1)
        if (accessor[0] === '"' || accessor[0] === '\'') {
          accessor = accessor.substring(1, accessor.length-1)

          current = tryAccessor(current, accessor)
        } else {
          const index = Number.parseInt(accessor, 10)
          if (Number.isNaN(index)) {
            throw new Error(`Invalid unquoted accessor ${accessor}, must be an integer`)
          } else if (!Array.isArray(current)) {
            throw new Error(`Invalid unquoted accessor, must access an array`)
          }

          current = tryAccessor(current, index)
        }
      }
    }
  }
  return current
}
