<!-- markdownlint-disable --><!-- textlint-disable -->

# 📓 Changelog

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.1.9](https://github.com/sanity-io/groq-js/compare/v1.1.8...v1.1.9) (2023-04-13)

### Bug Fixes

- **package.json:** add `repository` field ([3638394](https://github.com/sanity-io/groq-js/commit/3638394708b89e06895d8af50502c8d1ea3850a6))

## [1.1.8](https://github.com/sanity-io/groq-js/compare/v1.1.7...v1.1.8) (2023-03-06)

### Bug Fixes

- **deps:** update devdependencies (non-major) ([#100](https://github.com/sanity-io/groq-js/issues/100)) ([39dc24b](https://github.com/sanity-io/groq-js/commit/39dc24b774423c4fda0a3dc9169d768d771638fe))

## [1.1.7](https://github.com/sanity-io/groq-js/compare/v1.1.6...v1.1.7) (2023-02-14)

### Bug Fixes

- use pkg-utils to generate JS and typings ([195352f](https://github.com/sanity-io/groq-js/commit/195352fb2f9dc1608178fcaac194a66acea20240))

## [1.1.6](https://github.com/sanity-io/groq-js/compare/v1.1.5...v1.1.6) (2023-01-18)

### Bug Fixes

- namespaced functions should consume any whitespace before function arguments ([481e88d](https://github.com/sanity-io/groq-js/commit/481e88dcab348d43e3aba19d018f64a2c803cdb4))

## [1.1.5](https://github.com/sanity-io/groq-js/compare/v1.1.4...v1.1.5) (2023-01-12)

### Bug Fixes

- add API.md to npm publish ([e92bb78](https://github.com/sanity-io/groq-js/commit/e92bb78e3f53465c3125d49c65f9d73dd6e91951))

## [1.1.4](https://github.com/sanity-io/groq-js/compare/v1.1.3...v1.1.4) (2023-01-12)

### Bug Fixes

- add pkg keywords ([8f6fdad](https://github.com/sanity-io/groq-js/commit/8f6fdad53a5173339614f4e562e75afc1fa0d065))

## [1.1.3](https://github.com/sanity-io/groq-js/compare/v1.1.2...v1.1.3) (2023-01-12)

### Bug Fixes

- **docs:** add pnpm example ([98010d2](https://github.com/sanity-io/groq-js/commit/98010d287c0ddcebf3052ed72a9d95f5400f1ecc))

## [1.1.2](https://github.com/sanity-io/groq-js/compare/v1.1.1...v1.1.2) (2023-01-12)

### Bug Fixes

- add `sideEffects: false` for better tree-shaking ([77b3366](https://github.com/sanity-io/groq-js/commit/77b3366f8f79aead50f6df0e53b8ba8a36266a20))
- setup release automation ([f676dff](https://github.com/sanity-io/groq-js/commit/f676dff71722c88055d02d9f6234a72ff839268d))
- support `swcMinify` in NextJS 13 ([9beabc1](https://github.com/sanity-io/groq-js/commit/9beabc1d46b7e9f59e1f3eb0c7f39edc9286435a))

## v1.0.0-rc - 2022-07-28

New features:

- Implement `array::unique()`
- Implement aggregation functions on the `math` namespace:
  - `min()`
  - `max()`
  - `sum()`
  - `avg()`
- Implement functions on the `string` namespace:
  - `startsWith()`
  - `split()`
- Implement functions on the `array` namespace:
  - `join()`
  - `compact()`
- Introduce support for using specific GROQ versions
- Introduce validation for selector syntax

Tooling changes:

- Support local test via `$GROQTEST_SUITE`

## v0.4.0-beta.2 - 2022-03-21

Bug fixes

- Correctly accept function calls with trailing commas: `select(123,)`.
- Correctly parse object expressions which start with literal strings (e.g. `{"mail" == … => …}`).
- Correctly accept comments with no text (`//` on a single line).

## v0.4.0-beta.1

Bug fixes:

- Fix error `ReferenceError: marks is not defined` which happened while parsing strings in strict mode.

## v0.4.0-beta.0 - 2021-12-14

New features:

- Support specifying `now()` and `identity()` during evaluation.
- Support for validating Delta GROQ.

Backwards compatible API changes:

- Introduce `params` and `mode` option on `parse`.
- Introduce `before` and `after` option on `evaluate`.
- The main file is now an UMD file usable in the browser, exported under `groqJS`.

Private changes:

- Rewrite parser, optimizing for performance.

Tooling changes:

- Use Vite and esbuild instead of TSDX.
- Switch completely over from Jest to Tap for running test.

## v0.3.0 - 2021-06-25

API changes:

- Introduce `params` parameter on `parse` which is required to properly parse an expression (@judofyr)

GROQ compatibility fixes:

- Preserve nulls in objects (@judofyr, #36)
- Add support for arrays in `length` (@judofyr)
- Use stable sorting in `order` (@judofyr)
- Implement `string` function (@judofyr, @israelroldan)
- Add support for arrays in `references` (@judofyr)
- Implement `dateTime` (@judofyr)
- Implement proper array traversal (@judofyr)
- Implement `score` function (@judofyr)
- Implement namespaced functions (@judofyr)
- Implement `lower` and `upper` (@judofyr)
- Implement `pt::text` (@judofyr)
- Improve `match` behavior (@judofyr)

Private changes:

- Simplify and restructure AST (@judofyr)
- Split up `SyntaxNode` into a special `ExprNode` represent what's returned from `parse` (@judofyr)

Tooling changes:

- Use `tap` for running tests since Jest is too slow (@judofyr)

## v0.2.0 - 2020-10-20

- Require native generators (@rexxars)
- Support concatenation of arrays (@rexxars)
- Correctly fail on invalid asc/desc (@judofyr)
- Projection should not be mapped inside traversals (@judofyr)
- getType: Detect Pair correctly (@judofyr)
- Add support for object merging (@judofyr)
- Improve match semantics (@judofyr)
- Fix ESM build (@rexxars)

## v0.1.8 - 2020-09-27

- Upgrade dependencies (@rexxars)

## v0.1.7 - 2020-06-15

- Fix build so that it includes rawParser (@judofyr)
- Work around bug in babel-plugin-transform-async-to-promises (@judofyr)

## v0.1.6 - 2020-06-15

- Migrate to TypeScript (#18, @rexxars, @judofyr)
- Update semantics to work with latest GROQ spec

## v0.1.5 - 2020-03-17

- Add LICENSE.md
- Add `license`-field in package.json
- Fix crash during dereferencing when the dataset is non-array
- Implement `now()` function (#16, @rexxars)

## v0.1.4 - 2019-10-15

- Add custom syntax error object (#10, @asbjornh)

## v0.1.3 - 2019-09-17

- Implement `path()` function (#7)

## v0.1.2 - 2019-09-12

- Add support for parameters (#6)

## v0.1.1 - 2019-09-10

- Add support for escape sequences in string literals

## v0.1.0 - 2019-09-09

- Big rewrite with much improved support

## v0.0.1 - 2019-07-10

- Initial hacky version
