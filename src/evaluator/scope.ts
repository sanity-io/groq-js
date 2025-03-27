import type {Value} from '../nodeTypes'

export class Scope {
  public value: Value
  public parent: Scope | null
  public isHidden = false

  constructor(value: Value, parent: Scope | null = null) {
    this.value = value
    this.parent = parent
  }

  static create(value: Value, parent: Scope | null = null): Scope {
    return new Scope(value, parent)
  }

  createNested(value: Value): Scope {
    if (this.isHidden) {
      return new Scope(value, this.parent)
    }
    return new Scope(value, this)
  }

  createHidden(value: Value): Scope {
    const result = this.createNested(value)
    result.isHidden = true
    return result
  }

  getParent(n: number): Scope | null {
    if (n === 0) return this
    if (!this.parent) return null
    return this.parent.getParent(n - 1)
  }
}
