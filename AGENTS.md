# Project Architecture - Research & Publishing Suite

## System Diagram (5-Layer)

```
┌──────────────────────────────────────────────────────────────┐
│ LAYER 1: FRONTEND (Next.js 15 + React 19)                   │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐        │
│  │ Deep Tab    │  │ Context Tab │  │ Content Tab  │        │
│  │             │  │             │  │              │        │
│  │ Topic input │  │ Brand setup │  │ Copy review  │        │
│  │ SSE stream  │  │ History     │  │ Design proof │        │
│  │ Report view │  │ TOV guide   │  │ Approve/Edit │        │
│  └─────────────┘  └─────────────┘  └──────────────┘        │
│                                                              │
│                    [Sidebar Navigation]                     │
│                                                              │
│  ┌──────────────┐                                           │
│  │ Publishing   │                                           │
│  │ Queue view   │                                           │
│  │ Schedule     │                                           │
│  │ Analytics    │                                           │
│  └──────────────┘                                           │
└──────────────────────────────────────────────────────────────┘
              ↑ HTTP + SSE (EventSource)
              
┌──────────────────────────────────────────────────────────────┐
│ LAYER 2: API ROUTES (Next.js 15 + TypeScript)               │
│                                                              │
│  /api/inngest/route.ts        → Inngest webhook endpoint    │
│  /api/inngest/serve.ts        → Dev server UI               │
│  /api/deep-research/route.ts  → POST trigger, GET status    │
│  /api/deep-research/sse.ts    → SSE stream (progress)       │
│  /api/context-research/...    → Similar pattern             │
│  /api/content-generation/...  → Similar pattern             │
└──────────────────────────────────────────────────────────────┘
              ↑ Webhooks + Events
              
┌──────────────────────────────────────────────────────────────┐
│ LAYER 3: INNGEST + AGENTKIT (Event Bus + Functions)         │
│                                                              │
│  Deep Research Agent Network:                               │
│  ┌──────────────────────┐                                   │
│  │ Staging Agent        │  (ArXiv, GitHub, Web, Pinecone)  │
│  │ ├─ search-arxiv      │                                   │
│  │ ├─ search-github     │                                   │
│  │ ├─ search-exa        │                                   │
│  │ └─ search-pinecone   │                                   │
│  └──────────────────────┘                                   │
│           ↓ event                                           │
│  ┌──────────────────────┐                                   │
│  │ Reasoning Agent      │  (Claude analysis, TOT)           │
│  │ ├─ analyze-chunks    │                                   │
│  │ ├─ tree-of-thought   │                                   │
│  │ └─ extract-sources   │                                   │
│  └──────────────────────┘                                   │
│           ↓ event                                           │
│  ┌──────────────────────┐                                   │
│  │ Reporting Agent      │  (Format + Citations)             │
│  │ ├─ structure-report  │                                   │
│  │ ├─ format-citations  │                                   │
│  │ └─ save-to-db        │                                   │
│  └──────────────────────┘                                   │
│                                                              │
│  Context Research:                                          │
│  ┌──────────────────────┐                                   │
│  │ Context Gatherer     │  (Brand + Platform Context)       │
│  │ ├─ fetch-brand-config│                                   │
│  │ ├─ query-history     │                                   │
│  │ └─ rank-by-relevance │                                   │
│  └──────────────────────┘                                   │
│                                                              │
│  Content Generation:                                        │
│  ┌──────────────────────┐                                   │
│  │ Unified Writer       │  (Claude text generation)         │
│  │ ├─ generate-blog     │                                   │
│  │ ├─ generate-social   │                                   │
│  │ └─ maintain-tov      │                                   │
│  └──────────────────────┘                                   │
│           ↓ request                                         │
│  ┌──────────────────────┐                                   │
│  │ Canva Designer       │  (MCP Server)                     │
│  │ ├─ create-design     │                                   │
│  │ ├─ add-elements      │                                   │
│  │ └─ publish-design    │                                   │
│  └──────────────────────┘                                   │
│                                                              │
│  Publishing:                                                │
│  ┌──────────────────────┐  ┌──────────────┐                │
│  │ Shopify Publisher    │  │ Social        │                │
│  │ ├─ create-article    │  │ ├─ twitter    │                │
│  │ ├─ create-product    │  │ ├─ linkedin   │                │
│  │ └─ attach-images     │  │ └─ instagram  │                │
│  └──────────────────────┘  └──────────────┘                │
│           ↑ Cron-triggered events                           │
│  ┌──────────────────────┐                                   │
│  │ Queue Manager        │  (Retry, Schedule)                │
│  │ ├─ process-queue     │                                   │
│  │ ├─ exponential-backoff│                                  │
│  │ └─ deadletter-queue  │                                   │
│  └──────────────────────┘                                   │
│                                                              │
│  EVENT BUS (Inngest)                                        │
│  ├─ deep.research.requested                                │
│  ├─ deep.research.staging.completed                        │
│  ├─ deep.research.reasoning.completed                      │
│  ├─ deep.research.completed                                │
│  ├─ context.research.requested                             │
│  ├─ context.research.completed                             │
│  ├─ content.generation.requested                           │
│  ├─ content.generated                                      │
│  ├─ content.approval.requested                             │
│  ├─ publishing.scheduled                                   │
│  ├─ publishing.completed                                   │
│  └─ publishing.failed (+ retry logic)                      │
└──────────────────────────────────────────────────────────────┘
              ↑ Webhooks + Triggers
              
┌──────────────────────────────────────────────────────────────┐
│ LAYER 4: DATA PERSISTENCE (Neon PostgreSQL)                 │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Table: research_jobs                                    ││
│  │ ├─ id, topic, tab_type, parameters                     ││
│  │ ├─ status, report_data (JSONB)                         ││
│  │ ├─ created_at, completed_at, created_by               ││
│  │ └─ INDEX: status, created_at                           ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Table: brand_config                                     ││
│  │ ├─ id, name, tov_guidelines                            ││
│  │ ├─ brand_knowledge, platform_history (JSONB)           ││
│  │ ├─ brand_colors, logo_url                              ││
│  │ └─ created_at, updated_at, created_by                  ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Table: content_items                                    ││
│  │ ├─ id, research_job_id (FK)                            ││
│  │ ├─ content_type, copy, design_assets (JSONB)           ││
│  │ ├─ status (draft/approved/published), platform         ││
│  │ ├─ publish_date, created_at, updated_at                ││
│  │ └─ INDEX: status, research_job_id                      ││
│  │                                                          ││
│  │ [DB Trigger]                                            ││
│  │ WHEN status = 'approved'                                ││
│  │ THEN emit publishing.scheduled event                    ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Table: publishing_queue                                 ││
│  │ ├─ id, content_item_id (FK)                            ││
│  │ ├─ platform, scheduled_at, published_at                ││
│  │ ├─ status, error_log, retry_count                      ││
│  │ └─ INDEX: status, platform                             ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Table: agent_audit_log                                  ││
│  │ ├─ id, agent_name, action, job_id, status              ││
│  │ ├─ metadata (JSONB), created_at                        ││
│  │ └─ INDEX: agent_name, created_at                       ││
│  └─────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
              ↑ TCP PostgreSQL protocol
              
┌──────────────────────────────────────────────────────────────┐
│ LAYER 5: EXTERNAL SERVICES & INTEGRATIONS                   │
│                                                              │
│  Search & Research:                                         │
│  ├─ ArXiv API            (papers)                           │
│  ├─ GitHub Search API    (code, repos)                      │
│  ├─ Exa Search API       (web results)                      │
│  └─ Pinecone             (vector search, semantic)          │
│                                                              │
│  AI & LLM:                                                  │
│  └─ Anthropic Claude 3.5 Sonnet                            │
│     ├─ Reasoning (tree of thought)                         │
│     ├─ Analysis (extract findings)                         │
│     └─ Writing (generate copy, context)                    │
│                                                              │
│  Design & Media:                                            │
│  ├─ Canva MCP            (design generation)               │
│  └─ Image APIs           (upload, serve)                   │
│                                                              │
│  Publishing Platforms:                                      │
│  ├─ Shopify API          (blog posts, products)            │
│  ├─ Twitter API v2       (tweets, media)                   │
│  ├─ LinkedIn API         (posts, carousel docs)            │
│  └─ Instagram GraphAPI   (image posts)                     │
└──────────────────────────────────────────────────────────────┘
```

