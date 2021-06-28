import {LogicExprNode} from './compareTypes'

export class LogicExprNodeSet<T extends LogicExprNode = LogicExprNode> implements Set<T> {
  private _map = new Map<string, T>()

  constructor(...args: Array<T | T[] | LogicExprNodeSet<T>>) {
    for (const arg of args) {
      if (arg instanceof LogicExprNodeSet || Array.isArray(arg)) {
        for (const node of arg) {
          this.add(node)
        }
      } else {
        this.add(arg)
      }
    }
  }

  add(node: T) {
    this._map.set(node.hash, node)
    return this
  }

  clear() {
    this._map.clear()
  }

  delete(node: LogicExprNode) {
    return this._map.delete(node.hash)
  }

  *entries() {
    for (const value of this._map.values()) {
      yield [value, value] as [T, T]
    }
  }

  has(node: LogicExprNode) {
    return this._map.has(node.hash)
  }

  keys() {
    return this._map.values()
  }

  values() {
    return this._map.values()
  }

  forEach(fn: (key: T, value: T, set: this) => void) {
    for (const node of this._map.values()) {
      fn(node, node, this)
    }
  }

  map<R extends LogicExprNode>(fn: (t: T) => R): LogicExprNodeSet<R> {
    const next = new LogicExprNodeSet<R>()
    for (const i of this) next.add(fn(i))
    return next
  }

  filter(fn: (t: T) => boolean): LogicExprNodeSet<T>
  filter<R extends T>(fn: (t: T) => t is R): LogicExprNodeSet<R> {
    const next = new LogicExprNodeSet<R>()
    for (const i of this) if (fn(i)) next.add(i)
    return next
  }

  reduce<R extends T>(
    fn: (acc: LogicExprNodeSet<R>, t: T) => LogicExprNodeSet<R>,
    init?: LogicExprNodeSet<R>
  ): LogicExprNodeSet<R> {
    let next = init || new LogicExprNodeSet<R>()
    for (const i of this) next = fn(next, i)
    return next
  }

  clone(): LogicExprNodeSet<T> {
    return new LogicExprNodeSet(this)
  }

  first(): T | undefined {
    for (const i of this) return i
  }

  get size() {
    return this._map.size
  }

  [Symbol.iterator]() {
    return this._map.values()
  }

  [Symbol.toStringTag]: '[object LogicExprNodeSet]'
}
