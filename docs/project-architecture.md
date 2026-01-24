# Project Architecture - Research & Publishing Suite

## System Overview

```
┌────────────────────────────────────────────────────────────┐
│        Research & Publishing Suite (Next.js 15)            │
│         Unified AI-powered Content Pipeline                │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │         FRONTEND (React + Next.js)               │    │
│  │  • Sidebar Navigation (4 tabs)                   │    │
│  │  • Deep Research Tab                             │    │
│  │  • Context Research Tab                          │    │
│  │  • Content Generation Tab                        │    │
│  │  • Publishing & Monitoring Tab                   │    │
│  └──────────────────────────────────────────────────┘    │
│              ↓                                             │
│  ┌──────────────────────────────────────────────────┐    │
│  │    BACKEND ORCHESTRATION (Inngest + AgentKit)    │    │
│  │  • Event Bus + Workflows                         │    │
│  │  • Durable Function Execution                    │    │
│  │  • Multi-agent Coordination                      │    │
│  │  • Step-wise Processing with Retry              │    │
│  │  • Realtime Streaming via SSE                    │    │
│  └──────────────────────────────────────────────────┘    │
│              ↓                                             │
│  ┌──────────────────────────────────────────────────┐    │
│  │   DATABASE LAYER (Neon PostgreSQL + Events)      │    │
│  │  • research_jobs (Deep Research phase 1)         │    │
│  │  • brand_config (TOV, guidelines, assets)        │    │
│  │  • content_items (Generated copy & designs)      │    │
│  │  • publishing_queue (Scheduling & tracking)      │    │
│  │  • agent_audit_log (Agent activities)            │    │
│  │  • Logical replication triggers to Inngest       │    │
│  └──────────────────────────────────────────────────┘    │
│              ↓                                             │
│  ┌──────────────────────────────────────────────────┐    │
│  │     EXTERNAL INTEGRATIONS (APIs + MCP)           │    │
│  │  ┌──────────┬──────────┬──────────┬────────────┐ │    │
│  │  │ Research │ Content  │Publishing│  Design    │ │    │
│  │  ├──────────┼──────────┼──────────┼────────────┤ │    │
│  │  │ ArXiv    │ Canva    │ Shopify  │ Canva MCP  │ │    │
│  │  │ GitHub   │ (MCP)    │ Twitter  │ server     │ │    │
│  │  │ Exa Web  │          │ LinkedIn │            │ │    │
│  │  │ Pinecone │          │          │            │ │    │
│  │  └──────────┴──────────┴──────────┴────────────┘ │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Data Flow Architecture

### Phase 1: Deep Research (Parallel Agent Execution)

```
User Input (Topic + Parameters)
         ↓
   [Inngest Event: deep.research.requested]
         ↓
   ┌─────────────────────────────────┐
   │   STAGING AGENT (AgentKit)      │
   │  • Query expansion               │
   │  • Source gathering (ArXiv,      │
   │    GitHub, Exa Web, Pinecone)    │
   └─────────────────────────────────┘
         ↓
      save: raw_chunks to research_jobs
         ↓
   ┌─────────────────────────────────┐
   │  REASONING AGENT (AgentKit)     │
   │  • Synthesis                     │
   │  • Analysis                      │
   │  • Reasoning tree construction   │
   │  • Source validation             │
   └─────────────────────────────────┘
         ↓
      save: intermediate_analysis to DB
         ↓
   ┌─────────────────────────────────┐
   │  REPORTING AGENT (AgentKit)     │
   │  • Structure report              │
   │  • Format citations (IEEE style) │
   │  • Create Q&A                    │
   │  • Generate summary              │
   └─────────────────────────────────┘
         ↓
   [Inngest Event: deep.research.completed]
         ↓
   Save: report_data (JSON) to research_jobs
   Status: 'completed'
