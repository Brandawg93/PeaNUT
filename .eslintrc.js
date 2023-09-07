module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'brace-style': ['warn'],
    curly: ['warn', 'all'],
    'dot-notation': 'warn',
    eqeqeq: 'warn',
    'linebreak-style': ['warn', 'unix'],
    'lines-between-class-members': ['warn', 'always', { exceptAfterSingleLine: true }],
    'no-await-in-loop': ['warn'],
    'prefer-arrow-callback': ['warn'],
    semi: ['warn', 'always'],
    '@typescript-eslint/explicit-function-return-type': ['off'],
    '@typescript-eslint/array-type': ['error', { default: 'generic' }],
    '@typescript-eslint/camelcase': ['off'],
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/explicit-module-boundary-types': ['off'],
    '@typescript-eslint/no-this-alias': ['off'],
    '@typescript-eslint/no-non-null-assertion': ['warn'],
  },
  settings: {
    react: {
      version: '18',
    },
  },
};
