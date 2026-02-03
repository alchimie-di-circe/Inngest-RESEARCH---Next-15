---
tags: [guides, agentkit, setup, all-agents]
description: Production agent roster and config
alwaysApply: false
---

# 🤖 IN-APP PRODUCTION AGENTS - Quick Reference Guide

> **Status**: Currently Implementing Phase 1 (Deep Research)  
> **Last Updated**: January 25, 2026  
> **Team**: Single Inngest + AgentKit orchestrated team (all phases unified)  
> **User Controllability**: Currently none (hardcoded config)

---

## 📋 AGENT TEAM OVERVIEW

The Research & Publishing Suite uses a **single unified team of specialized Inngest functions** orchestrated via AgentKit. All agents are triggered through Inngest event streams with step-based durable execution.

### Architecture Pattern
- **Orchestration**: Inngest durable functions + event-driven
- **Agent Framework**: AgentKit (via AI SDK)
- **LLM Gateway**: Anthropic AI SDK `gateway()` provider (multi-provider abstraction)
- **Communication**: Event-based (trigger → invoke → publish)
- **Realtime Feedback**: Server-Sent Events (SSE) to frontend

---

## 🎯 AGENT ROSTER (Phase 1: Currently Live)

### 1. **Gather Context Agent**
| Property | Value |
|----------|-------|
| **File** | `src/inngest/functions/gather-context.ts` |
| **Role** | Parallel multi-source context gathering (preprocessing step) |
| **LLM Used** | None (no LLM, pure API orchestration) |
| **Trigger** | Event: `research/gather-context` |
| **Dependencies** | None (initiator) |
| **Output** | `topContexts: ContextItem[]` |
| **External APIs** | ArXiv, GitHub API, Exa Web Search, Pinecone Vector DB |
| **Rate Limits** | 50 concurrent, 100 req/min per user |

**Task Flow**:
```
1. Fetch from 4 sources in parallel:
   • fetchArxiv()     → 5 results
   • fetchGithub()    → 5 results (requires GITHUB_TOKEN)
   • fetchVectorDB()  → Vector similarity search
   • fetchWebSearch() → Web search (requires SERP_API_KEY)

2. Generate embeddings for all contexts (OpenAI embedding model)
3. Rank by relevance
4. Stream progress updates to frontend
```

**Downstream**: Invokes **Orchestrator** via `step.invoke()`

---

### 2. **Orchestrator Function**
| Property | Value |
|----------|-------|
| **File** | `src/inngest/functions/orchestrator.ts` |
| **Role** | Multi-agent research orchestration + job persistence |
| **LLM Used** | None (coordinator, delegates to 4 specialized agents) |
| **Trigger** | Event: `research/query.submitted` |
| **Dependencies** | `gatherContext` (step.invoke) |
| **Pattern** | Fan-out → run agents in parallel → fan-in → synthesize |
| **Database** | Create/update `researchJob` (Neon) |
| **onFailure Handler** | Marks job status as FAILED |

**Task Flow**:
```
1. Create ResearchJob in DB (status = RUNNING)
2. Invoke gatherContext → get topContexts
3. Fan-out to 4 agents in parallel:
   • Analyst Agent    (GPT-4)
   • Summarizer Agent (Claude)
   • Fact-Checker Agent (Gemini)
   • Classifier Agent (Mistral)
4. Fan-in: Collect all agent results
5. Invoke Synthesizer Agent → combine outputs
6. Save final results to jobResult field
7. Update job status to COMPLETED
```

**Error Handling**: If any step fails, `onFailure` handler updates job status to FAILED.

---

### 3. **Analyst Agent**
| Property | Value |
|----------|-------|
| **File** | `src/inngest/functions/agents/analyst-agent.ts` |
| **Role** | Deep analysis and detailed insights |
| **LLM Provider** | OpenAI |
| **Model** | `gpt-4-turbo` (via AI SDK gateway) |
| **Trigger** | Event: `agent/analyze` (from orchestrator) |
| **Dependencies** | `orchestrator` → `step.invoke()` |
| **Input Data** | `{ query, contexts[], sessionId, userId }` |
| **Output** | `{ agent: "analyst", model: string, response: string, duration: ms }` |
| **Rate Limits** | 10 concurrent, 1 req/min per user |
| **Retry Policy** | 2 retries on failure |

