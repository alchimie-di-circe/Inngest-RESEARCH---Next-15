# PRP: Task 16 - Create MCP Client Infrastructure

## Goal
Establish a robust, unified **Model Context Protocol (MCP) Client Infrastructure** within the application to seamlessly integrate external intelligence providers (Jina.AI, Firecrawl, Reddit) and the Google Deep Research agent. This infrastructure will serve as the backbone for the "Deep Research" phase, enabling the application to dynamically route research queries to the most appropriate tools via a standardized interface.

**Target Output:**
- A production-ready `src/lib/mcp/` module.
- Fully typed MCP clients for SSE (Jina, Firecrawl) and Stdio (Reddit) transports.
- A custom wrapper for Google's Interactions API.
- A "Router" capability to parallelize and aggregate results.

## Why
- **Decoupling**: Abstracts specific provider API details (headers, endpoints) behind a standard MCP tool interface.
- **Scalability**: Makes it trivial to add new MCP servers (e.g., local file search, database connectors) in the future without rewriting agent logic.
- **Reliability**: Centralizes error handling, timeout management, and connection logic for all external tool calls.
- **Performance**: Enables parallel execution of research tasks across multiple providers (Breadth) vs. sequential execution.

## What
- **Core SDK**: Integration of `@modelcontextprotocol/sdk`.
- **Transports**:
    - **SSE Client**: For Jina and Firecrawl (HTTP/Streaming).
    - **Stdio Client**: For Reddit (local process execution via `uvx`).
- **Clients**:
    - `JinaClient`: Search/Read via `mcp.jina.ai`.
    - `FirecrawlClient`: Scrape/Crawl via `mcp.firecrawl.dev`.
    - `RedditClient`: Community sentiment via `mcp-server-reddit`.
    - `GoogleDeepResearch`: Wrapper for `@google/genai` Interactions API.
- **Router**: Logic to accept a query + selected sources and return aggregated `ContextItem` results.

### Success Criteria
- [ ] `MCPClient` factory functionality creates valid connections to SSE and Stdio endpoints.
- [ ] Jina MCP integration successfully performs `search` and `read`.
- [ ] Firecrawl MCP integration successfully performs `scrape`.
- [ ] Reddit MCP integration successfully spawns `uvx` and fetches posts (in environment allowing spawn).
- [ ] Google Deep Research wrapper successfully polls and retrieves results.
- [ ] `MCPRouter` successfully aggregates results from multiple sources in parallel.
- [ ] All code is strictly typed with Zod schemas for tool arguments and results.

---

## All Needed Context

### Documentation & References
```yaml
# MCP Core
- url: https://modelcontextprotocol.io/introduction
  why: "Official standard specification."
  
- url: https://github.com/modelcontextprotocol/typescript-sdk
  why: "Official TypeScript SDK for Client implementation."
  critical: "Focus on 'Client' and 'Transport' interfaces (SSEClientTransport, StdioClientTransport)."

# Jina AI
- url: https://github.com/jina-ai/MCP
  why: "Official Jina MCP server documentation."
  details: "Endpoint: https://mcp.jina.ai/v1"

# Firecrawl
- url: https://github.com/firecrawl/firecrawl-mcp-server
  why: "Official Firecrawl MCP server documentation."
  details: "Endpoint: https://mcp.firecrawl.dev/v2/mcp"

# Reddit
- url: https://github.com/Hawstein/mcp-server-reddit
  why: "Community Reddit MCP server implementation."
  details: "Execution via 'uvx mcp-server-reddit'. No auth required for public read-only."

# Google Deep Research
- url: https://ai.google.dev/gemini-api/docs/interactions
  why: "Documentation for the Interactions API (Deep Research)."
  critical: "Requires polling mechanism for long-running jobs."
```

### Current Codebase Structure
```bash
src/
├── lib/
│   ├── utils.ts          # Existing utils
│   └── db.ts             # Database client
└── inngest/              # Inngest functions (Consumers of this infra)
```

### Desired Codebase Structure
```bash
src/
└── lib/
    └── mcp/
        ├── index.ts              # Barrel export
        ├── types.ts              # Core interfaces (MCPSource, MCPResult)
        ├── router.ts             # Aggregation logic
        ├── client-factory.ts     # Generic MCP Client creation
        ├── clients/
        │   ├── jina.ts           # Jina implementation
        │   ├── firecrawl.ts      # Firecrawl implementation
        │   └── reddit.ts         # Reddit implementation
        └── google/
            └── deep-research.ts  # Google API wrapper
```

### Known Gotchas
- **Stdio in Serverless**: The Reddit client uses `stdio` (spawning a process). This **WILL NOT WORK** efficiently in standard Vercel Serverless Functions due to process lifetime limits and binary dependencies (`uv`, `python`).
    - *Constraint*: This infrastructure assumes execution in a **containerized environment** (Google Cloud Run or Inngest Cloud) where `uvx` can be installed and processes spawned.
    - *Fallback*: If running on Vercel, the Reddit client must be disabled or proxied via a separate service.
