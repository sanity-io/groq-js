// Consumes a compiled test suite (https://github.com/sanity-io/groq-test-suite)
// from stdin and generates a Jest test file on stdout.
//
// This is needed because Jest doesn't support asynchronously defined tests.

const ndjson = require('ndjson')
const fs = require('fs')
const https = require('https')

const OUTPUT = process.stdout
const STACK = []
let IDENT = ""

function write(data) {
  OUTPUT.write(IDENT + data + "\n")
}

function openStack(expr) {
  let [open, close] = expr.split(/BODY/)
  write(open)
  STACK.push(close)
  IDENT += "  "
}

function closeStack() {
  let close = STACK.pop()
  IDENT = IDENT.substring(0, IDENT.length - 2)
  write(close)
}

function space() {
  OUTPUT.write("\n")
}

write(`const {evaluate, parse} = require('../src')`)
write(`const fs = require('fs')`)
write(`const ndjson = require('ndjson')`)
space()
write(`const DATASETS = new Map();`)
openStack(`describe("groq-test-suite", () => {BODY})`)

write(`
const LOADERS = new Map();

async function loadDocuments(id) {
  let entry = DATASETS.get(id)

  if (entry.documents != null) {
    return entry.documents
  }

  if (!LOADERS.has(id)) {
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
  https.request(url, res => {
    res.pipe(fs.createWriteStream(filename))
  }).end()
}

process.stdin
  .pipe(ndjson.parse())
  .on('data', entry => {
    if (entry._type == "dataset") {
      if (entry.documents == null) {
        download(entry._id, entry.url)
      }

      write(`DATASETS.set(${JSON.stringify(entry._id)}, ${JSON.stringify(entry)})`)
      space()
    }

    if (entry._type == "test") {
      openStack(`test("${entry.name}", async () => {BODY}, 20000)`)
      write(`let query = ${JSON.stringify(entry.query)}`)
      write(`let result = ${JSON.stringify(entry.result)}`)
      if (entry.dataset != null) {
        write(`let dataset = await loadDocuments(${JSON.stringify(entry.dataset._ref)})`)
      } else {
        write(`let dataset = []`)
      }
      write(`let tree = parse(query)`)
      write(`let value = await evaluate(tree, {dataset})`)
      write(`let data = await value.get()`)
      write(`data = JSON.parse(JSON.stringify(data))`)
      write(`expect(data).toStrictEqual(result)`)
      closeStack()
      space()
    }
  })
  .on('end', () => {
    closeStack()
  })
