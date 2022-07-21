import t from 'tap'

export function throwsWithMessage(funcUnderTest: () => {}, expectedMessage: string) {
  try {
    funcUnderTest()
  } catch (error: any) {
    t.same(error.message, expectedMessage)
  }
}
