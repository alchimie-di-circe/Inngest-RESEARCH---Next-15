# Inngest Patterns for Research & Publishing Suite

## Core Concepts

This project uses Inngest for:
- **Durable execution**: Retry logic, resumable workflows
- **Event-driven architecture**: Decoupled services via events
- **Multi-agent orchestration**: Step-wise execution with dependencies
- **Realtime streaming**: SSE updates to frontend during execution

---

## 1. Basic Event-Driven Workflow

### Pattern: Simple Request → Processing → Completion

```typescript
import { Inngest } from 'inngest';

export const inngest = new Inngest({ id: 'research-suite' });

// 1. User triggers event via HTTP
export const startResearch = inngest.createFunction(
  { id: 'start-research' },
  { event: 'deep.research.requested' },
  async ({ event, step }) => {
    const { topic, parameters } = event.data;

    // 2. Run work in steps (durable, retryable)
    const result = await step.run('process-topic', async () => {
      return await someExpensiveOperation(topic);
    });

    // 3. Send completion event
    await step.sendEvent('deep.research.completed', {
      data: { topic, result }
    });

    return result;
  }
);

// 4. Listen for completion in another function
export const handleCompletion = inngest.createFunction(
  { id: 'handle-completion' },
  { event: 'deep.research.completed' },
  async ({ event, step }) => {
    const { result } = event.data;
    await step.run('save-to-db', async () => {
      return await db.saveReport(result);
    });
  }
);
```

**Key Points**:
- `step.run()` = durable, automatically retried on failure
- `step.sendEvent()` = trigger next workflow without coupling
- Events are the contract between functions
- Each function is independent and reusable

---

## 2. Multi-Stage Pipeline (Deep Research Example)

### Pattern: Staging → Reasoning → Reporting

```typescript
// Stage 1: Gather raw data
export const stagingAgent = inngest.createFunction(
  { id: 'deep-research-staging' },
  { event: 'deep.research.requested' },
  async ({ event, step }) => {
    const { topic, parameters } = event.data;

    const chunks = await step.run('search-sources', async () => {
      // Parallel searches: ArXiv + GitHub + Exa Web + Pinecone
      const [arxiv, github, web, pinecone] = await Promise.all([
        searchArxiv(topic),
        searchGithub(topic),
        searchExa(topic),
        searchPinecone(topic)
      ]);
      return { arxiv, github, web, pinecone };
    });

    // Trigger next stage
    await step.sendEvent('deep.research.staging.completed', {
      data: { jobId: event.data.jobId, chunks }
    });

    return chunks;
  }
);

// Stage 2: Synthesize and analyze
export const reasoningAgent = inngest.createFunction(
  { id: 'deep-research-reasoning' },
  { event: 'deep.research.staging.completed' },
  async ({ event, step }) => {
    const { chunks } = event.data;

    const analysis = await step.run('analyze', async () => {
      return await claudeAnalyze(chunks);
    });

    await step.sendEvent('deep.research.reasoning.completed', {
      data: { jobId: event.data.jobId, analysis }
    });

    return analysis;
  }
);

// Stage 3: Generate final report
export const reportingAgent = inngest.createFunction(
  { id: 'deep-research-reporting' },
  { event: 'deep.research.reasoning.completed' },
  async ({ event, step }) => {
    const { analysis } = event.data;

    const report = await step.run('format-report', async () => {
      return await generateReport(analysis);
    });

    // Publish completion event
    await step.sendEvent('deep.research.completed', {
      data: { jobId: event.data.jobId, report }
    });

    return report;
  }
);
```

**Benefits**:
- Each stage runs independently
- Failure in stage 2 doesn't restart stage 1
- Easy to add new stages (insert new function + event)
- Scalable: each stage can have different concurrency/timeout

---

## 3. Parallel Execution with Dependencies

### Pattern: Fan-out + Wait for All