```

**Realtime Updates**: Each step emits SSE events → frontend streams progress

---

### Phase 2: Context Research (Multi-source Brand Contextualization)

```
Input: report from Phase 1 + topic
         ↓
   [Inngest Event: context.research.requested]
         ↓
   ┌─────────────────────────────────┐
   │  CONTEXT GATHERER               │
   │  • Fetch brand_config record    │
   │  • Retrieve TOV guidelines      │
   │  • Load brand knowledge JSON    │
   │  • Get platform history (past   │
   │    posts, CTAs, performance)    │
   │  • Extract brand colors/logos   │
   └─────────────────────────────────┘
         ↓
   ┌─────────────────────────────────┐
   │  CONTENT PLANNER                │
   │  • Analyze report facts         │
   │  • Map to brand voice           │
   │  • Plan blog outline structure  │
   │  • Design social post variants: │
   │    - Twitter hooks              │
   │    - LinkedIn professional      │
   │    - Instagram captions         │
   │  • Define CTAs per platform     │
   └─────────────────────────────────┘
         ↓
   [Inngest Event: content.generation.requested]
         ↓
```

**Context Gathering**: 1 SQL call to brand_config, 1 call to platform_history

---

### Phase 3: Content Generation (Text + Design)

```
Input: report + context + brand config
         ↓
   ┌──────────────────────────────────┐
   │  UNIFIED CONTENT WRITER          │
   │  (with Canva MCP Integration)    │
   │  • Generate blog post (2000-3000 │
   │    words, SEO-optimized)         │
   │  • Generate social captions      │
   │    (Twitter 280, LinkedIn 3000,  │
   │    Instagram, TikTok hooks)      │
   │  • Highlight key facts + CTAs    │
   └──────────────────────────────────┘
         ↓
   ┌──────────────────────────────────┐
   │  CANVA MCP CLIENT (Parallel)     │
   │  • Create design template for    │
   │    blog hero image               │
   │  • Create social post templates: │
   │    - Twitter header image        │
   │    - LinkedIn cover image        │
   │    - Instagram carousel (5-10)   │
   │  • Apply brand colors/logos      │
   │  • Export as image URLs          │
   └──────────────────────────────────┘
         ↓
   Save content_items:
   {
     research_job_id: UUID,
     content_type: "blog_post|twitter|linkedin|instagram",
     copy: "...",
     design_assets: { image_url, canva_design_id },
     status: "draft",
     platform: "blog|social"
   }
         ↓
   [Inngest Event: content.approval.requested]
         ↓
```

**Parallel Execution**: Content writer + Canva MCP client run simultaneously

---

### Phase 4: Publishing (Multi-channel Fan-out)

```
Input: approved content_items
         ↓
   [Inngest Event: publishing.scheduled]
         ↓
   ┌──────────────────┬──────────────┬──────────────┐
   │                  │              │              │
   ↓                  ↓              ↓              ↓
[SHOPIFY PUBLISHER] [TWITTER]    [LINKEDIN]    [INSTAGRAM]
   │                  │              │              │
   ├─> POST /blogs    ├─> POST /2/   ├─> POST      ├─> QUEUE
   │   /articles      │   tweets     │   /ugcPosts │   (if separate
   │   Content Type:  │   Text: 280  │   Text:     │    connector)
   │   {title, body,  │   Image: OG  │   3000 char │
   │   image}         │              │   Image     │
   │                  │              │             │
   ├─> Save to DB     ├─> Save       ├─> Save      └─> Save
   │   publishing_    │   post_id    │   post_id      post_id
   │   queue (status: │              │
   │   'published')   │              │
   │                  │              │
   └──────────────────┴──────────────┴──────────────┘
         ↓
   Monitoring:
   • publishing_queue tracks all posts
   • Retry logic: exponential backoff
   • Error logging per platform
   • Historical tracking (posted at, engagement)
