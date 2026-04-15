import path from 'node:path'
import {defineConfig} from '@sanity/pkg-utils'

const src = path.resolve(__dirname, 'src')

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
        if (!id.startsWith(src)) return undefined

        const relative = path.relative(src, id)

        if (relative.startsWith(`shared${path.sep}`)) return 'shared'
        if (relative.startsWith(`evaluator${path.sep}`)) return 'evaluator'

        return undefined
      },
    },
  },
})
