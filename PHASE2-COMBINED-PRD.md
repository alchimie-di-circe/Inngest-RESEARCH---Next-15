# Phase 2 Combined PRD - TestSprite Testing
> **Tasks**: T11 (Types & Schemas), T12 (Testing Infrastructure), T3 (Brand Config), T4 (Deep Research), T14 (API Routes)  
> **Generated**: February 6, 2026  
> **Purpose**: Consolidated requirements for TestSprite HITL cycle and full Phase 2 validation

---

## Task 11: Unified TypeScript Types & Inngest Event Schemas

### Goal
Consolidate all TypeScript type definitions for research, brand, content, and publishing domains, and define complete, robust Inngest event schemas using **Zod** for runtime validation. This ensures type safety across the entire event-driven architecture and aligns with Inngest v3 best practices.

**Target Output:**
- New type definition files in `src/types/` (`research.ts`, `content.ts`).
- Updated `src/types/db.ts` to export Prisma model types.
- Updated `src/inngest/client.ts` using `EventSchemas.fromZod()` for strict event validation.
- Comprehensive Zod schemas for all system events.

### Context & Research
**Project Status:**
- `src/types/db.ts` exists but lacks Prisma model exports.
- `src/inngest/client.ts` uses older `fromRecord` pattern without runtime validation.
- Inngest SDK v3 supports **Standard Schema** (Zod 4 compatible).

### Implementation Blueprint

#### A. Directory Structure
```text
src/
├── types/
│   ├── db.ts          # (UPDATE) Export Prisma generated types
│   ├── research.ts    # (NEW) Deep & Context research types + Zod schemas
│   ├── content.ts     # (NEW) Content generation types + Zod schemas
│   └── events.ts      # (NEW) Shared event payload schemas
├── inngest/
│   └── client.ts      # (UPDATE) Use EventSchemas.fromZod
```

#### B. Task Breakdown

**Task 11.1: Create Domain Type Definitions & Zod Schemas**
- **File**: `src/types/research.ts`
  - Define `DeepResearchReport` (Zod + Type)
  - Define `ContextBrief` (Zod + Type)
  - Include validation for `depth` (1-5), `breadth` (1-5)

- **File**: `src/types/content.ts`
  - Define `ContentType` (Enum)
  - Define `Platform` (Enum)
  - Define `ContentStatus` (Enum)
  - Define `ContentDraft` (Zod + Type)

- **File**: `src/types/db.ts`
  - Add `export type { ResearchJob, BrandConfig, ContentItem, ... } from '@prisma/client';`

**Task 11.2: Define Inngest Event Schemas**
- **File**: `src/types/events.ts` (or collocated in domain files)
- Create Zod schemas for ALL events:
  - `deep.research.requested` / `.completed`
  - `context.research.requested` / `.completed`
  - `content.generation.requested` / `.generated`
  - `content.design.requested`
  - `approval.requested` / `.response`
  - `publishing.shopify.requested`, etc.

**Task 11.3: Update Inngest Client**
- **File**: `src/inngest/client.ts`
- Import Zod schemas
- Replace `EventSchemas.fromRecord` with `EventSchemas.fromZod`
- **CRITICAL**: Ensure strictly typed events to prevent payload mismatches

### Validation Strategy
- **Level 1**: Static Analysis with `npx tsc --noEmit`
- **Level 2**: Schema Unit Tests in `src/types/__tests__/schemas.test.ts`
  - Validate Zod schemas against expected payloads
  - Test success/fail cases for each schema
- **Level 3**: Event Round-trip Testing
  - Send events with valid payloads
  - Verify Inngest client accepts them

### Success Criteria
- [x] Type files created and properly organized
- [x] Zod schemas for all major events defined
- [x] Client uses `EventSchemas.fromZod()`
- [ ] No TypeScript errors on `npm run typecheck`
- [ ] Schema validation tests pass
- [ ] All system events have strict schemas

---

