import {type TAP} from 'tap'

type Test = Parameters<Parameters<TAP['test']>[0]>[0]

export async function throwsWithMessage(
  t: Test,
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
