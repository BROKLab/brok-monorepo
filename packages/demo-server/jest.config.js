module.exports = {
  displayName: 'demo-server',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  modulePathIgnorePatterns: ['environments'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  testTimeout: 50000,
  coverageDirectory: '/coverage/apps/demo-server',
};