---

## Data Flow by Phase

### Phase 1: Deep Research
```
User Input Form (Frontend)
  ├─ topic: "AI in 2025"
  ├─ depth: 3
  └─ breadth: 5
       ↓ HTTP POST /api/deep-research
       
Inngest Event Bus
  ├─ deep.research.requested
  │  ├─ data: { topic, depth, breadth, jobId }
  │  ├─ jobId: UUID from DB
  │  └─ Webhook to http://localhost:8288
       ↓ Staging Agent listens
       
[Staging Agent]
  ├─ step.run('search-arxiv', ...)
  ├─ step.run('search-github', ...)
  ├─ step.run('search-exa', ...)
  ├─ step.run('search-pinecone', ...)    # Rerank + top 10
  └─ step.sendEvent('deep.research.staging.completed', ...)
  
[DB Insert Progress]
  ├─ UPDATE research_jobs
  │  ├─ status = 'running'
  │  ├─ stages: { staging: 'in_progress' }
  │  └─ progress: 33%
       ↓ (Optional: DB Trigger + SSE update)
       
[Reasoning Agent]
  ├─ Receives staging results
  ├─ Claude analyzes with depth/breadth tree
  ├─ Extracts key findings + validates sources
  └─ step.sendEvent('deep.research.reasoning.completed', ...)
  
[DB Insert Progress]
  ├─ UPDATE research_jobs
  │  ├─ stages: { reasoning: 'completed' }
  │  └─ progress: 66%
       ↓
[Reporting Agent]
  ├─ Formats markdown report
  ├─ Structures findings with citations (IEEE)
  ├─ Saves report_data (JSONB) to DB
  └─ step.sendEvent('deep.research.completed', ...)
  
[Final State]
  ├─ UPDATE research_jobs
  │  ├─ status = 'completed'
  │  ├─ report_data = { sections, citations, sources }
  │  ├─ completed_at = now()
  │  └─ progress = 100%
       ↓ SSE Event to Frontend
       
Frontend Receives
  ├─ Report with sections
  ├─ Cited sources (links)
  └─ Ready for Phase 2
```

