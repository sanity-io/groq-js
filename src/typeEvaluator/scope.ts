import debug from 'debug'

import {NullTypeNode, ReferenceTypeNode, Schema, TypeNode, UnionTypeNode} from './types'

const $trace = debug('typeEvaluator:scope:trace')
$trace.log = console.log.bind(console) // eslint-disable-line no-console

export interface Context {
  readonly schema: Schema

  lookupRef(ref: ReferenceTypeNode): TypeNode
  lookupType(name: ReferenceTypeNode): TypeNode
}

export function createContext(schema: Schema): Context {
  return {
    schema,

    lookupRef(ref) {
      for (const val of this.schema) {
        if (val.type === 'document') {
          if (val.name === ref.to) {
            return val
          }
        }
      }
      return {type: 'null'} satisfies NullTypeNode
    },

    lookupType(ref) {
      for (const val of this.schema) {
        if (val.type === 'type') {
          if (val.name === ref.to) {
            return val.value
          }
        }
      }
      return {type: 'null'} satisfies NullTypeNode
    },
  }
}

export interface Scope {
  value: UnionTypeNode
  parent: Scope | undefined
  context: Context

  subscope(value: TypeNode[], hidden?: boolean): Scope
}
export function createScope(value: TypeNode[], parent?: Scope, context?: Context): Scope {
  $trace('createScope', JSON.stringify({value, hasParent: parent !== undefined}, null, 2))
  return {
    value: {type: 'union', of: value} satisfies UnionTypeNode,
    parent,
    context: context || parent?.context || createContext([]),

    subscope(value, hidden = false) {
      if (hidden) {
        return createScope(value, this.parent, this.context)
      }
      return createScope(value, this, this.context)
    },
  }
}