## Task 12: Configure Testing Infrastructure with Jest and Playwright

### Goal
Establish a robust, automated testing infrastructure that supports the "Cloud-First" and "Delegate Testing" philosophy. This involves configuring Jest for unit/integration tests (compatible with Wallaby MCP) and Playwright for E2E tests (compatible with TestSprite MCP), along with essential mocks and fixtures to unblock parallel development.

### Why
- **Enabler for Parallelization**: Tasks 3, 4, and 14 cannot implement reliable tests without these shared utilities and configurations.
- **Quality Gates**: Enforces coverage thresholds (80% global, 90% inngest) to prevent regression during rapid iteration.
- **Agent Autonomy**: Provides the "tools" (mocks/fixtures) that AI agents need to write tests without hallucinating APIs.

### What
- **Jest Configuration**: Update `jest.config.js` with strict coverage thresholds and path mappings.
- **Test Utilities**:
    - `mock-prisma.ts`: Singleton mock for database operations.
    - `mock-inngest.ts`: Utilities to mock `step.run`, `step.invoke`, and `inngest.send`.
    - `mock-apis.ts`: Factory for mocking external APIs (Anthropic, Shopify, etc.).
- **Fixtures**: Standardized data sets in `tests/fixtures/` for Brands, Research, and Content.
- **Playwright Configuration**: Optimization for CI environments.
- **NPM Scripts**: Standardized test commands (`test:unit`, `test:integration`, `test:e2e`).

### Implementation Blueprint

#### Task 12.1: Dependencies & Configuration
- [x] Install testing dependencies: `jest-mock-extended`
- [ ] Update `jest.config.js` with coverage thresholds:
  ```javascript
  coverageThreshold: {
    global: { branches: 70, functions: 80, lines: 80, statements: 80 },
    './src/inngest/**/*.ts': { branches: 85, functions: 90, lines: 90 }
  }
  ```

#### Task 12.2: Test Utilities
- [ ] Create `tests/setup/mock-prisma.ts`
  - Prisma Client mock using `jest-mock-extended`
  - Singleton pattern for consistent mocking across tests

- [ ] Create `tests/setup/mock-inngest.ts`
  - Mock step tools: `run`, `sleep`, `invoke`, `waitForEvent`, `sendEvent`
  - Factory function `createMockStep()`

- [ ] Create `tests/setup/mock-apis.ts`
  - Factories for mocking Anthropic, Shopify, etc.

#### Task 12.3: Test Fixtures
- [ ] Create `tests/fixtures/brands.ts`
  - Sample `BrandConfig` objects for testing
  
- [ ] Create `tests/fixtures/research.ts`
  - Sample `ResearchJob` objects
  
- [ ] Create `tests/fixtures/content.ts`
  - Sample `ContentItem` objects

#### Task 12.4: NPM Scripts
- [ ] Update `package.json` scripts:
  ```json
  "test:unit": "jest --testPathIgnorePatterns=tests/integration",
  "test:integration": "jest tests/integration",
  "test:e2e": "playwright test",
  "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e"
  ```

#### Task 12.5: Playwright Configuration
- [ ] Ensure `playwright.config.ts` is optimized for:
  - Headless mode
  - CI timeout settings
  - Retries for flaky tests

### Validation Loop

#### Level 1: Configuration Check
```bash
npx jest --showConfig
```

#### Level 2: Utility Verification
- Create temporary test file `tests/setup/verify-mocks.test.ts`
- Verify Prisma mock works
- Verify Inngest mock works

