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

        // Evaluator modules also used by non-evaluator code (type evaluator,
        // parser) must stay in the shared chunk to avoid circular deps.
        const evaluatorShared = [
          'evaluator/types',
          'evaluator/matching',
          'evaluator/operators',
          'evaluator/ordering',
          'evaluator/equality',
        ]

        if (
          relative.startsWith('evaluator/') &&
          !evaluatorShared.some((prefix) => relative.startsWith(prefix))
        ) {
          return 'evaluator'
        }
        if (
          evaluatorShared.some((prefix) => relative.startsWith(prefix)) ||
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
