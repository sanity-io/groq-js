<!-- markdownlint-disable --><!-- textlint-disable -->

# 📓 Changelog

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.6.1](https://github.com/sanity-io/groq-js/compare/v1.6.0...v1.6.1) (2024-04-02)

### Bug Fixes

- remove typeEvaluator typesVersions export ([#207](https://github.com/sanity-io/groq-js/issues/207)) ([80bb8cb](https://github.com/sanity-io/groq-js/commit/80bb8cb202848e7e1a5282939d6d7f8ac04c89cd))

## [1.6.0](https://github.com/sanity-io/groq-js/compare/v1.5.0...v1.6.0) (2024-04-02)

### Features

- **type-evaluation:** add support for Pos and Neg nodes ([bef4ad5](https://github.com/sanity-io/groq-js/commit/bef4ad543077394053f07cd7d9dda311d3eed96b))

### Bug Fixes

- `Exports` should be `exports` ([5cea533](https://github.com/sanity-io/groq-js/commit/5cea533edb6523f73e17c3ca3882cfdd04a1e9c4))
- **deps:** bump `@sanity/pkg-utils` to `v5.1.5` ([d2e8f6c](https://github.com/sanity-io/groq-js/commit/d2e8f6c0769f5ef72e51962e82e62b51803df091))
- remove legacy `typings` field, as `types` is already used ([7c05d5e](https://github.com/sanity-io/groq-js/commit/7c05d5e4e8828c3cdbe0927dfc0ff7bcd5e726f6))
- test ecospark push override ([1e4b895](https://github.com/sanity-io/groq-js/commit/1e4b8953080611636258b11a8ee27dbf088544a2))

## [1.5.0](https://github.com/sanity-io/groq-js/compare/v1.4.3...v1.5.0) (2024-03-19)

### Features

- access optinal attributes should return null ([8e3f7e4](https://github.com/sanity-io/groq-js/commit/8e3f7e41298739fca9a1fe6b86cada2d2cf7fb07))
- add support for slice in type evaluator ([7877990](https://github.com/sanity-io/groq-js/commit/7877990477defe7bbc9e55d024b2e9430ba580c8))
- add tsdoc to describe the type nodes ([65cbc41](https://github.com/sanity-io/groq-js/commit/65cbc41ac209cadd716ed0f35ec225745f9ffa96))
- add type evaluator ([637603b](https://github.com/sanity-io/groq-js/commit/637603bf21472910a59097b189a2844fc865d9fd))
- **evaluateQueryType:** add more tests ([#180](https://github.com/sanity-io/groq-js/issues/180)) ([5d2528e](https://github.com/sanity-io/groq-js/commit/5d2528ec241117bab89fe0cbc23e5dc857363fd1))
- export type evaluation with version 1 ([62c6b7f](https://github.com/sanity-io/groq-js/commit/62c6b7f78e0b3458fe96e64e1ac69917c48127d9))
- only export typeEvaluate function ([e3e3875](https://github.com/sanity-io/groq-js/commit/e3e3875add41c410264db01fedf0a83fe9236d35))
- replace esbuild with tsx. fixes linenumber ([8a60c87](https://github.com/sanity-io/groq-js/commit/8a60c87b16f1ef0d90d57922b51770c270ff8da1))
- **typeEvaluator:** rename main function to `typeEvaluate` ([9c2f345](https://github.com/sanity-io/groq-js/commit/9c2f3453c363a475aa0de7b9705d9ba8bd74729d))

### Bug Fixes

- dont access attributes inside arrays ([0e267bc](https://github.com/sanity-io/groq-js/commit/0e267bc51f38c232050d54285c70241176faa3cf))
- dont stringify objects, let debug/util handle it ([bb7d646](https://github.com/sanity-io/groq-js/commit/bb7d646db2ad05f44612d355286eb77eccc9485c))
- forward type on map unexpected ([8131a71](https://github.com/sanity-io/groq-js/commit/8131a711eb1844009eefef76a3257d68b1b36c76))
- handle flatmap over unions correctly ([70dc0c3](https://github.com/sanity-io/groq-js/commit/70dc0c3497961a7576f3c3017759171a78043395))
- order unions ([5a940e0](https://github.com/sanity-io/groq-js/commit/5a940e043492373234eac74c50230827549ca3b1))
- query node type eval tests ([522bd9b](https://github.com/sanity-io/groq-js/commit/522bd9b80b947f559fd952e0a1d4519b0d733ab0))
- recursively lookup attributes in object rest ([fecc1a1](https://github.com/sanity-io/groq-js/commit/fecc1a1fdcf27e4cf290b63992ebbeff08573afe))
- refactor and reuse scope handling from evaluator ([7bed827](https://github.com/sanity-io/groq-js/commit/7bed827a584e33efa64c4c430969b0b044cf3e8e))
- remove un-evaluated Slice-case ([349645b](https://github.com/sanity-io/groq-js/commit/349645b6c66471c5878e5cd4d524aaea28b990b0))
- **typeEvaluate:** resolve inline when mapping type ([7a3742c](https://github.com/sanity-io/groq-js/commit/7a3742c69a3ed278a0e7e083ea9a2ce9a1216123))
- update snapshots ([0860eaf](https://github.com/sanity-io/groq-js/commit/0860eaf76e432c76192bd109fcc2c483e191c238))
- various type evaluation bugs ([3da42d7](https://github.com/sanity-io/groq-js/commit/3da42d774d3265a167b167bd1418db2180100cc0))

## [1.4.3](https://github.com/sanity-io/groq-js/compare/v1.4.2...v1.4.3) (2024-02-21)

### Bug Fixes

- **deps:** update dependency @sanity/pkg-utils to ^4.2.8 ([#174](https://github.com/sanity-io/groq-js/issues/174)) ([5d353eb](https://github.com/sanity-io/groq-js/commit/5d353eb6d7443d349d7b50d6860a9419e25cd33d))

## [1.4.2](https://github.com/sanity-io/groq-js/compare/v1.4.1...v1.4.2) (2024-02-21)

### Bug Fixes

- **deps:** update non-major ([#172](https://github.com/sanity-io/groq-js/issues/172)) ([29fef52](https://github.com/sanity-io/groq-js/commit/29fef52a8443e08d92ea7bad8cbfe01b91435a0f))

## [1.4.1](https://github.com/sanity-io/groq-js/compare/v1.4.0...v1.4.1) (2024-01-25)

### Bug Fixes

- **deps:** update dependency @sanity/pkg-utils to v4 ([#163](https://github.com/sanity-io/groq-js/issues/163)) ([065f28f](https://github.com/sanity-io/groq-js/commit/065f28f7f96a2752a5253c2143e0ba6a69e6f3ce))

## [1.4.0](https://github.com/sanity-io/groq-js/compare/v1.3.0...v1.4.0) (2024-01-18)

### Features

- export Path class ([c7a8a46](https://github.com/sanity-io/groq-js/commit/c7a8a46cefbede3ad16816137694410a3cbf827d))

## [1.3.0](https://github.com/sanity-io/groq-js/compare/v1.2.0...v1.3.0) (2023-09-08)

### Features

- export `DateTime` class (fixes [#144](https://github.com/sanity-io/groq-js/issues/144)) ([4d4e397](https://github.com/sanity-io/groq-js/commit/4d4e397d1ed91e9f470093d007aa833c4861e5de))
- expose `namespace` on FuncCall node (fixes [#145](https://github.com/sanity-io/groq-js/issues/145)) ([ea77e7e](https://github.com/sanity-io/groq-js/commit/ea77e7e36a5835e86836dbfa5171580249406e16))
- implement dateTime namespace (fixes [#143](https://github.com/sanity-io/groq-js/issues/143)) ([932b2bc](https://github.com/sanity-io/groq-js/commit/932b2bcd4e3dd4123af7a8b272a891e198933d4e))

### Bug Fixes

- != should be non-associative (fixes [#147](https://github.com/sanity-io/groq-js/issues/147)) ([8c1a9e3](https://github.com/sanity-io/groq-js/commit/8c1a9e3d13b2d30a6ae34e74c890737b33ca1278))

## [1.2.0](https://github.com/sanity-io/groq-js/compare/v1.1.12...v1.2.0) (2023-08-23)

### Features

- add option to provide a custom dereference function ([#98](https://github.com/sanity-io/groq-js/issues/98)) ([7e5c789](https://github.com/sanity-io/groq-js/commit/7e5c7898b104e89ffe2a94b23ac0243b7c179d5f))

## [1.1.12](https://github.com/sanity-io/groq-js/compare/v1.1.11...v1.1.12) (2023-08-10)

### Bug Fixes

- handle parenthesis directly inside filters ([abe94a9](https://github.com/sanity-io/groq-js/commit/abe94a9fca57108cef084e412307f992eaf93e79))

## [1.1.11](https://github.com/sanity-io/groq-js/compare/v1.1.10...v1.1.11) (2023-08-07)

### Bug Fixes

- add `node.module` condition for bundlers ([67365ac](https://github.com/sanity-io/groq-js/commit/67365acadbee7df79c06deedbb1f26ae331f8fb5))

## [1.1.10](https://github.com/sanity-io/groq-js/compare/v1.1.9...v1.1.10) (2023-08-04)

### Bug Fixes

- **deps:** update non-major ([#126](https://github.com/sanity-io/groq-js/issues/126)) ([f84fbda](https://github.com/sanity-io/groq-js/commit/f84fbda97f317bb484b8c65c850ea889be9d8ecb))

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
