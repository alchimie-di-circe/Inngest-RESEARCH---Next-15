/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable security/detect-unsafe-regex */
const nextJest = require('next/jest')

// Type-safe Jest setup files configuration
/** @type {string[]} */
const setupFiles = ['<rootDir>/jest.setup.js']

// Type-safe module name mapper
/** @type {Record<string, string>} */
const moduleMapper = {
  '^@/(.*)$': '<rootDir>/src/$1',
}

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: setupFiles,
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: moduleMapper,
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
}
/* eslint-enable security/detect-non-literal-fs-filename */
/* eslint-enable security/detect-unsafe-regex */

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