**Streaming**: Token-by-token updates published to `researchChannel(sessionId).agent-update()`

---

### 4. **Summarizer Agent**
| Property | Value |
|----------|-------|
| **File** | `src/inngest/functions/agents/summarizer-agent.ts` |
| **Role** | Concise summaries and key points |
| **LLM Provider** | Anthropic |
| **Model** | `claude-3.5-sonnet` (via AI SDK gateway) |
| **Trigger** | Event: `agent/summarize` (from orchestrator) |
| **Dependencies** | `orchestrator` → `step.invoke()` |
| **Input Data** | `{ query, contexts[], sessionId, userId }` |
| **Output** | `{ agent: "summarizer", model: string, response: string, duration: ms }` |
| **Rate Limits** | 10 concurrent, 1 req/min per user |
| **Retry Policy** | 2 retries on failure |

---

### 5. **Fact-Checker Agent**
| Property | Value |
|----------|-------|
| **File** | `src/inngest/functions/agents/fact-checker-agent.ts` |
| **Role** | Validates claims and checks accuracy |
| **LLM Provider** | Google |
| **Model** | `gemini-2.5-flash` (via AI SDK gateway) |
| **Trigger** | Event: `agent/fact-check` (from orchestrator) |
| **Dependencies** | `orchestrator` → `step.invoke()` |
| **Input Data** | `{ query, contexts[], sessionId, userId }` |
| **Output** | `{ agent: "factChecker", model: string, response: string, duration: ms }` |
| **Rate Limits** | 10 concurrent, 1 req/min per user |
| **Retry Policy** | 2 retries on failure |

---

### 6. **Classifier Agent**
| Property | Value |
|----------|-------|
| **File** | `src/inngest/functions/agents/classifier-agent.ts` |
| **Role** | Categorizes and classifies content |
| **LLM Provider** | Mistral AI |
| **Model** | `mistral-large` (via AI SDK gateway) |
| **Trigger** | Event: `agent/classify` (from orchestrator) |
| **Dependencies** | `orchestrator` → `step.invoke()` |
| **Input Data** | `{ query, contexts[], sessionId, userId }` |
| **Output** | `{ agent: "classifier", model: string, response: string, duration: ms }` |
| **Rate Limits** | 10 concurrent, 1 req/min per user |
| **Retry Policy** | 2 retries on failure |

---

### 7. **Synthesizer Agent**
| Property | Value |
|----------|-------|
| **File** | `src/inngest/functions/agents/synthesizer-agent.ts` |
| **Role** | Combines insights from all 4 agents into final answer |
| **LLM Provider** | OpenAI |
| **Model** | `gpt-4-turbo` (via AI SDK gateway) |
| **Trigger** | Event: `agent/synthesize` (from orchestrator) |
| **Dependencies** | Receives all 4 agent results as input |
| **Input Data** | `{ query, agentResults[], sessionId, userId }` |
| **Output** | `{ agent: "synthesizer", model: string, response: string, duration: ms }` |
| **Retry Policy** | 2 retries on failure |

**Purpose**: Takes the 4 specialized analyses and synthesizes them into a unified, coherent response that combines all perspectives.

---

## 🔗 AGENT DEPENDENCY GRAPH

```
User Input (research/query.submitted event)
         ↓
    [Orchestrator] ─── DB: Create ResearchJob (RUNNING)
         ↓
   [Gather Context]
         ↓
    (4 agents in parallel)
    ┌────┬────┬──────────┬──────────┐
    ↓    ↓    ↓          ↓          ↓
 [Analyst] [Summarizer] [Fact-Checker] [Classifier]
    └────┴────┴──────────┴──────────┘
         ↓
   [Synthesizer] ─────────────────┐
         ↓                         ↓
    (fan-in)                  DB: Save Results
         ↓
   ResearchJob Status: COMPLETED
```

### Dependency Types

