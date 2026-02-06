# PRP: Task 18 - Replace Old Source Files with MCP Sources

## Goal
Systematically replace the legacy, hardcoded research source implementations (`arxiv.ts`, `github.ts`) with robust, standardized wrappers around the new MCP Client Infrastructure (Task 16). This task also involves creating new wrappers for Jina, Firecrawl, Reddit, and Google Deep Research, effectively finalizing the transition to a modular "MCP-first" architecture for data gathering.

**Target Output:**
- New source wrappers in `src/lib/sources/`:
    - `jina.ts`: Wrapper for Jina MCP (Search + Read).
    - `firecrawl.ts`: Wrapper for Firecrawl MCP (Scrape + Crawl).
    - `reddit.ts`: Wrapper for Reddit Workflow (Task 17).
    - `google-deep-research.ts`: Wrapper for Google Interactions API.
- Archived legacy files (`src/lib/sources/.archived/`).
- Updated `src/lib/sources/index.ts` exporting only the new MCP-based sources.

## Why
- **Standardization**: All external data fetching now flows through a single `MCPClient` interface, simplifying error handling, logging, and observability.
- **Maintainability**: Removing ad-hoc HTTP calls (axios/fetch) from individual source files reduces code duplication and "drift".
- **Capability Expansion**: Switching to MCP immediately unlocks advanced features like Firecrawl's "crawl" or Jina's "reader" without rewriting source logic.
- **Cleanup**: Removing technical debt (old ArXiv/GitHub scrapers) prevents confusion for future agents.

## What
- **Source Wrapper Pattern**: A standard function signature `fetchX(query, options): Promise<ContextItem[]>` for all sources.
- **Normalization**: Each wrapper MUST transform the raw MCP result (which varies by provider) into the application's standard `ContextItem` format (defined in `src/lib/mcp/types.ts`).
- **Error Handling**: Wrappers must catch MCP-specific errors (connection closed, timeout) and return empty arrays or typed errors, preventing workflow crashes.
- **Integration**: Re-exporting these new functions so the `gather-context` agent (Task 19) can consume them transparently.

### Success Criteria
- [ ] `fetchJina("query")` returns valid `ContextItem[]`.
- [ ] `fetchFirecrawl("url")` returns valid `ContextItem[]`.
- [ ] `fetchReddit("query")` returns valid `ContextItem[]` (integrating Task 17 logic).
- [ ] `fetchGoogleDeepResearch("query")` returns valid `ContextItem[]` (handling async polling).
- [ ] Legacy files `arxiv.ts` and `github.ts` are moved to `.archived/`.
- [ ] `src/lib/sources/index.ts` exports the new functions cleanly.

---

## All Needed Context

### Documentation & References
```yaml
# Project Context
- file: src/lib/mcp/types.ts
  why: "Target 'ContextItem' schema and MCPResult interfaces."
  
- file: src/lib/mcp/client-factory.ts
  why: "How to instantiate clients inside the wrappers."

- file: src/lib/mcp/workflows/reddit.ts
  why: "The Reddit logic to wrap (created in Task 17)."

# Google Deep Research
- doc: "Google Gemini Deep Research API"
  why: "Polling pattern for long-running research tasks (Interactions API)."
  details: "Requires creating an interaction, getting an ID, and polling status until 'completed'."
```

### Current Codebase Structure (Relevant)
```bash
src/
└── lib/
    └── sources/
        ├── arxiv.ts          # To Archive
        ├── github.ts         # To Archive
        ├── websearch.ts      # To Refactor/Archive
        └── index.ts          # To Update
```

### Desired Structure Additions
```bash
src/
└── lib/
    └── sources/
        ├── .archived/
        │   ├── arxiv.ts
        │   └── github.ts
        ├── jina.ts           # New
        ├── firecrawl.ts      # New
        ├── reddit.ts         # New
        ├── google.ts         # New (Deep Research)
        └── index.ts          # Updated barrel
```

