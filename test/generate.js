// Consumes a compiled test suite (https://github.com/sanity-io/groq-test-suite)
// from stdin and generates a Tap test file on stdout.
//
// This is needed because Tap doesn't support asynchronously defined tests.

const ndjson = require('ndjson')
const fs = require('fs')
const path = require('path')
const https = require('https')
const semver = require('semver')

const SUPPORTED_FEATURES = new Set(['portableText'])
// We implement GROQ-1.revision1. The final patch has to be there for it to be a valid SemVer.
const GROQ_VERSION = '1.1.0'
const DISABLED_TESTS = [
  'Filters / documents, nested 3', // very slow
  'Parameters / Undefined',
  /diff functions/, // we don't have full selector support yet
  /score\(\) function \/ Illegal use/, // we're missing validation here
]

// Create 40 test files, TAP holds each test in-memory and node18 runs out of memory if we have too many tests in one file.
const testFiles = new Array(40).fill(0).map((_, i) =>
  fs.openSync(
    path.join(__dirname, `suite-${i}.test.js`),
    // eslint-disable-next-line no-bitwise
    fs.constants.O_TRUNC | fs.constants.O_CREAT | fs.constants.O_WRONLY,
  ),
)

const STACK = testFiles.map(() => [])
let IDENT = testFiles.map(() => '')

function write(i, data) {
  fs.writeSync(testFiles[i], `${IDENT[i] + data}\n`)
}

function openStack(i, expr) {
  const [open, close] = expr.split(/BODY/)
  write(i, open)
  STACK[i].push(close)
  IDENT[i] += '  '
}

function closeStack(i) {
  const close = STACK[i].pop()
  if (close) {
    IDENT[i] = IDENT[i].substring(0, IDENT[i].length - 2)
    write(i, close)
  }
}

function space(i) {
  fs.writeSync(testFiles[i], '\n')
}

for (let i = 0; i < testFiles.length; i++) {
  write(i, `const fs = require('fs')`)
  write(i, `const ndjson = require('ndjson')`)
  write(i, `const tap = require('tap')`)
  write(i, `const {evaluate, parse} = require('../src/1')`)
  space(i)

  write(i, `tap.setTimeout(0)`)
  space(i)

  write(i, `const DATASETS = new Map()`)

  write(
    i,
    `
const LOADERS = new Map()

async function loadDocuments(id) {
  let entry = DATASETS.get(id)

  if (entry.documents != null) {
    return entry.documents
  }

  if (!LOADERS.has(id)) {
    // For now we've disabled all external datasets since they are very big.
    return null
    LOADERS.set(id, new Promise((resolve, reject) => {
      let filename = __dirname + "/datasets/" + entry._id + ".ndjson"
      let documents = []
      fs.createReadStream(filename)
        .pipe(ndjson.parse())
        .on('data', doc => documents.push(doc))
        .on('end', () => resolve(documents))
        .on('error', err => reject(err))
    }))
  }

  return LOADERS.get(id)
}

function replaceScoreWithPos(val) {
  const scores = new Set();
  const entries = [];

  function visit(val) {
    if (Array.isArray(val)) {
      for (const child of val) {
        visit(child)
      }
      return
    }

    if (val && typeof val === 'object') {
      if (typeof val._score === 'number') {
        entries.push(val)
        scores.add(val._score)
      }

      for (const child of Object.values(val)) {
        visit(child)
      }

      return
    }
  }

  visit(val)

  const sortedScores = Array.from(scores).sort((a, b) => b - a)

  for (const entry of entries) {
    const pos = sortedScores.indexOf(entry._score) + 1
    entry._pos = pos
    delete entry._score
  }
}
`,
  )
}
function isDisabled(testName) {
  return DISABLED_TESTS.find((t) => (typeof t === 'string' ? t === testName : t.test(testName)))
}

const DOWNLOADING = new Set()

function download(id, url) {
  if (DOWNLOADING.has(id)) return
  DOWNLOADING.add(id)

  const dir = `${__dirname}/datasets`
  const filename = `${dir}/${id}.ndjson`

  // File already exists
  if (fs.existsSync(filename)) return

  if (!fs.existsSync(dir)) fs.mkdirSync(dir)

  process.stderr.write(`Downloading ${url}\n`)
  https
    .request(url, (res) => {
      res.pipe(fs.createWriteStream(filename))
    })
    .end()
}

function cmpString(a, b) {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

let i = 0
process.stdin
  .pipe(ndjson.parse())
  .on('data', (entry) => {
    i++
    if (entry._type === 'dataset') {
      if (entry.documents) {
        entry.documents.sort((a, b) => cmpString(a._id, b._id))
      } else {
        download(entry._id, entry.url)
      }

      for (let i = 0; i < testFiles.length; i++) {
        write(i, `DATASETS.set(${JSON.stringify(entry._id)}, ${JSON.stringify(entry)})`)
        space(i)
      }
    }

    if (entry._type === 'test') {
      const testIndex = i % testFiles.length
      const supported = entry.features.every((f) => SUPPORTED_FEATURES.has(f))
      if (!supported) return

      if (entry.version && !semver.satisfies(GROQ_VERSION, entry.version)) return

      if (!entry.valid && entry.features.indexOf('scoring') != -1) {
        // For now we don't validate score()
        return
      }

      if (/perf/.test(entry.filename)) return
      if (isDisabled(entry.name)) {
        process.stderr.write(`[warning] Skipping disabled test: ${entry.name}\n`)
        return
      }

      openStack(
        testIndex,
        `tap.test(${JSON.stringify(`${entry._id}: ${entry.name}`)}, async (t) => {BODY})`,
      )
      write(testIndex, `let query = ${JSON.stringify(entry.query)}`)
      write(testIndex, `t.comment(query)`)
      if (entry.valid) {
        write(testIndex, `let result = ${JSON.stringify(entry.result)}`)
        write(testIndex, `let dataset = await loadDocuments(${JSON.stringify(entry.dataset._ref)})`)
        write(testIndex, `if (!dataset) return`)
        write(testIndex, `let params = ${JSON.stringify(entry.params || {})}`)
        write(testIndex, `let tree = parse(query, {params})`)
        write(testIndex, `let value = await evaluate(tree, {dataset, params})`)
        write(testIndex, `let data = await value.get()`)
        write(testIndex, `data = JSON.parse(JSON.stringify(data))`)
        write(testIndex, `replaceScoreWithPos(data)`)
        write(testIndex, `t.match(data, result)`)
        write(testIndex, `t.end()`)
      } else {
        write(testIndex, `t.throws(() => parse(query))`)
        write(testIndex, `t.end()`)
      }
      closeStack(testIndex)
      space(testIndex)
    }
  })
  .on('end', () => {
    for (let i = 0; i < testFiles.length; i++) {
      closeStack(i)
      fs.closeSync(testFiles[i])
    }
  })