| From | To | Type | Data Flow |
|------|-----|------|-----------|
| User | Orchestrator | **Event-triggered** | `research/query.submitted` event |
| Orchestrator | GatherContext | **step.invoke()** | Returns `topContexts` |
| Orchestrator | Analyst/Summarizer/Fact-Checker/Classifier | **step.invoke() (parallel)** | All receive same `contexts[], query` |
| 4 Agents | Synthesizer | **Data-based** (output of all 4) | Agent results compiled as input |
| Synthesizer | Database | **step.run()** | Save final `jobResult` to DB |
| Orchestrator | Database | **onFailure handler** | If any step fails, mark FAILED |

---

## 🌐 EXTERNAL SERVICES & APIs USED

### Context Gathering Phase
| Service | API | Auth | Purpose | Rate Limit |
|---------|-----|------|---------|-----------|
| **ArXiv** | `export.arxiv.org/api/query` | None | Academic papers, research | 1 req/sec |
| **GitHub** | `api.github.com/search/repos` | `GITHUB_TOKEN` | Code repositories | 30 req/min (auth) |
| **Exa Web Search** | `api.exa.ai/search` | `SERP_API_KEY` | Web search results | Depends on plan |
| **Pinecone** | Vectorstore (optional) | `PINECONE_API_KEY` | Vector similarity | Depends on plan |

### LLM Providers (AI SDK Gateway)
| Provider | Models Used | Auth | Cost Model |
|----------|-----------|------|-----------|
| **OpenAI** | gpt-4-turbo, gpt-4-mini | `OPENAI_API_KEY` | Per-token billing |
| **Anthropic** | claude-3.5-sonnet | `ANTHROPIC_API_KEY` | Per-token billing |
| **Google** | gemini-2.5-flash | `GOOGLE_API_KEY` | Per-token billing |
| **Mistral AI** | mistral-large | `MISTRAL_API_KEY` | Per-token billing |

### Internal Message Queue
| Service | Purpose | Config |
|---------|---------|--------|
| **Inngest** | Event orchestration, durable functions | `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` |
| **Neon PostgreSQL** | Research job tracking, results storage | `DATABASE_URL` |

---

## 👤 USER CONTROLLABILITY STATUS

### ❌ Currently NOT Controllable by Users

**Model Selection**:
- All 4 agent models are **hardcoded** in `src/lib/ai-models.ts`
- No UI panel/toggle to switch models
- No settings page for LLM provider configuration

**Rate Limits & Concurrency**:
- Hard-coded in agent function config
- No user override available

**API Keys**:
- Must be set as environment variables
- No in-app configuration UI

### ✅ Potentially Controllable (Future Roadmap)

**Planned for Phase 2-3**:
- Settings panel in dashboard to select agent models per-agent
- Brand-specific model overrides (e.g., "Use Claude exclusively for summarization")
- Dynamic prompt injection (tone, keywords, restrictions)

**Implementation Path**:
```typescript
// Future: Store in brand_config table
{
  brandId: "x",
  agentConfig: {
    analyst: { model: "gpt-4", temperature: 0.7 },
    summarizer: { model: "claude-3.5-sonnet", temperature: 0.5 },
    // ... override any agent
  }
}

// In orchestrator.ts
const agentConfig = await db.brandConfig.findUnique({ where: { brandId } });
const analystModel = agentConfig?.agentConfig?.analyst?.model || "gpt-4";
```

---

## 📦 ENVIRONMENT VARIABLES REQUIRED

```bash
# LLM Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=claude-...
GOOGLE_API_KEY=goog-...
MISTRAL_API_KEY=mist-...

# Context Sources
GITHUB_TOKEN=ghp_...
SERP_API_KEY=...
PINECONE_API_KEY=... (optional)

# Infrastructure
DATABASE_URL=postgresql://...
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...
```

---

## 🚀 PHASE 2-4 PLANNED AGENTS (Not Yet Implemented)

### Phase 3: Content Generation

