# GROQ-JS

GROQ-JS is a (work-in-progress) JavaScript implementation of [GROQ](https://www.sanity.io/docs/data-store/how-queries-work) which follows the official specification.

```javascript
import {parse, evaluate} from 'groq-js'

let input = '*[_type == "user"]{name}'

// Returns an ESTree-inspired syntax tree
let tree = parse(input)

let documents = [
  {_type: "user", name: "Michael"},
  {_type: "company", name: "Bluth Company"}
]

// Evaluate a tree against a set of documents
let value = await evaluate(tree, {documents})

// Gather everything into one JavaScript object
let result = await value.get()

console.log(result)
```

Table of contents:

- [Installation](#installation)
- [Documentation](#documentation)
- [Versioning](#versioning)
- [License](#license)
- [Tests](#tests)

## Installation

GROQ-JS is currently not yet released on NPM.com, but you can install the development version from Git:

```bash
# NPM
npm i groq-js

# Yarn
yarn add groq-js
```

## Documentation

See [API.md](API.md) for the public API.

## Versioning

GROQ-JS follows [SemVer](https://semver.org) and is currently at version v0.1.
This is an "experimental" release and anything *may* change at any time, but we're trying to keep changes as minimal as possible:

- The public API of the parser/evaluator will most likely stay the same in future version.
- The syntax tree is *not* considered a public API and may change at any time.
- This package always implements the latest version of [GROQ according to the specification](https://github.com/sanity-io/groq). 
- The goal is to release a v1.0.0 by the end of 2019.

## License

MIT © [Sanity.io](https://www.sanity.io/)

## Tests

Tests are written in [Jest](https://jestjs.io/):

```bash
# Install dependencies
yarn

# Run tests
yarn test
```

You can also generate tests from [the official GROQ test suite](https://github.com/sanity-io/groq-test-suite):

```bash
# Clone the repo somewhere:
git clone https://github.com/sanity-io/groq-test-suite somewhere

# Install dependencies:
(cd somewhere && yarn)

# Generate test file (in this repo):
./test/generate.sh somewhere

# Run tests as usual:
yarn test
```