// Consumes a compiled test suite (https://github.com/sanity-io/groq-test-suite)
// from stdin and generates a Jest test file on stdout.
//
// This is needed because Jest doesn't support asynchronously defined tests.

const ndjson = require('ndjson')

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
space()
write(`const DATASETS = new Map();`)
openStack(`describe("groq-test-suite", () => {BODY})`)

process.stdin
  .pipe(ndjson.parse())
  .on('data', entry => {
    if (entry._type == "dataset") {
      write(`DATASETS.set(${JSON.stringify(entry._id)}, ${JSON.stringify(entry.documents)})`)
      space()
    }

    if (entry._type == "test") {
      openStack(`test("${entry.name}", async () => {BODY})`)
      write(`let query = ${JSON.stringify(entry.query)}`)
      write(`let result = ${JSON.stringify(entry.result)}`)
      write(`let documents = DATASETS.get(${JSON.stringify(entry.dataset)})`)
      write(`let tree = parse(query)`)
      write(`let value = await evaluate(tree, {documents})`)
      write(`let data = await value.get()`)
      write(`expect(data).toStrictEqual(result)`)
      closeStack()
      space()
    }
  })
  .on('end', () => {
    closeStack()
  })
