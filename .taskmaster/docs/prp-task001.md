# PRP-TASK-001: Extend Database Schema for Full Research Publishing Suite

## Goal
Extend the existing Prisma schema to support the full Research Publishing Suite lifecycle, covering Deep Research, Context Research, Content Generation, and Publishing phases. This includes adding new models for `ResearchJob`, `BrandConfig`, `ContentItem`, `PublishingQueue`, and `AgentAuditLog`, along with necessary indexes and relations. We will also implement a robust `db.ts` client singleton for serverless efficiency with Neon.

## Why
- **Support Full Lifecycle**: The current schema is minimal (`ResearchContext`, `AgentRun`) and cannot support the complex 4-phase workflow defined in the PRD.
- **Data Integrity**: Proper relations and foreign keys (e.g., `ResearchJob` -> `ContentItem`) ensure data consistency.
- **Performance**: Targeted indexes (`@@index([status])`, etc.) are critical for the queue manager and real-time dashboard performance.
- **Serverless Stability**: Implementing the Prisma Client singleton pattern is essential to prevent connection pool exhaustion in Next.js serverless/edge environments (Neon).

## What
1.  **Schema Update**: Add 5 new models to `prisma/schema.prisma`.
2.  **Indexing**: Apply performance indexes for frequent query patterns.
3.  **Client Singleton**: Create `src/lib/db.ts` with global caching for development HMR.
4.  **Type Exports**: Export types for use in the application.

### Success Criteria
- [ ] `prisma/schema.prisma` contains all 5 new models with correct fields and relations.
- [ ] `npx prisma validate` passes without errors.
- [ ] `src/lib/db.ts` exists and implements the singleton pattern correctly.
- [ ] Integration tests verify CRUD operations for all new models.
- [ ] `npx prisma db push --dry-run` shows the expected SQL changes.

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/serverless-drivers-drivers-adapters#neon
  why: Best practices for connecting Prisma to Neon in serverless envs.

- url: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-pooling
  why: Understanding connection pooling with Neon (PgBouncer) vs Direct connection.

- url: https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices
  why: The definitive guide on the singleton pattern for Next.js to avoid "Too many connections" errors during HMR.

- file: .taskmaster/docs/prd.txt
  why: Contains the source of truth for the data models and their fields (Capability 1-4).

- file: prisma/schema.prisma
  why: Current schema state to be extended.
```

### Current Codebase tree
```bash
/Users/alexandthemusic/APP-VIBE/ZED_Inngest-APP/Inngest-RESEARCH---Next-15/
├── prisma/
│   └── schema.prisma
├── src/
│   └── lib/
│       └── (db.ts does not exist yet)
```

### Desired Codebase tree
```bash
/Users/alexandthemusic/APP-VIBE/ZED_Inngest-APP/Inngest-RESEARCH---Next-15/
├── prisma/
│   └── schema.prisma         # Updated with 5 new models
├── src/
│   └── lib/
│       └── db.ts             # New file: Prisma Singleton
```

### Known Gotchas & Library Quirks
```python
# CRITICAL: Connection Pooling with Neon
# You must use the pooled connection string (with -pooler suffix) in DATABASE_URL for the application.
# You must use the direct connection string in DIRECT_URL for migrations (prisma db push/migrate).
# This is configured in .env, but the schema datasource should use `url = env("DATABASE_URL")`.

# CRITICAL: Next.js HMR & Prisma
# Instantiating `new PrismaClient()` in `db.ts` without the global variable check will cause 
# connection exhaustion in dev mode because Next.js re-runs the file on every edit.
# Pattern: `globalForPrisma.prisma ?? new PrismaClient()`

# CRITICAL: Json Types
# Prisma supports `Json` type for PostgreSQL. Ensure TypeScript interfaces for these JSON fields 
# are defined in `src/types` (later task) or cast properly when using them. 
# For now, `Json?` in schema is sufficient.
```

## Implementation Blueprint

### Data models and structure

**ResearchJob**: Tracks the state of a research session (Deep, Context, etc.).
**BrandConfig**: Stores brand guidelines and assets.
**ContentItem**: Represents a piece of content (Post, Article) generated from research.
**PublishingQueue**: Manages the scheduling and publishing status of content items.
**AgentAuditLog**: Logs agent actions for debugging and compliance.

### List of tasks to be completed

```yaml
Task 1:
MODIFY prisma/schema.prisma:
  - ADD model ResearchJob
  - ADD model BrandConfig
  - ADD model ContentItem
  - ADD model PublishingQueue
  - ADD model AgentAuditLog
  - CONFIGURE relations and indexes
  - PRESERVE existing ResearchContext and AgentRun models (optional, or deprecate)

