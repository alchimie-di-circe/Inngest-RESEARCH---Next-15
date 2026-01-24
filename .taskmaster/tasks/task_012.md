# Task ID: 12

**Title:** Configure Testing Infrastructure with Jest and Playwright

**Status:** pending

**Dependencies:** 2

**Priority:** medium

**Description:** Set up complete testing infrastructure including Jest for unit/integration tests and Playwright for E2E tests, with proper mocking patterns for external APIs.

**Details:**

1. Update `jest.config.js` for proper path aliases and coverage:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*'
  ],
  coverageThreshold: {
    global: { branches: 70, functions: 80, lines: 80, statements: 80 },
    './src/inngest/**/*.ts': { branches: 85, functions: 90, lines: 90 }
  }
};
```

2. Create test utilities at `tests/setup/`:
- `mock-prisma.ts` - Prisma client mock factory
- `mock-inngest.ts` - Inngest function testing utilities
- `mock-apis.ts` - External API mocks (Anthropic, Shopify, Twitter, etc.)

3. Create test fixtures at `tests/fixtures/`:
- `brands.ts` - Sample brand configurations
- `research.ts` - Sample research reports
- `content.ts` - Sample content items

4. Update `playwright.config.ts` for E2E tests:
```typescript
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
});
```

5. Add npm scripts:
```json
"test:unit": "jest --testPathPattern=unit",
"test:integration": "jest --testPathPattern=integration",
"test:e2e": "playwright test",
"test:all": "npm run test:unit && npm run test:integration && npm run test:e2e"
```

**Test Strategy:**

Meta-testing: Verify mock utilities work correctly. Run test suite to ensure all configurations are valid. Check coverage reports generate properly.
