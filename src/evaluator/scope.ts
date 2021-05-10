import {Value} from '../values'

export class Scope {
  public params: Record<string, unknown>
  public source: Value
  public value: Value
  public parent: Scope | null
  public timestamp: string
  public isHidden = false

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(params: Record<string, unknown>, source: Value, value: Value, parent: Scope | null) {
    this.params = params
    this.source = source
    this.value = value
    this.parent = parent
    this.timestamp = parent ? parent.timestamp : new Date().toISOString()
  }

  createNested(value: Value): Scope {
    if (this.isHidden) {
      return new Scope(this.params, this.source, value, this.parent)
    }
    return new Scope(this.params, this.source, value, this)
  }

  createHidden(value: Value): Scope {
    const result = this.createNested(value)
    result.isHidden = true
    return result
  }
}
