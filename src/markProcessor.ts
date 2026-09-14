import type {CustomFunctions} from './rawParser'
import type {ParseOptions} from './types'

export interface Mark {
  name: string
  position: number
}

export type MarkVisitor<T> = Record<string, MarkVisitorFunc<T>>
type MarkVisitorFunc<T> = (p: MarkProcessor, mark: Mark) => T

export class MarkProcessor {
  private _string: string
  private marks: Mark[]
  private index: number
  customFunctions: CustomFunctions
  parseOptions: ParseOptions
  allowBoost = false

  constructor(
    string: string,
    marks: Mark[],
    customFunctions: CustomFunctions,
    parseOptions: ParseOptions,
  ) {
    this._string = string
    this.marks = marks
    this.customFunctions = customFunctions
    this.index = 0
    this.parseOptions = parseOptions
  }

  hasMark(pos = 0): boolean {
    return this.index + pos < this.marks.length
  }

  getMark(pos = 0): Mark {
    return this.marks[this.index + pos]
  }

  shift(): void {
    this.index += 1
  }

  process<T>(visitor: MarkVisitor<T>): T {
    const mark = this.marks[this.index]
    this.shift()
    const func = visitor[mark.name]
    if (!func) {
      throw new Error(`Unknown handler: ${mark.name}`)
    }
    return func.call(visitor, this, mark)
  }

  processString(): string {
    this.shift()
    return this.processStringEnd()
  }

  processStringEnd(): string {
    const prev = this.marks[this.index - 1]
    const curr = this.marks[this.index]
    this.shift()
    return this.string.slice(prev.position, curr.position)
  }

  slice(len: number): string {
    const pos = this.marks[this.index].position
    return this.string.slice(pos, pos + len)
  }

  get string(): string {
    return this._string
  }
}
