module.exports = {
  env: {node: true, browser: true, jest: true},
  parserOptions: {
    ecmaVersion: 9,
    sourceType: 'module',
    ecmaFeatures: {
      modules: true,
    },
  },
  extends: ['sanity/typescript', 'prettier/@typescript-eslint', 'prettier', 'prettier/react'],
  rules: {
    'callback-return': 'off',
    'no-unused-vars': 'off',
  },
}
