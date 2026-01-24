# Task ID: 1

**Title:** Extend Database Schema for Full Research Publishing Suite

**Status:** pending

**Dependencies:** None

**Priority:** high

**Description:** Update Prisma schema with complete data models for research_jobs, brand_config, content_items, and publishing_queue tables as specified in the PRD to support all 4 phases.

**Details:**

Update `prisma/schema.prisma` with the following models:

```prisma
model ResearchJob {
  id           String        @id @default(cuid())
  topic        String
  tabType      String        // 'deep', 'context', 'content', 'publish'
  parameters   Json?
  status       String        @default("pending") // pending, running, completed, failed
  reportData   Json?
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

Then run `npx prisma db push` to sync with Neon. Create a database utility file at `src/lib/db.ts` to export Prisma client singleton.

**Test Strategy:**

Run `npx prisma validate` to check schema. Run `npx prisma db push --dry-run` to verify migration. Create integration tests in `tests/integration/db/schema.test.ts` that verify all tables can be created and basic CRUD operations work.

## Subtasks

### 1.1. Add Core Models with Relations to Prisma Schema

**Status:** pending  
**Dependencies:** None  

Add the 5 new models (ResearchJob, BrandConfig, ContentItem, PublishingQueue, AgentAuditLog) to the Prisma schema with proper field definitions, relations, and cascade delete behaviors. Integrate with or deprecate existing ResearchContext and AgentRun models.

**Details:**

Update `prisma/schema.prisma` to add:

1. **ResearchJob** model with fields: id, topic, tabType ('deep'|'context'|'content'|'publish'), parameters (Json), status ('pending'|'running'|'completed'|'failed'), reportData (Json), createdAt, completedAt, createdBy. Add one-to-many relation to ContentItem.

2. **BrandConfig** model with fields: id, name, tovGuidelines (Text for tone of voice), brandKnowledge (Json), platformHistory (Json), brandColors (Json), logoUrl, createdAt, updatedAt, createdBy. Standalone model.

3. **ContentItem** model with fields: id, researchJobId (FK), contentType, copy (Text), designAssets (Json), status ('draft'|'approved'|'rejected'|'published'), platform, publishDate, createdAt, updatedAt. Relation to ResearchJob with onDelete Cascade. One-to-many relation to PublishingQueue.

4. **PublishingQueue** model with fields: id, contentItemId (FK), platform, scheduledAt, publishedAt, status ('pending'|'published'|'failed'), errorLog (Text), retryCount, createdAt. Relation to ContentItem with onDelete Cascade.

5. **AgentAuditLog** model with fields: id, agentName, action, jobId, status, metadata (Json), createdAt. Standalone model for audit trail.

Consider keeping existing models as-is for backward compatibility or add deprecation comments if they're superseded by new models.

### 1.2. Add Database Indexes and Constraints

**Status:** pending  
**Dependencies:** 1.1  

Add performance-critical indexes to all models for common query patterns (status filtering, date sorting, platform filtering) as specified in the PRD schema.

**Details:**

Add the following `@@index` directives to optimize query performance:

**ResearchJob:**
- `@@index([status])` - For filtering by job status (pending, running, completed, failed)
- `@@index([createdAt])` - For sorting/filtering by creation date

**ContentItem:**
- `@@index([status])` - For filtering draft/approved/published content

**PublishingQueue:**
- `@@index([status])` - For finding pending/failed publishing jobs
- `@@index([platform])` - For platform-specific queue queries

**AgentAuditLog:**
- `@@index([agentName])` - For filtering logs by agent
- `@@index([createdAt])` - For time-based log queries

These indexes align with the SQL schema in CLAUDE.md and support the query patterns needed for the publishing queue manager (Task 10) and real-time streaming (Task 13).

### 1.3. Create Prisma Client Singleton and Type Exports

**Status:** pending  
**Dependencies:** 1.1, 1.2  

Create the database utility file at `src/lib/db.ts` with a Prisma client singleton pattern for serverless environments and export type helpers for all new models.

**Details:**

Create `src/lib/db.ts` with the following structure:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Type exports for all models
export type { ResearchJob, BrandConfig, ContentItem, PublishingQueue, AgentAuditLog } from '@prisma/client';

// Convenience type aliases
export type ResearchJobStatus = 'pending' | 'running' | 'completed' | 'failed';
export type ContentStatus = 'draft' | 'approved' | 'rejected' | 'published';
export type PublishingStatus = 'pending' | 'published' | 'failed';
export type TabType = 'deep' | 'context' | 'content' | 'publish';
export type Platform = 'blog' | 'twitter' | 'linkedin' | 'instagram' | 'multi';
```

After creating the file, run `npx prisma generate` to ensure types are available, then `npx prisma db push` to sync schema with Neon database.
