# CLAUDE.md - Research & Publishing Suite
**Context Engineering with Inngest x AgentKit Deep Research**

Last updated: January 16, 2025 | Stack: Next.js 15, TypeScript, Inngest, Neon PostgreSQL, AgentKit

---

## 🎯 Project Overview

**Research & Publishing Suite** unifies two powerful approaches:
- **Deep Research** (AgentKit): Multi-agent staging → reasoning → reporting pipeline
- **Context Research** (Next-15): Multi-source parallel gathering + brand contextualization
- **Content Generation**: Unified text + design creation with Canva MCP
- **Publishing**: Automated distribution to Shopify, Twitter, LinkedIn, blogs

### The Vision (4 Tabs, 1 Flow)
```
Deep Research Tab
┌─────────────────────────┐
│ Topic + Parameters      │ → Staging (ArXiv, GitHub, Web, Pinecone)
│ depth, breadth          │ → Reasoning (Claude analysis)
│ Verify sources          │ → Reporting (structured, with citations)
└─────────────────────────┘

Context Research Tab
┌─────────────────────────┐
│ Research Report (↑)     │ → Multi-source gathering
│ + Brand Guidelines      │ → Semantic ranking
│ + Platform History      │ → Live updates (SSE)
└─────────────────────────┘

Content Generation Tab
┌─────────────────────────┐
│ Research + Context (↑)  │ → Unified writer (Claude)
│ + TOV, CTA              │ → Canva designs (MCP)
│ → Blog/Social variants  │
└─────────────────────────┘

Publishing Tab
┌─────────────────────────┐
│ Approved Content (↑)    │ → Queue manager
│ → Multi-platform        │ → Retry logic (exponential backoff)
│ → Shopify + Social      │ → Audit logging
└─────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 15, React 19, TailwindCSS | App router, server components, fast refresh |
| **Backend** | Inngest + AgentKit | Event-driven, durable execution, multi-agent orchestration |
| **Database** | Neon PostgreSQL | Serverless, branching, native Inngest triggers |
| **Vector Store** | Pinecone | Semantic search, reranking, namespaces for isolation |
| **Realtime** | Inngest SDKs, SSE | Live progress updates to frontend |
| **LLM** | Anthropic Claude 3.5 Sonnet | Reasoning, writing, analysis |
| **Design** | Canva MCP + MCP SDK | Brand-aware design generation |
| **Publishing** | Shopify API, Twitter API, LinkedIn API | Platform distribution |
| **DevOps** | GitHub Codespaces, Docker, docker-compose | Portability, consistency |

---

## 📊 Key Architecture Decisions

### Single DevContainer (Recommended)
✅ All dependencies in one container (Node.js 20, Inngest CLI, PostgreSQL client)
✅ Perfect for GitHub Codespaces
✅ Backend runs via `npm run inngestdev` local process

### Database: Neon + Inngest Triggers
✅ No polling needed
✅ DB changes auto-trigger Inngest workflows
✅ `content_items` status → `publishing.scheduled` event

### Event Model: Inngest
✅ Deep Research → `deep.research.completed`
✅ Context Research → `context.research.completed`
✅ Content Gen → `content.generation.requested`
✅ Publishing → `publishing.scheduled` → `publishing.completed`

---

## 🚀 Quick Start

### Prerequisites
- GitHub account (for Codespaces or local)
- Neon PostgreSQL account (free tier)
- Inngest account + event key
- Anthropic API key
- Pinecone API key (optional, for vector search)

### Local Development (GitHub Codespaces Recommended)

**1. Create Codespace**
```bash
# From GitHub: 
# 1. Click "Code" → "Codespaces" → "Create codespace on main"
# Wait 2-3 min for setup
```

**2. Environment Setup**
```bash
# Copy example
cp .env.example .env.local