### Phase 2: Context Research
```
User Inputs (Frontend)
  ├─ Selects report from Phase 1
  ├─ Selects/creates brand_config
  │  ├─ TOV guidelines
  │  ├─ Brand knowledge
  │  └─ Logo
  └─ Selects platforms (Twitter, LinkedIn, Shopify)
       ↓ HTTP POST /api/context-research
       
Inngest Event Bus
  ├─ context.research.requested
  │  ├─ data: {
  │  │  researchJobId: UUID,
  │  │  brandConfigId: UUID,
  │  │  platforms: ['twitter', 'linkedin', 'shopify']
  │  │ }
       ↓
[Context Gatherer Agent]
  ├─ step.run('fetch-brand-config', ...)
  ├─ step.run('query-platform-history', ...)
  │  ├─ SELECT from content_items WHERE platform = 'twitter'
  │  ├─ Last 10 posts for tone/style analysis
  ├─ step.run('rank-by-relevance', ...)
  │  ├─ Semantic match research findings vs. brand guidelines
  ├─ step.run('generate-outline', ...)
  │  ├─ Claude creates contextualized brief
  └─ step.sendEvent('context.research.completed', ...)
  
[DB Insert]
  ├─ INSERT INTO research_jobs (tab_type = 'context')
  │  ├─ parent_research_job_id (reference to Phase 1)
  │  └─ context_brief (JSONB with TOV insights)
       ↓
Frontend Receives
  ├─ Context brief (Markdown)
  ├─ Brand alignment score
  └─ Ready for Phase 3
```

