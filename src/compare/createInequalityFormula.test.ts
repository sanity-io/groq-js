import {findInequalityTruths} from './createInequalityFormula'
import {generate} from './compare'
import {transform} from './transform'
import {simplify} from './simplify'
import {parse} from '../parser'

function printInequalityTruths(input: string) {
  const output = simplify(transform(parse(input)))
  if (output.type !== 'And') throw new Error()

  const result = findInequalityTruths(output)

  return `input: ${generate(output)}\n\noutput:\n${result
    .sort((a, b) => a.value - b.value)
    .map((x) => {
      const reason = x.path
        .reverse()
        .map((node) => generate(node))
        .join(' and ')

      return `${x.group} ${x.inclusive ? '≥' : '>'} ${x.value} because ${reason}`
    })
    .join('\n')}`
}

describe('findInequalityTruths', () => {
  test('simple, non-transitive', () => {
    const input = `x > 0 && x < 10`

    expect(printInequalityTruths(input)).toMatchInlineSnapshot(`
      "input: (!(x ≥ 10) and x > 0)

      output:
      x > 0 because x > 0
      x ≥ 10 because x ≥ 10"
    `)
  })

  test('larger, non-transitive', () => {
    const input = `x > 0 && x < 10 && x > 1 && x < 9`

    expect(printInequalityTruths(input)).toMatchInlineSnapshot(`
      "input: (!(x ≥ 10) and !(x ≥ 9) and x > 0 and x > 1)

      output:
      x > 0 because x > 0
      x > 1 because x > 1
      x ≥ 9 because x ≥ 9
      x ≥ 10 because x ≥ 10"
    `)
  })

  test('simple transitive', () => {
    const input = `0 < x && x < y && y < 9`

    expect(printInequalityTruths(input)).toMatchInlineSnapshot(`
      "input: (!(x ≥ y) and !(y ≥ 9) and x > 0)

      output:
      x > 0 because x > 0
      y > 0 because x > 0 and !(x ≥ y)
      x ≥ 9 because y ≥ 9 and x ≥ y
      y ≥ 9 because y ≥ 9"
    `)
  })

  test('larger transitive', () => {
    const input = `0 < x && x < y && y < 9 && z < 10 && b > 0 && b < z && z > 3`

    expect(printInequalityTruths(input)).toMatchInlineSnapshot(`
      "input: (!(b ≥ z) and !(x ≥ y) and !(y ≥ 9) and !(z ≥ 10) and b > 0 and x > 0 and z > 3)

      output:
      x > 0 because x > 0
      y > 0 because x > 0 and !(x ≥ y)
      z > 0 because b > 0 and !(b ≥ z)
      b > 0 because b > 0
      z > 3 because z > 3
      b > 3 because z > 3 and b ≥ z
      x ≥ 9 because y ≥ 9 and x ≥ y
      y ≥ 9 because y ≥ 9
      z ≥ 10 because z ≥ 10
      b ≥ 10 because z ≥ 10 and b ≥ z"
    `)
  })
})

describe('createInequalityFormula', () => {
  test.todo('works')
})