#### Level 3: Run Full Suite
```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

### Success Criteria
- [x] Dependencies installed
- [ ] `jest.config.js` updated with coverage thresholds
- [ ] Mock files created and functional
- [ ] Fixtures created and usable
- [ ] NPM scripts working
- [ ] `npm run test:unit` passes with mocks
- [ ] `npm run test:e2e` launches Playwright

---

## Task 3: Implement Brand Configuration Management

### Goal
Implement a robust Brand Configuration Management system allowing users to create, read, update, and delete (CRUD) brand profiles. Each profile includes detailed settings for tone of voice, brand colors, logo, and platform history, acting as the "context engine" for downstream content generation.

### Why
- **Foundation for Agents**: The "Context Research" and "Content Writer" agents (Tasks 5 & 7) depend entirely on these configurations to generate on-brand content.
- **User Control**: Enables users to manage multiple brand personas (e.g., "Personal Brand" vs "Company Blog").
- **Schema Alignment**: Ensures the database schema fully supports the detailed requirements.

### What
- **API Routes**: Next.js 15 App Router endpoints (`/api/brand`, `/api/brand/[id]`) for CRUD operations.
- **UI Components**:
    - `BrandForm`: A comprehensive React Hook Form with validation (Zod) for editing brand details.
    - `BrandList`: A card-based grid view of available brands.
    - `BrandSelector`: A reusable dropdown for selecting the active brand context.
- **Data Model**: Update `BrandConfig` in Prisma to include `brandColors`, `logoUrl`, and `platformHistory`.

### Implementation Blueprint

#### Task 3.1: Data Model & Types
**Update Prisma Schema** - `prisma/schema.prisma`
```prisma
model BrandConfig {
  id              String   @id @default(cuid())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  name            String   // Brand name
  tovGuidelines   String?  @db.Text // Tone of Voice
  brandKnowledge  Json?    // Key facts/context
  platformHistory Json?    // { twitter: [], linkedin: [] }
  brandColors     Json?    // { primary: '#...', secondary: '#...' }
  logoUrl         String?

  jobs            ResearchJob[]
  
  @@index ([name])
}
```

**Zod Schemas** - `src/types/brand.ts`
```typescript
import { z } from 'zod';

export const BrandColorsSchema = z.object({
  primary: z.string().min(1),
  secondary: z.string().min(1),
  accent: z.string().optional(),
});

export const CreateBrandSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  tovGuidelines: z.string().optional(),
  brandColors: BrandColorsSchema.optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
});

export type CreateBrandInput = z.infer<typeof CreateBrandSchema>;
```

#### Task 3.2: API Routes
- [ ] Create `src/app/api/brand/route.ts`
  - `GET`: Fetch all brands
  - `POST`: Create brand with validation

- [ ] Create `src/app/api/brand/[id]/route.ts`
  - `GET`: Fetch single brand
  - `PUT`: Update brand
  - `DELETE`: Delete brand

#### Task 3.3: Frontend Components
- [ ] Create `src/components/brand/brand-form.tsx`
  - Use `useForm` with `zodResolver`
  - Dark Mode styling
  
- [ ] Create `src/components/brand/brand-list.tsx`
  - Fetch and display brands
  - Edit/Delete actions
  
- [ ] Create `src/components/brand/brand-selector.tsx`
  - Dropdown for brand selection
  - Styled to match sidebar

#### Task 3.4: Integration
- [ ] Update Dashboard Page to mount components
- [ ] Verify CRUD flow works end-to-end

### Validation Loop
- **Level 1**: Syntax & Schema
  ```bash
  npx prisma validate
  npx tsc --noEmit
  ```
- **Level 2**: Unit/Component Tests
  - Mock fetch in `BrandForm` tests
  - Verify form renders and submits
- **Level 3**: Integration Tests
  - Test API endpoints
  - Test CRUD operations

### Success Criteria
- [x] Prisma schema updated and types generated
- [x] Zod schemas defined
- [x] API Routes created
- [x] UI components created
- [ ] Integration tests pass
- [ ] Full CRUD flow verified
- [ ] Dark Mode styling correct

---

## Task 4: Refactor Deep Research Agent for PRD Compliance

### Goal
Refactor the Deep Research Agent to align with PRD requirements and leverage Inngest capabilities for maximum performance and UX. This involves upgrading the event architecture, enabling **Inngest Checkpointing** for low-latency execution, implementing **Native Realtime Streaming** for progress updates, and persisting full job state to the database.

### Why
- **Granular Control**: Users need to specify `depth` and `breadth` to control cost and thoroughness.
- **Low Latency**: **Checkpointing** enables steps to execute immediately on the client without waiting for HTTP round-trips.
- **Real-Time Feedback**: **Native Inngest Realtime** allows streaming step-by-step progress without polling.
- **Persistence**: A robust audit trail ensures results are never lost.
- **Foundation for Phase 3**: The output feeds directly into Content Generation.

### What
- **Event Architecture**: Introduce `deep.research.requested` event and typed Realtime channels.
- **Orchestrator Update**:
    - Enable `checkpointing: true`
    - Use `publish()` for real-time updates
    - Persist `ResearchJob` state at start, intermediate steps, and completion
- **Context Gathering**: Update `gatherContext` to respect `depth` and `breadth`
- **UI**:
    - New `ResearchForm` with parameters
    - `ResearchStatus` component using `useInngestSubscription`
    - `ResearchReport` view

### Implementation Blueprint

#### Task 4.1: Event & Channel Models
**Define Events** - `src/inngest/events.ts`
```typescript
import { z } from 'zod';

