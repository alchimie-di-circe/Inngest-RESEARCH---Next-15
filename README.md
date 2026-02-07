# Research & Publishing Suite - Updated Context Engineering

> **Status**: Phase 2 - T3, T4, T12, T13, T14 Validation  
> **Date**: February 7, 2026  
> **Branch**: `phase-2--tasks-parallel-wave--11-3-4-14-12`  
> **Build**: ✅ Frontend Build Resolved

## Project Overview

Unified **Research & Publishing Suite** unifying:
- **Deep Research Tab**: Multi-agent research pipeline (staging → reasoning → reporting) from `agent-kit/deep-research`
- **Context Research Tab**: Multi-source context gathering + brand contextualization from `Inngest-RESEARCH---Next-15`
- **Content Generation**: Unified text + design creation (MCP Canva)
- **Publishing Agent**: Automated posting to Shopify, social, blogs

All orchestrated via **Inngest + AgentKit + Next.js 15**.

## Key Technologies

- **Framework**: Next.js 15 (App Router), TypeScript
- **Orchestration**: Inngest (durable execution, events, workflows, realtime)
- **Agent Framework**: AgentKit (multi-agent reasoning, tool use, MCP servers)
- **LLM**: Anthropic Claude 3.5 Sonnet (via AI SDK)
- **Database**: Neon PostgreSQL (serverless, branching, Inngest triggers)
- **Vector DB**: Pinecone (optional, fallback to in-memory)
- **APIs**: ArXiv, GitHub, Exa Web Search, Shopify, Twitter/LinkedIn, Canva (MCP)

### Neon Database Configuration

| Setting | Value |
|---------|-------|
| **Project ID** | `summer-haze-17190561` |
| **Database** | `neondb` |
| **Owner Role** | `neondb_owner` |

**Branches**:

| Branch | ID | Environment |
|--------|-----|-------------|
| **production** | `br-jolly-salad-agb6asse` | Live |
| **preview** | `br-fragrant-dawn-ag82fjdz` | PR previews |
| **dev** | `br-sparkling-darkness-agdcyxfm` | Development |

See [QUICKSTART.md](QUICKSTART.md) for connection setup.

## Two-Step Workflow

### Step 1: Deep Research → Verified Report
```
user input topic
  ↓
[Staging Agent]  → Query generation, source gathering
  ↓
[Reasoning Agent] → Analysis, synthesis, reasoning tree
  ↓
[Reporting Agent] → Structured report + citations
  ↓
database: research_jobs.report_data
```

### Step 2: Context Research → Brand-Contextualized Content
```
report from Step 1
  ↓
[Context Gatherer] → Multi-source (TOV, brand knowledge, platform history)
  ↓
[Content Planner] → Blog outline + social variants (copy, hooks, CTAs)
  ↓
[Content Generator] → Final texts + Canva design via MCP
  ↓
database: content_items
```

### Step 3: Publishing
```
content_items (approved)
  ↓
[Publisher] → Fan-out to Shopify (blog) + Social (Twitter, LinkedIn)
  ↓
database: publishing_queue
```

## Quick Start

### Local Dev (GitHub Codespaces recommended)

```bash
# 1. Fork + Create Codespace
# Click "Code" → "Codespaces" → "Create codespace on main"

# 2. Wait for postCreateCommand: npm install && npx prisma generate

# 3. Two terminals:
# Terminal 1:
npm run dev           # Next.js port 3000

# Terminal 2:
npm run inngestdev   # Inngest port 8288

# 4. Visit http://localhost:3000
```

### Environment Setup

```bash
# Copy and fill .env.local
cp .env.example .env.local

# Required:
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=...

# Optional (for publishing):
SHOPIFY_STORE_URL=...
SHOPIFY_ACCESS_TOKEN=...
TWITTER_BEARER_TOKEN=...
LINKEDIN_ACCESS_TOKEN=...
CANVA_API_KEY=...
CANVA_API_SECRET=...
```

## Architecture

See @knowledge/project-architecture.md for detailed system design and data flows.

## Common Tasks

### Starting a new research
1. Navigate to "Deep Research" tab
2. Enter topic and set depth/breadth parameters
3. Watch progress in realtime via Inngest streaming
4. Report auto-saves to database

### Creating branded content from research
1. Report from Step 1 pre-loaded
2. Navigate to "Context Research" tab
3. System fetches brand TOV, platform history, guidelines
4. AI generates blog + social variants
5. Review in "Content" tab

### Publishing
1. Approve content in "Content" tab
2. Select platform(s) and schedule
3. "Publishing" agent handles retry + tracking
4. Monitor in "Publishing" tab

### Integrating new API/MCP Server
1. Create client in `/src/lib/[service]-client.ts`
2. Add AgentKit tool definition
3. Register in `src/inngest/tools/index.ts`
4. Reference in agent function via `tools: { myNewTool: {...} }`

## Database Schema

Core tables (created via `.devcontainer/init-db.sql`):

- `research_jobs` - Deep research jobs, status, report_data (JSON)
- `brand_config` - Brand TOV, guidelines, colors, logos
- `content_items` - Generated copy/design, platforms, status
- `publishing_queue` - Publication schedule, platform, retry logic
- `agent_audit_log` - Agent actions, errors, timestamps

## Reference Documentation

- Architecture: @knowledge/project-architecture.md
- Inngest patterns: @knowledge/inngest-patterns.md
- Pinecone (if used): @knowledge/pinecone-basics.md
- API integrations: @knowledge/api-integrations.md
- DevContainer: `.devcontainer/devcontainer.json`

## Development Workflow

### With GitHub Copilot / Claude Code

Use Claude Code with this CLAUDE.md + knowledge files:

```bash
# In Claude Code terminal:
npm run dev           # Then Copilot can see real errors
npm run inngestdev   # In another pane

# Claude Code reads this file automatically
# Reference specific knowledge: @knowledge/inngest-patterns.md
```

### Debugging Inngest Workflows

```bash
# View execution dashboard
open http://localhost:8288

# View logs for specific function
npx inngest-cli runs list --function deep-research.staging

# Replay a failed run
npx inngest-cli runs replay <run-id>
```

## Production Deployment

See `DEPLOYMENT.md` for:
- Vercel (frontend) + Cloud Run (backend) setup
- Neon branching strategy
- CI/CD with GitHub Actions
- Environment variable management

## Team

- Built with Inngest + AgentKit
- Inspired by deep research + context engineering patterns
- Ready for async agents, MCP servers, multi-tenant setup


## Context Engineering

Per capire l'architettura:
```bash
# Quick overview
cat .claude/CLAUDE.md

# Deep dive (architettura, DB schema, data flows)
cat .claude/knowledge/project-architecture.md

# Inngest patterns & examples
cat .claude/knowledge/inngest-patterns.md

# Pinecone (se usi vector search)
cat .claude/knowledge/pinecone-basics.md

# API integrations
cat .claude/knowledge/api-integrations.md

# DevContainer
cat .devcontainer/devcontainer.json
```         