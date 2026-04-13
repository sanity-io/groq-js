import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  extract: {
    rules: {
      'ae-internal-missing-underscore': 'off',
      'ae-missing-release-tag': 'warn',
    },
  },
  rollup: {
    output: {
      manualChunks(id) {
        // Split build into shared + evaluator chunks for tree-shaking.
        // Consumers who only import parse() can tree-shake the evaluator
        // chunk, since the entry only references it for evaluate exports.
        const relative = id.split('/src/').pop()
        if (!relative || relative === id) return undefined

        // evaluator/matching is also used by the type evaluator, so it
        // must be in the shared chunk to avoid a circular dependency.
        if (relative.startsWith('evaluator/matching')) {
          return 'shared'
        }

        if (
          relative.startsWith('evaluator/') &&
          !relative.startsWith('evaluator/types')
        ) {
          return 'evaluator'
        }

        if (
          relative.startsWith('values') ||
          relative === 'nodeTypes.ts' ||
          relative === 'functionRegistry.ts' ||
          relative === 'constantEvaluate.ts'
        ) {
          return 'shared'
        }

        return undefined
      },
    },
  },
})