```

**Fan-out Strategy**: 
- For each content_item, trigger platform-specific publisher
- Parallel execution (Shopify + Social at same time)
- Retry on failure (429, 5xx → exponential backoff)

---

## Database Schema (Neon PostgreSQL)

### research_jobs
```sql
CREATE TABLE research_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic VARCHAR NOT NULL,
  parameters JSONB,  -- { depth: 3, breadth: 5, sources: [...] }
  status VARCHAR(20),  -- pending, staging, reasoning, reporting, completed
  raw_chunks JSONB,  -- From staging agent
  analysis JSONB,    -- From reasoning agent
  report_data JSONB, -- From reporting agent (final)
  created_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP,
  created_by VARCHAR,
  INDEX idx_status (status),
  INDEX idx_created (created_at)
);
```

### brand_config
```sql
CREATE TABLE brand_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  tov_guidelines TEXT,  -- Brand voice guidelines
  brand_knowledge JSONB, -- Brand facts, history, values
  platform_history JSONB, -- { twitter: [past posts], linkedin: [...] }
  brand_colors JSONB,     -- { primary, secondary, accent }
  logo_url VARCHAR,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_by VARCHAR
);
```

### content_items
```sql
CREATE TABLE content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_job_id UUID REFERENCES research_jobs(id),
  content_type VARCHAR(50), -- blog_post, twitter, linkedin, instagram
  copy TEXT,
  design_assets JSONB, -- { image_url, canva_design_id, ... }
  status VARCHAR(20),  -- draft, approved, published
  platform VARCHAR(50), -- blog, social, multi
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  INDEX idx_status (status),
  INDEX idx_job (research_job_id)
);
```

### publishing_queue
```sql
CREATE TABLE publishing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id UUID REFERENCES content_items(id),
  platform VARCHAR(50), -- shopify, twitter, linkedin, instagram
  platform_post_id VARCHAR, -- returned post ID from API
  scheduled_at TIMESTAMP,
  published_at TIMESTAMP,
  status VARCHAR(20), -- pending, published, failed
  error_log TEXT,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  INDEX idx_platform (platform),
  INDEX idx_status (status)
);
```

### agent_audit_log
```sql
CREATE TABLE agent_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name VARCHAR, -- staging, reasoning, reporting, content-writer, publisher
  action VARCHAR,     -- started, completed, failed, retry
  job_id UUID,
  event_type VARCHAR, -- deep.research.requested, context.research.requested, ...
  status VARCHAR,     -- success, error
  metadata JSONB,     -- error details, timing, tokens used
  created_at TIMESTAMP DEFAULT now(),
  INDEX idx_agent (agent_name),
  INDEX idx_created (created_at)
);
```

---

## Inngest Events Model

```typescript
interface Events {
  // Deep Research Phase
  'deep.research.requested': {
    data: {
      topic: string;
      parameters: { depth: number; breadth: number };
    }
  };
  'deep.research.staging.started': { data: { jobId: string } };
  'deep.research.staging.completed': { data: { jobId: string; chunks: any[] } };
  'deep.research.reasoning.completed': { data: { jobId: string; analysis: any } };
  'deep.research.completed': { data: { jobId: string; report: any } };

  // Context Research Phase
  'context.research.requested': { data: { jobId: string; sources: string[] } };
  'context.research.completed': { data: { jobId: string; context: any } };

  // Content Generation Phase
  'content.generation.requested': { data: { jobId: string; contentTypes: string[] } };
  'canva.design.requested': { data: { contentId: string; format: string } };
  'content.generated': { data: { contentIds: string[] } };

