# PRP-TASK-001: Extend Database Schema for Full Research Publishing Suite

## Goal
Extend the existing Prisma schema to support the full Research Publishing Suite lifecycle, covering Deep Research, Context Research, Content Generation, and Publishing phases. This includes adding new models for `ResearchJob`, `BrandConfig`, `ContentItem`, `PublishingQueue`, and `AgentAuditLog`. We will implement a robust `db.ts` client singleton using the **Neon Serverless Driver Adapter** for optimal connection management in Next.js Server Actions.

## Why
- **Support Full Lifecycle**: The current schema is minimal and cannot support the complex 4-phase workflow defined in the PRD.
- **Data Integrity**: Proper relations (Foreign Keys) and Enums ensure data consistency at the database level.
- **Performance**: Targeted indexes (`@@index`) and the Neon Driver Adapter (WebSockets) reduce latency and prevent connection pool exhaustion in serverless environments.
- **Type Safety**: Using Prisma Enums and explicit JSON type definitions prevents magic string errors.

## What
1.  **Dependencies**: Install `@prisma/adapter-neon`, `@neondatabase/serverless`, and `ws`.
2.  **Schema Update**: Add 5 new models with **Enums** for fixed states.
3.  **Client Singleton**: Create `src/lib/db.ts` using the Driver Adapter pattern.
4.  **Type Definitions**: Create `src/types/db.ts` for JSON field interfaces.

### Success Criteria
- [ ] `prisma/schema.prisma` contains 5 new models using native Enums.
- [ ] `src/lib/db.ts` correctly initializes `PrismaClient` with the Neon adapter.
- [ ] JSON fields (e.g., `parameters`, `reportData`) have corresponding TypeScript interfaces defined.
- [ ] `npx prisma validate` passes.
- [ ] `npx prisma db push --dry-run` shows correct SQL (including Enum creation).

## All Needed Context

### Documentation & References
```yaml
- url: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/serverless-drivers-drivers-adapters#neon
  why: Reference for configuring the Neon serverless driver adapter.

- file: prisma/schema.prisma
  why: Current schema state.
```

### Desired Codebase tree
```bash
/Users/alexandthemusic/APP-VIBE/ZED_Inngest-APP/Inngest-RESEARCH---Next-15/
├── prisma/
│   └── schema.prisma         # Updated with models & enums
├── src/
│   ├── lib/
│   │   └── db.ts             # Singleton with Neon Adapter
│   └── types/
│       └── db.ts             # JSON type definitions
```

## Implementation Blueprint

### Data models and structure

**Enums**:
- `JobStatus`: PENDING, RUNNING, COMPLETED, FAILED
- `TabType`: DEEP, CONTEXT, CONTENT, PUBLISH
- `ContentStatus`: DRAFT, APPROVED, REJECTED, PUBLISHED
- `Platform`: BLOG, TWITTER, LINKEDIN, INSTAGRAM, SHOPIFY

**Models**: `ResearchJob`, `BrandConfig`, `ContentItem`, `PublishingQueue`, `AgentAuditLog` (as previously defined, but using Enums).

### List of tasks to be completed

```yaml
Task 1:
INSTALL Dependencies:
  - RUN npm install @prisma/adapter-neon @neondatabase/serverless ws
  - RUN npm install -D @types/ws

Task 2:
MODIFY prisma/schema.prisma:
  - DEFINE enums (JobStatus, TabType, ContentStatus, Platform)
  - ADD models using these enums
  - CONFIGURE relations and indexes

Task 3:
CREATE src/types/db.ts:
  - DEFINE interfaces for JSON fields (ResearchParameters, BrandKnowledge, etc.)

Task 4:
CREATE src/lib/db.ts:
  - IMPLEMENT Singleton pattern with Neon Adapter
  - EXPORT PrismaClient instance

Task 5:
VERIFY:
  - RUN npx prisma generate
  - RUN npx prisma db push --dry-run
  - CREATE integration test
```

### Per task pseudocode

#### Task 2: Update Schema (with Enums)
```prisma
// prisma/schema.prisma

enum JobStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
}

enum TabType {
  DEEP
  CONTEXT
  CONTENT
  PUBLISH
}

enum ContentStatus {
  DRAFT
  APPROVED
  REJECTED
  PUBLISHED
}

enum Platform {
  BLOG
  TWITTER
  LINKEDIN
  INSTAGRAM
  SHOPIFY
}

model ResearchJob {
  id           String        @id @default(cuid())
  topic        String
  tabType      TabType
  parameters   Json?         // Typed as ResearchParameters in app
  status       JobStatus     @default(PENDING)
  reportData   Json?         // The final output
  createdAt    DateTime      @default(now())
  completedAt  DateTime?
  createdBy    String?
  contentItems ContentItem[]

  @@index([status])
  @@index([createdAt])
}

model BrandConfig {
  id             String   @id @default(cuid())
  name           String
  tovGuidelines  String?  @db.Text
  brandKnowledge Json?
  brandColors    Json?
  logoUrl        String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model ContentItem {
  id            String           @id @default(cuid())
  researchJobId String
  researchJob   ResearchJob      @relation(fields: [researchJobId], references: [id], onDelete: Cascade)
  contentType   String           // Specific type like 'blog_post'
  copy          String?          @db.Text
  status        ContentStatus    @default(DRAFT)
  platform      Platform
  publishDate   DateTime?
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
  publishingQueue PublishingQueue[]

  @@index([status])
}

model PublishingQueue {
  id            String      @id @default(cuid())
  contentItemId String
  contentItem   ContentItem @relation(fields: [contentItemId], references: [id], onDelete: Cascade)
  platform      Platform
  scheduledAt   DateTime?
  publishedAt   DateTime?
  status        String      @default("pending") // Keep string or make separate enum
  errorLog      String?     @db.Text
  retryCount    Int         @default(0)
  createdAt     DateTime    @default(now())

  @@index([status])
}

model AgentAuditLog {
  id         String   @id @default(cuid())
  agentName  String
  action     String
  jobId      String?
  status     String
  metadata   Json?
  createdAt  DateTime @default(now())

  @@index([agentName])
  @@index([createdAt])
}
```

#### Task 3: JSON Types
```typescript
// src/types/db.ts

export interface ResearchParameters {
  depth: number;
  breadth: number;
  focus?: string[];
}

export interface BrandKnowledge {
  mission?: string;
  values?: string[];
  audience?: string;
}

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
}
```

#### Task 4: DB Client (Adapter Pattern)
```typescript
// src/lib/db.ts
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';

// Sets up WebSocket connection for Neon serverless driver
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export * from '@prisma/client';
```

## Validation Loop

### Level 1: Syntax & Config
```bash
# Check dependencies
npm list @prisma/adapter-neon

# Validate Schema
npx prisma validate
```

### Level 2: DB Connection
```bash
# Push schema (dry-run first)
npx prisma db push --dry-run
```

### Level 3: Integration Test
```typescript
// tests/integration/db/connection.test.ts
import { prisma } from '@/lib/db';

describe('DB Connection', () => {
  it('should connect using the adapter', async () => {
    await expect(prisma.$queryRaw`SELECT 1`).resolves.toBeTruthy();
  });
});
```