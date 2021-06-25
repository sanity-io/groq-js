# Changelog

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