```typescript
export const parallelContentGeneration = inngest.createFunction(
  { id: 'parallel-content-gen' },
  { event: 'content.generation.requested' },
  async ({ event, step }) => {
    const { jobId, contentTypes } = event.data;

    // Step 1: Generate all text content in parallel
    const textResults = await Promise.all(
      contentTypes.map(type =>
        step.run(`generate-${type}`, async () => {
          return await generateContent(type, event.data);
        })
      )
    );

    // Step 2: Generate designs in parallel (separate from text)
    const designs = await Promise.all(
      contentTypes
        .filter(type => ['blog_post', 'social'].includes(type))
        .map(type =>
          step.run(`design-${type}`, async () => {
            // MCP Canva call
            return await canvaClient.createDesign(type, textResults[type]);
          })
        )
    );

    // Step 3: Save everything to DB
    const contentIds = await step.run('save-content', async () => {
      return await saveAllContent(textResults, designs, jobId);
    });

    // Step 4: Trigger next workflow
    await step.sendEvent('content.generated', {
      data: { jobId, contentIds }
    });

    return { contentIds, designs };
  }
);
```

**Key Points**:
- `Promise.all()` waits for all parallel steps
- Each `step.run()` gets its own ID (`generate-blog`, `design-blog`)
- If one fails, entire function retries all steps
- Efficient: doesn't waste time waiting

---

## 4. Conditional Branching

### Pattern: Different paths based on data

```typescript
export const contentApprovalFlow = inngest.createFunction(
  { id: 'content-approval' },
  { event: 'content.approval.requested' },
  async ({ event, step }) => {
    const { contentId, approved } = event.data;

    if (approved) {
      // Path A: Approved → Schedule publishing
      await step.run('set-approved', async () => {
        await db.updateContent(contentId, { status: 'approved' });
      });

      await step.sendEvent('publishing.scheduled', {
        data: { contentId, scheduledAt: new Date() }
      });
    } else {
      // Path B: Rejected → Store feedback
      await step.run('set-rejected', async () => {
        await db.updateContent(contentId, { status: 'rejected' });
      });

      await step.sendEvent('content.rejected', {
        data: { contentId, feedback: event.data.feedback }
      });
    }

    return { contentId, status: approved ? 'approved' : 'rejected' };
  }
);
```

**Usage**: Different downstream workflows based on condition

---

## 5. Database Triggers (Neon Integration)

### Pattern: Respond to DB changes via Inngest

```typescript
// In database: setup logical replication
// CREATE PUBLICATION inngest_pub FOR TABLE content_items;
// In Neon console: enable logical replication

// Inngest automatically listens to changes
export const contentStatusChanged = inngest.createFunction(
  { id: 'content-status-changed' },
  { event: 'db/neon/content_items.updated' },  // Auto-generated by Neon + Inngest
  async ({ event, step }) => {
    const { old, new: updated } = event.data;

    // Trigger only if status actually changed
    if (old.status === updated.status) {
      return; // No-op
    }

    if (updated.status === 'approved') {
      // Auto-publish approved content
      await step.sendEvent('publishing.scheduled', {
        data: { contentId: updated.id }
      });
    }
  }
);
```

**Benefits**:
- No polling needed
- DB is source of truth
- Changes → Inngest workflow automatically

---

## 6. Realtime Streaming with SSE

### Pattern: Frontend receives live updates

**Backend** (`src/inngest/functions/deep-research/streaming.ts`):
```typescript
export const deepResearchWithStreaming = inngest.createFunction(
  { id: 'deep-research-streaming' },
  { event: 'deep.research.requested' },
  async ({ event, step }) => {
    const { topic, jobId } = event.data;

    // After each major step, emit event for frontend
    const staging = await step.run('staging', async () => {
      return await stagingAgent();
    });

    // Send update to frontend
    await step.sendEvent('deep.research.progress', {
      data: {
        jobId,
        phase: 'staging',
        progress: 33,
        message: 'Found sources',
        chunks: staging
      }
    });

    const reasoning = await step.run('reasoning', async () => {
      return await reasoningAgent(staging);
    });

    await step.sendEvent('deep.research.progress', {
      data: {
        jobId,
        phase: 'reasoning',
        progress: 66,
        message: 'Analyzing content'
      }
    });

    const report = await step.run('reporting', async () => {
      return await reportingAgent(reasoning);
    });

    await step.sendEvent('deep.research.completed', {
      data: { jobId, report, progress: 100 }
    });

    return report;
  }
);
```

