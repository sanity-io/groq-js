#!/usr/bin/env bash
set -eo pipefail

GROQTEST_SUITE_VERSION=${GROQTEST_SUITE_VERSION:-v0.1.32-groq-js}

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
RESULT="$DIR"/suite.taptest.js

curl -sfL "https://github.com/sanity-io/groq-test-suite/releases/download/$GROQTEST_SUITE_VERSION/suite.ndjson" | \
  node "$DIR"/generate.js > "$RESULT"

$DIR/../node_modules/.bin/prettier --write "$RESULT"

echo "Successfully generated $RESULT"
