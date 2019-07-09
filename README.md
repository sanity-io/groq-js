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
let result = await evaluate(tree, {documents})
```

Table of contents:

- [Installation](#installation)
- [Versioning](#versioning)
- [License](#license)

## Installation

GROQ-JS is currently not yet released on NPM.com, but you can install the development version from Git:

```bash
# NPM
npm i git+https://git@github.com/sanity-io/groq-js.git

# Yarn
yarn add git+https://git@github.com/sanity-io/groq-js.git
```

## Versioning

GROQ-JS is currently not released.

## License

MIT © [Sanity.io](https://www.sanity.io/)