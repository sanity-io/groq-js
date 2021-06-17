import {compare} from './compare'

describe('compare', () => {
  test('compare(A, A ∪ B)', () => {
    const a = `_type == 'foo'`
    const b = `_type == 'foo' || _type == 'bar'`

    expect(compare(a, b)).toBe('subset')
    expect(compare(b, a)).toBe('superset')
  })

  test('compare(B, A ∪ B)', () => {
    const a = `_type == 'bar'`
    const b = `_type == 'foo' || _type == 'bar'`

    expect(compare(a, b)).toBe('subset')
    expect(compare(b, a)).toBe('superset')
  })

  test('compare(A ∪ B, A)', () => {
    const a = `_type == 'foo' || _type == 'bar'`
    const b = `_type == 'foo'`

    expect(compare(a, b)).toBe('superset')
    expect(compare(b, a)).toBe('subset')
  })

  test('compare(A, B)', () => {
    const a = `_type == 'bar'`
    const b = `_type == 'foo'`

    expect(compare(a, b)).toBe('disjoint')
    expect(compare(b, a)).toBe('disjoint')
  })

  test('compare(A ∪ B, A ∪ C)', () => {
    const a = `_type == 'foo' || _type == 'bar'`
    const b = `_type == 'foo' || _type == 'baz'`

    expect(compare(a, b)).toBe('overlap')
    expect(compare(b, a)).toBe('overlap')
  })

  test('compare(A ∩ C, B ∩ C)', () => {
    const a = `_type == 'foo' && title == 'test'`
    const b = `_type == 'bar' && title == 'test'`

    expect(compare(a, b)).toBe('disjoint')
    expect(compare(b, a)).toBe('disjoint')
  })

  test('compare((A ∪ B) ∩ D, (B ∪ C) ∩ D)', () => {
    const a = `(_type == 'foo' || _type == 'bar') && title == 'test'`
    const b = `(_type == 'bar' || _type == 'baz') && title == 'test'`

    expect(compare(a, b)).toBe('overlap')
    expect(compare(b, a)).toBe('overlap')
  })

  test('compare(A ∩ C, (A ∪ B) ∩ C)', () => {
    const a = `_type == 'foo' && title == 'test'`
    const b = `(_type == 'bar' || _type == 'foo') && title == 'test'`

    expect(compare(a, b)).toBe('subset')
    expect(compare(b, a)).toBe('superset')
  })

  test('compare(A, !B) | A ∪ B = ∅', () => {
    const a = `_type == 'foo'`
    const b = `!(_type == 'bar')`

    expect(compare(a, b)).toBe('subset')
    expect(compare(b, a)).toBe('superset')
  })

  test('compare(A, !B) | A ∪ B ≠ ∅', () => {
    const a = `_type == 'foo' || _type == 'bar'`
    const b = `!(_type == 'bar' || _type == 'baz')`

    expect(compare(a, b)).toBe('overlap')
    expect(compare(b, a)).toBe('overlap')
  })

  test('compare(A, !A)', () => {
    const a = `_type == 'foo'`
    const b = `!(_type == 'foo')`

    expect(compare(a, b)).toBe('disjoint')
    expect(compare(b, a)).toBe('disjoint')
  })

  test('compare(A ∪ B ∪ C, B ∪ C ∪ A)', () => {
    const a = `_type == 'foo' || title == 'test' || description == 'bar'`
    const b = `title == 'test' || description == 'bar' || _type == 'foo'`

    expect(compare(a, b)).toBe('equal')
    expect(compare(b, a)).toBe('equal')
  })

  test('compare(!(A ∪ B), !A ∩ !B)', () => {
    const a = `!(_type == 'foo' || title == 'test')`
    const b = `_type != 'foo' && title != 'test'`

    expect(compare(a, b)).toBe('equal')
    expect(compare(b, a)).toBe('equal')
  })
})
