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
    format: ['esm', 'commonjs'],
  }),
  {
    outputOptions: {
      // Split build into shared + evaluator chunks for tree-shaking.
      // Consumers who only import parse() can tree-shake the evaluator
      // chunk, since the entry only references it for evaluate exports.
      advancedChunks: {
        groups: [
          {name: 'shared', test: /src[\\/]shared[\\/]/},
          {name: 'evaluator', test: /src[\\/]evaluator[\\/]/},
        ],
      },
    },
  },
)
