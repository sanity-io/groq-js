import path from 'node:path'
import {defineConfig} from '@sanity/pkg-utils'

const src = path.resolve(__dirname, 'src')

function isUnder(relative: string, dir: string): boolean {
  return relative.startsWith(dir + path.sep) || relative === dir
}

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
        const dir = path.dirname(relative)
        const name = path.basename(relative, path.extname(relative))

        // evaluator/matching is also used by the type evaluator, so it
        // must be in the shared chunk to avoid a circular dependency.
        if (dir === 'evaluator' && name === 'matching') {
          return 'shared'
        }

        if (isUnder(relative, 'evaluator') && name !== 'types') {
          return 'evaluator'
        }

        // Values, node types, and other shared modules must be explicitly
        // assigned to the shared chunk. Without this, rollup inlines them
        // into the evaluator chunk, which prevents tree-shaking.
        if (
          isUnder(relative, 'values') ||
          name === 'nodeTypes' ||
          name === 'functionRegistry' ||
          name === 'constantEvaluate'
        ) {
          return 'shared'
        }

        return undefined
      },
    },
  },
})