# Fill in required keys:
# - NEON_DATABASE_URL
# - INNGEST_EVENT_KEY
# - INNGEST_SIGNING_KEY
# - ANTHROPIC_API_KEY
# - PINECONE_API_KEY (optional)
# - SHOPIFY_STORE_URL, TWITTER_BEARER_TOKEN, etc.
```

**3. Install & Initialize**
```bash
npm install
npm run setupdb      # Initialize Neon schema
```

**4. Run (3 terminals)**
```bash
# Terminal 1: Next.js frontend on port 3000
npm run dev

# Terminal 2: Inngest dev server on port 8288
npm run inngestdev

# Terminal 3: Monitor (optional)
npm run watch:db     # Watch Neon changes
```

**5. Access App**
- Frontend: http://localhost:3000
- Inngest Dev UI: http://localhost:8288
- API: http://localhost:3000/api/...

---

## 📁 Project Structure

```
research-publishing-suite/
├── .devcontainer/
│   ├── devcontainer.json          # GitHub Codespaces config
│   ├── Dockerfile                 # Single container with Node, Inngest CLI, psql
│   └── docker-compose.yml         # Reference: multi-container for prod
├── .claude/
│   ├── CLAUDE.md                  # This file (context for Claude Code)
│   └── knowledge/
│       ├── project-architecture.md
│       ├── inngest-patterns.md
│       ├── pinecone-basics.md
│       └── api-integrations.md
├── .env.example                   # Copy to .env.local
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout + sidebar nav
│   │   ├── globals.css            # Tailwind + design system
│   │   ├── api/
│   │   │   ├── inngest/
│   │   │   │   ├── route.ts       # Inngest webhook endpoint
│   │   │   │   └── serve.ts       # Serve dev server UI
│   │   │   └── [agent]/
│   │   │       ├── deep-research/
│   │   │       │   ├── route.ts   # Trigger deep research
│   │   │       │   └── sse.ts     # SSE streaming
│   │   │       ├── context-research/
│   │   │       │   ├── route.ts   # Trigger context gathering
│   │   │       │   └── sse.ts
│   │   │       └── content-generation/
│   │   │           └── route.ts   # Trigger content writer
│   │   └── research/
│   │       ├── layout.tsx
│   │       ├── deep/page.tsx      # Deep Research UI tab
│   │       ├── context/page.tsx   # Context Research UI tab
│   │       ├── content/page.tsx   # Content Generation UI tab
│   │       └── publishing/page.tsx # Publishing UI tab
│   ├── inngest/
│   │   ├── client.ts              # Inngest SDK client (singleton)
│   │   ├── events.ts              # TypeScript event schema
│   │   └── functions/
│   │       ├── deep-research/
│   │       │   ├── staging-agent.ts      # ArXiv, GitHub, Web, Pinecone search
│   │       │   ├── reasoning-agent.ts    # Claude analysis, tree of thought
│   │       │   └── reporting-agent.ts    # Structure report + citations
│   │       ├── context-research/
│   │       │   └── context-gatherer.ts   # TOV, brand, history, guidelines
│   │       ├── content-generation/
│   │       │   ├── unified-writer.ts     # Claude text generation
│   │       │   ├── canva-designer.ts     # MCP Canva client
│   │       │   └── approval-flow.ts      # Draft → Approval → Ready
│   │       └── publishing/
│   │           ├── shopify-publisher.ts
│   │           ├── social-publisher.ts   # Twitter, LinkedIn, Instagram
│   │           └── queue-manager.ts      # Retry, schedule, deadletter
│   ├── components/
│   │   ├── sidebar.tsx            # Navigation, tab switcher
│   │   ├── research-tabs/
│   │   │   ├── deep-tab.tsx
│   │   │   ├── context-tab.tsx
│   │   │   ├── content-tab.tsx
│   │   │   └── publishing-tab.tsx
│   │   ├── progress-tracker.tsx    # Real-time Inngest status
│   │   ├── result-display.tsx
│   │   └── error-boundary.tsx
│   ├── lib/
│   │   ├── db.ts                  # Neon client + types
│   │   ├── inngest-client.ts       # Reexport for convenience
│   │   ├── agents-config.ts        # AgentKit tools, models
│   │   └── utils/
│   │       ├── format-report.ts
│   │       ├── parse-citations.ts
│   │       └── stream-handler.ts
│   └── mcp/
│       ├── canva-client.ts        # MCP Canva integration
│       └── tools.ts               # Tool definitions for agents
├── scripts/
│   ├── migrate-db.ts              # Neon schema migrations
│   └── seed-db.ts                 # Sample data for testing
├── tests/
│   ├── e2e/
│   │   └── full-pipeline.test.ts  # E2E: Deep → Context → Content → Publish
│   ├── integration/
│   │   ├── inngest-functions.test.ts
│   │   └── db-triggers.test.ts
│   └── unit/
│       ├── format-report.test.ts
│       └── parse-citations.test.ts
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Test on push/PR
│       └── deploy.yml             # Deploy to Vercel + Cloud Run
├── package.json                   # See scripts section below
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── inngest.config.ts              # Inngest config
└── README.md
```

---

## 📋 Database Schema (Neon PostgreSQL)

**5 core tables + audit log:**

```sql
-- 1. Research jobs tracking
CREATE TABLE research_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic VARCHAR NOT NULL,
  tab_type VARCHAR(20) NOT NULL,  -- 'deep', 'context', 'content', 'publish'
  parameters JSONB,                -- depth, breadth, stages, etc.
  status VARCHAR(20) DEFAULT 'pending', -- pending, running, completed, failed
  report_data JSONB,               -- Structured report + citations
  created_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP,
  created_by VARCHAR,
  INDEX idx_research_jobs_status (status),
  INDEX idx_research_jobs_created (created_at)
);

