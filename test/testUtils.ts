import type {Test} from 'tap'

export async function throwsWithMessage(
  t: Test,
  funcUnderTest: () => unknown,
  expectedMessage: string,
): Promise<void> {
  let didThrow = false

  try {
    await funcUnderTest()
  } catch (error) {
    didThrow = true
    t.same((error as Error).message, expectedMessage)
  }

  t.ok(didThrow, `Expected function to throw with message: '${expectedMessage}'`)
}