export const DeepResearchRequestedSchema = z.object({
  topic: z.string(),
  brandId: z.string().optional(),
  depth: z.number().min(1).max(5).default(3),
  breadth: z.number().min(1).max(5).default(3),
  userId: z.string(),
  sessionId: z.string(),
});

export const DeepResearchCompletedSchema = z.object({
  jobId: z.string(),
  reportData: z.any(),
  sourcesCount: z.number(),
});
```

**Define Realtime Channels** - `src/inngest/channels.ts`
```typescript
import { channel, topic } from '@inngest/realtime';
import { z } from 'zod';

export const researchChannel = channel('research')
  .addTopic(topic('deep-progress').schema(z.object({
    stage: z.enum(['staging', 'reasoning', 'reporting']),
    progress: z.number(), // 0-100
    message: z.string(),
    timestamp: z.string()
  })));
```

**Update Client** - `src/inngest/client.ts`
- Add `realtimeMiddleware()` to Inngest client
- Configure event schemas with Zod

#### Task 4.2: Orchestrator Refactor
- [ ] Update `src/inngest/functions/orchestrator.ts`
  - Enable `checkpointing: true`
  - Add `publish()` calls for progress updates
  - Persist `ResearchJob` state transitions:
    - `RUNNING` on start
    - `COMPLETED` on finish
  - Save full `reportData` to job

#### Task 4.3: Context Gathering Update
- [ ] Modify `src/inngest/functions/gather-context.ts`
  - Accept `depth` and `breadth` parameters
  - Use `breadth` to determine result count
  - Use `depth` for query variation count

#### Task 4.4: UI Implementation
**Server Action** - `src/app/actions.ts`
```typescript
export async function fetchResearchToken() {
  return await getSubscriptionToken(inngest, {
    channel: researchChannel, 
    topics: ["deep-progress"]
  });
}
```

**UI Components**:
- [ ] Create `src/components/research/research-form.tsx`
  - Input: `topic`, `brandId`, `depth`, `breadth`
  - Sliders for depth/breadth (1-5, default 3)
  - Submit triggers server action
  
- [ ] Create `src/components/research/research-status.tsx`
  - Display streaming progress via `useInngestSubscription`
  - Show current stage and message
  - Progress bar
  
- [ ] Create `src/components/research/research-report.tsx`
  - Display final `DeepResearchReport`

- [ ] Update Dashboard page to integrate components

### Validation Loop
- **Level 1**: Type checking
  ```bash
  npx tsc --noEmit
  ```
- **Level 2**: Unit Tests
  - Mock orchestrator step logic
  - Verify checkpointing enabled
  
- **Level 3**: Integration Tests
  - Trigger event via API
  - Observe Realtime updates
  - Verify job persists with correct state

### Success Criteria
- [x] Events and Channels defined
- [x] Orchestrator implements checkpointing
- [x] Realtime middleware configured
- [ ] UI components created and integrated
- [ ] Realtime updates work end-to-end
- [ ] Job state persists correctly
- [ ] Integration tests pass

---

## Task 14: Create API Routes for Research and Project Management

### Goal
Implement a comprehensive, type-safe REST API layer using Next.js 15 App Router Route Handlers. These endpoints serve as the interface between the frontend dashboard and backend services (Neon DB, Inngest orchestration), enabling CRUD operations for research jobs, projects, content items, and publishing queues.

### Why
- **Frontend-Backend Decoupling**: Provides standardized interface for UI to interact with data and trigger workflows.
- **Workflow Triggering**: Acts as entry point for starting Inngest agentic workflows (e.g., creating a research job).
- **Status Polling**: Enables real-time-like status updates via lightweight polling endpoints.
- **Type Safety**: Enforces strict data validation using Zod before data reaches DB or Inngest.

### What
- **Research Routes**:
    - `GET /api/research`: List jobs with filtering (status, type)
    - `POST /api/research`: Create job + trigger Inngest event
    - `GET/PUT/DELETE /api/research/[id]`: Job lifecycle management
    - `GET /api/research/[id]/status`: Optimized polling endpoint
- **Project Routes**: `GET/POST /api/project` for organizing research
- **Content Routes**: `GET/POST /api/content` for managing drafts
- **Publishing Routes**: `GET/POST /api/publishing` for queue management

### Implementation Blueprint

#### Task 14.1: Data Validation (Zod Schemas)
**File**: `src/types/api.ts`
```typescript
import { z } from 'zod';