-- 2. Brand configuration per user/org
CREATE TABLE brand_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  tov_guidelines TEXT,            -- Tone of voice
  brand_knowledge JSONB,
  platform_history JSONB,          -- Past posts by platform
  brand_colors JSONB,
  logo_url VARCHAR,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_by VARCHAR
);

-- 3. Generated content items
CREATE TABLE content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_job_id UUID REFERENCES research_jobs(id) ON DELETE CASCADE,
  content_type VARCHAR(50),        -- 'blog_post', 'social_post', 'carousel', etc.
  copy TEXT,                       -- Generated text
  design_assets JSONB,             -- Canva design URLs, media
  status VARCHAR(20) DEFAULT 'draft', -- draft, approved, rejected, published
  platform VARCHAR(50),            -- 'blog', 'twitter', 'linkedin', 'instagram', 'multi'
  publish_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  INDEX idx_content_items_status (status)
);

-- 4. Publishing queue with retry logic
CREATE TABLE publishing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
  platform VARCHAR,
  scheduled_at TIMESTAMP,
  published_at TIMESTAMP,
  status VARCHAR(20),              -- pending, published, failed
  error_log TEXT,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  INDEX idx_publishing_queue_status (status),
  INDEX idx_publishing_queue_platform (platform)
);

-- 5. Audit log for agent activities
CREATE TABLE agent_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name VARCHAR,
  action VARCHAR,
  job_id UUID,
  status VARCHAR,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now(),
  INDEX idx_agent_audit_log_agent (agent_name),
  INDEX idx_agent_audit_log_created (created_at)
);

-- DB Trigger: When content_items.status → 'approved', emit publishing.scheduled event
-- (configured in Inngest Neon integration)
```

---

## 🔄 Workflow Phases

### Phase 1: Deep Research (AgentKit Multi-Agent)
**Duration**: 2-5 min | **Event**: `deep.research.requested` → `deep.research.completed`

```
User Input: Topic + Parameters (depth, breadth)
    ↓
[Staging Agent]
  ├─ ArXiv search
  ├─ GitHub search
  ├─ Exa Web search
  └─ Pinecone semantic search
    ↓
[Reasoning Agent]
  ├─ Claude analysis
  ├─ Tree of thought (depth/breadth)
  └─ Extract findings + sources
    ↓
[Reporting Agent]
  ├─ Structure report (markdown)
  ├─ Format citations (IEEE)
  └─ Save to DB
    ↓