  // Publishing Phase
  'content.approval.requested': { data: { contentId: string; status: string } };
  'publishing.scheduled': { data: { contentId: string; platform: string } };
  'publishing.completed': { data: { contentId: string; platform: string } };
  'publishing.failed': { data: { contentId: string; platform: string; error: string } };
}
```

---

## AgentKit Integration Points

### 1. Staging Agent (from agent-kit/deep-research)
- **Tools available**: 
  - Web search (Exa API)
  - ArXiv search
  - GitHub search
  - Pinecone vector search
- **Input**: topic, depth, breadth parameters
- **Output**: structured chunks with sources

### 2. Reasoning Agent (from agent-kit/deep-research)
- **Tools available**: 
  - Internal analysis (no external tools, uses LLM reasoning)
  - Citation tracking
  - Fact validation
- **Input**: chunks from staging
- **Output**: analysis with reasoning tree

### 3. Reporting Agent (from agent-kit/deep-research)
- **Tools available**:
  - Report formatting
  - Citation generation (IEEE)
  - Summary generation
- **Input**: analysis from reasoning
- **Output**: final report JSON

### 4. Content Writer (Custom)
- **Tools available**:
  - Anthropic Claude 3.5 (via AI SDK)
  - Canva MCP client (custom)
- **Input**: report, brand config, topic
- **Output**: blog post + social variants (text only)

### 5. Design Generator (Custom)
- **Tools available**:
  - Canva MCP server (create_design, add_elements, publish_design)
  - Image URL generation
- **Input**: content copy, brand colors/logos, platform specs
- **Output**: design URLs + Canva design IDs

### 6. Publisher (Custom)
- **Tools available**:
  - Shopify API (POST /blogs/articles)
  - Twitter API v2 (POST /2/tweets)
  - LinkedIn API (POST /ugcPosts)
  - Error handling + retry logic
- **Input**: approved content + platform
- **Output**: post IDs + tracking records

---

## Realtime Streaming Architecture

### Frontend → Backend (User Requests)
```
HTTP POST /api/deep-research
  ↓
next-inngest-api-handler
  ↓
inngest.send(event)  // Added to Inngest event bus
  ↓
Response: 200 OK + jobId
```

### Backend → Frontend (SSE Streaming)
```
Inngest function step → await step.run(...)
         ↓
At end of each major step, emit event:
  await step.sendEvent('deep.research.*.completed', {...})
         ↓
Listener on /api/sse endpoint
  ↓
SendEvent (Server-Sent Events) to client:
  event: step-completed
  data: { phase: 'staging', progress: '33%', chunks: [...] }
  ↓
