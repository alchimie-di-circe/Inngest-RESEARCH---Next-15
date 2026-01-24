# Task ID: 14

**Title:** Create API Routes for Research and Project Management

**Status:** pending

**Dependencies:** 1, 11

**Priority:** medium

**Description:** Implement REST API routes for research job management, project lifecycle, and status endpoints as specified in the PRD structural decomposition.

**Details:**

1. Create `src/app/api/research/route.ts`:
```typescript
// GET - List research jobs with filtering
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const tabType = searchParams.get('tabType');
  
  const jobs = await prisma.researchJob.findMany({
    where: {
      ...(status && { status }),
      ...(tabType && { tabType })
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  
  return Response.json(jobs);
}

// POST - Create new research job
export async function POST(request: Request) {
  const body = await request.json();
  
  const job = await prisma.researchJob.create({
    data: {
      topic: body.topic,
      tabType: body.tabType,
      parameters: body.parameters,
      status: 'pending',
      createdBy: body.userId
    }
  });
  
  // Trigger appropriate Inngest event based on tabType
  await inngest.send({
    name: `${body.tabType}.research.requested`,
    data: { jobId: job.id, ...body }
  });
  
  return Response.json(job);
}
```

2. Create `src/app/api/research/[id]/route.ts` for GET/PUT/DELETE

3. Create `src/app/api/research/[id]/status/route.ts` for status polling

4. Create `src/app/api/project/route.ts` for project CRUD:
```typescript
// Project management endpoints
// - Create project with brand association
// - List projects with phase completion tracking
// - Archive completed projects
```

5. Create `src/app/api/content/route.ts` for content item management

6. Create `src/app/api/publishing/route.ts` for publishing queue management

**Test Strategy:**

Unit tests for each API route using mocked database. Integration tests verifying API → Inngest event triggering. Test error handling and validation for invalid inputs.
