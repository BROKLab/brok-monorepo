module.exports = {
  require: [
    'ts-node/register/transpile-only', // required to run TypeScript code
  ],
  extension: ['ts'],
  watchExtensions: ['ts'],
  spec: ['src/test/**/*.test.ts'],
  setTimeout: 5000
}