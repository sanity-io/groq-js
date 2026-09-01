import {defineConfig} from '@sanity/tsdown-config'
import {mergeConfig} from 'tsdown'

export default mergeConfig(
  await defineConfig({
    tsconfig: 'tsconfig.json',
    entry: {
      'index': 'src/index.ts',
      '1': 'src/1.ts',
      'experimental': 'src/experimental.ts',
    },
    format: ['esm'],
  }),
  {
    outputOptions: {
      // Split build into shared + evaluator chunks for tree-shaking.
      // Consumers who only import parse() can tree-shake the evaluator
      // chunk, since the entry only references it for evaluate exports.
      //
      // rolldown-plugin-dts generates declarations as virtual .d.ts modules
      // in the same graph and only emits a chunk as .d.ts when the chunk
      // name ends in `.d`. The `.d` groups must come first, or the
      // declaration modules land in the runtime chunks and never emit:
      // https://github.com/sxzz/rolldown-plugin-dts#code-splitting-support
      advancedChunks: {
        groups: [
          {name: 'shared.d', test: /src[\\/]shared[\\/].*\.d\.[cm]?ts$/},
          {name: 'evaluator.d', test: /src[\\/]evaluator[\\/].*\.d\.[cm]?ts$/},
          {name: 'shared', test: /src[\\/]shared[\\/]/},
          {name: 'evaluator', test: /src[\\/]evaluator[\\/]/},
        ],
      },
    },
  },
)