### Phase 3: Content Generation
```
User Inputs (Frontend)
  ├─ Research report (Phase 1)
  ├─ Context brief (Phase 2)
  ├─ Content types: ['blog_post', 'twitter', 'linkedin']
  ├─ Additional CTA, CTAtext
  └─ Approval workflow: manual (vs. auto)
       ↓ HTTP POST /api/content-generation
       
Inngest Event Bus
  ├─ content.generation.requested
  │  ├─ data: {
  │  │  researchJobId, brandConfigId, contextJobId,
  │  │  contentTypes, cta, ctaText
  │  │ }
       ↓
[Unified Content Writer Agent]
  ├─ step.run('fetch-data', ...)
  │  ├─ research report, context brief, brand config
  ├─ step.run('generate-copy', ...)
  │  ├─ Claude generates for each content type
  │  │  ├─ blog_post: 1000-2000 words, citations, headers
  │  │  ├─ twitter: Multiple variants (280 chars)
  │  │  └─ linkedin: 300-500 chars, professional tone
  ├─ step.run('maintain-tov', ...)
  │  ├─ Verify brand voice consistency
  │  ├─ Maintain citations + CTA
  └─ step.run('save-drafts', ...)
     ├─ INSERT INTO content_items (status = 'draft')
     │  ├─ copy, design_assets NULL initially
     │  └─ Return contentIds
       ↓
[Canva Designer Agent - MCP]
  ├─ step.run('init-canva-mcp', ...)
  │  ├─ Create MCP client to Canva
  ├─ For each social content:
  │  ├─ step.run('create-design-<type>', ...)
  │  │  ├─ Call Canva MCP: createDesign(title, template, brandKit)
  │  │  ├─ Canva API returns design ID + preview URL
  │  │  └─ Save design_assets JSONB: { canvaDesignId, previewUrl, ... }
  └─ step.run('save-design-assets', ...)
     ├─ UPDATE content_items
     │  ├─ design_assets = { ... }
     │  └─ WHERE id IN (twitter, linkedin designs)
       ↓
[Approval Flow]
  ├─ Frontend fetches drafts (status = 'draft')
  ├─ User reviews copy + designs
  │  ├─ Option A: Approve → status = 'approved'
  │  │  └─ step.sendEvent('content.approval.requested', { contentId, approved: true })
  │  ├─ Option B: Reject with feedback → status = 'rejected'
  │  │  └─ step.sendEvent('content.approval.requested', { approved: false, feedback: '...' })
  │  └─ Option C: Edit (store new version)
  │     └─ UPDATE content_items SET copy = '...', status = 'draft'
       ↓
[Listener: content.approval.requested]
  ├─ If approved:
  │  ├─ UPDATE content_items SET status = 'approved'
  │  └─ TRIGGER: DB trigger emits publishing.scheduled
  └─ If rejected:
     ├─ INSERT agent_audit_log { action: 'rejected', feedback: '...' }
     └─ Frontend shows "Ready to re-edit"
```

### Phase 4: Publishing
```
Trigger: User approves content (Phase 3)
  ├─ UPDATE content_items SET status = 'approved'
  └─ DB Trigger (Neon logical replication) → publishing.scheduled event
  
Inngest Event Bus
  ├─ publishing.scheduled
  │  ├─ data: { contentId, scheduledTime: now() OR future }
       ↓
[Queue Manager (Cron: every 5 min)]
  ├─ step.run('find-pending', ...)
  │  ├─ SELECT FROM publishing_queue WHERE status = 'pending'
  │  │  AND scheduled_at <= now()
  ├─ For each pending item:
  │  ├─ Extract platform + contentId
  │  ├─ Determine handler: shopify | twitter | linkedin | instagram
  └─ step.sendEvent('publish.<platform>.requested', { contentId, ... })
       ↓ Parallel execution (Promise.all)
       
[Shopify Publisher]
  ├─ step.run('fetch-content', ...)
  │  ├─ SELECT FROM content_items WHERE id = contentId
  ├─ If platform = 'blog':
  │  ├─ POST /admin/api/2024-01/blogs/<id>/articles.json
  │  │  ├─ title: content.copy.split('\n')[0]  # First line
  │  │  ├─ body_html: markdown → HTML
  │  │  ├─ image: design_assets.heroImage
  │  │  └─ published_at: scheduled time
  │  └─ Response: { id: shopifyArticleId, ... }
  ├─ If platform = 'product':
  │  ├─ POST /admin/api/2024-01/products.json
  │  │  ├─ title, body_html, images
  │  │  └─ published: true
  └─ step.run('save-shopify-url', ...)
     ├─ UPDATE content_items SET shopify_url = articleUrl
     ├─ INSERT publishing_queue (status = 'published')
     └─ step.sendEvent('publishing.completed', ...)
       ↓
[Social Publishers - Parallel]

  [Twitter Publisher]
  ├─ step.run('publish-twitter', ...)
  │  ├─ POST /2/tweets
  │  │  ├─ text: content.copy (truncated to 280)
  │  │  ├─ media: design_assets.imageUrls
  │  │  └─ reply settings, etc.
  └─ step.sendEvent('publishing.completed', ...)
  
  [LinkedIn Publisher]
  ├─ step.run('publish-linkedin', ...)
  │  ├─ POST /v2/ugcPosts
  │  │  ├─ author: user's LinkedIn person URN
  │  │  ├─ content: { text: copy }
  │  │  ├─ media: design_assets
  │  │  └─ visibility: PUBLIC
  └─ step.sendEvent('publishing.completed', ...)

[Error Handling]
  ├─ Any publisher fails:
  │  ├─ INSERT INTO publishing_queue
  │  │  ├─ status = 'failed'
  │  │  ├─ error_log = error message
  │  │  ├─ retry_count = 0
  │  │  └─ created_at = now()
  │  
  │  └─ Later (cron) → Queue Manager finds failed items
  │     ├─ If retry_count < 3:
  │     │  ├─ Exponential backoff: wait 2^retryCount minutes
  │     │  └─ Re-emit publish event
  │     └─ Else: Move to deadletter queue
       ↓
[Final State]
  ├─ UPDATE content_items
  │  ├─ status = 'published'
  │  ├─ platform_urls = { shopify, twitter, linkedin, ... }
  │  └─ published_at = now()
  ├─ INSERT agent_audit_log
  │  ├─ agent_name: 'publisher'
  │  ├─ action: 'published'
  │  ├─ status: 'success'
  │  └─ metadata: { platforms, urls }
       ↓
Frontend Receives
  ├─ Published content with direct links
  ├─ Publishing timestamp
  └─ Platform-specific analytics (if available)
```

