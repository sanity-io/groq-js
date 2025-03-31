import {type Value} from '../values/types'
import {type Context} from './types'

export class Scope {
  public params: Record<string, unknown>
  public source: Value
  public value: Value
  public parent: Scope | null
  public context: Context
  public isHidden = false

  constructor(
    params: Record<string, unknown>,
    source: Value,
    value: Value,
    context: Context,
    parent: Scope | null,
  ) {
    this.params = params
    this.source = source
    this.value = value
    this.context = context
    this.parent = parent
  }

  createNested(value: Value): Scope {
    if (this.isHidden) {
      return new Scope(this.params, this.source, value, this.context, this.parent)
    }
    return new Scope(this.params, this.source, value, this.context, this)
  }

  createHidden(value: Value): Scope {
    const result = this.createNested(value)
    result.isHidden = true
    return result
  }
}
