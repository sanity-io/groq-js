#!/usr/bin/env bash
set -eo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
RESULT="$DIR"/suite.test.js

if [[ "$GROQTEST_SUITE" != "" ]]; then
  node "$DIR"/generate.js < "$GROQTEST_SUITE" >"$RESULT"
else
  GROQTEST_SUITE_VERSION=${GROQTEST_SUITE_VERSION:-v0.1.35}
  curl -sfL "https://github.com/sanity-io/groq-test-suite/releases/download/$GROQTEST_SUITE_VERSION/suite.ndjson" |
    node "$DIR"/generate.js >"$RESULT"
fi

$DIR/../node_modules/.bin/prettier --write "$RESULT"

echo "Successfully generated $RESULT"