---

## Database Schema (Complete)

```sql
-- research_jobs: One per deep/context/content/publish job
CREATE TABLE research_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic VARCHAR NOT NULL,
  tab_type VARCHAR(20) NOT NULL,         -- 'deep', 'context', 'content', 'publish'
  parent_job_id UUID REFERENCES research_jobs(id),  -- For chaining phases
  parameters JSONB,                       -- { depth: 3, breadth: 5, ... }
  status VARCHAR(20) DEFAULT 'pending',  -- pending, running, completed, failed
  progress INT DEFAULT 0,                 -- 0-100
  stages JSONB,                          -- { staging: '...', reasoning: '...', ... }
  report_data JSONB,                     -- Full structured output
  context_brief JSONB,                   -- For context/content phases
  created_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP,
  created_by VARCHAR NOT NULL,
  updated_at TIMESTAMP DEFAULT now(),
  
  INDEX idx_research_jobs_status (status),
  INDEX idx_research_jobs_created (created_at),
  INDEX idx_research_jobs_tab_type (tab_type),
  INDEX idx_research_jobs_parent (parent_job_id)
);

-- brand_config: Reusable brand guidelines per org/user
CREATE TABLE brand_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id VARCHAR NOT NULL,               -- Multi-tenant: user/org identifier
  name VARCHAR NOT NULL,                 -- Brand name
  tov_guidelines TEXT,                   -- Tone of voice guidelines
  brand_knowledge JSONB,                 -- Brand facts, values, unique selling points
  platform_history JSONB,                -- { twitter: [...posts], linkedin: [...], ... }
  brand_colors JSONB,                    -- { primary: '#...', secondary: '...' }
  logo_url VARCHAR,
  brand_kit_canva_id VARCHAR,            -- Canva brand kit ID for consistency
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_by VARCHAR NOT NULL,
  
  INDEX idx_brand_config_org (org_id),
  INDEX idx_brand_config_created (created_at)
);

-- content_items: One per piece of generated content
CREATE TABLE content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_job_id UUID REFERENCES research_jobs(id) ON DELETE CASCADE,
  brand_config_id UUID REFERENCES brand_config(id),
  content_type VARCHAR(50) NOT NULL,     -- 'blog_post', 'twitter', 'linkedin', 'carousel', 'product'
  copy TEXT NOT NULL,                    -- Generated text content
  design_assets JSONB,                   -- { canvaDesignId, previewUrl, finalImageUrl, ... }
  status VARCHAR(20) DEFAULT 'draft',    -- draft, approved, rejected, published
  platform VARCHAR(50),                  -- 'blog', 'twitter', 'linkedin', 'instagram', 'shopify', 'multi'
  platform_urls JSONB,                   -- { shopify: 'https://...', twitter: 'https://twitter.com/.../...', ... }
  platform_ids JSONB,                    -- { shopifyArticleId: '123', twitterTweetId: '456', ... }
  publish_date TIMESTAMP,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_by VARCHAR,
  
  INDEX idx_content_items_status (status),
  INDEX idx_content_items_research_job (research_job_id),
  INDEX idx_content_items_brand_config (brand_config_id),
  INDEX idx_content_items_content_type (content_type),
  INDEX idx_content_items_platform (platform)
);

-- publishing_queue: Queue for retry + scheduling logic
CREATE TABLE publishing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
  platform VARCHAR NOT NULL,
  scheduled_at TIMESTAMP DEFAULT now(),
  published_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending',  -- pending, published, failed
  error_log TEXT,
  retry_count INT DEFAULT 0,
  last_retry_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  INDEX idx_publishing_queue_status (status),
  INDEX idx_publishing_queue_platform (platform),
  INDEX idx_publishing_queue_scheduled_at (scheduled_at),
  INDEX idx_publishing_queue_content_item (content_item_id)
);

-- agent_audit_log: Compliance + debugging
CREATE TABLE agent_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES research_jobs(id) ON DELETE SET NULL,
  agent_name VARCHAR NOT NULL,           -- 'staging-agent', 'reasoning-agent', 'publisher', ...
  action VARCHAR NOT NULL,               -- 'search', 'analyze', 'publish', 'reject', ...
  status VARCHAR NOT NULL,               -- 'success', 'failure', 'pending'
  metadata JSONB,                        -- { sources: [...], citations: [...], error: '...', ... }
  created_at TIMESTAMP DEFAULT now(),
  created_by VARCHAR,
  
  INDEX idx_agent_audit_log_agent (agent_name),
  INDEX idx_agent_audit_log_created (created_at),
  INDEX idx_agent_audit_log_job_id (job_id),
  INDEX idx_agent_audit_log_status (status)
);

-- DB Trigger: Auto-emit publishing.scheduled on content approval
CREATE OR REPLACE FUNCTION trigger_content_approved()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Inngest will listen to this via logical replication
    -- Event: content_items.status_changed
    -- Data: { content_item_id: NEW.id, status: 'approved', ... }
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_status_change
AFTER UPDATE ON content_items
FOR EACH ROW
EXECUTE FUNCTION trigger_content_approved();
```

