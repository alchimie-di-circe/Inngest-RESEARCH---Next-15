# Task ID: 11

**Title:** Create TypeScript Types and Event Definitions

**Status:** pending

**Dependencies:** None

**Priority:** high

**Description:** Consolidate all TypeScript type definitions for research, brand, content, and publishing domains, and define complete Inngest event schemas.

**Details:**

1. Create type definitions in `src/types/`:

`src/types/research.ts`:
```typescript
export interface DeepResearchReport {
  topic: string;
  summary: string;
  findings: Array<{
    title: string;
    content: string;
    sources: string[];
    confidence: number;
  }>;
  citations: Array<{
    id: number;
    source: string;
    url: string;
    title: string;
  }>;
  metadata: {
    depth: number;
    breadth: number;
    sourcesSearched: number;
    completedAt: string;
  };
}

export interface ContextBrief {
  themes: string[];
  opportunities: string[];
  warnings: string[];
  brandAlignment: {
    tovMatch: number;
    keywordCoverage: string[];
    suggestions: string[];
  };
}
```

`src/types/content.ts`:
```typescript
export type ContentType = 'blog_post' | 'social_post' | 'carousel' | 'product_description';
export type Platform = 'blog' | 'twitter' | 'linkedin' | 'instagram' | 'shopify';
export type ContentStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'published';

export interface ContentDraft {
  id: string;
  type: ContentType;
  copy: string;
  designAssets?: {
    canvaUrl?: string;
    images?: string[];
  };
  status: ContentStatus;
  platform: Platform;
}
```

2. Update `src/inngest/client.ts` with complete event schemas:
```typescript
export const inngest = new Inngest({
  id: 'research-publishing-suite',
  schemas: new EventSchemas().fromRecord<{
    'deep.research.requested': { data: DeepResearchRequest };
    'deep.research.completed': { data: DeepResearchCompleted };
    'context.research.requested': { data: ContextResearchRequest };
    'context.research.completed': { data: ContextResearchCompleted };
    'content.generation.requested': { data: ContentGenerationRequest };
    'content.generated': { data: ContentGeneratedEvent };
    'content.design.requested': { data: DesignRequest };
    'approval.requested': { data: ApprovalRequest };
    'approval.response': { data: ApprovalResponse };
    'publishing.scheduled': { data: PublishingScheduled };
    'publishing.completed': { data: PublishingCompleted };
  }>()
});
```

3. Create barrel exports at `src/types/index.ts`

**Test Strategy:**

TypeScript compilation should catch type errors. Create type guard functions and test them with valid/invalid data. Ensure all Inngest event handlers match their schemas.
