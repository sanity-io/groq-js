<!-- markdownlint-disable --><!-- textlint-disable -->

# 📓 Changelog

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.20.0](https://github.com/sanity-io/groq-js/compare/v1.19.0...v1.20.0) (2025-10-16)

### Features

- add `unparse()` function ([#310](https://github.com/sanity-io/groq-js/issues/310)) ([ca38b52](https://github.com/sanity-io/groq-js/commit/ca38b527ade9d172c12c6c909e4930151360453d))

## [1.19.0](https://github.com/sanity-io/groq-js/compare/v1.18.0...v1.19.0) (2025-09-24)

### Features

- add synchronous evaluator for pipe functions ([2cc9134](https://github.com/sanity-io/groq-js/commit/2cc91346f55c6e01df31153c05829217729fc6af))
- add synchronous evaluator for score() ([143e9e1](https://github.com/sanity-io/groq-js/commit/143e9e19c9d6da8d13d73e05e6b83b5e311e990f))
- enable pt::text in synchronous mode ([cea0eb3](https://github.com/sanity-io/groq-js/commit/cea0eb3b68c79dd7e6d2e4c82babc69fc9dc0988))
- implement more sync evaluators ([62f7519](https://github.com/sanity-io/groq-js/commit/62f751909086561abd8dcb5a1e2dd972f1293b10))
- implement more sync evaluators ([2471091](https://github.com/sanity-io/groq-js/commit/24710915d57cc109a4e199ec2b4d257149faac8c))
- introduce `toJS` ([0ab8a17](https://github.com/sanity-io/groq-js/commit/0ab8a17778b911aba49d4689ab418af7a2788715))
- introduce evaluateSync ([af51fac](https://github.com/sanity-io/groq-js/commit/af51facc3b1e11c02e0d5f7b15c3fd7cdbd24388))
- **typeEvaluator:** support document::get -> unknown/null ([c55e82a](https://github.com/sanity-io/groq-js/commit/c55e82ae469db81021f2c8fba07158a53b06284e))

## [1.18.0](https://github.com/sanity-io/groq-js/compare/v1.17.3...v1.18.0) (2025-09-08)

### Features

- Add parser error messages ([#292](https://github.com/sanity-io/groq-js/issues/292)) ([24c555e](https://github.com/sanity-io/groq-js/commit/24c555e3c419be158e3984198b4f4ca2b3701628))
- Add support for diff::changedOnly ([#294](https://github.com/sanity-io/groq-js/issues/294)) ([3c2b553](https://github.com/sanity-io/groq-js/commit/3c2b55373dfbdd55de64524fdb09e7f5eafc6d2f))
- Enable support for delta mode changedAny and changedOnly ([#298](https://github.com/sanity-io/groq-js/issues/298)) ([e51f4c6](https://github.com/sanity-io/groq-js/commit/e51f4c6c56fa051a5a8d7277399d084bf8735575))
- **parser:** Add geo namespace with noop ([889ebff](https://github.com/sanity-io/groq-js/commit/889ebff7ed3f54c1fc2809b759fc15b67e9296b7))
- Support diff::changedAny function ([#293](https://github.com/sanity-io/groq-js/issues/293)) ([7f3ead8](https://github.com/sanity-io/groq-js/commit/7f3ead89374f5069af2ff7f71d3ee566ed700812))
- **typeEvaluator:** Handle geo functions in type evaluator ([351d499](https://github.com/sanity-io/groq-js/commit/351d499a25fb6ee0247f2e6bf5c40844b55f5270))

### Bug Fixes

- Handle exceptions during StreamValue fetch ([#295](https://github.com/sanity-io/groq-js/issues/295)) ([6e13515](https://github.com/sanity-io/groq-js/commit/6e13515ee871cd6b42fb1f7315336488b74a3100))
- **test:** Cleanup warning output from generate.js ([#291](https://github.com/sanity-io/groq-js/issues/291)) ([c7bb73c](https://github.com/sanity-io/groq-js/commit/c7bb73ce4e488a76b0713afe62293a7b3e88b022))

## [1.17.3](https://github.com/sanity-io/groq-js/compare/v1.17.2...v1.17.3) (2025-07-23)

### Bug Fixes

- **typeEvaluator:** resolve rest field on deref ([4a22363](https://github.com/sanity-io/groq-js/commit/4a22363de7afb6a36605e95fcf5a416cdd560218))

## [1.17.2](https://github.com/sanity-io/groq-js/compare/v1.17.1...v1.17.2) (2025-07-18)

### Bug Fixes

- **typeEvaluator:** map derefs to handle inlined references ([b854b02](https://github.com/sanity-io/groq-js/commit/b854b02629101b09dde406ca1eb5c1184da88d66))

## [1.17.1](https://github.com/sanity-io/groq-js/compare/v1.17.0...v1.17.1) (2025-06-23)

### Bug Fixes

- address review comments ([4ede432](https://github.com/sanity-io/groq-js/commit/4ede4329f2b5adf34466229448cfdbeb65b1bd39))
- correct implementation of release functions ([a73f741](https://github.com/sanity-io/groq-js/commit/a73f741fbecbfb91a89d17aee8d6fc8afdf8736f))
- correct type evaluator as well ([abe586e](https://github.com/sanity-io/groq-js/commit/abe586edcff80cb55b65958bc6c6cf316d5c5670))

## [1.17.0](https://github.com/sanity-io/groq-js/compare/v1.16.1...v1.17.0) (2025-05-26)

### Features

- add support for text::query() ([#283](https://github.com/sanity-io/groq-js/issues/283)) ([0a1cce6](https://github.com/sanity-io/groq-js/commit/0a1cce65bae952d0bda738d9ad10d31a9830a58f))

## [1.16.1](https://github.com/sanity-io/groq-js/compare/v1.16.0...v1.16.1) (2025-03-10)

### Bug Fixes

- **typeEvaluator:** avoid recalculating typeNode hash ([557fb89](https://github.com/sanity-io/groq-js/commit/557fb89e9838288988d6ca4bcdca09f78a348a2c))

## [1.16.0](https://github.com/sanity-io/groq-js/compare/v1.15.0...v1.16.0) (2025-03-06)

### Features

- **functions:** add releases:all() ([7c67bd1](https://github.com/sanity-io/groq-js/commit/7c67bd124292d1404eaee1202da1ca50c0fd1c51))

### Bug Fixes

- **functions:** correct behaviour of partOfRelease and versionOf ([1a85198](https://github.com/sanity-io/groq-js/commit/1a851986d8372f4d9fcc4a7deef322409251eacd))
- revert sanity::versionsOf to versionOf ([#274](https://github.com/sanity-io/groq-js/issues/274)) ([6179e61](https://github.com/sanity-io/groq-js/commit/6179e61bd4a640df000b3329c8101e0ed68fcc11))

## [1.15.0](https://github.com/sanity-io/groq-js/compare/v1.14.2...v1.15.0) (2025-02-03)

### Features

- renames extension functions for releases ([#271](https://github.com/sanity-io/groq-js/issues/271)) ([03d0035](https://github.com/sanity-io/groq-js/commit/03d0035ef307e2522a5b9540d72fe40f0f6d88a8))

## [1.14.2](https://github.com/sanity-io/groq-js/compare/v1.14.1...v1.14.2) (2024-12-09)

### Bug Fixes

- ensure coalesce handles optional/unknown/null properly ([610e21e](https://github.com/sanity-io/groq-js/commit/610e21ea818c84762e79796c3f45d5e09500f830))

## [1.14.1](https://github.com/sanity-io/groq-js/compare/v1.14.0...v1.14.1) (2024-11-28)

### Bug Fixes

- pipe functions in projections ([40e6c25](https://github.com/sanity-io/groq-js/commit/40e6c2554081de9fea77e0b1eebc4eb0a4582d9a))

## [1.14.0](https://github.com/sanity-io/groq-js/compare/v1.13.0...v1.14.0) (2024-11-04)

### Features

- add array intersects function ([ced9e90](https://github.com/sanity-io/groq-js/commit/ced9e90febb37348c538c67f8bce6b17928a3877))
- can extract attribute key from Group ([46ba490](https://github.com/sanity-io/groq-js/commit/46ba490757383d7151ac31b60c543d36448c0540))
- **typeEvaluator:** implement proper support for defined in filters ([d319f1c](https://github.com/sanity-io/groq-js/commit/d319f1c5c027280e8c65253ae28e08d53644e6c8))
- upgrade groq-test-suite version to v0.1.46 ([a71e3ec](https://github.com/sanity-io/groq-js/commit/a71e3ec38ee64bb3e505aee446caa64252dccfa2))

### Bug Fixes

- **functions:** fix typo mapConcrete to mapNode ([7f57a91](https://github.com/sanity-io/groq-js/commit/7f57a91888cc274c686f750ab30d8675eeab317a))

## [1.13.0](https://github.com/sanity-io/groq-js/compare/v1.12.0...v1.13.0) (2024-08-26)

### Features

- add new GROQ function sanity::documentsOf ([c086187](https://github.com/sanity-io/groq-js/commit/c086187210794ff5c75d9decefe6891e31f0d184))
- **typeEvaluator:** do not let unknown always resolve to unknown ([41679a3](https://github.com/sanity-io/groq-js/commit/41679a3993a9240b4ef5753ad420b959d0168200))
- **typeEvaluator:** remove resolve condition, use walk to determine conditions ([38ca510](https://github.com/sanity-io/groq-js/commit/38ca5104136b32f72ee3d9cb6d32e0832170f2fc))

## [1.12.0](https://github.com/sanity-io/groq-js/compare/v1.11.1...v1.12.0) (2024-07-26)

### Features

- **typeEvaluator:** add support for global::dateTime ([8ed40ea](https://github.com/sanity-io/groq-js/commit/8ed40ea619823c8000677f482f17bea17608b194))
- **typeEvaluator:** add support for global::length ([a244bdc](https://github.com/sanity-io/groq-js/commit/a244bdcef9ca3ca50b1dca126631a0bd81ec9b8e))

## [1.11.1](https://github.com/sanity-io/groq-js/compare/v1.11.0...v1.11.1) (2024-07-25)

### Bug Fixes

- **typeEvaluator:** fix bug when splatting over optional attributes ([92d2449](https://github.com/sanity-io/groq-js/commit/92d244935d677af024311da4ed83a1c4c578e4e9))

## [1.11.0](https://github.com/sanity-io/groq-js/compare/v1.10.0...v1.11.0) (2024-07-23)

### Features

- add support for sanity::versionOf() ([fb2f5d0](https://github.com/sanity-io/groq-js/commit/fb2f5d0a02b09e50a91f9e1d1b5b9245f20f7443))
- add type evaluator for sanity::versionOf() ([db54be4](https://github.com/sanity-io/groq-js/commit/db54be465e0822985d9848adf405c4a145b2e8d1))
- **typeEvaluator:** validate if arg to sanity::versionOf is string ([0f4d047](https://github.com/sanity-io/groq-js/commit/0f4d047f163834e76e3eb727b4adc898986d2a08))

## [1.10.0](https://github.com/sanity-io/groq-js/compare/v1.9.0...v1.10.0) (2024-07-02)

### Features

- **typeEvaluate:** preserve value when casting string upper/lower case ([fc189a0](https://github.com/sanity-io/groq-js/commit/fc189a07badc8c41e569b13c45c6eb39f7f53d85))
- **typeEvaluator:** add support for array functions ([86b1053](https://github.com/sanity-io/groq-js/commit/86b1053ea02d7c74facb3f182a8df1ae6ee78cb4))
- **typeEvaluator:** add support for dateTime::now() ([9ad8200](https://github.com/sanity-io/groq-js/commit/9ad82008793f658c101a394ac5d8ba3cb3387879))
- **typeEvaluator:** add support for global::now() ([d8cf2d9](https://github.com/sanity-io/groq-js/commit/d8cf2d957799958f34a84aad29f652d369059607))
- **typeEvaluator:** add support for round() ([641ecc6](https://github.com/sanity-io/groq-js/commit/641ecc67cbfb35eb1f2e10900022d333c0d7722d))
- **typeEvaluator:** add support for upper() and lower() ([0934a3c](https://github.com/sanity-io/groq-js/commit/0934a3c0d3a6753f95f484eb8e78b57a14d63b16))
- **typeEvaluator:** expand all unions inside a object ([1a5106d](https://github.com/sanity-io/groq-js/commit/1a5106dad97b0fdef159132d4e578ad3faf6867d))

### Bug Fixes

- **typeEvaluator:** bail early if splatting over a non-union/object ([117ec01](https://github.com/sanity-io/groq-js/commit/117ec011dff00e7b6908c530d444a46d04790be3))
- **typeEvaluator:** handle access{attribute,element) when resolving conditions ([313369c](https://github.com/sanity-io/groq-js/commit/313369c35446dea007a5c7f9b88a419b6632e1c5))
- **typeEvaluator:** handle not nodes when resolving conditions ([c940472](https://github.com/sanity-io/groq-js/commit/c9404728e293e56d230bfedf62a67f27d1a15bc2))
- **typeEvaluator:** handle rest on object splat operations ([2ce28eb](https://github.com/sanity-io/groq-js/commit/2ce28eb042a259d226e125da816eb88f9a475a81))
- **typeEvaluator:** make sure we are not inside a hidden scope when resolving parent nodes ([f109098](https://github.com/sanity-io/groq-js/commit/f109098ff6f344ae855b5de4fbcd2112778175cd))
- **typeEvaluator:** map over concrete values and return them as alternatives ([f3adc53](https://github.com/sanity-io/groq-js/commit/f3adc53e47ffad1e419246902c5b19524634fb0f))
- **typeEvaluator:** move object splat into separate methods to ensure conrete mapping ([8f1a8d9](https://github.com/sanity-io/groq-js/commit/8f1a8d99361300a6f7cce159aeade4854d3399cc))
- **typeEvaluator:** properly handle object splats with non-concrete types ([97aee3e](https://github.com/sanity-io/groq-js/commit/97aee3ee40297c099e8546d69b5f18e04a7946ab))
- **typeEvaluator:** return undefined by default when resolving condition ([bfb3d5e](https://github.com/sanity-io/groq-js/commit/bfb3d5eeed526b51c14da0c921e51877662ec63f))

## [1.9.0](https://github.com/sanity-io/groq-js/compare/v1.8.0...v1.9.0) (2024-05-14)

### Features

- **typeEvaluator:** add support for global::references ([af958db](https://github.com/sanity-io/groq-js/commit/af958db1623e9557624f97dba280bc588aee240b))
- **typeEvaluator:** add support for string::split ([dd823dd](https://github.com/sanity-io/groq-js/commit/dd823dde0a6c687e0637fffe4f80d1502321907d))
- **typeEvaluator:** add support for string::startsWith ([6b51180](https://github.com/sanity-io/groq-js/commit/6b511808203084bb54777c6d182339e34aad2019))

### Bug Fixes

- **typeEvaluator:** update hash group to capture start/end ([531fe81](https://github.com/sanity-io/groq-js/commit/531fe815292bd3e031bc6ba26d8d688696af7ba1))

## [1.8.0](https://github.com/sanity-io/groq-js/compare/v1.7.0...v1.8.0) (2024-04-24)

### Features

- **typeEvaluation:** add support for global::string ([133d8af](https://github.com/sanity-io/groq-js/commit/133d8afbae75022f88abb1b253803ee8f95af55a))
- **typeEvaluator:** add support for count ([49e05c7](https://github.com/sanity-io/groq-js/commit/49e05c7aebfdeb5f585c78a68e92690f7355c845))

### Bug Fixes

- loosen strictness for equality with unions ([04b4b36](https://github.com/sanity-io/groq-js/commit/04b4b36b489b6abedd0d55649513b8fdf2134ad6))
- **typeEvaluation:** map over unions to support filtering null-unions ([6ad2398](https://github.com/sanity-io/groq-js/commit/6ad23980ce7f243cb799c2ae6b8e36f11165ee2a))
- **types:** use the strictest tsconfig preset ([#222](https://github.com/sanity-io/groq-js/issues/222)) ([8a83812](https://github.com/sanity-io/groq-js/commit/8a83812ced1d731035ced25eb15c8bbf609b73ae))

## [1.7.0](https://github.com/sanity-io/groq-js/compare/v1.6.1...v1.7.0) (2024-04-02)

### Features

- **typeEvaluation:** let optional resolved condition be evaulated ([91ef6b5](https://github.com/sanity-io/groq-js/commit/91ef6b521adf511129409f97a196bf168c5d2542))

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
