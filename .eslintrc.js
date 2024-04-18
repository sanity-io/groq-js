module.exports = {
  root: true,
  env: {node: true, browser: true, jest: true},
  extends: ['sanity/typescript', 'prettier'],
  plugins: ['prettier', 'simple-import-sort'],
  rules: {
    'no-undef': 'off',
    'callback-return': 'off',
    'no-unused-vars': 'off',
    'no-shadow': 'off',
    'require-await': 'off',
    'max-nested-callbacks': 'off',
    'no-return-await': 'off',
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',
    'dot-notation': 'off',
  },
}
