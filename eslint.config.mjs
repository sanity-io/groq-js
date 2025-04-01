// @ts-check
import eslint from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import-x'
import tsdoc from 'eslint-plugin-tsdoc'

export default tseslint.config(
  eslint.configs.recommended,
  eslintPluginPrettierRecommended,
  tseslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    plugins: {tsdoc},
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
      'import-x/consistent-type-specifier-style': ['error', 'prefer-inline'],
      'import-x/extensions': ['error', 'never'],
      'import-x/first': 'error',
      'import-x/newline-after-import': 'error',
      'import-x/no-duplicates': ['error', {'prefer-inline': true}],
      'import-x/no-named-as-default-member': 'off',
      'import-x/no-self-import': 'error',
      'import-x/order': 'error',
      'no-console': 'error',
      'no-warning-comments': ['warn', {location: 'start', terms: ['todo', 'fixme']}],
      'tsdoc/syntax': 'error',
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
