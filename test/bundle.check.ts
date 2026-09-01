import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import {existsSync, readFileSync} from 'node:fs'
import {dirname, join, posix} from 'node:path'
import {fileURLToPath} from 'node:url'

import {buildSync} from 'esbuild'

const __dirname = dirname(fileURLToPath(import.meta.url))

// This test verifies that importing only `parse` from the built package
// does not pull in the evaluator chunk. esbuild tree-shakes the output,
// and we assert that evaluator-specific identifiers are absent.
//
// Requires `npm run build` to have been run first. In CI this is handled
// by the workflow; locally you can run `npm run build && npm run test:bundle`.

const distEntry = join(__dirname, '..', 'dist', '1.js')
if (!existsSync(distEntry)) {
  console.error('dist/1.js not found. Run `npm run build` first.')
  process.exit(1)
}

const result = buildSync({
  stdin: {
    contents: `import {parse} from '../dist/1.js';\nconsole.log(parse('*'));`,
    resolveDir: join(__dirname, '..', 'test'),
  },
  bundle: true,
  format: 'esm',
  treeShaking: true,
  platform: 'node',
  external: ['obug'],
  write: false,
})

const bundle = Buffer.from(result.outputFiles[0].contents).toString('utf-8')

// Evaluator-specific identifiers that should NOT appear in a parse-only bundle.
const evaluatorIdentifiers = ['executeAsync', 'executeSync', 'evaluateQuery', 'createScope']

for (const id of evaluatorIdentifiers) {
  assert.equal(
    new RegExp(`\\b${id}\\b`).test(bundle),
    false,
    `parse-only bundle should not contain "${id}"`,
  )
}

// Sanity check: the bundle should contain parse-related code
assert.match(bundle, /parse/, 'bundle should contain parse-related code')

console.log('Bundle check passed: evaluator is tree-shaken from parse-only bundle.')

// Declarations are code-split like the runtime, so every relative specifier
// in a published .d.ts must resolve to a published .d.ts. An unresolvable
// specifier degrades to TypeScript's `error` type, which `skipLibCheck`
// silences, leaving consumers with implicit `any`.
// https://github.com/sanity-io/groq-js/issues/361

const root = join(__dirname, '..')
const [{files}] = JSON.parse(
  execFileSync('npm', ['pack', '--dry-run', '--json'], {cwd: root, encoding: 'utf-8'}),
)
const published = new Set<string>(files.map((file: {path: string}) => file.path))

const missing: string[] = []
for (const path of published) {
  if (!path.endsWith('.d.ts')) continue
  const source = readFileSync(join(root, path), 'utf-8')
  for (const [, specifier] of source.matchAll(/(?:from\s*|import\()\s*['"](\.[^'"]+)['"]/g)) {
    const declaration = posix.join(posix.dirname(path), specifier.replace(/\.[cm]?js$/, '.d.ts'))
    if (!published.has(declaration)) missing.push(`${path} imports ${specifier}`)
  }
}
assert.deepEqual(missing, [], 'every .d.ts specifier must resolve to a published declaration')

console.log('Declaration check passed: every published .d.ts specifier resolves.')