- **Connection Lifecycle**: MCP clients over SSE need to remain open or be re-established per request. For stateless Inngest functions, we will likely establish a fresh connection per step execution.
- **Google Polling**: The Interactions API is async. The wrapper must implement robust polling with timeout/backoff.

---

## Implementation Blueprint

### 1. Dependencies
**Task 16.1**: Install core dependencies.
```bash
npm install @modelcontextprotocol/sdk eventsource @google/genai zod
```

### 2. Core Types (`src/lib/mcp/types.ts`)
```typescript
import { z } from 'zod';

export type MCPSource = 'jina' | 'firecrawl' | 'reddit' | 'google_deep_research';

export interface MCPToolCall {
  name: string;
  arguments: Record<string, any>;
}

export interface MCPResult {
  source: MCPSource;
  content: string;
  metadata: Record<string, any>;
}

export interface MCPConfig {
  jinaKey?: string;
  firecrawlKey?: string;
  googleKey?: string;
  // ...
}
```

### 3. Generic Client Factory (`src/lib/mcp/client-factory.ts`)
Implement a helper to initialize clients with the correct transport.
```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export class MCPClientFactory {
  static async createSSEClient(url: string, headers: Record<string, string>) {
    const transport = new SSEClientTransport(new URL(url), { eventSourceInit: { headers } });
    const client = new Client({ name: "research-bot", version: "1.0.0" }, { capabilities: {} });
    await client.connect(transport);
    return client;
  }

  static async createStdioClient(command: string, args: string[]) {
    const transport = new StdioClientTransport({ command, args });
    const client = new Client({ name: "research-bot", version: "1.0.0" }, { capabilities: {} });
    await client.connect(transport);
    return client;
  }
}
```

### 4. Specific Clients
**Task 16.2**: `src/lib/mcp/clients/jina.ts`
- Extends generic client.
- Implements `search(query)` and `read(url)` using Jina tools.

**Task 16.3**: `src/lib/mcp/clients/firecrawl.ts`
- Extends generic client.
- Implements `scrape(url)` and `crawl(url)`.

**Task 16.4**: `src/lib/mcp/clients/reddit.ts`
- Uses `createStdioClient` with command `uvx` and args `['mcp-server-reddit']`.
- Implements `get_subreddit_hot_posts`.

**Task 16.5**: `src/lib/mcp/google/deep-research.ts`
- Uses `@google/genai`.
- Implements `execute(prompt)` with `client.interactions.create` + polling loop.

### 5. Router (`src/lib/mcp/router.ts`)
```typescript
export class MCPRouter {
  async route(query: string, sources: MCPSource[]): Promise<MCPResult[]> {
    const promises = sources.map(async (source) => {
      try {
        switch(source) {
          case 'jina': return await jinaClient.search(query);
          case 'reddit': return await redditClient.search(query);
          // ...
        }
      } catch (e) {
        console.error(`MCP Source ${source} failed:`, e);
        return null;
      }
    });
    
    const results = await Promise.all(promises);
    return results.filter(r => r !== null).flat();
  }
}
```

---

## Validation Loop

### Level 1: Static Analysis
```bash
# Verify type safety
npx tsc --noEmit
```

### Level 2: Unit Tests (Mocked)
Create `tests/unit/mcp/router.test.ts`:
```typescript
test('router aggregates results', async () => {
  const mockJina = jest.spyOn(jinaClient, 'search').mockResolvedValue([{ source: 'jina', content: 'test' }]);
  const router = new MCPRouter();
  const results = await router.route('test', ['jina']);
  expect(results).toHaveLength(1);
  expect(results[0].source).toBe('jina');
});
```

### Level 3: Integration Tests (Live/Container)
Create `tests/integration/mcp/live-connection.test.ts` (Run via `container-use` or local with env vars).
```typescript
test('jina connection', async () => {
  if (!process.env.JINA_API_KEY) return; // Skip if no key
  const client = await MCPClientFactory.createSSEClient('https://mcp.jina.ai/v1', { Authorization: `Bearer ${process.env.JINA_API_KEY}` });
  const tools = await client.listTools();
  expect(tools).toBeDefined();
});
```

---

## Final Checklist
- [ ] Dependencies installed.
- [ ] Core types defined.
- [ ] Client factory implemented (SSE + Stdio).
- [ ] Individual wrappers created (Jina, Firecrawl, Reddit, Google).
- [ ] Router logic implemented.
- [ ] Env vars added to `.env.example` (`JINA_API_KEY`, `FIRECRAWL_API_KEY`, `GOOGLE_GENAI_KEY`).
- [ ] Unit tests pass.