export const CreateResearchJobSchema = z.object({
  topic: z.string().min(5),
  tabType: z.enum(['DEEP', 'CONTEXT', 'CONTENT', 'PUBLISH']),
  parameters: z.record(z.unknown()).optional(),
  userId: z.string().optional(),
  brandId: z.string().optional(),
});

// Similar schemas for Project, Content, Publishing...
```

#### Task 14.2: Research API Routes
- [ ] Create `src/app/api/research/route.ts`
  - `GET`: List with filtering (status, tabType)
  - `POST`: Create + validate with Zod + trigger Inngest
  - Use `export const dynamic = 'force-dynamic'` for real-time data

- [ ] Create `src/app/api/research/[id]/route.ts`
  - `GET`: Fetch single job
  - `PUT`: Update job
  - `DELETE`: Delete job
  - All with proper Zod validation

- [ ] Create `src/app/api/research/[id]/status/route.ts`
  - `GET`: Return only status field
  - Optimized for polling

#### Task 14.3: Additional API Routes
- [ ] Create `src/app/api/project/route.ts`
  - CRUD for Projects (if needed)

- [ ] Create `src/app/api/content/route.ts`
  - CRUD for ContentItem

- [ ] Create `src/app/api/publishing/route.ts`
  - CRUD for PublishingQueue

#### Task 14.4: Error Handling & Validation
- [ ] Apply Zod validation to all POST/PUT bodies
- [ ] Handle `ZodError` -> 400 response
- [ ] Handle Prisma errors -> 400/404/500 appropriately
- [ ] Log errors consistently

### API Endpoint Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/research` | GET | List all research jobs |
| `/api/research` | POST | Create new research job + trigger Inngest |
| `/api/research/[id]` | GET | Fetch single research job |
| `/api/research/[id]` | PUT | Update research job |
| `/api/research/[id]` | DELETE | Delete research job |
| `/api/research/[id]/status` | GET | Poll job status (lightweight) |
| `/api/content` | GET/POST | List/Create content items |
| `/api/publishing` | GET/POST | List/Create publishing queue items |
| `/api/project` | GET/POST | List/Create projects (optional) |