Client React component receives and updates UI
```

### Event Payload Example
```json
{
  "type": "deep.research.staging.completed",
  "jobId": "uuid-here",
  "phase": "staging",
  "progress": 33,
  "message": "Found 42 ArXiv papers, 12 GitHub repos",
  "chunks": [
    { "source": "arxiv", "title": "...", "url": "..." }
  ],
  "timestamp": "2025-01-16T12:00:00Z"
}
```

---

## Directory Structure

```
research-suite/
├── .devcontainer/
│   ├── devcontainer.json
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── init-db.sql
│
├── .claude/
│   ├── CLAUDE.md (this file, updated)
│   └── knowledge/
│       ├── pinecone-basics.md
│       ├── inngest-patterns.md
│       └── project-architecture.md (this file)
│
├── src/
│   ├── inngest/
│   │   ├── client.ts
│   │   ├── events.ts
│   │   └── functions/
│   │       ├── deep-research/
│   │       │   ├── staging.ts
│   │       │   ├── reasoning.ts
│   │       │   └── reporting.ts
│   │       ├── context-research/
│   │       │   ├── gatherer.ts
│   │       │   └── planner.ts
│   │       ├── content-generation/
│   │       │   ├── writer.ts
│   │       │   └── designer.ts
│   │       └── publishing/
│   │           ├── shopify.ts
│   │           ├── social.ts
│   │           └── queue.ts
│   │
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx (with Sidebar)
│   │   │   ├── research/
│   │   │   │   ├── deep/page.tsx
│   │   │   │   └── context/page.tsx
│   │   │   ├── content/page.tsx
│   │   │   └── publishing/page.tsx
│   │   │
│   │   └── api/
│   │       ├── deep-research/route.ts
│   │       ├── context-research/route.ts
│   │       ├── content/route.ts
│   │       ├── publishing/route.ts
│   │       ├── inngest/route.ts
│   │       └── sse/route.ts
│   │
│   ├── components/
│   │   ├── sidebar.tsx
│   │   ├── research-tabs/
│   │   │   ├── deep-research.tsx
│   │   │   └── context-research.tsx
│   │   ├── content/
│   │   │   ├── editor.tsx
│   │   │   └── preview.tsx
│   │   └── shared/
│   │       ├── progress-stream.tsx
│   │       └── job-list.tsx
│   │
│   └── lib/
│       ├── db.ts (Neon SQL helpers)
│       ├── inngest-client.ts
│       ├── api-clients/
│       │   ├── arxiv.ts
│       │   ├── github.ts
│       │   ├── exa.ts
│       │   ├── shopify.ts
│       │   └── social.ts
│       └── types.ts
│
├── package.json (with dev scripts)
├── .env.example
└── README.md
```

---

## Deployment Strategy (Dec 2025)

### Option A: Vercel Frontend + Cloud Run Backend (Recommended)

**Frontend (Vercel)**
- Next.js app deploys automatically on push
- SSE streaming works natively
- Streaming responses supported

**Backend (Google Cloud Run)**
- Inngest functions + AgentKit
- Containerized via `.devcontainer/Dockerfile`
- Stateless (no local state)
- Auto-scales with workload

**Database (Neon)**
- Separate PostgreSQL instance
- Logical replication triggers to Inngest
- Branching for dev/staging/prod

### Option B: Single Container (K8s/ECS)

Deploy entire stack (Next.js + Inngest) as single container to K8s or ECS.

---

## Performance Considerations

| Operation | Timeout | Notes |
|-----------|---------|-------|
| Staging Agent | 60s | Multiple API calls, web scraping |
| Reasoning Agent | 120s | Token-heavy LLM call |
| Reporting Agent | 30s | Report formatting + citation gen |
| Content Writer | 45s | Blog post + social variants |
| Canva Design | 30s | MCP server round-trip |
| Shopify Publish | 10s | Single API call |
| Social Publish | 15s | May include image upload |
| DB Query | 1s | Index on status, created_at |
| SSE Stream | N/A | Realtime, stays open until job complete |

---

## Error Handling & Retry Logic

**Inngest Built-in**:
- Automatic retry on transient errors (5xx, timeout)
- Exponential backoff (1s, 2s, 4s, 8s, 16s, ...)
- Max retries: 3 (configurable per function)

**Custom Retry** (Publishing Queue):
- Polling job every 5 minutes for failed items
- Manual retry via UI
- Logged in agent_audit_log

**Fallback Patterns**:
- If Pinecone unavailable → use in-memory search
- If Canva MCP timeout → generate text-only content
- If social API rate-limited → queue for later
- If Shopify offline → hold in publishing_queue

---

## Security & Best Practices

1. **API Keys**: All in `.env.local`, never committed
2. **Database Access**: Row-level security via Neon policies (optional)
3. **Inngest Signing**: All events signed via INNGEST_SIGNING_KEY
4. **CORS**: API routes secured via next.js built-in
5. **Rate Limiting**: Per-API rate limits + Inngest throttling
6. **Audit Trail**: All agent actions logged to agent_audit_log

---

## Monitoring & Observability

- **Inngest Dashboard**: http://localhost:8288 (dev) or via Inngest.com (prod)
- **Database Metrics**: Neon console (query performance, storage)
- **Logs**: CloudRun logs (backend) + Vercel logs (frontend)
- **Audit Log**: Query `agent_audit_log` for agent activity
- **Publishing Queue**: Dashboard widget shows pending/failed posts

---

## Testing Strategy

| Level | Tool | Coverage |
|-------|------|----------|
| Unit | Jest | Agent functions (in isolation) |
| Integration | testClient (Inngest) | Event flows, step execution |
| E2E | Playwright | Full UI workflow (deep → content → publish) |
| Load | k6 | Concurrent research jobs |

---

## Next Steps

1. **Merge repos**: Subtree in agent-kit/deep-research into src/inngest/functions/deep-research
2. **Create sidebar**: Link 4 tabs to routes
3. **Unify event model**: Define all events in src/inngest/events.ts
4. **Setup database**: Deploy Neon, run init-db.sql, test Inngest triggers
5. **Implement Phase 1**: Deep research end-to-end
6. **Implement Phase 2-4**: Content generation, publishing
7. **Deploy**: Vercel + Cloud Run (or single container)