### Known Gotchas
- **Google Polling**: The Google wrapper needs a robust loop.
    - *Pattern*: `while(status !== 'COMPLETED') { wait(5s); check(); }` with a max timeout (e.g., 5 mins).
- **Normalization Variability**:
    - *Jina*: Returns markdown. Needs parsing to extract "snippets".
    - *Firecrawl*: Returns structured JSON or markdown.
    - *Reddit*: Already normalized in Task 17, just needs pass-through.
- **Env Vars**: Wrappers should check for API keys and return "Skipped" or throw "ConfigError" if missing, to avoid runtime crashes.

---

## Implementation Blueprint

### 1. Source Wrapper Pattern
Define a standard interface for all source functions.

```typescript
// src/lib/sources/types.ts (Optional, or just convention)
import { ContextItem } from '@/lib/mcp/types';

export type SourceFetcher = (query: string, options?: any) => Promise<ContextItem[]>;
```

### 2. Jina Wrapper (`src/lib/sources/jina.ts`)
```typescript
import { MCPClientFactory } from '@/lib/mcp/client-factory';
import { ContextItem } from '@/lib/mcp/types';

export async function fetchJina(query: string): Promise<ContextItem[]> {
  if (!process.env.JINA_API_KEY) {
    console.warn("Jina key missing");
    return [];
  }
  
  const client = await MCPClientFactory.createSSEClient(
    'https://mcp.jina.ai/v1', 
    { Authorization: `Bearer ${process.env.JINA_API_KEY}` }
  );
  
  // Call tool 'search'
  const result = await client.callTool({ name: 'search', arguments: { query } });
  
  // Normalize result (Jina specific parsing)
  return normalizeJinaResponse(result); 
}
```

### 3. Google Deep Research Wrapper (`src/lib/sources/google.ts`)
```typescript
import { GoogleGenAI } from '@google/genai';

export async function fetchGoogleDeepResearch(query: string): Promise<ContextItem[]> {
  const client = new GoogleGenAI(process.env.GOOGLE_API_KEY);
  
  // 1. Start Interaction
  const interaction = await client.interactions.create({
    model: 'deep-research-pro-preview-12-2025',
    input: query
  });
  
  // 2. Poll for Completion
  let status = interaction.status;
  while (status !== 'COMPLETED') {
    await new Promise(r => setTimeout(r, 5000));
    const updated = await client.interactions.get(interaction.id);
    status = updated.status;
    if (status === 'FAILED') throw new Error("Google Research Failed");
  }
  
  // 3. Normalize
  return [{
    source: 'google_deep_research',
    content: interaction.result.text,
    metadata: { citations: interaction.result.citations }
  }];
}
```

### 4. Archive Legacy
Move `arxiv.ts` and `github.ts` to `.archived/`.

---

## Validation Loop

### Level 1: Static Analysis
```bash
npx tsc --noEmit
```

### Level 2: Unit Tests (Normalization)
Create `tests/unit/sources/normalization.test.ts`:
```typescript
test('normalizes jina markdown to context items', () => {
  const raw = { content: [{ text: "markdown result" }] };
  const items = normalizeJinaResponse(raw);
  expect(items[0].source).toBe('jina');
});
```

### Level 3: Integration Tests (Live)
Create `tests/integration/sources/live-fetch.test.ts`:
```typescript
test('fetchJina returns results', async () => {
  const results = await fetchJina('test query');
  expect(results.length).toBeGreaterThan(0);
});
```

---

## Final Checklist
- [ ] `jina.ts` implemented.
- [ ] `firecrawl.ts` implemented.
- [ ] `reddit.ts` implemented (wrapping Task 17 logic).
- [ ] `google.ts` implemented (with polling).
- [ ] Legacy files archived.
- [ ] `index.ts` updated.
- [ ] Unit tests for normalization pass.
