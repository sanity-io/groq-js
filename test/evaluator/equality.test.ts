import t from 'tap'
import {deepEqual} from '../../src/evaluator/equality'

t.test('deepEqual', async (t) => {
  t.test('returns true when two basic things are equal', async (t) => {
    t.equal(deepEqual(1, 1), true, 'numbers')
    t.equal(deepEqual('abc', 'abc'), true, 'strings')
    t.equal(deepEqual(true, true), true, 'booleans')
    t.equal(deepEqual(null, null), true, 'nulls')
    t.equal(deepEqual(undefined, undefined), true, 'undefined')
    t.equal(deepEqual(t.test, t.test), true, 'functions')
  })

  t.test('returns true when two objects have the same structure and values', async (t) => {
    t.equal(deepEqual({a: 1, b: {c: 2}}, {a: 1, b: {c: 2}}), true)
  })

  t.test('returns true when two arrays have the same order and values', async (t) => {
    t.equal(deepEqual([1, 'a', null], [1, 'a', null]), true)
  })

  t.test('returns false when two basic things are different', async (t) => {
    t.equal(deepEqual(1, 2), false, 'numbers')
    t.equal(deepEqual('abc', 'cba'), false, 'strings')
    t.equal(deepEqual(true, false), false, 'booleans')
    t.equal(deepEqual(null, {}), false, 'nulls')
    t.equal(deepEqual(undefined, {}), false, 'undefined')
    t.equal(
      deepEqual(
        () => {},
        () => {},
      ),
      false,
      'functions',
    )
  })

  t.test('returns false when two objects have different structure and values', async (t) => {
    t.equal(deepEqual({a: 1, b: {c: {}}}, {a: 1, b: {c: 2}}), false)
    t.equal(deepEqual({a: 1, b: {c: 3}}, {a: 1, b: {c: 2}}), false)
  })

  t.test('returns false when two arrays have different order and values', async (t) => {
    t.equal(deepEqual([1, 'a', null], [1, 'b', null]), false)
    t.equal(deepEqual([1, 'a', null], [1, null, 'a']), false)
  })
})
