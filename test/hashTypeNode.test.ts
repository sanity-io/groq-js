import t from 'tap'

import {hashTypeNode} from '../src/typeEvaluator/optimizations'
import type {ObjectTypeNode, TypeNode} from '../src/typeEvaluator/types'

// helpers for building TypeNode trees
function str(value?: string): TypeNode {
  return value === undefined ? {type: 'string'} : {type: 'string', value}
}

function num(value?: number): TypeNode {
  return value === undefined ? {type: 'number'} : {type: 'number', value}
}

function bool(value?: boolean): TypeNode {
  return value === undefined ? {type: 'boolean'} : {type: 'boolean', value}
}

function nullNode(): TypeNode {
  return {type: 'null'}
}

function unknown(): TypeNode {
  return {type: 'unknown'}
}

function inline(name: string): TypeNode {
  return {name, type: 'inline'}
}

function arr(of: TypeNode): TypeNode {
  return {of, type: 'array'}
}

function union(...of: TypeNode[]): TypeNode {
  return {of, type: 'union'}
}

function attr(
  value: TypeNode,
  optional?: boolean,
): {optional?: boolean; type: 'objectAttribute'; value: TypeNode} {
  return optional ? {optional, type: 'objectAttribute', value} : {type: 'objectAttribute', value}
}

function obj(
  attributes: Record<string, {optional?: boolean; type: 'objectAttribute'; value: TypeNode}>,
  extra?: {dereferencesTo?: string; rest?: ObjectTypeNode},
): ObjectTypeNode {
  return {attributes, type: 'object', ...extra}
}

