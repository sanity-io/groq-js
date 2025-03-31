// @ts-check
import eslint from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  eslintPluginPrettierRecommended,
  tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'error',
      'no-warning-comments': ['warn', {location: 'start', terms: ['todo', 'fixme']}],
      '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
    },
  },
  {
    ignores: [
      '**/suite.test.js',
      '**/test/generate.js',
      '**/dist/**/*',
      '**/tap-snapshots/**/*',
      '**/coverage/**/*',
    ],
  },
)