Output: Structured Report (JSON) with verified sources
```

### Phase 2: Context Research
**Duration**: 30-60 sec | **Event**: `context.research.requested` → `context.research.completed`

```
Input: Research Report (Phase 1) + Brand Config
    ↓
[Context Gatherer Agent]
  ├─ Fetch brand TOV, guidelines, knowledge
  ├─ Query platform history (Twitter, LinkedIn, Shopify)
  ├─ Semantic ranking vs. research data
  └─ Generate context outline
    ↓
Output: Contextualized Brief (JSON) with brand alignment
```

### Phase 3: Content Generation
**Duration**: 2-3 min | **Event**: `content.generation.requested` → `content.generated`

```
Input: Research Report + Context Brief + Content Types
    ↓
[Unified Content Writer]
  ├─ Claude generates copy for each type
  │  ├─ Blog post (long-form)
  │  ├─ Social captions (short, engaging)
  │  └─ Product description (for Shopify)
  ├─ Maintain brand voice + citations
  └─ Save drafts to DB
    ↓
[Canva Designer (MCP)]
  ├─ Create designs for social posts
  ├─ Apply brand colors, logo
  └─ Export as images/URLs
    ↓
[Approval Flow]
  ├─ Save as draft
  ├─ Wait for user approval
  └─ Emit `content.approval.requested`
    ↓
Output: Content Items (blog, social, designs) in draft status
```

### Phase 4: Publishing
**Duration**: Variable (scheduled) | **Event**: `publishing.scheduled` → `publishing.completed`

```
Input: Approved Content Items
    ↓
[Queue Manager (Cron)]
  ├─ Find all approved → ready content
  ├─ Schedule by platform + time
  └─ Emit publish events
    ↓
[Platform Publishers (Parallel)]
  ├─ [Shopify Publisher]
  │  ├─ Create blog post OR product
  │  ├─ Attach images
  │  └─ Set publish date
  └─ [Social Publishers]
     ├─ Twitter API (280 chars + image)
     ├─ LinkedIn API (carousel, doc)
     └─ Instagram (image upload)
    ↓
[Retry Logic]
  ├─ Failed? → Exponential backoff
  ├─ 3 retries max
  └─ Log to error queue
    ↓
Output: Published content with URLs, audit log
```

---

## 🔌 Key Integration Points

| Service | Usage | Config |
|---------|-------|--------|
| **Neon** | PostgreSQL DB + Inngest triggers | `NEON_DATABASE_URL` |
| **Inngest** | Event orchestration, durable functions | `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` |
| **Anthropic** | Claude 3.5 Sonnet for reasoning, writing | `ANTHROPIC_API_KEY` |
| **Pinecone** | Vector search for research sources | `PINECONE_API_KEY` |
| **Canva MCP** | Design generation | `CANVA_API_KEY`, `CANVA_API_SECRET` |
| **Shopify** | Blog posts, product descriptions | `SHOPIFY_STORE_URL`, `SHOPIFY_ACCESS_TOKEN` |
| **Twitter API** | Social media distribution | `TWITTER_BEARER_TOKEN` |
| **LinkedIn API** | Professional network posts | `LINKEDIN_ACCESS_TOKEN` |
| **ArXiv** | Academic paper search | Free, no auth |
| **GitHub Search** | Code & repo search | Free, rate-limited |
| **Exa** | Web search (Deep Research) | `EXA_API_KEY` |

---

## 🚦 Core Inngest Patterns

### 1. Linear Pipeline (Deep Research)
```typescript
staging.completed → reasoning.completed → reporting.completed
```

### 2. Parallel Fan-Out (Content Types)
```typescript
Promise.all([
  generateBlogPost(...),
  generateTwitter(...),
  generateLinkedin(...)
])
```

### 3. Conditional Branching (Approval)
```typescript
if (approved) → publishing.scheduled
else → content.rejected
```

### 4. Database Triggers (Auto-Publish)
```
content_items.status = 'approved'
  ↓ (Neon logical replication)
