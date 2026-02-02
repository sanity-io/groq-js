import type {GroqSyntaxError} from '../src/parser'

export async function throwsWithMessage(
  t: Tap.Test,
  funcUnderTest: () => unknown,
  expectedMessage: string,
): Promise<void> {
  let didThrow = false

  try {
    await funcUnderTest()
  } catch (error: unknown) {
    didThrow = true
    assertIsError(t, error)
    t.same(error.message, expectedMessage)
  }

  t.ok(didThrow, `Expected function to throw with message: '${expectedMessage}'`)
}

export function assertIsError(t: Tap.Test, thing: unknown): asserts thing is Error {
  t.type(thing, Error, 'Expected thrown value to be an Error')
}

export function assertIsGroqSyntaxError(
  t: Tap.Test,
  thing: unknown,
): asserts thing is GroqSyntaxError {
  assertIsError(t, thing)
  t.equal(thing.name, 'GroqSyntaxError', 'Expected error to be a GroqSyntaxError')
}
