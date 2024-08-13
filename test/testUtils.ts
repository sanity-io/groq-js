import type {Test} from 'tap'

export async function throwsWithMessage(
  t: Test,
  funcUnderTest: () => any,
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
