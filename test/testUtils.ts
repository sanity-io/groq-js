import t from 'tap'

export async function throwsWithMessage(funcUnderTest: () => {}, expectedMessage: string) {
  try {
    await funcUnderTest()
  } catch (error: any) {
    t.same(error.message, expectedMessage)
  }
}
