import {compare} from './compare'

describe('compare', () => {
  describe('functional correctness', () => {
    test('compare(A, A or B)', () => {
      const a = `_type == 'foo'`
      const b = `_type == 'foo' || _type == 'bar'`

      expect(compare(a, b)).toBe('subset')
      expect(compare(b, a)).toBe('superset')
    })

    test('compare(B, A or B)', () => {
      const a = `_type == 'bar'`
      const b = `_type == 'foo' || _type == 'bar'`

      expect(compare(a, b)).toBe('subset')
      expect(compare(b, a)).toBe('superset')
    })

    test('compare(A or B, A)', () => {
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

    test('compare(A or B, A or C)', () => {
      const a = `_type == 'foo' || _type == 'bar'`
      const b = `_type == 'foo' || _type == 'baz'`

      expect(compare(a, b)).toBe('overlap')
      expect(compare(b, a)).toBe('overlap')
    })

    test('compare(A and C, B and C)', () => {
      const a = `_type == 'foo' && title == 'test'`
      const b = `_type == 'bar' && title == 'test'`

      expect(compare(a, b)).toBe('disjoint')
      expect(compare(b, a)).toBe('disjoint')
    })

    test('compare((A or B) and D, (B or C) and D)', () => {
      const a = `(_type == 'foo' || _type == 'bar') && title == 'test'`
      const b = `(_type == 'bar' || _type == 'baz') && title == 'test'`

      expect(compare(a, b)).toBe('overlap')
      expect(compare(b, a)).toBe('overlap')
    })

    test('compare(A and C, (A or B) and C)', () => {
      const a = `_type == 'foo' && title == 'test'`
      const b = `(_type == 'bar' || _type == 'foo') && title == 'test'`

      expect(compare(a, b)).toBe('subset')
      expect(compare(b, a)).toBe('superset')
    })

    test('compare(A, !B) | A or B = ∅', () => {
      const a = `_type == 'foo'`
      const b = `!(_type == 'bar')`

      expect(compare(a, b)).toBe('subset')
      expect(compare(b, a)).toBe('superset')
    })

    test('compare(A, !B) | A or B ≠ ∅', () => {
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

    test('compare(A or B or C, B or C or A)', () => {
      const a = `_type == 'foo' || title == 'test' || description == 'bar'`
      const b = `title == 'test' || description == 'bar' || _type == 'foo'`

      expect(compare(a, b)).toBe('equal')
      expect(compare(b, a)).toBe('equal')
    })

    test('compare(!(A or B), !A and !B)', () => {
      const a = `!(_type == 'foo' || title == 'test')`
      const b = `_type != 'foo' && title != 'test'`

      expect(compare(a, b)).toBe('equal')
      expect(compare(b, a)).toBe('equal')
    })
  })

  describe('normalization', () => {
    test('multiple array literals', () => {
      const a = `_type in ['book'] || title == 'test'`
      const b = `_type == 'book' || (title in ['test', 'foo'])`

      expect(compare(a, b)).toBe('subset')
      expect(compare(b, a)).toBe('superset')
    })

    test('array literal normalization', () => {
      const a = `_type in ['book', 'movie']`
      const b = `_type == 'book' || _type == 'movie'`

      expect(compare(a, b)).toBe('equal')
      expect(compare(b, a)).toBe('equal')
    })

    test('recursive array literal normalization (splats)', () => {
      const a = `_type in [...[...['book'], 'movie']]`
      const b = `_type == 'book' || _type == 'movie'`

      expect(compare(a, b)).toBe('equal')
      expect(compare(b, a)).toBe('equal')
    })

    // TODO: not implemented
    test.skip('multi-variable equalities', () => {
      const a = `_type == x && x == 'book'`
      const b = `_type == 'book'`

      expect(compare(a, b)).toBe('equal')
      expect(compare(b, a)).toBe('equal')
    })

    test('simple inequality subset', () => {
      const a = `x > 1 && x < 9`
      const b = `x > 0 && x < 10`

      expect(compare(a, b)).toBe('subset')
      expect(compare(b, a)).toBe('superset')
    })

    test('transitive inequality variable subset', () => {
      // 0 < x < y < 10
      const a = `0 < x && x < y && y < 9`
      const b = `0 < x && x < 10`

      expect(compare(a, b)).toBe('subset')
      expect(compare(b, a)).toBe('superset')
    })

    test('multiple inequalities', () => {
      const a = `x > 1 && x < 10 && y > 1 && y < 10`
      const b = `x > 0 && x < 10 && y > 0 && y < 10`

      expect(compare(a, b)).toBe('subset')
      expect(compare(b, a)).toBe('superset')
    })

    test('overlapping inequalities', () => {
      const a = `x > 0 && x < 10`
      const b = `x > 1 && x < 11`

      expect(compare(a, b)).toBe('overlap')
      expect(compare(b, a)).toBe('overlap')
    })

    test('right-hand side variable membership', () => {
      const a = `'foo' in group`
      const b = `'bar' in group`

      expect(compare(a, b)).toBe('overlap')
      expect(compare(b, a)).toBe('overlap')
    })

    test('right-hand side variable membership with slices', () => {
      const a = `'value' in category[0..2]`
      const b = `'value' in category`

      expect(compare(a, b)).toBe('subset')
      expect(compare(b, a)).toBe('superset')
    })

    test('right-hand side variable membership with two slices', () => {
      const a = `'value' in category[0...2]`
      const b = `'value' in category[0...10]`

      expect(compare(a, b)).toBe('subset')
      expect(compare(b, a)).toBe('superset')
    })

    // TODO: not implemented
    test.skip('right-hand side variable membership with filters', () => {
      const a = `x in category[foo == 'test']`
      const b = `x in category`

      expect(compare(a, b)).toBe('subset')
      expect(compare(b, a)).toBe('superset')
    })

    // TODO: not implemented
    test.skip('right-hand side variable membership with overlapping filters', () => {
      const a = `x in category['bar' in foo]`
      const b = `x in category['baz' in foo]`

      expect(compare(a, b)).toBe('overlap')
      expect(compare(b, a)).toBe('overlap')
    })

    // TODO: not implemented
    test.skip('right-hand side variable membership with disjoint filters', () => {
      const a = `x in category[foo == 'bar']`
      const b = `x in category[foo == 'baz']`

      expect(compare(a, b)).toBe('disjoint')
      expect(compare(b, a)).toBe('disjoint')
    })

    // TODO: not implemented
    test.skip('equality with left-hand side filter + element access', () => {
      const a = `category[foo == 'bar'][0] == x`
      const b = `category[0] == x`

      expect(compare(a, b)).toBe('subset')
      expect(compare(b, a)).toBe('superset')
    })

    // TODO: not implemented
    test.skip('equality with subset left-hand side filter + element access', () => {
      const a = `category[foo == 'foo' && bar == 'bar'][0] == x`
      const b = `category[foo == 'foo'][0] == x`

      expect(compare(a, b)).toBe('subset')
      expect(compare(b, a)).toBe('superset')
    })

    // TODO: not implemented
    test.skip('equality with overlapping left-hand side filter + element access', () => {
      const a = `category[foo > 0 && foo < 10][0] == x`
      const b = `category[foo > 1 && foo < 11][0] == x`

      expect(compare(a, b)).toBe('overlap')
      expect(compare(b, a)).toBe('overlap')
    })
  })

  describe('performance', () => {
    test('larger example', () => {
      const start = Date.now()
      const a = `_type in [${Array.from(Array(20))
        .map((_, i) => `'${i + 1}'`)
        .join(', ')}]`
      const b = `_type == '1'`

      expect(compare(a, b)).toBe('superset')
      const end = Date.now()
      expect(end - start).toBeLessThan(1000)
    })

    test('larger example', () => {
      const start = Date.now()
      const a = `_type in [${Array.from(Array(20))
        .map((_, i) => `'${i + 1}'`)
        .join(', ')}]`
      const b = `_type == '1' && title == 'test' || description == '3'`

      expect(compare(a, b)).toBe('overlap')
      const end = Date.now()
      expect(end - start).toBeLessThan(1000)
    })
  })
})
