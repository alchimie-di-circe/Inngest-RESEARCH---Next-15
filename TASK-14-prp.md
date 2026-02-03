# PRP: Task 14 - Create API Routes for Research and Project Management

## Goal
Implement a comprehensive, type-safe REST API layer for the Research Publishing Suite using Next.js 15 App Router Route Handlers. These endpoints will serve as the interface between the frontend dashboard and the backend services (Neon DB, Inngest orchestration), enabling CRUD operations for research jobs, projects, content items, and publishing queues.

## Why
- **Frontend-Backend Decoupling**: Provides a standardized way for the UI to interact with data and trigger background workflows.
- **Workflow Triggering**: Acts as the entry point for starting Inngest agentic workflows (e.g., creating a research job triggers the Deep Research Agent).
- **Status Polling**: Enables real-time-like status updates for the UI via lightweight polling endpoints.
- **Type Safety**: Enforces strict data validation using Zod before data reaches the database or Inngest.

## What
- **Research Routes**:
    - `GET /api/research`: List jobs with filtering (status, type).
    - `POST /api/research`: Create job + trigger Inngest event.
    - `GET/PUT/DELETE /api/research/[id]`: Job lifecycle management.
    - `GET /api/research/[id]/status`: Optimized polling endpoint.
- **Project Routes**: `GET/POST /api/project` for organizing research into projects (Brand association).
- **Content Routes**: `GET/POST /api/content` for managing drafts and generated assets.
- **Publishing Routes**: `GET/POST /api/publishing` for queue management.

### Success Criteria
- [ ] All endpoints return correct HTTP status codes (200, 201, 400, 404, 500).
- [ ] Zod validation is applied to all incoming request bodies and query parameters.
- [ ] Inngest events are correctly triggered upon job creation.
- [ ] Prisma operations use the singleton `db` instance.
- [ ] Error handling catches Zod validation errors and Prisma errors gracefully.
- [ ] Integration tests verify the flow: API Call -> DB Record Created -> Inngest Event Sent.

---

## All Needed Context

### Documentation & References
```yaml
# Tech Stack Documentation
- url: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
  why: "Next.js 15 Route Handler patterns (GET/POST export convention)."

- url: https://zod.dev/?id=basic-usage
  why: "Runtime validation for request bodies."

- url: https://www.prisma.io/docs/orm/prisma-client/queries/crud
  why: "Prisma CRUD operations best practices."

- url: https://www.inngest.com/docs/sending-events
  why: "Pattern for sending events from Next.js API routes."

# Project Context
- file: src/lib/db.ts
  why: "Database client singleton. Usage: `import { db } from '@/lib/db'`."

- file: src/inngest/client.ts
  why: "Inngest client for sending events. Usage: `import { inngest } from '@/inngest/client'`."

- file: prisma/schema.prisma
  why: "Data models references (ResearchJob, BrandConfig, ContentItem)."
```

### Current Codebase Structure (Relevant)
```bash
src/
├── app/
│   ├── api/
│   │   └── inngest/      # Existing Inngest route
│   │   └── brand/        # Created in Task 3
├── lib/
│   └── db.ts             # Prisma Singleton
└── inngest/
    └── client.ts         # Inngest Client
```

### Desired Structure Additions
```bash
src/app/api/
├── research/
│   ├── route.ts          # List (GET), Create (POST)
│   └── [id]/
│       ├── route.ts      # Get (GET), Update (PUT), Delete (DELETE)
│       └── status/
│           └── route.ts  # Status Poll (GET)
├── project/
│   └── route.ts          # List (GET), Create (POST)
├── content/
│   └── route.ts          # List (GET), Create (POST)
└── publishing/
    └── route.ts          # List (GET), Create (POST)
```

### Known Gotchas
- **Next.js Caching**: Route handlers using `GET` are cached by default if they don't use dynamic functions (like `request` object methods).
    - *Solution*: Since we access `request.url` or `searchParams`, Next.js opts out of static caching, but to be safe/explicit for an API, we can use `export const dynamic = 'force-dynamic'`.
- **Zod Validation**: `request.json()` can fail if body is empty. Wrap in try/catch.
- **Inngest Event Naming**: Must match exactly what's defined in `src/inngest/client.ts` / `events.ts`.
    - *Ref*: `deep.research.requested`, `context.research.requested`, etc.

