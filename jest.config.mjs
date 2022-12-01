/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'js', 'mjs', 'json'],
  moduleNameMapper: {
    // '^(\\.{1,2}/.*)\\.js$': '$1',
    '^#(.*)$': './vendor/$1',
  },
  preset: 'ts-jest/presets/default-esm', // A preset that is used as a base for Jest's configuration
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'], // The glob patterns Jest uses to detect test files
  transform: {
    '^.+\\.m?[tj]sx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(cli-cursor|is-interactive|is-unicode-supported|log-symbols|ora|read-pkg|read-pkg-up|restore-cursor)/)',
  ],
  verbose: true,
};
