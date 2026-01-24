# Task ID: 7

**Title:** Implement Content Generation Phase 3 - Unified Writer

**Status:** pending

**Dependencies:** 1, 5, 6

**Priority:** medium

**Description:** Create the unified content writer agent that generates multi-format content (blog posts, social captions, product descriptions) from research and context briefs per PRD Feature 3.1.

**Details:**

1. Create `src/inngest/functions/content-writer-agent.ts`:
```typescript
export const contentWriterAgent = inngest.createFunction(
  { id: 'content-writer-agent' },
  { event: 'content.generation.requested' },
  async ({ event, step, publish }) => {
    const { contextBriefId, contentTypes, brandId, sessionId } = event.data;
    
    // Fetch context brief and brand
    const [brief, brand] = await Promise.all([
      step.run('fetch-brief', () => prisma.researchJob.findUnique({...})),
      step.run('fetch-brand', () => prisma.brandConfig.findUnique({...}))
    ]);
    
    // Generate content for each type in parallel
    const contentResults = await Promise.all(
      contentTypes.map(type => 
        step.run(`generate-${type}`, async () => {
          const systemPrompt = buildSystemPrompt(brand, type);
          const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            system: systemPrompt,
            messages: [{ role: 'user', content: buildContentPrompt(brief, type) }]
          });
          return { type, content: response.content[0].text };
        })
      )
    );
    
    // Save drafts to database
    const savedContent = await step.run('save-drafts', async () => {
      return await Promise.all(
        contentResults.map(r => 
          prisma.contentItem.create({
            data: {
              researchJobId: contextBriefId,
              contentType: r.type,
              copy: r.content,
              status: 'draft',
              platform: mapTypeToPlatform(r.type)
            }
          })
        )
      );
    });
    
    // Request approval
    await step.sendEvent('request-approval', {
      name: 'approval.requested',
      data: { itemId: savedContent[0].id, itemType: 'content' }
    });
    
    return { drafts: savedContent };
  }
);
```

2. Create content type definitions in `src/types/content.ts`

3. Create Content Generation page with:
- Content type selection (blog, twitter, linkedin, instagram)
- Preview of generated content
- Edit capability before approval
- Approval/reject buttons

**Test Strategy:**

Unit tests for prompt building functions. Integration tests verifying content is saved to database. Test parallel generation of multiple content types. Verify brand voice is applied correctly.
