#!/usr/bin/env bash
set -eo pipefail

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
RESULT="$DIR"/suite.test.ts

curl -sfL 'https://github.com/sanity-io/groq-test-suite/releases/latest/download/suite.ndjson' | \
  node "$DIR"/generate.js > "$RESULT"

$DIR/../node_modules/.bin/prettier --write "$RESULT"

echo "Successfully generated $RESULT"