**Frontend** (`src/app/api/deep-research/sse/route.ts`):
```typescript
import { createReadableStream } from 'inngest';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  // Setup SSE response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Listen to inngest events
        const listener = async (event: any) => {
          if (event.data.jobId === jobId) {
            // Send to frontend
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify(event.data)}\n\n`
              )
            );
          }
        };

        // Subscribe to progress events
        inngest.on('deep.research.progress', listener);
        inngest.on('deep.research.completed', listener);

      } catch (error) {
        controller.error(error);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

**Frontend React** (`src/components/research-stream.tsx`):
```typescript
'use client';
import { useEffect, useState } from 'react';

export function ResearchStream({ jobId }) {
  const [progress, setProgress] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const eventSource = new EventSource(`/api/sse?jobId=${jobId}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setProgress(data.progress);
      setMessages(prev => [...prev, data.message]);
    };

    eventSource.onerror = () => eventSource.close();

    return () => eventSource.close();
  }, [jobId]);

  return (
    <div>
      <progress value={progress} max={100} />
      <ul>
        {messages.map((msg, i) => <li key={i}>{msg}</li>)}
      </ul>
    </div>
  );
}
```

**Benefits**:
- User sees progress in real-time
- No polling overhead
- Feels responsive and transparent

---

## 7. Scheduled Jobs (Cron)

### Pattern: Periodic tasks

```typescript
export const publishingQueueManager = inngest.createFunction(
  { id: 'publishing-queue-manager' },
  { cron: '*/5 * * * *' },  // Every 5 minutes
  async ({ step }) => {
    // Find all failed items
    const failed = await step.run('find-failed', async () => {
      return await db.query(
        'SELECT * FROM publishing_queue WHERE status = $1 AND retry_count < 3',
        ['failed']
      );
    });

    // Retry each one
    for (const item of failed) {
      await step.sendEvent('publishing.retry.requested', {
        data: { contentId: item.content_item_id, retryCount: item.retry_count + 1 }
      });
    }

    return { retriedCount: failed.length };
  }
);
```

**Usage**: 
- Retry failed publishes
- Cleanup old jobs
- Health checks
- Scheduled reports

---

## 8. Error Handling & Retry

### Pattern: Graceful degradation

```typescript
export const robustPublisher = inngest.createFunction(
  {
    id: 'robust-publisher',
    retries: 3,  // Max 3 retries
    timeout: '15s'  // Timeout after 15 seconds
  },
  { event: 'publishing.scheduled' },
  async ({ event, step, attempt }) => {
    const { contentId } = event.data;

    try {
      const result = await step.run('publish', async () => {
        return await publishToShopify(contentId);
      });

      return { success: true, result };
    } catch (error) {
      // Log attempt
      await step.run('log-failure', async () => {
        await db.log({
          contentId,
          attempt,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      });

      // Retry logic handled by Inngest automatically
      // attempt = 1, 2, 3 (exponential backoff)
      throw error;  // Inngest will retry
    }
  }
);
```

**Built-in Retry Strategy**:
- Attempt 1: immediately
- Attempt 2: after 1s
- Attempt 3: after 2s
- Attempt 4: after 4s
- ...exponential backoff

---

## 9. Testing Inngest Functions

```typescript
import { testClient } from 'inngest/test';
import { describe, it, expect } from '@jest/globals';
import { deepResearchAgent } from '@/inngest/functions';

describe('Deep Research Agent', () => {
  it('should complete research and save report', async () => {
    const inngest = testClient({
      id: 'test',
      functions: [deepResearchAgent]
    });

    // Trigger event
    const run = await inngest.send({
      name: 'deep.research.requested',
      data: { topic: 'AI in 2025', parameters: { depth: 2, breadth: 3 } }
    });

    // Wait for completion
    const result = await run.waitForCompletion();

    expect(result.status).toBe('completed');
    expect(result.data.report).toBeDefined();
    expect(result.data.report.chunks).toHaveLength(expect.any(Number));
  });

  it('should retry on failure', async () => {
    // Mock API to fail first time
    mockArchixApi.failOnce();

    const inngest = testClient({
      id: 'test',
      functions: [stagingAgent]
    });

    const run = await inngest.send({
      name: 'deep.research.requested',
      data: { topic: 'Test' }
    });

    // Should eventually succeed via retry
    const result = await run.waitForCompletion();
    expect(result.status).toBe('completed');
  });
});
```

---

## Best Practices

### ✅ DO

- Use `step.run()` for ALL external calls (API, DB, LLM)
- Name steps descriptively (`staging-arxiv`, `analyze-chunks`)
- Break long workflows into functions (event → next function)
- Emit progress events for realtime UX
- Log to agent_audit_log for observability
- Implement idempotent step logic (safe to retry)

### ❌ DON'T

- Make HTTP calls outside `step.run()` (not durable)
- Update DB outside `step.run()` (not retryable)
- Store mutable state between steps
- Use `setTimeout()` (use Inngest scheduling)
- Hardcode retry logic (Inngest handles it)
- Emit events inside `step.run()` (emit outside)

---

## Common Patterns Reference

| Pattern | Use Case | Example |
|---------|----------|---------|
| **Linear Pipeline** | Sequential stages | Deep research: staging → reasoning → reporting |
| **Parallel Execution** | Multiple independent tasks | Generate blog + designs simultaneously |
| **Conditional Branching** | Different paths based on data | Approved → publish, Rejected → archive |
| **Scheduled Jobs** | Periodic execution | Queue manager (every 5 min) |
| **DB Triggers** | React to data changes | Content status change → auto-publish |
| **Realtime Streaming** | Live progress to frontend | SSE updates during research |
| **Error Handling** | Graceful retry + logging | Publish with exponential backoff |
| **Testing** | Local verification | testClient + waitForCompletion |

---

## Debugging

```bash
# View all executions
npx inngest-cli@latest runs list

# View specific function
npx inngest-cli@latest runs list --function deep-research-staging

# View run details
npx inngest-cli@latest runs get <run-id>

# Replay failed run (re-execute from start)
npx inngest-cli@latest runs replay <run-id>

# Stream logs
npx inngest-cli@latest runs stream <run-id>
```

---

## Events Cheat Sheet

```typescript
// Define in src/inngest/events.ts
interface Events {
  // Request → Processing chain
  'deep.research.requested': { data: { topic: string; parameters: any } };
  'deep.research.staging.completed': { data: { jobId: string; chunks: any } };
  'deep.research.reasoning.completed': { data: { jobId: string; analysis: any } };
  'deep.research.completed': { data: { jobId: string; report: any } };

  // Content generation
  'content.generation.requested': { data: { jobId: string; contentTypes: string[] } };
  'content.generated': { data: { contentIds: string[] } };

  // Publishing
  'publishing.scheduled': { data: { contentId: string; platform: string } };
  'publishing.completed': { data: { contentId: string } };
  'publishing.failed': { data: { contentId: string; error: string } };

  // General
  'deep.research.progress': { data: { jobId: string; progress: number; message: string } };
}

// Send event
await step.sendEvent('deep.research.completed', {
  data: { jobId: '...', report: {...} }
});

// Listen in function signature
{ event: 'deep.research.completed' }
```
