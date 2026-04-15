import assert from 'node:assert/strict'
import {existsSync} from 'node:fs'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {buildSync} from 'esbuild'

const __dirname = dirname(fileURLToPath(import.meta.url))

// This test verifies that importing only `parse` from the built package
// does not pull in the evaluator chunk. esbuild tree-shakes the output,
// and we assert that evaluator-specific identifiers are absent.
//
// Requires `npm run build` to have been run first. In CI this is handled
// by the workflow; locally you can run `npm run build && npm run test:bundle`.

const distEntry = join(__dirname, '..', 'dist', '1.mjs')
if (!existsSync(distEntry)) {
  console.error('dist/1.mjs not found. Run `npm run build` first.')
  process.exit(1)
}

const result = buildSync({
  stdin: {
    contents: `import {parse} from '../dist/1.mjs';\nconsole.log(parse('*'));`,
    resolveDir: join(__dirname, '..', 'test'),
  },
  bundle: true,
  format: 'esm',
  treeShaking: true,
  platform: 'node',
  external: ['debug'],
  write: false,
})

const bundle = Buffer.from(result.outputFiles[0].contents).toString('utf-8')

// Evaluator-specific identifiers that should NOT appear in a parse-only bundle.
const evaluatorIdentifiers = ['executeAsync', 'executeSync', 'evaluateQuery', 'createScope']

for (const id of evaluatorIdentifiers) {
  assert.equal(new RegExp(`\\b${id}\\b`).test(bundle), false, `parse-only bundle should not contain "${id}"`)
}

// Sanity check: the bundle should contain parse-related code
assert.match(bundle, /parse/, 'bundle should contain parse-related code')

console.log('Bundle check passed: evaluator is tree-shaken from parse-only bundle.')
