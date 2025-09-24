import fs from 'fs'
import path from 'path'

export async function throwsWithMessage(
  t: Tap.Test,
  funcUnderTest: () => {},
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

/**
 * Extracts GROQ queries from the fixtures markdown file
 * @returns {string[]} Array of GROQ query strings
 */
export function parseGroqFixtures(): string[] {
  const fixturesPath = path.join(__dirname, 'fixtures', 'sanity-docs-queries.md')
  const content = fs.readFileSync(fixturesPath, 'utf8')

  // Match all groq``` code blocks
  const regex = /groq```\n([\s\S]*?)\n```/g
  const queries = []
  let match

  while ((match = regex.exec(content)) !== null) {
    const queryBlock = match[1].trim()
    if (queryBlock) {
      queries.push(queryBlock)
    }
  }

  return queries
}
