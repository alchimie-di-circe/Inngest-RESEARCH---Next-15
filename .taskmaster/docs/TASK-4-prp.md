# PRP: Task 4 - Refactor Deep Research Agent for PRD Compliance

## Goal
Refactor the Deep Research Agent to align with the PRD requirements, specifically Feature 1.1-1.3. This involves upgrading the event architecture to support detailed research requests (depth, breadth), persisting full job state to the database, and updating the UI to support these new capabilities.

## Why
- **Granular Control**: Users need to specify `depth` and `breadth` to control cost and thoroughness.
- **Persistence**: Currently, research results might be lost if not properly persisted. We need a robust audit trail in the `ResearchJob` table.
- **Observability**: Tracking the status of the research job (pending -> running -> completed) in the DB allows for better UI feedback and history.
- **Foundation for Phase 3**: The output of this phase (`DeepResearchReport`) is the input for the Content Generation phase.

## What
- **Event Architecture**: Introduce `deep.research.requested` and `deep.research.completed` events with Zod validation.
- **Orchestrator Update**: Modify `orchestrateMultiAgent` to:
    - Listen for the new event.
    - Create/Update `ResearchJob` entry at start.
    - Persist intermediate steps.
    - Save final JSON report.
- **Context Gathering**: Update `gatherContext` to respect `depth` (search query variations) and `breadth` (source count/limit).
- **UI**:
    - New `ResearchForm` with sliders for depth/breadth.
    - `ResearchHistory` table.
    - `ResearchReport` view.

### Success Criteria
- [ ] `deep.research.requested` event triggers the orchestrator.
- [ ] `ResearchJob` is created in DB with status `RUNNING` immediately upon trigger.
- [ ] `gatherContext` scales sources based on `breadth` parameter.
- [ ] Final report is saved to `ResearchJob.reportData` and status set to `COMPLETED`.
- [ ] UI displays real-time progress and final report from DB.
- [ ] Retry logic works for failed steps (Inngest built-in).

---

## All Needed Context

### Documentation & References
```yaml
# Tech Stack Documentation
- url: https://www.inngest.com/docs/features/events-triggers
  why: "Defining custom event schemas with Zod."

- url: https://www.inngest.com/docs/guides/multi-step-functions
  why: "Using step.run for durable execution and state persistence."

- url: https://sdk.vercel.ai/docs/reference/ai-sdk-core/generate-text
  why: "Vercel AI SDK patterns for agent interactions."

# Project Context
- file: src/inngest/functions/orchestrator.ts
  why: "Current orchestrator implementation to refactor."

- file: src/inngest/functions/gather-context.ts
  why: "Context gathering logic to update for depth/breadth."

- file: src/inngest/client.ts
  why: "Event schema definitions location."

- file: prisma/schema.prisma
  why: "ResearchJob model definition."
```

### Current Codebase Structure (Relevant)
```bash
src/
├── app/
│   └── (dashboard)/
│       └── deep/
│           └── page.tsx        # UI to update
├── inngest/
│   ├── functions/
│   │   ├── orchestrator.ts     # Main logic
│   │   └── gather-context.ts   # Sub-function
│   ├── client.ts               # Event schemas
│   └── events.ts               # (New) Dedicated events file
└── lib/
    └── db.ts                   # Prisma client
```

### Known Gotchas
- **Event Schema Duplication**: Ensure `src/inngest/client.ts` imports from the new `events.ts` to avoid circular deps or duplication.
- **Timeouts**: Deep research can take time. Ensure Inngest function timeouts are high enough (default is usually fine for serverless if using steps, but check platform limits).
- **Prisma Json Types**: `reportData` is `Json?`. Ensure strict typing in TypeScript when reading/writing to avoid `any` issues.

---

## Implementation Blueprint

### 1. Event & Data Models
**Step 1: Define Events (`src/inngest/events.ts`)**
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
  reportData: z.any(), // Define strict DeepResearchReport type
  sourcesCount: z.number(),
});

