# Task ID: 10

**Title:** Implement Publishing Queue Manager with Retry Logic

**Status:** pending

**Dependencies:** 1, 9

**Priority:** medium

**Description:** Create the queue manager for publishing jobs with exponential backoff retry logic, job status tracking, and audit logging per PRD Feature 4.2.

**Details:**

1. Create `src/inngest/functions/queue-manager.ts`:
```typescript
export const publishingQueueManager = inngest.createFunction(
  {
    id: 'publishing-queue-manager',
    retries: 3,
    backoff: { type: 'exponential', base: '30s', maxDelay: '1h' }
  },
  { event: 'publishing.scheduled' },
  async ({ event, step, attempt }) => {
    const { contentItemId, platforms, scheduledAt } = event.data;
    
    // Wait until scheduled time if in future
    if (scheduledAt && new Date(scheduledAt) > new Date()) {
      await step.sleepUntil('wait-for-schedule', new Date(scheduledAt));
    }
    
    // Create queue entries
    const queueEntries = await step.run('create-queue-entries', async () => {
      return await Promise.all(
        platforms.map(platform =>
          prisma.publishingQueue.create({
            data: {
              contentItemId,
              platform,
              scheduledAt,
              status: 'pending'
            }
          })
        )
      );
    });
    
    // Publish to each platform (with individual error handling)
    const results = await Promise.allSettled(
      platforms.map(platform =>
        step.invoke(`publish-${platform}`, {
          function: getPublisherFunction(platform),
          data: { contentItemId }
        })
      )
    );
    
    // Update queue statuses
    await step.run('update-statuses', async () => {
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        await prisma.publishingQueue.update({
          where: { id: queueEntries[i].id },
          data: {
            status: result.status === 'fulfilled' ? 'published' : 'failed',
            publishedAt: result.status === 'fulfilled' ? new Date() : null,
            errorLog: result.status === 'rejected' ? String(result.reason) : null,
            retryCount: attempt
          }
        });
      }
    });
    
    // Log to audit
    await step.run('audit-log', async () => {
      await prisma.agentAuditLog.create({
        data: {
          agentName: 'queue-manager',
          action: 'publish',
          jobId: contentItemId,
          status: results.every(r => r.status === 'fulfilled') ? 'success' : 'partial',
          metadata: { platforms, results: results.map(r => r.status) }
        }
      });
    });
    
    return { results };
  }
);
```

2. Create scheduled cron function for queue processing:
```typescript
export const queueProcessor = inngest.createFunction(
  { id: 'queue-processor' },
  { cron: '0 * * * *' }, // Every hour
  async ({ step }) => {
    // Find failed jobs eligible for retry
    const failedJobs = await step.run('find-failed', async () => {
      return await prisma.publishingQueue.findMany({
        where: { status: 'failed', retryCount: { lt: 3 } }
      });
    });
    
    // Re-queue each for retry
    for (const job of failedJobs) {
      await step.sendEvent(`retry-${job.id}`, {
        name: 'publishing.scheduled',
        data: { contentItemId: job.contentItemId, platforms: [job.platform] }
      });
    }
  }
);
```

3. Update Publishing page to show queue status, retry counts, and error logs

**Test Strategy:**

Unit tests for retry logic with various failure scenarios. Integration tests simulating rate limits and temporary failures. Verify exponential backoff timing is correct. Test audit log accuracy.
