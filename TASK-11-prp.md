# PRP: Task 11 - Unified TypeScript Types & Inngest Event Schemas

## 1. Goal
Consolidate all TypeScript type definitions for research, brand, content, and publishing domains, and define complete, robust Inngest event schemas using **Zod** for runtime validation. This ensures type safety across the entire event-driven architecture and aligns with Inngest v3 best practices.

**Target Output:**
- New type definition files in `src/types/` (`research.ts`, `content.ts`).
- Updated `src/types/db.ts` to export Prisma model types.
- Updated `src/inngest/client.ts` using `EventSchemas.fromZod()` for strict event validation.
- Comprehensive Zod schemas for all system events.

## 2. Context & Research
**Project Status:**
- `src/types/db.ts` exists but lacks Prisma model exports.
- `src/inngest/client.ts` uses older `fromRecord` pattern without runtime validation.
- Inngest SDK v3 supports **Standard Schema** (Zod 4 compatible).

**Key Documentation:**
- **Inngest Zod Validation**: [Best Practices](https://www.inngest.com/docs/reference/client/schemas) - Use `EventSchemas.fromZod()` for type safety + runtime validation.
- **Zod**: [Documentation](https://zod.dev/) - For defining robust schemas (e.g., `z.object()`, `z.enum()`, `z.string().url()`).
- **Prisma Types**: Export generated types from `@prisma/client` to decouple application code from direct Prisma import paths where possible.

**Container-Use Context:**
- This task will be implemented inside a **Dagger container** using the `container-use` MCP server to ensure a clean, isolated environment for type checking and testing without affecting the local machine.

## 3. Implementation Blueprint

### A. Directory Structure
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

### B. Task Breakdown

#### Task 1: Create Domain Type Definitions & Zod Schemas
**File:** `src/types/research.ts`
- Define `DeepResearchReport` (Zod + Type).
- Define `ContextBrief` (Zod + Type).
- Include validation for `depth` (1-5), `breadth` (1-5).

**File:** `src/types/content.ts`
- Define `ContentType` (Enum).
- Define `Platform` (Enum).
- Define `ContentStatus` (Enum).
- Define `ContentDraft` (Zod + Type).

**File:** `src/types/db.ts`
- Add `export type { ResearchJob, BrandConfig, ContentItem, ... } from '@prisma/client';`

#### Task 2: Define Inngest Event Schemas
**File:** `src/types/events.ts` (or collocated in domain files)
- Create Zod schemas for ALL events:
  - `deep.research.requested` / `.completed`
  - `context.research.requested` / `.completed`
  - `content.generation.requested` / `.generated`
  - `content.design.requested`
  - `approval.requested` / `.response`
  - `publishing.shopify.requested`, etc.

#### Task 3: Update Inngest Client
**File:** `src/inngest/client.ts`
- Import Zod schemas.
- Replace `EventSchemas.fromRecord` with `EventSchemas.fromZod`.
- **CRITICAL**: Ensure strictly typed events to prevent payload mismatches.

### C. Container-Use Workflow (Execution Strategy)
1. **Start Container**: Use `container-use` to spin up a Node.js 20 container.
2. **Install**: Run `npm install` inside the container.
3. **Develop**: Create/Edit files inside the container.
4. **Validate**: Run `npx tsc --noEmit` inside the container to verify type safety.

## 4. Validation & Testing strategy

### Level 1: Static Analysis (Inside Container)
```bash
# Verify no type errors
npx tsc --noEmit
```

### Level 2: Schema Unit Tests
Create `src/types/__tests__/schemas.test.ts` to validate Zod schemas against expected payloads.
```typescript
import { DeepResearchRequestSchema } from '../research';

test('validates valid deep research request', () => {
  const valid = { topic: 'AI', depth: 3, ... };
  expect(DeepResearchRequestSchema.parse(valid)).toEqual(valid);
});

test('throws on invalid depth', () => {
  const invalid = { topic: 'AI', depth: 10, ... }; // Depth max is 5
  expect(() => DeepResearchRequestSchema.parse(invalid)).toThrow();
});
```

## 5. Known Gotchas
- **Zod Import**: Ensure `zod` is installed (`npm install zod`).
- **Circular Dependencies**: Avoid importing `inngest/client.ts` into `types/*.ts`. Keep types pure.
- **Prisma Generation**: In the container, you might need to run `npx prisma generate` if `node_modules` is fresh, to ensure `@prisma/client` types exist.

## 6. Resources & Reference Snippets

### Inngest Zod Pattern
```typescript
import { EventSchemas, Inngest } from "inngest";
import { z } from "zod";

const userSignup = z.object({
  data: z.object({
    userId: z.string(),
    email: z.string().email(),
  }),
});

export const inngest = new Inngest({
  id: "my-app",
  schemas: new EventSchemas().fromZod({
    "user.signup": userSignup,
  }),
});
```

### Research Types Snippet
```typescript
// src/types/research.ts
import { z } from 'zod';

export const DeepResearchReportSchema = z.object({
  topic: z.string(),
  summary: z.string(),
  findings: z.array(z.object({
    title: z.string(),
    content: z.string(),
    confidence: z.number().min(0).max(1)
  })),
  // ...
});

export type DeepResearchReport = z.infer<typeof DeepResearchReportSchema>;
```
