# Task ID: 4

**Title:** Refactor Deep Research Agent for PRD Compliance

**Status:** pending

**Dependencies:** 1, 2

**Priority:** high

**Description:** Update the existing deep research agent (gather-context, orchestrator) to align with PRD Feature 1.1-1.3, adding proper event schemas and database persistence.

**Details:**

1. Update `src/inngest/events.ts` to add new event types:
```typescript
export type InngestEvents = {
  'deep.research.requested': {
    data: {
      topic: string;
      brandId?: string;
      depth: number; // 1-5
      breadth: number; // 1-5
      userId: string;
      sessionId: string;
    };
  };
  'deep.research.completed': {
    data: {
      jobId: string;
      reportData: DeepResearchReport;
      sourcesCount: number;
    };
  };
};
```

2. Modify `src/inngest/functions/orchestrator.ts`:
- Accept 'deep.research.requested' event (in addition to existing)
- Persist ResearchJob to database at start
- Update job status as workflow progresses
- Save final reportData to database
- Emit 'deep.research.completed' event at end

3. Add read_article tool integration in websearch.ts to fetch full articles

4. Update gather-context to accept depth/breadth parameters and adjust search queries accordingly

5. Update Deep Research page (`src/app/(dashboard)/deep/page.tsx`):
- Add form for topic, depth, breadth parameters
- Show research job history from database
- Display real-time progress using existing RealtimeResearchStatus component

**Test Strategy:**

Integration tests for the full deep research pipeline using TestSprite MCP sandbox. Verify database persistence at each step. Test edge cases: no results found, API failures, retry logic.

## Subtasks

### 4.1. Add Deep Research Event Types to events.ts

**Status:** pending  
**Dependencies:** None  

Create a dedicated events.ts file with deep.research.requested and deep.research.completed event type definitions including all required parameters (topic, brandId, depth, breadth, userId, sessionId).

**Details:**

1. Create `src/inngest/events.ts` if it doesn't exist (currently events are inline in client.ts)
2. Define DeepResearchReport type for report data structure
3. Add deep.research.requested event with: topic (string), brandId (optional string), depth (1-5 number), breadth (1-5 number), userId (string), sessionId (string)
4. Add deep.research.completed event with: jobId (string), reportData (DeepResearchReport), sourcesCount (number)
5. Export InngestEvents type union and update client.ts to import from events.ts
6. Add Zod validation schemas for depth/breadth parameters (1-5 range validation)

### 4.2. Modify Orchestrator to Accept New Event and Add Database Persistence

**Status:** pending  
**Dependencies:** 4.1  

Update orchestrator.ts to listen for deep.research.requested event, create ResearchJob in database at workflow start, update job status during execution, and emit deep.research.completed on success.

**Details:**

1. Add second event trigger to orchestrator: { event: 'deep.research.requested' } alongside existing research/query.submitted
2. At workflow start, use step.run('create-job') to persist ResearchJob to database with status='running'
3. After gatherContext, update job status with step.run('update-job-staging')
4. After agent fan-out/fan-in, update job status with step.run('update-job-analysis')
5. On successful synthesis, save reportData to database and set status='completed', completedAt=now()
6. Emit deep.research.completed event via inngest.send() with jobId, reportData, sourcesCount
7. Wrap workflow in try/catch, update job status='failed' on error with error message in reportData
8. Ensure database operations use Prisma with proper error handling

### 4.3. Add Depth/Breadth Parameters to Gather-Context Function

**Status:** pending  
**Dependencies:** 4.1  

Extend gather-context.ts to accept depth and breadth parameters that control search query expansion, result counts per source, and context ranking thresholds.

**Details:**

1. Update gatherContext function signature to accept depth (1-5) and breadth (1-5) from event.data
2. Depth affects: number of search variations per source, embedding comparison threshold, context ranking strictness
3. Breadth affects: number of sources to query in parallel, max results per source (breadth * 5), total contexts returned (breadth * 10)
4. Modify ArXiv query to expand search terms based on depth (depth > 3 adds related terms)
5. Modify GitHub search to adjust repos searched based on breadth
6. Modify VectorDB query to adjust topK based on depth * breadth
7. Modify Web search to adjust result count based on breadth
8. Update context ranking threshold: higher depth = stricter relevance cutoff
9. Default values: depth=3, breadth=3 for backward compatibility with existing events

### 4.4. Create Deep Research Page with Form and Job History

**Status:** pending  
**Dependencies:** 4.2, 4.3  

Build or update the Deep Research page at src/app/(dashboard)/deep/page.tsx with a form for topic, depth, breadth inputs and a job history table fetching from database.

**Details:**

1. Create page at src/app/(dashboard)/deep/page.tsx with server component wrapper
2. Add form with: topic (text input, required), depth (slider/select 1-5, default 3), breadth (slider/select 1-5, default 3)
3. Add optional brandId selector if brand_config table has entries
4. Create server action submitDeepResearch() that sends deep.research.requested event
5. Add ResearchJobHistory client component that fetches jobs with tabType='deep' from API
6. Display job history table with columns: topic, status, createdAt, completedAt, actions (view report)
7. Integrate existing RealtimeResearchStatus component for real-time progress display
8. Add status filters (all, pending, running, completed, failed) and pagination
9. Style with existing Tailwind design system patterns from QueryForm.tsx

### 4.5. Implement Report Display and Error Handling

**Status:** pending  
**Dependencies:** 4.2, 4.4  

Create a report viewer component for displaying deep research reports from database, with proper error boundaries and recovery UI for failed jobs.

**Details:**

1. Create DeepResearchReport component that renders reportData JSON as structured UI
2. Add report sections: Executive Summary, Key Findings, Sources (with citations), Agent Analysis breakdown
3. Implement error boundary wrapper around RealtimeResearchStatus to catch streaming errors
4. Add retry button for failed jobs that re-emits deep.research.requested with same parameters
5. Create API route GET /api/research/[jobId] to fetch single job with full reportData
6. Add loading skeleton states for report sections
7. Implement report export functionality (markdown, JSON download)
8. Handle edge cases: empty report, partial completion, timeout states
9. Add toast notifications for job status changes using existing notification patterns
