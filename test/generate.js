// Consumes a compiled test suite (https://github.com/sanity-io/groq-test-suite)
// from stdin and generates a Jest test file on stdout.
//
// This is needed because Jest doesn't support asynchronously defined tests.

const ndjson = require('ndjson')
const fs = require('fs')
const https = require('https')
const semver = require('semver')

const SUPPORTED_FEATURES = new Set(['scoring', 'namespaces'])
const GROQ_VERSION = '2.0.0'
const DISABLED_TESTS = ['Filters / documents, nested 3']

const OUTPUT = process.stdout
const STACK = []
let IDENT = ''

function write(data) {
  OUTPUT.write(IDENT + data + '\n')
}

function openStack(expr) {
  let [open, close] = expr.split(/BODY/)
  write(open)
  STACK.push(close)
  IDENT += '  '
}

function closeStack() {
  let close = STACK.pop()
  IDENT = IDENT.substring(0, IDENT.length - 2)
  write(close)
}

function space() {
  OUTPUT.write('\n')
}

write(`const fs = require('fs')`)
write(`const ndjson = require('ndjson')`)
write(`const tap = require('tap')`)
write(`const {evaluate, parse} = require('../dist')`)
space()

write(`tap.setTimeout(0)`)
space()

write(`const DATASETS = new Map()`)

write(`
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
`)

const DOWNLOADING = new Set()

function download(id, url) {
  if (DOWNLOADING.has(id)) return
  DOWNLOADING.add(id)

  let dir = `${__dirname}/datasets`
  let filename = `${dir}/${id}.ndjson`

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

process.stdin
  .pipe(ndjson.parse())
  .on('data', (entry) => {
    if (entry._type === 'dataset') {
      if (entry.documents) {
        entry.documents.sort((a, b) => cmpString(a._id, b._id))
      } else {
        download(entry._id, entry.url)
      }

      write(`DATASETS.set(${JSON.stringify(entry._id)}, ${JSON.stringify(entry)})`)
      space()
    }

    if (entry._type === 'test') {
      const supported = entry.features.every((f) => SUPPORTED_FEATURES.has(f))
      if (!supported) return

      if (entry.version && !semver.satisfies(GROQ_VERSION, entry.version)) return

      if (!entry.valid && entry.features.indexOf('scoring') != -1) {
        // For now we don't validate score()
        return
      }

      if (/perf/.test(entry.filename)) return
      if (DISABLED_TESTS.includes(entry.name)) return

      openStack(`tap.test(${JSON.stringify(entry.name)}, async (t) => {BODY})`)
      write(`let query = ${JSON.stringify(entry.query)}`)
      write(`t.comment(query)`)
      if (entry.valid) {
        write(`let result = ${JSON.stringify(entry.result)}`)
        write(`let dataset = await loadDocuments(${JSON.stringify(entry.dataset._ref)})`)
        write(`if (!dataset) return`)
        write(`let params = ${JSON.stringify(entry.params || {})}`)
        write(`let tree = parse(query)`)
        write(`let value = await evaluate(tree, {dataset, params})`)
        write(`let data = await value.get()`)
        write(`data = JSON.parse(JSON.stringify(data))`)
        write(`replaceScoreWithPos(data)`)
        write(`t.match(data, result)`)
      } else {
        write(`t.throws(() => parse(query))`)
      }
      closeStack()
      space()
    }
  })
  .on('end', () => {
    closeStack()
  })