export type InngestEvents = {
  'deep.research.requested': { data: z.infer<typeof DeepResearchRequestedSchema> };
  'deep.research.completed': { data: z.infer<typeof DeepResearchCompletedSchema> };
}
```

**Step 2: Update Client (`src/inngest/client.ts`)**
```typescript
import { EventSchemas } from 'inngest';
import { InngestEvents } from './events';

export const inngest = new Inngest({
  id: "research-app",
  schemas: new EventSchemas().fromRecord<InngestEvents>(),
});
```

### 2. Orchestrator Refactor
**File: `src/inngest/functions/orchestrator.ts`**
```typescript
// Pseudocode update
export const orchestrateMultiAgent = inngest.createFunction(
  { id: 'deep-research-orchestrator' },
  { event: 'deep.research.requested' }, // NEW TRIGGER
  async ({ event, step }) => {
    const { topic, depth, breadth, userId, sessionId } = event.data;

    // 1. Create/Update Job
    const job = await step.run('init-job', async () => {
      return db.researchJob.create({
        data: {
          topic,
          tabType: 'DEEP',
          status: 'RUNNING',
          parameters: { depth, breadth },
          userId, // Ensure mapping to createdBy or similar
        }
      });
    });

    // 2. Gather Context (Pass params)
    const context = await step.invoke('gather-context', {
      function: gatherContext,
      data: { query: topic, depth, breadth, sessionId }
    });

    // 3. Update Job Status
    await step.run('update-job-analyzing', async () => {
       await db.researchJob.update({
         where: { id: job.id },
         data: { status: 'RUNNING', reportData: { stage: 'analyzing' } }
       });
    });

    // ... (Existing Fan-out logic) ...

    // 4. Final Save
    await step.run('finalize-job', async () => {
       await db.researchJob.update({
         where: { id: job.id },
         data: { 
           status: 'COMPLETED', 
           completedAt: new Date(),
           reportData: finalReport 
         }
       });
    });
    
    // 5. Emit Completion
    await step.sendEvent('emit-complete', {
      name: 'deep.research.completed',
      data: { jobId: job.id, ... }
    });
  }
);
```

### 3. Context Gathering Update
**File: `src/inngest/functions/gather-context.ts`**
- Update signature to accept `depth` and `breadth`.
- Use `breadth` to determine how many results to fetch (e.g., `breadth * 5`).
- Use `depth` to generate more/fewer search query variations (e.g., `depth` = iterations of query refinement).

### 4. UI Implementation
**File: `src/app/(dashboard)/deep/page.tsx`**
- **ResearchForm**:
    - Input: Topic (text).
    - Sliders: Depth (1-5), Breadth (1-5).
    - Action: Server Action -> `inngest.send('deep.research.requested', ...)` -> Redirect to `/deep?jobId=...`.
- **Status/Result View**:
    - If `jobId` param exists, poll `/api/research/[id]` or subscription.
    - Render `ResearchReport` component when status is `COMPLETED`.

---

## Validation Loop

### Level 1: Static & Type Check
```bash
npx tsc --noEmit
# Verify Zod schemas match DB types
```

### Level 2: Unit Testing (Jest)
- Test `orchestrator` step logic (mocking `step.run` and `db`).
- Test `gatherContext` parameter scaling.

### Level 3: Integration Testing (Dev Environment)
1. Start Dev Server: `npm run devall`.
2. Trigger event via Inngest Dev Server UI:
   ```json
   {
     "name": "deep.research.requested",
     "data": {
       "topic": "Future of AI 2025",
       "depth": 2,
       "breadth": 2,
       "userId": "user_1",
       "sessionId": "session_1"
     }
   }
   ```
3. Check Prisma Studio (`npx prisma studio`): Verify `ResearchJob` created and status updates.
4. Check Inngest UI: Verify steps executed and event emitted.

---

## Final Checklist
- [ ] Events defined and exported.
- [ ] Orchestrator handles persistence.
- [ ] Gather context respects parameters.
- [ ] UI allows triggering and viewing results.
- [ ] Integration test passes.