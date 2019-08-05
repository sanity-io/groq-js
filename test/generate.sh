#!/usr/bin/env bash
set -eo pipefail

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

if [ -z "$1" ]; then
  echo "usage: $0 <directory>"
  echo
  echo " (where <directory> is a clone of https://github.com/sanity-io/groq-test-suite)"
  exit 1
fi

RESULT="$DIR"/suite.test.js

(
  cd "$1" &&
  yarn --silent build
) | node "$DIR"/generate.js > "$RESULT"

echo "Successfully generated $RESULT"