---

## Event Schema (TypeScript)

```typescript
// src/inngest/events.ts
export interface ResearchEvents {
  // Deep Research Pipeline
  'deep.research.requested': {
    data: {
      jobId: string;
      topic: string;
      parameters: {
        depth: number;      // 1-5
        breadth: number;    // 1-5
        stages?: number;
      };
    };
  };
  
  'deep.research.staging.completed': {
    data: {
      jobId: string;
      chunks: {
        arxiv: any[];
        github: any[];
        web: any[];
        pinecone: any[];
      };
    };
  };
  
  'deep.research.reasoning.completed': {
    data: {
      jobId: string;
      analysis: {
        findings: string[];
        sources: Array<{ title: string; url: string; relevance: number }>;
        treeOfThought?: any;
      };
    };
  };
  
  'deep.research.completed': {
    data: {
      jobId: string;
      report: {
        sections: Array<{ title: string; content: string }>;
        citations: Array<{ author: string; title: string; year: number; url: string }>;
        summary: string;
      };
    };
  };
  
  // Context Research
  'context.research.requested': {
    data: {
      jobId: string;
      researchJobId: string;
      brandConfigId: string;
      platforms: string[];
    };
  };
  
  'context.research.completed': {
    data: {
      jobId: string;
      contextBrief: {
        tov_insights: string;
        platform_specific_tips: Record<string, string>;
        brand_alignment_score: number;
      };
    };
  };
  
  // Content Generation
  'content.generation.requested': {
    data: {
      jobId: string;
      researchJobId: string;
      contextJobId: string;
      brandConfigId: string;
      contentTypes: ('blog_post' | 'twitter' | 'linkedin' | 'carousel' | 'product')[];
      cta?: string;
      ctaText?: string;
    };
  };
  
  'content.generated': {
    data: {
      jobId: string;
      contentIds: string[];
      designs: Record<string, { canvaDesignId: string; previewUrl: string }>;
    };
  };
  
  'content.approval.requested': {
    data: {
      contentId: string;
      approved: boolean;
      feedback?: string;
    };
  };
  
  // Publishing
  'publishing.scheduled': {
    data: {
      contentId: string;
      platform: string;
      scheduledTime?: string;  // ISO date, default: now()
    };
  };
  
  'publishing.completed': {
    data: {
      contentId: string;
      platform: string;
      platformUrl: string;
      platformId: string;
      publishedAt: string;
    };
  };
  
  'publishing.failed': {
    data: {
      contentId: string;
      platform: string;
      error: string;
      retryCount: number;
    };
  };
}

export type EventName = keyof ResearchEvents;
```