| Agent | LLM | Role | File (TBD) |
|-------|-----|------|-----------|
| Content Writer | Claude 3.5 Sonnet | Unified text generation (copy, headlines, CTAs) | `src/inngest/functions/content-writer-agent.ts` |
| Canva Agent | - (MCP) | Design creation via Canva API | `src/inngest/functions/canva-agent.ts` |

### Phase 4: Publishing

| Agent | LLM | Role | File (TBD) |
|-------|-----|------|-----------|
| Shopify Publisher | - | E-commerce publishing | `src/inngest/functions/shopify-publisher.ts` |
| Social Publisher | - | Twitter, LinkedIn, Instagram posting | `src/inngest/functions/social-publisher.ts` |
| Queue Manager | - | Publishing queue + exponential backoff | `src/inngest/functions/queue-manager.ts` |

---

## 📊 AGENT TEAM STATISTICS (Phase 1)

| Metric | Value |
|--------|-------|
| **Total Agents (Phase 1)** | 7 (1 orchestrator + 1 context gatherer + 4 analysis agents + 1 synthesizer) |
| **LLM Providers** | 4 (OpenAI, Anthropic, Google, Mistral) |
| **Parallel Agents** | 4 (during fan-out phase) |
| **Total External APIs** | 4 (ArXiv, GitHub, Exa Web Search, Pinecone) |
| **Avg Response Time** | ~15-30 seconds (entire workflow) |
| **Streaming Updates** | Real-time via SSE to frontend |
| **Database Transactions** | 2 (create job, save results) |
| **Error Handling** | Retry-on-failure + onFailure handler |

---

## 🔧 CONFIGURATION FILES

| File | Purpose | Location |
|------|---------|----------|
| **AI Models Registry** | Hardcoded agent-to-model mapping | `src/lib/ai-models.ts` |
| **Inngest Client** | Event definitions + schemas | `src/inngest/client.ts` |
| **Event Schema** | TypeScript types for all events | `src/inngest/client.ts` (EventSchemas) |
| **Database Schema** | research_jobs, brand_config, etc. | `prisma/schema.prisma` |

---

## 📚 RELATED DOCUMENTATION

- **Full Agent Architecture**: See `docs/project-architecture.md`
- **AgentKit Patterns**: See `.claude/knowledge/agentkit-advanced-patterns.md`
- **Inngest Workflows**: See `.claude/knowledge/inngest-patterns.md`
- **Testing Strategy**: See `AGENTS.md` (Testing & Development section)

---

## ⚠️ KNOWN LIMITATIONS & TODOs

| Item | Status | Impact | Timeline |
|------|--------|--------|----------|
| User-configurable models | ❌ Not implemented | Users cannot override agent models | Phase 2 |
| Brand-specific agent configs | ❌ Not implemented | All brands use same agent settings | Phase 2 |
| Dynamic prompt overrides | ❌ Not implemented | Cannot customize agent behavior per-brand | Phase 2 |
| Agent feedback/rating | ❌ Not implemented | No way to track which agents performed well | Future |
| A/B testing different models | ❌ Not implemented | Cannot compare agent outputs | Future |

---

## 🎓 QUICK REFERENCE: ADDING A NEW AGENT

### Template Structure
```typescript
// src/inngest/functions/agents/my-agent.ts
import { inngest } from "../../client";
import { researchChannel } from "../../channels";
import { models, modelInfo } from "@/lib/ai-models";
import { streamText } from "ai";

export const myAgent = inngest.createFunction(
  {
    id: "my-agent",
    name: "My Agent Name",
    retries: 2,
    throttle: { limit: 10, period: "1m", key: "event.data.userId" },
  },
  { event: "agent/my-event" },
  async ({ event, step, publish }) => {
    // Implementation
  }
);
```

### Steps
1. Add new event to `src/inngest/client.ts` (EventSchemas)
2. Add agent config to `src/lib/ai-models.ts`
3. Create `src/inngest/functions/agents/my-agent.ts`
4. Call via `step.invoke()` from orchestrator
5. Write tests in `tests/integration/agents/my-agent.test.ts`

---

**This guide is maintained as part of the Research & Publishing Suite documentation.**  
**Last Updated**: January 25, 2026  
**Next Review**: When Phase 2 agents are implemented
