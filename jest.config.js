module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  transformIgnorePatterns: [
    'node_modules/'
  ],
  collectCoverageFrom: [
    '../ts-sdk-client/src/**/*.ts',
    '../gateway-ts-sdk/src/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**'
  ],
  coverageDirectory: 'test/coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json',
    'text-summary'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testTimeout: 10000,
  verbose: true,
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ]
};