---

## AgentKit Integration Points

| Agent | Tools | Input | Output |
|-------|-------|-------|--------|
| **Staging** | `searchArxiv`, `searchGithub`, `searchExa`, `searchPinecone` | topic, depth, breadth | chunks array |
| **Reasoning** | `analyzeText`, `extractCitations`, `treeOfThought` | chunks, depth, breadth | findings, sources |
| **Reporting** | `formatMarkdown`, `citationFormatter`, `saveToDb` | findings, sources | report JSON |
| **Context Gatherer** | `fetchBrandConfig`, `queryPlatformHistory`, `rankBySemantic` | research report, brand ID, platforms | context brief |
| **Unified Writer** | `generateText` (Claude), `validateTOV`, `formatCopy` | research, context, content types | content items |
| **Canva Designer** | `createDesign`, `addElements`, `publishDesign` (MCP) | content, brand kit, template | design URLs |
| **Shopify Publisher** | `createArticle`, `createProduct`, `uploadImage` | content, images | article/product URL |
| **Social Publishers** | `postTwitter`, `postLinkedin`, `postInstagram` | content, images, hashtags | post URL, ID |
| **Queue Manager** | `findPending`, `checkSchedule`, `retryWithBackoff` | cron trigger | publish events |

---

## Performance & Constraints

| Operation | Typical Duration | Max Timeout | Notes |
|-----------|------------------|------------|-------|
| **Deep Research** | 2-5 min | 10 min | Depends on sources (ArXiv, GitHub, etc.) |
| **Reasoning** | 30-60 sec | 3 min | Claude analysis + tree of thought |
| **Reporting** | 10-20 sec | 1 min | Formatting + DB save |
| **Context Gathering** | 30-60 sec | 2 min | Platform history queries |
| **Content Generation** | 1-3 min | 5 min | Claude generation for all types |
| **Design Creation** | 30-60 sec | 2 min | Canva API calls |
| **Approval** | Manual (0-24h) | N/A | Waiting for user |
| **Single Platform Publish** | 5-10 sec | 30 sec | API call to platform |
| **Multi-Platform Publish** | Parallel, ~10 sec | 30 sec | Promise.all |

---

## Deployment Options

### Option A: Vercel + Cloud Run (Recommended for MVP)
```
Frontend: Vercel (next.js, auto-deploy from git)
Backend: Google Cloud Run (containerized)
Database: Neon Postgres (serverless)
```

### Option B: Monorepo on Railway/Render
```
Single container with Node.js + Next.js + Inngest
Auto-deploys from git
```

### Option C: Kubernetes (Production)
```
- Frontend: Vercel or K8s Deployment
- Backend: K8s Deployment (scaled replicas)
- Database: Managed Postgres (Cloud SQL, RDS)
- Message Queue: Inngest Cloud (not self-hosted)
```

---

## Security Best Practices

1. **Environment Variables**: Store in Vercel/Cloud Run secrets, not in `.env` in repo
2. **Database**: Use connection pooling (Neon has built-in)
3. **API Keys**: Rotate quarterly, monitor usage
4. **Rate Limiting**: Inngest built-in; also add on API routes
5. **CORS**: Restrict to known frontend domains
6. **Audit Logging**: All agent actions logged to `agent_audit_log`
7. **Error Handling**: Never expose raw API keys in error messages

---

## Monitoring & Observability

**Inngest Dev UI** (http://localhost:8288):
- View all function executions
- See event payloads
- Step results + errors
- Replay failed runs

**Neon Dashboard**:
- DB query logs
- Connection pool status
- Backups

**Custom Metrics** (to add):
- Pipeline completion time
- Content approval rate
- Publishing success rate
- Agent failure rate

---

## Next Steps for Implementation

1. **Phase 1-2**: Set up DB schema + Inngest functions (Deep + Context)
2. **Phase 3**: Content generation + Canva MCP integration
3. **Phase 4**: Publishing agents + queue manager
4. **Phase 5**: Frontend UI + real-time updates (SSE)
5. **Phase 6**: E2E testing + DevContainer validation
6. **Phase 7**: Production deployment + monitoring

---

**Ready to build!** 🚀