t.test('hashTypeNode', async (t) => {
  t.test('primitives without values', async (t) => {
    t.equal(hashTypeNode(str()), 'string')
    t.equal(hashTypeNode(num()), 'number')
    t.equal(hashTypeNode(bool()), 'boolean')
    t.equal(hashTypeNode(nullNode()), 'null')
    t.equal(hashTypeNode(unknown()), 'unknown')
  })

  t.test('primitives with values', async (t) => {
    t.equal(hashTypeNode(str('hello')), 'string(hello)')
    t.equal(hashTypeNode(num(42)), 'number(42)')
    t.equal(hashTypeNode(bool(true)), 'boolean(true)')
    t.equal(hashTypeNode(bool(false)), 'boolean(false)')
  })

  t.test('inline type', async (t) => {
    t.equal(hashTypeNode(inline('Post')), 'inline(Post)')
  })

  t.test('array', async (t) => {
    t.equal(hashTypeNode(arr(str())), 'array(string)')
    t.equal(hashTypeNode(arr(arr(num()))), 'array(array(number))')
  })

  t.test('union members are sorted', async (t) => {
    const a = union(str(), num(), bool())
    const b = union(bool(), str(), num())
    t.equal(hashTypeNode(a), hashTypeNode(b))
  })

  t.test('object attributes are sorted by key', async (t) => {
    const a = obj({a: attr(num()), z: attr(str())})
    const b = obj({z: attr(str()), a: attr(num())})
    t.equal(hashTypeNode(a), hashTypeNode(b))
  })

  t.test('object with optional attributes', async (t) => {
    const required = obj({title: attr(str())})
    const optional = obj({title: attr(str(), true)})
    t.not(hashTypeNode(required), hashTypeNode(optional))
    t.ok(hashTypeNode(optional).includes('optional'))
  })

  t.test('object with rest', async (t) => {
    const base = obj({a: attr(str())})
    const withRest = obj({a: attr(str())}, {rest: obj({b: attr(num())})})
    t.not(hashTypeNode(base), hashTypeNode(withRest))
  })

  t.test('object with dereferencesTo', async (t) => {
    const base = obj({a: attr(str())})
    const withDeref = obj({a: attr(str())}, {dereferencesTo: 'author'})
    t.not(hashTypeNode(base), hashTypeNode(withDeref))
    t.ok(hashTypeNode(withDeref).includes('ref-author'))
  })

  t.test('structurally identical objects produce identical hashes', async (t) => {
    const a = obj({
      _id: attr(str()),
      tags: attr(arr(str())),
      title: attr(str(), true),
    })
    const b = obj({
      _id: attr(str()),
      tags: attr(arr(str())),
      title: attr(str(), true),
    })
    t.equal(hashTypeNode(a), hashTypeNode(b))
  })

  t.test('different value types produce different hashes', async (t) => {
    const a = obj({name: attr(str()), score: attr(num())})
    const b = obj({name: attr(str()), score: attr(str())})
    t.not(hashTypeNode(a), hashTypeNode(b))
  })

  t.test('different optionality produces different hashes', async (t) => {
    const required = obj({email: attr(str()), name: attr(str())})
    const optional = obj({email: attr(str(), true), name: attr(str())})
    t.not(hashTypeNode(required), hashTypeNode(optional))
  })

  t.test('different keys produce different hashes', async (t) => {
    const withTitle = obj({name: attr(str()), title: attr(str())})
    const withSlug = obj({name: attr(str()), slug: attr(str())})
    t.not(hashTypeNode(withTitle), hashTypeNode(withSlug))
  })

  t.test('different _type literal values produce different hashes', async (t) => {
    const post = obj({_type: attr(str('post')), body: attr(str()), title: attr(str())})
    const page = obj({_type: attr(str('page')), body: attr(str()), title: attr(str())})
    t.not(hashTypeNode(post), hashTypeNode(page))
  })

  t.test('different nested structure produces different hashes', async (t) => {
    const innerA = obj({x: attr(num()), y: attr(num())})
    const innerB = obj({x: attr(str()), y: attr(str())})
    const outerA = obj({coords: attr(innerA), label: attr(str())})
    const outerB = obj({coords: attr(innerB), label: attr(str())})
    t.not(hashTypeNode(outerA), hashTypeNode(outerB))
  })

  t.test('snapshot of hashes for various node shapes', async (t) => {
    t.strictSame(
      {
        array_of_objects: hashTypeNode(arr(obj({id: attr(str()), name: attr(str())}))),
        boolean_literal: hashTypeNode(bool(true)),
        deeply_nested: hashTypeNode(
          obj({
            items: attr(
              arr(
                obj({
                  tags: attr(arr(str())),
                  value: attr(num()),
                }),
              ),
            ),
          }),
        ),
        empty_object: hashTypeNode(obj({})),
        inline: hashTypeNode(inline('Slug')),
        null: hashTypeNode(nullNode()),
        number: hashTypeNode(num()),
        object_with_deref: hashTypeNode(obj({_ref: attr(str())}, {dereferencesTo: 'post'})),
        object_with_rest: hashTypeNode(obj({a: attr(str())}, {rest: obj({b: attr(num())})})),
        simple_object: hashTypeNode(obj({age: attr(num()), name: attr(str())})),
        string: hashTypeNode(str()),
        string_literal: hashTypeNode(str('hello')),
        union: hashTypeNode(union(str(), num(), nullNode())),
        unknown: hashTypeNode(unknown()),
      },
      {
        array_of_objects:
          'array(object:(id:string(non-optional),name:string(non-optional)):ref-undefined:no-rest)',
        boolean_literal: 'boolean(true)',
        deeply_nested:
          'object:(items:array(object:(tags:array(string)(non-optional),value:number(non-optional)):ref-undefined:no-rest)(non-optional)):ref-undefined:no-rest',
        empty_object: 'object:():ref-undefined:no-rest',
        inline: 'inline(Slug)',
        null: 'null',
        number: 'number',
        object_with_deref: 'object:(_ref:string(non-optional)):ref-post:no-rest',
        object_with_rest:
          'object:(a:string(non-optional)):ref-undefined:object:(b:number(non-optional)):ref-undefined:no-rest',
        simple_object:
          'object:(age:number(non-optional),name:string(non-optional)):ref-undefined:no-rest',
        string: 'string',
        string_literal: 'string(hello)',
        union: 'union(number,string,null)',
        unknown: 'unknown',
      },
    )
  })
})
