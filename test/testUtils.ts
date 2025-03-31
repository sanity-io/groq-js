import type {TAP} from 'tap'

export async function throwsWithMessage(
  t: TAP,
  funcUnderTest: () => void,
  expectedMessage: string,
) {
  let didThrow = false

  try {
    await funcUnderTest()
  } catch (error: any) {
    didThrow = true
    t.same(error.message, expectedMessage)
  }

  t.ok(didThrow, `Expected function to throw with message: '${expectedMessage}'`)
}
