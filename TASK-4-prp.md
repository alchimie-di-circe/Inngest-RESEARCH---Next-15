# PRP: Task 4 - Refactor Deep Research Agent for PRD Compliance

## Goal
Refactor the Deep Research Agent to align with the PRD requirements (Feature 1.1-1.3) and leverage the latest Inngest capabilities for maximum performance and user experience. This involves upgrading the event architecture, enabling **Inngest Checkpointing** for low-latency execution, implementing **Native Realtime Streaming** for progress updates, and persisting full job state to the database.

## Why
- **Granular Control**: Users need to specify `depth` and `breadth` to control cost and thoroughness.
- **Low Latency**: **Checkpointing** enables steps to execute immediately on the client (Vercel) without waiting for HTTP round-trips to Inngest Cloud, critical for AI agent responsiveness.
- **Real-Time Feedback**: **Native Inngest Realtime** allows us to stream step-by-step progress and intermediate thoughts to the UI without polling or custom WebSocket infrastructure.
- **Persistence**: A robust audit trail in the `ResearchJob` table ensures results are never lost and provides a history.
- **Foundation for Phase 3**: The output (`DeepResearchReport`) feeds directly into Content Generation.

## What
- **Event Architecture**: Introduce `deep.research.requested` event and typed Realtime channels.
- **Orchestrator Update**: 
    - Enable `checkpointing: true`.
    - Use `publish()` for real-time updates.
    - Persist `ResearchJob` state at start, intermediate steps, and completion.
- **Context Gathering**: Update `gatherContext` to respect `depth` and `breadth`.
- **UI**:
    - New `ResearchForm` with parameters.
    - `ResearchStatus` component using `useInngestSubscription`.
    - `ResearchReport` view.

### Success Criteria
- [ ] `deep.research.requested` triggers the orchestrator.
- [ ] Orchestrator runs with `checkpointing: true` (verified via logs/headers).
- [ ] Progress updates stream to UI via `useInngestSubscription`.
- [ ] `ResearchJob` persists `RUNNING` -> `COMPLETED` states in DB.
- [ ] Final report saved to `ResearchJob.reportData`.
- [ ] UI displays streaming progress and final report.

---

## All Needed Context

### Documentation & References
```yaml
# Tech Stack Documentation
- url: https://www.inngest.com/docs/features/events-triggers
  why: "Defining custom event schemas with Zod."

- url: https://www.inngest.com/docs/setup/checkpointing
  why: "Enabling low-latency execution for AI agents."

- url: https://www.inngest.com/docs/features/realtime
  why: "Implementing native streaming with publish() and React hooks."

# Project Context
- file: src/inngest/functions/orchestrator.ts
  why: "Current orchestrator implementation to refactor."

- file: src/inngest/client.ts
  why: "Event schema definitions location."

- file: src/inngest/channels.ts
  why: "(New) Realtime channel definitions."
```

---

## Implementation Blueprint

### 1. Event & Channel Models

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
  reportData: z.any(), // Replace with strict DeepResearchReport type
  sourcesCount: z.number(),
});

export type InngestEvents = {
  'deep.research.requested': { data: z.infer<typeof DeepResearchRequestedSchema> };
  'deep.research.completed': { data: z.infer<typeof DeepResearchCompletedSchema> };
}
```

**Step 2: Define Realtime Channels (`src/inngest/channels.ts`)**
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

**Step 3: Update Client (`src/inngest/client.ts`)**
```typescript
import { Inngest } from 'inngest';
import { realtimeMiddleware } from '@inngest/realtime/middleware';
import { EventSchemas } from 'inngest';
import { InngestEvents } from './events';

export const inngest = new Inngest({
  id: "research-app",
  schemas: new EventSchemas().fromRecord<InngestEvents>(),
  middleware: [realtimeMiddleware()], // Enable Realtime
});
```

### 2. Orchestrator Refactor
**File: `src/inngest/functions/orchestrator.ts`**
```typescript
import { inngest } from '../client';
import { researchChannel } from '../channels';

export const orchestrateMultiAgent = inngest.createFunction(
  { 
    id: 'deep-research-orchestrator',
    checkpointing: true, // 🚀 ENABLE LOW LATENCY
    cancelOn: [{ event: 'app/process.cancelled', match: 'data.jobId' }]
  },
  { event: 'deep.research.requested' },
  async ({ event, step, publish }) => { // 🚀 publish is available
    const { topic, depth, breadth, userId, sessionId } = event.data;

    // 1. Create Job in DB
    const job = await step.run('init-job', async () => {
      return db.researchJob.create({
        data: {
          topic,
          tabType: 'DEEP',
          status: 'RUNNING',
          parameters: { depth, breadth },
          createdBy: userId,
        }
      });
    });

    // 2. Stream Progress
    await publish(researchChannel.deepProgress({
      stage: 'staging',
      progress: 10,
      message: 'Initializing research agents...',
      timestamp: new Date().toISOString()
    }));

    // 3. Gather Context
    const context = await step.invoke('gather-context', {
      function: gatherContext,
      data: { query: topic, depth, breadth, sessionId }
    });

    // Stream update
    await publish(researchChannel.deepProgress({
      stage: 'reasoning',
      progress: 40,
      message: 'Analyzing gathered context...',
      timestamp: new Date().toISOString()
    }));

    // ... (Fan-out logic) ...

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
- Use `depth` to generate more/fewer search query variations.

### 4. UI Implementation
**File: `src/app/(dashboard)/deep/page.tsx`**

**Server Action (`src/app/actions.ts`)**:
```typescript
"use server";
import { getSubscriptionToken } from "@inngest/realtime";
import { researchChannel } from "@/inngest/channels";

export async function fetchResearchToken() {
  // Validate auth...
  return await getSubscriptionToken(inngest, {
    channel: researchChannel, 
    topics: ["deep-progress"]
  });
}
```

**Client Component (`ResearchStatus.tsx`)**:
```tsx
"use client";
import { useInngestSubscription } from "@inngest/realtime/hooks";
import { fetchResearchToken } from "@/app/actions";

export function ResearchStatus() {
  const { data, latestData, state } = useInngestSubscription({
    refreshToken: fetchResearchToken
  });

  if (state === 'connecting') return <div>Connecting...</div>;

  return (
    <div>
      <h3>Status: {latestData?.message}</h3>
      <ProgressBar value={latestData?.progress} />
      {/* Render full log */}
      {data.map((msg, i) => (
        <div key={i}>{msg.timestamp}: {msg.message}</div>
      ))}
    </div>
  );
}
```

---

## Validation Loop

### Level 1: Static & Type Check
```bash
npx tsc --noEmit
```

### Level 2: Unit Testing (Jest)
- Test `orchestrator` step logic.
- Verify `checkpointing: true` is set in config object.

### Level 3: Integration Testing (Dev Environment)
1. Start Dev Server: `npm run devall`.
2. Trigger event via UI.
3. Observe **Realtime Updates** in the browser (no reload needed).
4. Verify **Checkpointing**: Check logs to see steps executing immediately without "Sleep" pauses typically associated with serverless cold starts between steps.
5. Check Prisma Studio: Verify `ResearchJob` created and status updates.

---

## Final Checklist
- [ ] Events & Channels defined and exported.
- [ ] `realtimeMiddleware` added to client.
- [ ] Orchestrator uses `checkpointing: true`.
- [ ] UI uses `useInngestSubscription`.
- [ ] Integration test passes.