Task 2:
CREATE src/lib/db.ts:
  - IMPLEMENT Singleton pattern
  - EXPORT PrismaClient instance
  - EXPORT Types from @prisma/client

Task 3:
VERIFY:
  - RUN npx prisma validate
  - RUN npx prisma db push --dry-run
  - CREATE integration test for schema
```

### Per task pseudocode

#### Task 1: Update Schema
```prisma
// prisma/schema.prisma

// ... existing generator and datasource ...

model ResearchJob {
  id           String        @id @default(cuid())
  topic        String
  tabType      String        // 'deep', 'context', 'content', 'publish'
  parameters   Json?         // Store depth, breadth, etc.
  status       String        @default("pending") // pending, running, completed, failed
  reportData   Json?         // The final output of the research
  createdAt    DateTime      @default(now())
  completedAt  DateTime?
  createdBy    String?
  contentItems ContentItem[] // Relation to content

  @@index([status])
  @@index([createdAt])
}

model BrandConfig {
  id             String   @id @default(cuid())
  name           String
  tovGuidelines  String?  @db.Text // Tone of voice
  brandKnowledge Json?
  platformHistory Json?
  brandColors    Json?
  logoUrl        String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  createdBy      String?
}

model ContentItem {
  id            String           @id @default(cuid())
  researchJobId String
  researchJob   ResearchJob      @relation(fields: [researchJobId], references: [id], onDelete: Cascade)
  contentType   String           // 'blog_post', 'social_post', 'carousel'
  copy          String?          @db.Text
  designAssets  Json?
  status        String           @default("draft") // draft, approved, rejected, published
  platform      String           // 'blog', 'twitter', 'linkedin', 'instagram', 'multi'
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
  platform      String
  scheduledAt   DateTime?
  publishedAt   DateTime?
  status        String      @default("pending") // pending, published, failed
  errorLog      String?     @db.Text
  retryCount    Int         @default(0)
  createdAt     DateTime    @default(now())

  @@index([status])
  @@index([platform])
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

#### Task 2: DB Client Singleton
```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

// PATTERN: Global variable to hold instance during HMR
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Re-export types for convenience
export type { ResearchJob, BrandConfig, ContentItem, PublishingQueue, AgentAuditLog } from '@prisma/client';

// Define helper types matching schema enums/strings
export type ResearchJobStatus = 'pending' | 'running' | 'completed' | 'failed';
export type ContentStatus = 'draft' | 'approved' | 'rejected' | 'published';
```

### Integration Points
**DATABASE**:
- New tables will be created in Neon via `prisma db push`.
- Indexes will be created for performance.

**CONFIG**:
- `DATABASE_URL` in `.env` must be set (already expected to be present).

## Validation Loop

### Level 1: Syntax & Style
```bash
# Validate Schema
npx prisma validate

# Check TS file
npx tsc --noEmit src/lib/db.ts
```

### Level 2: Unit/Integration Tests
```typescript
// tests/integration/db/schema.test.ts (Pseudo-test)
import { prisma } from '@/lib/db';

describe('Database Schema', () => {
  it('should create a ResearchJob with ContentItems', async () => {
    const job = await prisma.researchJob.create({
      data: {
        topic: 'Test Topic',
        tabType: 'deep',
        contentItems: {
          create: {
            contentType: 'blog_post',
            platform: 'blog',
            status: 'draft'
          }
        }
      },
      include: { contentItems: true }
    });
    
    expect(job.id).toBeDefined();
    expect(job.contentItems).toHaveLength(1);
    
    // Test Cascade Delete
    await prisma.researchJob.delete({ where: { id: job.id } });
    
    const contentCheck = await prisma.contentItem.findUnique({ 
      where: { id: job.contentItems[0].id } 
    });
    expect(contentCheck).toBeNull();
  });
});
```

### Level 3: Manual Verification
```bash
# Verify SQL generation
npx prisma db push --dry-run
```

## Final Validation Checklist
- [ ] `npx prisma validate` returns "The schema is valid".
- [ ] `src/lib/db.ts` compiles without errors.
- [ ] `prisma db push --dry-run` shows correct `CREATE TABLE` and `CREATE INDEX` statements.
- [ ] Integration tests pass confirming CRUD and Cascade behavior.
