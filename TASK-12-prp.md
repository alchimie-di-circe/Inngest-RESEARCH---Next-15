# PRP: Task 12 - Configure Testing Infrastructure with Jest and Playwright

## Goal
Establish a robust, automated testing infrastructure that supports the "Cloud-First" and "Delegate Testing" philosophy defined in `AGENTS.md`. This involves configuring Jest for unit/integration tests (compatible with Wallaby MCP) and Playwright for E2E tests (compatible with TestSprite MCP), along with essential mocks and fixtures to unblock parallel development.

## Why
- **Enabler for Parallelization**: Tasks 3, 4, and 14 cannot implement reliable tests without these shared utilities and configurations.
- **Quality Gates**: Enforces coverage thresholds (80% global, 90% inngest) to prevent regression during rapid iteration.
- **Agent Autonomy**: Provides the "tools" (mocks/fixtures) that AI agents need to write tests without hallucinating APIs.

## What
- **Jest Configuration**: Update `jest.config.js` with strict coverage thresholds and path mappings.
- **Test Utilities**:
    - `mock-prisma.ts`: Singleton mock for database operations.
    - `mock-inngest.ts`: Utilities to mock `step.run`, `step.invoke`, and `inngest.send`.
    - `mock-apis.ts`: Factory for mocking external APIs (Anthropic, Shopify, etc.).
- **Fixtures**: Standardized data sets in `tests/fixtures/` for Brands, Research, and Content.
- **Playwright Configuration**: Optimization for CI environments.
- **NPM Scripts**: Standardized test commands (`test:unit`, `test:integration`, `test:e2e`).

### Success Criteria
- [ ] `npm run test:unit` runs successfully with mock infrastructure.
- [ ] `npm run test:e2e` launches Playwright correctly.
- [ ] Coverage reports are generated and check thresholds.
- [ ] `mock-prisma` allows unit testing without a running DB.
- [ ] `mock-inngest` allows testing functions without a running Dev Server.

---

## All Needed Context

### Documentation & References
```yaml
# Tech Stack Documentation
- url: https://jestjs.io/docs/configuration
  why: "Jest configuration reference."

- url: https://playwright.dev/docs/test-configuration
  why: "Playwright configuration reference."

- url: https://www.prisma.io/docs/orm/prisma-client/testing/unit-testing
  why: "Official guide for mocking Prisma Client with jest-mock-extended."

# Project Context
- file: AGENTS.md
  why: "Defines the testing strategy (Wallaby, TestSprite) that this infra must support."

- file: jest.config.js
  why: "Current configuration to be updated."

- file: package.json
  why: "Dependency list (jest-mock-extended needs to be added)."
```

### Current Codebase Structure (Relevant)
```bash
src/
tests/
├── e2e/                  # Playwright tests
├── setup/                # (To be created)
└── fixtures/             # (To be created)
jest.config.js
playwright.config.ts
```

### Desired Structure Additions
```bash
tests/
├── setup/
│   ├── mock-prisma.ts    # Prisma mock factory
│   ├── mock-inngest.ts   # Inngest mock factory
│   └── mock-apis.ts      # External API mocks
└── fixtures/
    ├── brands.ts         # Sample BrandConfig data
    ├── research.ts       # Sample ResearchJob data
    └── content.ts        # Sample ContentItem data
```

### Known Gotchas
- **Jest Mock Hoisting**: Mocks must be defined before imports. `mock-prisma.ts` needs to be imported carefully in test files.
- **Prisma Singleton**: The singleton pattern in `src/lib/db.ts` makes mocking tricky. We must use `jest-mock-extended`.
- **Environment Variables**: Tests need `NODE_ENV=test`. Ensure `jest.setup.js` or scripts set this.

---

## Implementation Blueprint

### 1. Dependencies
**Task 12.1**: Install testing dependencies.
```bash
npm install -D jest-mock-extended
```

### 2. Jest Configuration
**Task 12.2**: Update `jest.config.js`.
- Add `coverageThreshold` object.
- Ensure `testMatch` separates unit vs integration (by convention `*.test.ts` vs `tests/integration/*.test.ts`).

```javascript
// Add to customJestConfig
coverageThreshold: {
  global: { branches: 70, functions: 80, lines: 80, statements: 80 },
  './src/inngest/**/*.ts': { branches: 85, functions: 90, lines: 90 }
}
```

### 3. Test Utilities
**Task 12.3**: Create `tests/setup/mock-prisma.ts`.
```typescript
import { PrismaClient } from '@prisma/client'
import { mockDeep, DeepMockProxy } from 'jest-mock-extended'
import { db } from '@/lib/db'

jest.mock('@/lib/db', () => ({
  __esModule: true,
  db: mockDeep<PrismaClient>(),
}))

export const prismaMock = db as unknown as DeepMockProxy<PrismaClient>
```

**Task 12.4**: Create `tests/setup/mock-inngest.ts`.
```typescript
// Mock step tools
export const createMockStep = () => ({
  run: jest.fn((name, handler) => handler()),
  sleep: jest.fn(),
  sleepUntil: jest.fn(),
  invoke: jest.fn(),
  waitForEvent: jest.fn(),
  sendEvent: jest.fn(),
});
```

### 4. Test Fixtures
**Task 12.5**: Create `tests/fixtures/brands.ts`.
```typescript
import { BrandConfig } from '@prisma/client';

export const mockBrand: BrandConfig = {
  id: 'brand-123',
  name: 'TechCorp',
  tovGuidelines: 'Professional, authoritative',
  brandColors: { primary: '#000', secondary: '#FFF' },
  // ... other fields
};
```

### 5. NPM Scripts
**Task 12.6**: Update `package.json`.
```json
"scripts": {
  "test:unit": "jest --testPathIgnorePatterns=tests/integration",
  "test:integration": "jest tests/integration",
  "test:e2e": "playwright test",
  "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e"
}
```

---

## Validation Loop

### Level 1: Configuration Check
```bash
# Verify Jest config validity
npx jest --showConfig
```

### Level 2: Utility Verification
Create a temporary test file `tests/setup/verify-mocks.test.ts`.
```typescript
import { prismaMock } from './mock-prisma';
import { createMockStep } from './mock-inngest';

test('prisma mock works', async () => {
  prismaMock.user.findUnique.mockResolvedValue({ id: '1', name: 'Test' });
  const user = await prismaMock.user.findUnique({ where: { id: '1' } });
  expect(user?.name).toBe('Test');
});

test('inngest mock works', async () => {
  const step = createMockStep();
  const result = await step.run('test', () => 'success');
  expect(result).toBe('success');
  expect(step.run).toHaveBeenCalled();
});
```

### Level 3: Run Suite
```bash
npm run test:unit
```

---

## Final Checklist
- [ ] `jest-mock-extended` installed.
- [ ] `jest.config.js` updated with thresholds.
- [ ] Mock files created in `tests/setup/`.
- [ ] Fixtures created in `tests/fixtures/`.
- [ ] Scripts added to `package.json`.