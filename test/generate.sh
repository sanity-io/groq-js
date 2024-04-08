#!/usr/bin/env bash
set -exo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

if [[ "$GROQTEST_SUITE" != "" ]]; then
  echo "Using test suite file: $GROQTEST_SUITE"
  node "$DIR"/generate.js < "$GROQTEST_SUITE"
else
  GROQTEST_SUITE_VERSION=${GROQTEST_SUITE_VERSION:-v0.1.38}
  url=https://github.com/sanity-io/groq-test-suite/releases/download/$GROQTEST_SUITE_VERSION/suite.ndjson
  echo "Getting test suite: $url"
  curl -sfL "$url" | node "$DIR"/generate.js
fi

npx prettier --write $DIR/suite*.test.js

echo "Successfully generated test suite files."