### Validation Loop
- **Level 1**: Static Analysis
  ```bash
  npx tsc --noEmit
  npm run lint
  ```

- **Level 2**: Unit/Integration Tests
  - Test Zod schema validation
  - Test API endpoint responses
  - Verify Inngest event triggering

- **Level 3**: Manual Verification
  ```bash
  # List jobs
  curl http://localhost:3000/api/research

  # Create job
  curl -X POST http://localhost:3000/api/research \
    -H "Content-Type: application/json" \
    -d '{"topic": "AI Trends", "tabType": "DEEP"}'
  ```

### Success Criteria
- [x] All data models and schemas defined
- [ ] All Route Handlers implemented
- [ ] Zod validation protects write operations
- [ ] Inngest events triggered correctly
- [ ] HTTP status codes correct (200/201/400/404/500)
- [ ] Error messages clear and consistent
- [ ] Integration tests pass
- [ ] Manual API testing succeeds

---

## Phase 2 Complete Testing Checklist

### Type Safety (Task 11)
- [ ] All `.ts` files compile without errors
- [ ] Event schemas strictly typed with Zod
- [ ] No implicit `any` types
- [ ] Inngest client uses `EventSchemas.fromZod()`

### Testing Infrastructure (Task 12)
- [ ] Jest configured with coverage thresholds
- [ ] Mock utilities functional
- [ ] Test fixtures available
- [ ] Playwright configured for CI
- [ ] All npm test scripts work

### Brand Management (Task 3)
- [ ] Prisma schema includes all required fields
- [ ] API CRUD endpoints functional
- [ ] UI components render correctly
- [ ] Form validation working
- [ ] Dark Mode styling applied

### Deep Research (Task 4)
- [ ] `deep.research.requested` event triggers orchestrator
- [ ] Checkpointing enabled and verified
- [ ] Realtime updates working
- [ ] Job state persists correctly
- [ ] UI displays progress and report

### API Routes (Task 14)
- [ ] All endpoints return correct status codes
- [ ] Zod validation enforced
- [ ] Inngest events triggered from API
- [ ] Error handling comprehensive
- [ ] Integration between frontend and backend verified

---

## Quick Reference: Known Gotchas & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Type errors in events | Mismatched Zod schema | Update `src/types/events.ts` and re-run Inngest codegen |
| API returns 500 | Prisma singleton not initialized | Ensure `src/lib/db.ts` follows singleton pattern |
| Jest mocks not working | Mock hoisting issue | Import mocks at top of test files, before other imports |
| Realtime updates not streaming | Middleware not added to client | Add `realtimeMiddleware()` to Inngest constructor |
| Coverage below threshold | New code not tested | Add unit tests or increase coverage tolerance temporarily |
| Playwright headless fails in CI | Missing dependencies | Ensure `playwright.config.ts` has correct timeout/retry settings |

---

## TestSprite Execution Strategy

### Backend Tests (No Dev Server Required)
TestSprite can generate and execute **Jest + integration tests** in its own sandbox without requiring a running dev server. These tests validate:
- API route handlers (`/api/brand`, `/api/research`, etc.)
- Inngest event schemas and orchestrator logic
- Zod validation
- Database operations (mocked)
- Type safety

### Frontend Tests (Requires Dev Server on Port 3000)
E2E tests with Playwright require the Next.js dev server to be running on `localhost:3000`. These validate:
- UI component rendering
- Form submissions
- User workflows
- Integration with backend APIs

### Two-Cycle Approach
1. **Cycle 1 (Local, NOW)**: Backend tests in TestSprite sandbox
2. **Cycle 2 (Codespace)**: Frontend E2E tests with running server

---

## Generated by Jules + Droid
> **Branch**: `phase-2--tasks-parallel-wave--11-3-4-14-12`  
> **For**: TestSprite HITL Cycle - Full Phase 2 Validation  
> **Status**: Ready for backend test execution (sandbox mode)