---

## Implementation Blueprint

### 1. Data Validation (Zod Schemas)
Define strict validation schemas. Ideally, these live in `src/types/api.ts` or co-located if small. For consistency, we'll assume `src/types/api.ts` or reuse Task 11 types.

```typescript
// Example Zod Schema
import { z } from 'zod';
// If TabType isn't exported from Prisma yet, define it locally or import
// import { TabType } from '@prisma/client'; 

export const CreateResearchJobSchema = z.object({
  topic: z.string().min(5),
  tabType: z.enum(['DEEP', 'CONTEXT', 'CONTENT', 'PUBLISH']), 
  parameters: z.record(z.unknown()).optional(),
  userId: z.string().optional(), // For now, optional or mocked
  brandId: z.string().optional(),
});
```

### 2. API Route Implementation Patterns

**Pattern: List & Create (`src/app/api/research/route.ts`)**
```typescript
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inngest } from '@/inngest/client';
import { CreateResearchJobSchema } from '@/types/api'; // or local
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tabType = searchParams.get('tabType');
    
    // Type-safe query building
    const whereClause: any = {};
    // Ensure status matches JobStatus enum if strict
    if (status) whereClause.status = status.toUpperCase(); 
    if (tabType) whereClause.tabType = tabType.toUpperCase();

    const jobs = await db.researchJob.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { brandConfig: true } // Include related data if needed
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = CreateResearchJobSchema.parse(body);

    const job = await db.researchJob.create({
      data: {
        jobTitle: validated.topic, // Mapping 'topic' to 'jobTitle' per schema
        jobBrief: validated.topic, // Using topic as brief initially
        status: 'PENDING',
        brandConfigId: validated.brandId
        // tabType logic might need DB schema update if TabType enum is used differently
      }
    });

    // Trigger Inngest
    await inngest.send({
      name: `${validated.tabType.toLowerCase()}.research.requested`,
      data: { 
        jobId: job.id, 
        topic: validated.topic,
        brandId: validated.brandId,
        // ... other params
      }
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

### 3. Implementation Tasks

#### Task 14.1: Research API
- [ ] Create `src/app/api/research/route.ts` (GET/POST).
- [ ] Create `src/app/api/research/[id]/route.ts` (GET/PUT/DELETE).
- [ ] Create `src/app/api/research/[id]/status/route.ts` (GET - optimize to select only status field).

#### Task 14.2: Project & Content APIs
- [ ] Create `src/app/api/project/route.ts`: List/Create projects.
- [ ] Create `src/app/api/content/route.ts`: CRUD for `ContentItem`.
- [ ] Create `src/app/api/publishing/route.ts`: CRUD for `PublishingQueue`.

#### Task 14.3: Validation Schemas
- [ ] Create/Update `src/types/api.ts` with Zod schemas for all POST/PUT bodies.

---

## Validation Loop

### Level 1: Static Analysis
```bash
# Type Check
npx tsc --noEmit
# Lint
npm run lint
```

### Level 2: Unit/Integration Testing (Container/Codespace)
Create `tests/integration/api/research.test.ts`.

```typescript
import { createMocks } from 'node-mocks-http'; // Or use native fetch in test runner
import { GET, POST } from '@/app/api/research/route';

describe('/api/research', () => {
  it('creates a job and triggers inngest', async () => {
    const req = new Request('http://localhost:3000/api/research', {
      method: 'POST',
      body: JSON.stringify({
        topic: 'Test Research',
        tabType: 'DEEP',
        brandId: null
      })
    });
    
    const res = await POST(req);
    const data = await res.json();
    
    expect(res.status).toBe(201);
    expect(data.jobTitle).toBe('Test Research');
    // Verify Inngest send (mocking required)
  });
});
```

### Level 3: Manual Verification
Using `curl` or Postman against the running dev server:
```bash
# List Jobs
curl http://localhost:3000/api/research

# Create Job
curl -X POST http://localhost:3000/api/research \
  -H "Content-Type: application/json" \
  -d '{"topic": "AI Trends 2026", "tabType": "DEEP"}'
```

---

## Final Checklist
- [ ] All Route Handlers implemented.
- [ ] `force-dynamic` applied where necessary.
- [ ] Zod validation protects all write operations.
- [ ] Inngest events wired up correctly.
- [ ] Tests pass (Unit + Integration).