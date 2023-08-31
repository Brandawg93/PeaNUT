module.exports = {
  extends: ['react-app', 'react-app/jest'],
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
  },
};