publishing.scheduled event
  ↓ (Inngest auto-listens)
Platform publishers run
```

### 5. Scheduled Jobs (Queue Manager)
```bash
cron: '0 * * * *'  # Every hour
Find failed/pending → retry with exponential backoff
```

---

## 📚 Further Reading

**For architecture deep-dives:**
```bash
@knowledge/project-architecture.md  # DB schema, data flows, deployment options
```

**For Inngest patterns:**
```bash
@knowledge/inngest-patterns.md      # 9 common patterns with full code examples
```

**For Pinecone (if using):**
```bash
@knowledge/pinecone-basics.md       # Essential operations, gotchas, best practices
```

**For API integrations:**
```bash
@knowledge/api-integrations.md      # Shopify, Twitter, LinkedIn, Canva endpoints
```

---

## 💡 Tips for Development

### Working with Claude Code / Droid

```bash
# In terminal, use these references for faster context:
@knowledge/project-architecture.md  # "Add a new agent"
@knowledge/inngest-patterns.md      # "How do I handle retries?"
@knowledge/pinecone-basics.md       # "Integrate vector search"

# Example:
# "Add a new publishing agent for Instagram"
# → Claude Code loads CLAUDE.md + @knowledge/inngest-patterns.md (pattern 9)
#   → Suggests event schema, function skeleton, DB updates
```

### Debugging Workflows

```bash
# Terminal:
npm run inngestdev

# Visit http://localhost:8288 to see:
# - Function execution timeline
# - Event payloads
# - Step results
# - Errors and retries
# - Replay failed runs

# Useful commands:
npx inngest-cli runs list
npx inngest-cli runs list --function deep-research-staging
npx inngest-cli runs get <run-id>
npx inngest-cli runs replay <run-id>
```

### Testing Locally

```bash
# Run all tests:
npm test

# E2E test (full pipeline):
npm run test:integration

# Watch mode:
npm run test:watch

# Coverage:
npm run test:coverage
```

### Database Migrations

```bash
# Add new table/column to .devcontainer/init-db.sql
# Then:
npm run setupdb

# For production (Neon):
npm run db:migrate
```

---

## ✅ Checklist: Before First Commit

- [ ] `.env.local` filled with all required keys
- [ ] `npm install` completed
- [ ] `npm run setupdb` initialized Neon schema
- [ ] `npm run dev` starts frontend (port 3000)
- [ ] `npm run inngestdev` starts Inngest (port 8288)
- [ ] http://localhost:3000 loads without errors
- [ ] http://localhost:8288 shows 0 functions (will update on app reload)
- [ ] At least one function registered (check sidebar in Inngest UI)
- [ ] No TypeScript errors: `npm run type-check`
- [ ] Linter clean: `npm run lint`

---

## 🚀 Next Steps

1. **Complete Local Setup** (15 min)
   - Follow "Quick Start" above
   - Verify all 3 servers running

2. **Explore Deep Research** (20 min)
   - Visit http://localhost:3000/research/deep
   - Enter topic + parameters
   - Watch staging → reasoning → reporting flow
   - View results and citations

3. **Test Context Research** (15 min)
   - Create brand config
   - Trigger context gathering
   - Verify platform history integration

4. **Generate Content** (20 min)
   - Use report from #2 + brand from #3
   - Generate blog + social variants
   - Review Canva designs

5. **Publish to Staging** (optional, 20 min)
   - Approve content items
   - Watch publishing.scheduled events
   - Verify queue manager retries

6. **Deploy to Production** (when ready)
   - See `.devcontainer/docker-compose.yml` for reference
   - Options: Vercel + Cloud Run, K8s, Railway
   - Set production env vars
   - Run migrations on production DB

---

## 📞 Support

- **Inngest Docs**: https://www.inngest.com/docs
- **AgentKit Docs**: https://agentkit.inngest.com
- **Neon Docs**: https://neon.tech/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Pinecone Docs**: https://docs.pinecone.io (if using)

---

**Happy researching and publishing! 🎉**
