# MCP Code Reference

> **Purpose**: Reference implementation for MCP (Model Context Protocol) integration
> **Use For**: Task 16 (MCP Infrastructure) and Task 20 (Database Models)
> **Created**: January 29, 2026
> **Status**: Code saved for future implementation on feature branch

---

## Overview

This file contains the complete code implementation for the MCP upgrade. The code was written during planning but should be implemented on a feature branch, not directly on main.

### When to Use This Code

| Task | What to Copy |
|------|--------------|
| **Task 16**: Create MCP Client Infrastructure | All files in `src/lib/mcp/` section |
| **Task 20**: Add Database Models | Prisma schema changes + `src/lib/credentials.ts` |

### Implementation Steps

1. Create feature branch: `git checkout -b task-16-mcp-infrastructure`
2. Copy relevant code from this file
3. Run `npm install` (in Codespace, NOT local Mac)
4. For Prisma changes: `npx prisma db push` or `npx prisma migrate dev`
5. Test and create PR

---

## File Structure

```
src/
├── lib/
│   ├── credentials.ts          # Credential encryption utilities
│   └── mcp/
│       ├── index.ts            # Barrel exports
│       ├── types.ts            # TypeScript types
│       ├── jina-client.ts      # Jina.AI SSE client
│       ├── firecrawl-client.ts # Firecrawl SSE client
│       ├── reddit-client.ts    # Reddit stdio client (NO AUTH!)
│       ├── google-deep-research.ts # Google API wrapper
│       └── mcp-router.ts       # Query routing
```

---

## src/lib/mcp/types.ts

```typescript
/**
 * MCP (Model Context Protocol) Types
 *
 * Type definitions for the MCP client infrastructure supporting
 * Jina.AI, Firecrawl, Reddit, and Google Deep Research integrations.
 */

// Available MCP sources
export type MCPSource =
  | "jina"
  | "firecrawl"
  | "reddit"
  | "google_deep_research"
  | "vectordb";

// Transport types for MCP connections
export type MCPTransportType = "sse" | "stdio" | "ws" | "custom";

// MCP transport configuration
export interface MCPTransportConfig {
  type: MCPTransportType;
  url?: string;
  command?: string;
  args?: string[];
  requestInit?: {
    headers?: Record<string, string>;
  };
}

// MCP server configuration
export interface MCPServerConfig {
  name: MCPSource;
  transport: MCPTransportConfig;
  requiresAuth: boolean;
  costPerQuery?: number; // For Google Deep Research
}

// Result from an MCP query
export interface MCPResult {
  source: MCPSource;
  success: boolean;
  items: MCPResultItem[];
  error?: string;
  metadata?: {
    queriedAt: string;
    responseTimeMs: number;
    creditsUsed?: number;
    cost?: number;
  };
}

// Individual result item from an MCP
export interface MCPResultItem {
  id: string;
  title: string;
  text: string;
  url?: string;
  source: MCPSource;
  relevanceScore?: number;
  metadata?: Record<string, unknown>;
}

// Jina-specific types
export interface JinaSearchOptions {
  limit?: number;
  includeImages?: boolean;
}

export interface JinaSearchResult {
  title: string;
  url: string;
  content: string;
  score?: number;
}

export interface JinaReadResult {
  url: string;
  title: string;
  content: string;
  markdown?: string;
}

// Firecrawl-specific types
export interface FirecrawlScrapeOptions {
  formats?: ("markdown" | "html" | "text")[];
  onlyMainContent?: boolean;
  includeTags?: string[];
  excludeTags?: string[];
}

export interface FirecrawlSearchOptions {
  limit?: number;
  scrapeOptions?: FirecrawlScrapeOptions;
}

export interface FirecrawlCrawlOptions {
  maxDepth?: number;
  limit?: number;
  includePaths?: string[];
  excludePaths?: string[];
}

export interface FirecrawlResult {
  url: string;
  title?: string;
  markdown?: string;
  html?: string;
  text?: string;
  metadata?: Record<string, unknown>;
}

// Reddit-specific types
export interface RedditSubredditMapping {
  category: string;
  keywords: string[];
  subreddits: string[];
}

export interface RedditFetchOptions {
  subreddits?: string[];
  limit?: number;
  timeFilter?: "hour" | "day" | "week" | "month" | "year" | "all";
  commentDepth?: number;
  commentLimit?: number;
}

export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  url: string;
  subreddit: string;
  author: string;
  score: number;
  numComments: number;
  createdUtc: number;
  awards?: number;
  permalink: string;
}

export interface RedditComment {
  id: string;
  body: string;
  author: string;
  score: number;
  createdUtc: number;
  replies?: RedditComment[];
  depth: number;
}

export interface RedditSubredditInfo {
  name: string;
  title: string;
  description: string;
  subscribers: number;
  publicDescription?: string;
}

// Google Deep Research-specific types
export interface GoogleDeepResearchOptions {
  format?: "technical" | "executive" | "casual";
  maxPollingAttempts?: number;
  pollingIntervalMs?: number;
}

export interface GoogleDeepResearchResult {
  query: string;
  report: string;
  sources: Array<{
    url: string;
    title: string;
    excerpt?: string;
  }>;
  metadata: {
    startedAt: string;
    completedAt: string;
    costEstimate: number;
    tokensUsed?: number;
  };
}

// MCP Router types
export interface MCPRouterOptions {
  selectedSources: MCPSource[];
  query: string;
  userId: string;
  sessionId: string;
  credentials?: Record<MCPSource, string>;
  depth?: number;
  breadth?: number;
}

export interface MCPRouterResult {
  results: Record<MCPSource, MCPResult>;
  aggregatedItems: MCPResultItem[];
  sourcesQueried: MCPSource[];
  totalItems: number;
  errors: Array<{ source: MCPSource; error: string }>;
}

// Credential types
export interface MCPCredentialStatus {
  source: MCPSource;
  status: "connected" | "not_configured" | "no_auth_needed" | "invalid";
  lastValidated?: string;
}

// MCP info for UI
export interface MCPInfo {
  id: MCPSource;
  name: string;
  icon: string;
  description: string;
  requiresAuth: boolean;
  costWarning?: string;
  helpUrl?: string;
}

// Available MCPs configuration
export const MCP_INFO: Record<MCPSource, MCPInfo> = {
  jina: {
    id: "jina",
    name: "Jina.AI",
    icon: "🔍",
    description: "Web search & content reading",
    requiresAuth: true,
    helpUrl: "https://jina.ai/api-key",
  },
  firecrawl: {
    id: "firecrawl",
    name: "Firecrawl",
    icon: "🔥",
    description: "Advanced web scraping",
    requiresAuth: true,
    helpUrl: "https://firecrawl.dev/pricing",
  },
  reddit: {
    id: "reddit",
    name: "Reddit",
    icon: "💬",
    description: "Community insights & discussions",
    requiresAuth: false,
  },
  google_deep_research: {
    id: "google_deep_research",
    name: "Google Deep Research",
    icon: "🧠",
    description: "AI-powered deep research",
    requiresAuth: true,
    costWarning: "$2-5 per query",
    helpUrl: "https://aistudio.google.com",
  },
  vectordb: {
    id: "vectordb",
    name: "VectorDB",
    icon: "📊",
    description: "Internal semantic search",
    requiresAuth: false,
  },
};

// Default MCP selection
export const DEFAULT_MCPS: MCPSource[] = ["jina", "reddit"];

// Maximum MCPs that can be selected
export const MAX_MCP_SELECTION = 4;
```

---

## src/lib/mcp/jina-client.ts

```typescript
/**
 * Jina.AI MCP Client
 *
 * SSE transport client for Jina.AI MCP server.
 * Tools: search_web, read_url, parallel_search_web
 *
 * @see https://github.com/jina-ai/MCP
 */

import type {
  JinaSearchOptions,
  JinaSearchResult,
  JinaReadResult,
  MCPResultItem,
  MCPResult,
} from "./types";

const JINA_MCP_URL = "https://mcp.jina.ai/v1";

interface JinaMCPClientOptions {
  apiKey: string;
  includeTags?: string[];
  excludeTags?: string[];
}

export class JinaMCPClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(options: JinaMCPClientOptions) {
    this.apiKey = options.apiKey;

    // Build URL with tag filters
    const params = new URLSearchParams();
    if (options.includeTags?.length) {
      params.set("include_tags", options.includeTags.join(","));
    }
    if (options.excludeTags?.length) {
      params.set("exclude_tags", options.excludeTags.join(","));
    }

    const queryString = params.toString();
    this.baseUrl = queryString ? `${JINA_MCP_URL}?${queryString}` : JINA_MCP_URL;
  }

  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Call a Jina MCP tool
   */
  private async callTool<T>(
    toolName: string,
    args: Record<string, unknown>
  ): Promise<T> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/call",
        params: {
          name: toolName,
          arguments: args,
        },
        id: Date.now(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Jina MCP error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(`Jina MCP tool error: ${result.error.message}`);
    }

    return result.result as T;
  }

  /**
   * Search the web for a query
   */
  async searchWeb(
    query: string,
    options: JinaSearchOptions = {}
  ): Promise<JinaSearchResult[]> {
    const result = await this.callTool<{ results: JinaSearchResult[] }>(
      "search_web",
      {
        query,
        max_results: options.limit ?? 10,
      }
    );

    return result.results || [];
  }

  /**
   * Read and extract content from a URL
   */
  async readUrl(url: string): Promise<JinaReadResult> {
    const result = await this.callTool<JinaReadResult>("read_url", { url });
    return result;
  }

  /**
   * Perform parallel web searches
   */
  async parallelSearchWeb(
    queries: string[],
    options: JinaSearchOptions = {}
  ): Promise<JinaSearchResult[][]> {
    const result = await this.callTool<{ results: JinaSearchResult[][] }>(
      "parallel_search_web",
      {
        queries,
        max_results_per_query: options.limit ?? 5,
      }
    );

    return result.results || [];
  }
}

/**
 * Fetch research results using Jina MCP
 */
export async function fetchJina(
  query: string,
  apiKey: string,
  options: JinaSearchOptions = {}
): Promise<MCPResult> {
  const startTime = Date.now();

  try {
    const client = new JinaMCPClient({
      apiKey,
      includeTags: ["search", "read"],
    });

    const searchResults = await client.searchWeb(query, {
      limit: options.limit ?? 10,
    });

    const items: MCPResultItem[] = searchResults.map((result, index) => ({
      id: `jina-${Date.now()}-${index}`,
      title: result.title,
      text: result.content,
      url: result.url,
      source: "jina" as const,
      relevanceScore: result.score,
    }));

    return {
      source: "jina",
      success: true,
      items,
      metadata: {
        queriedAt: new Date().toISOString(),
        responseTimeMs: Date.now() - startTime,
      },
    };
  } catch (error) {
    return {
      source: "jina",
      success: false,
      items: [],
      error: error instanceof Error ? error.message : "Unknown error",
      metadata: {
        queriedAt: new Date().toISOString(),
        responseTimeMs: Date.now() - startTime,
      },
    };
  }
}

/**
 * Create a Jina MCP client with default configuration
 */
export function createJinaClient(apiKey?: string): JinaMCPClient | null {
  const key = apiKey || process.env.JINA_API_KEY;
  if (!key) {
    console.warn("Jina API key not provided");
    return null;
  }

  return new JinaMCPClient({
    apiKey: key,
    includeTags: ["search", "read"],
  });
}
```

---

## src/lib/mcp/firecrawl-client.ts

```typescript
/**
 * Firecrawl MCP Client
 *
 * SSE transport client for Firecrawl MCP server.
 * Tools: firecrawl_scrape, firecrawl_search, firecrawl_crawl, firecrawl_extract
 *
 * @see https://docs.firecrawl.dev/mcp-server
 */

import type {
  FirecrawlScrapeOptions,
  FirecrawlSearchOptions,
  FirecrawlCrawlOptions,
  FirecrawlResult,
  MCPResultItem,
  MCPResult,
} from "./types";

const FIRECRAWL_MCP_URL = "https://mcp.firecrawl.dev/v2/mcp";

interface FirecrawlMCPClientOptions {
  apiKey: string;
  retryMaxAttempts?: number;
  retryInitialDelay?: number;
}

export class FirecrawlMCPClient {
  private apiKey: string;
  private retryMaxAttempts: number;
  private retryInitialDelay: number;

  constructor(options: FirecrawlMCPClientOptions) {
    this.apiKey = options.apiKey;
    this.retryMaxAttempts = options.retryMaxAttempts ?? 3;
    this.retryInitialDelay = options.retryInitialDelay ?? 1000;
  }

  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Call a Firecrawl MCP tool with retry logic
   */
  private async callTool<T>(
    toolName: string,
    args: Record<string, unknown>
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.retryMaxAttempts; attempt++) {
      try {
        const response = await fetch(FIRECRAWL_MCP_URL, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "tools/call",
            params: {
              name: toolName,
              arguments: args,
            },
            id: Date.now(),
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Firecrawl MCP error: ${response.status} ${response.statusText}`
          );
        }

        const result = await response.json();

        if (result.error) {
          throw new Error(`Firecrawl MCP tool error: ${result.error.message}`);
        }

        return result.result as T;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < this.retryMaxAttempts - 1) {
          // Exponential backoff
          const delay = this.retryInitialDelay * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error("Unknown error");
  }

  /**
   * Scrape a single URL
   */
  async scrape(
    url: string,
    options: FirecrawlScrapeOptions = {}
  ): Promise<FirecrawlResult> {
    const result = await this.callTool<FirecrawlResult>("firecrawl_scrape", {
      url,
      formats: options.formats ?? ["markdown"],
      onlyMainContent: options.onlyMainContent ?? true,
      includeTags: options.includeTags,
      excludeTags: options.excludeTags,
    });

    return result;
  }

  /**
   * Search the web and scrape results
   */
  async search(
    query: string,
    options: FirecrawlSearchOptions = {}
  ): Promise<FirecrawlResult[]> {
    const result = await this.callTool<{ results: FirecrawlResult[] }>(
      "firecrawl_search",
      {
        query,
        limit: options.limit ?? 10,
        scrapeOptions: options.scrapeOptions ?? { formats: ["markdown"] },
      }
    );

    return result.results || [];
  }

  /**
   * Crawl a website to a specified depth
   */
  async crawl(
    url: string,
    options: FirecrawlCrawlOptions = {}
  ): Promise<FirecrawlResult[]> {
    const result = await this.callTool<{ results: FirecrawlResult[] }>(
      "firecrawl_crawl",
      {
        url,
        maxDepth: options.maxDepth ?? 2,
        limit: options.limit ?? 10,
        includePaths: options.includePaths,
        excludePaths: options.excludePaths,
      }
    );

    return result.results || [];
  }

  /**
   * Batch scrape multiple URLs
   */
  async batchScrape(
    urls: string[],
    options: FirecrawlScrapeOptions = {}
  ): Promise<FirecrawlResult[]> {
    const result = await this.callTool<{ results: FirecrawlResult[] }>(
      "firecrawl_batch_scrape",
      {
        urls,
        formats: options.formats ?? ["markdown"],
        onlyMainContent: options.onlyMainContent ?? true,
      }
    );

    return result.results || [];
  }
}

/**
 * Fetch research results using Firecrawl MCP
 */
export async function fetchFirecrawl(
  query: string,
  apiKey: string,
  options: FirecrawlSearchOptions = {}
): Promise<MCPResult> {
  const startTime = Date.now();

  try {
    const client = new FirecrawlMCPClient({ apiKey });

    const searchResults = await client.search(query, {
      limit: options.limit ?? 10,
    });

    const items: MCPResultItem[] = searchResults.map((result, index) => ({
      id: `firecrawl-${Date.now()}-${index}`,
      title: result.title || result.url,
      text: result.markdown || result.text || "",
      url: result.url,
      source: "firecrawl" as const,
      metadata: result.metadata,
    }));

    return {
      source: "firecrawl",
      success: true,
      items,
      metadata: {
        queriedAt: new Date().toISOString(),
        responseTimeMs: Date.now() - startTime,
      },
    };
  } catch (error) {
    return {
      source: "firecrawl",
      success: false,
      items: [],
      error: error instanceof Error ? error.message : "Unknown error",
      metadata: {
        queriedAt: new Date().toISOString(),
        responseTimeMs: Date.now() - startTime,
      },
    };
  }
}

/**
 * Create a Firecrawl MCP client with default configuration
 */
export function createFirecrawlClient(
  apiKey?: string
): FirecrawlMCPClient | null {
  const key = apiKey || process.env.FIRECRAWL_API_KEY;
  if (!key) {
    console.warn("Firecrawl API key not provided");
    return null;
  }

  return new FirecrawlMCPClient({ apiKey: key });
}
```

---

## src/lib/mcp/reddit-client.ts

```typescript
/**
 * Reddit MCP Client
 *
 * stdio transport client for Reddit MCP server (mcp-server-reddit).
 * NO AUTHENTICATION REQUIRED!
 *
 * Tools:
 * - get_frontpage_posts: Trending posts from homepage
 * - get_subreddit_info: Details about a subreddit
 * - get_subreddit_hot_posts: Hot posts in a subreddit
 * - get_subreddit_new_posts: New posts in a subreddit
 * - get_subreddit_top_posts: Top posts (with time filter)
 * - get_subreddit_rising_posts: Rising posts
 * - get_post_content: Full post with comments
 * - get_post_comments: Just comments from a post
 *
 * @see https://github.com/Hawstein/mcp-server-reddit
 */

import { spawn, type ChildProcess } from "child_process";
import type {
  RedditPost,
  RedditComment,
  RedditSubredditInfo,
  RedditFetchOptions,
  RedditSubredditMapping,
  MCPResultItem,
  MCPResult,
} from "./types";

// Subreddit mappings for different query types
export const SUBREDDIT_MAPPINGS: RedditSubredditMapping[] = [
  {
    category: "tech_ai",
    keywords: [
      "ai",
      "artificial intelligence",
      "machine learning",
      "ml",
      "llm",
      "gpt",
      "claude",
      "agent",
      "neural",
      "deep learning",
    ],
    subreddits: [
      "MachineLearning",
      "artificial",
      "LocalLLaMA",
      "singularity",
      "ChatGPT",
      "ClaudeAI",
    ],
  },
  {
    category: "programming",
    keywords: [
      "programming",
      "coding",
      "developer",
      "software",
      "code",
      "typescript",
      "javascript",
      "python",
      "rust",
    ],
    subreddits: [
      "programming",
      "learnprogramming",
      "webdev",
      "typescript",
      "javascript",
      "Python",
      "rust",
    ],
  },
  {
    category: "marketing",
    keywords: [
      "marketing",
      "social media",
      "content",
      "brand",
      "advertising",
      "seo",
      "growth",
    ],
    subreddits: [
      "marketing",
      "socialmedia",
      "Entrepreneur",
      "smallbusiness",
      "SEO",
      "digital_marketing",
    ],
  },
  {
    category: "business",
    keywords: [
      "business",
      "startup",
      "entrepreneur",
      "company",
      "industry",
      "market",
    ],
    subreddits: [
      "business",
      "startups",
      "Entrepreneur",
      "smallbusiness",
      "investing",
    ],
  },
  {
    category: "technology",
    keywords: [
      "technology",
      "tech",
      "gadget",
      "innovation",
      "future",
      "digital",
    ],
    subreddits: ["technology", "Futurology", "gadgets", "tech"],
  },
];

// Default fallback subreddits
const FALLBACK_SUBREDDITS = ["technology", "news", "todayilearned"];

interface RedditMCPClientOptions {
  timeout?: number;
}

export class RedditMCPClient {
  private timeout: number;
  private process: ChildProcess | null = null;
  private requestId = 0;

  constructor(options: RedditMCPClientOptions = {}) {
    this.timeout = options.timeout ?? 30000;
  }

  /**
   * Call a Reddit MCP tool via stdio
   */
  private async callTool<T>(
    toolName: string,
    args: Record<string, unknown>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Reddit MCP timeout after ${this.timeout}ms`));
      }, this.timeout);

      try {
        // Spawn uvx process for each call (stateless)
        const proc = spawn("uvx", ["mcp-server-reddit"], {
          stdio: ["pipe", "pipe", "pipe"],
        });

        let stdout = "";
        let stderr = "";

        proc.stdout?.on("data", (data) => {
          stdout += data.toString();
        });

        proc.stderr?.on("data", (data) => {
          stderr += data.toString();
        });

        // Send the JSON-RPC request
        const request = JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/call",
          params: {
            name: toolName,
            arguments: args,
          },
          id: ++this.requestId,
        });

        proc.stdin?.write(request + "\n");
        proc.stdin?.end();

        proc.on("close", (code) => {
          clearTimeout(timeoutId);

          if (code !== 0 && !stdout) {
            reject(new Error(`Reddit MCP exited with code ${code}: ${stderr}`));
            return;
          }

          try {
            // Parse the last complete JSON response
            const lines = stdout.trim().split("\n");
            const lastLine = lines[lines.length - 1];
            const result = JSON.parse(lastLine);

            if (result.error) {
              reject(new Error(`Reddit MCP error: ${result.error.message}`));
              return;
            }

            resolve(result.result as T);
          } catch {
            reject(new Error(`Failed to parse Reddit MCP response: ${stdout}`));
          }
        });

        proc.on("error", (error) => {
          clearTimeout(timeoutId);
          reject(
            new Error(`Reddit MCP process error: ${error.message}. Make sure uvx is installed.`)
          );
        });
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  /**
   * Get trending posts from Reddit frontpage
   */
  async getFrontpagePosts(limit = 25): Promise<RedditPost[]> {
    const result = await this.callTool<{ posts: RedditPost[] }>(
      "get_frontpage_posts",
      { limit }
    );
    return result.posts || [];
  }

  /**
   * Get information about a subreddit
   */
  async getSubredditInfo(subreddit: string): Promise<RedditSubredditInfo> {
    return this.callTool<RedditSubredditInfo>("get_subreddit_info", {
      subreddit,
    });
  }

  /**
   * Get hot posts from a subreddit
   */
  async getSubredditHotPosts(
    subreddit: string,
    limit = 25
  ): Promise<RedditPost[]> {
    const result = await this.callTool<{ posts: RedditPost[] }>(
      "get_subreddit_hot_posts",
      { subreddit, limit }
    );
    return result.posts || [];
  }

  /**
   * Get new posts from a subreddit
   */
  async getSubredditNewPosts(
    subreddit: string,
    limit = 25
  ): Promise<RedditPost[]> {
    const result = await this.callTool<{ posts: RedditPost[] }>(
      "get_subreddit_new_posts",
      { subreddit, limit }
    );
    return result.posts || [];
  }

  /**
   * Get top posts from a subreddit with time filter
   */
  async getSubredditTopPosts(
    subreddit: string,
    timeFilter: "hour" | "day" | "week" | "month" | "year" | "all" = "month",
    limit = 25
  ): Promise<RedditPost[]> {
    const result = await this.callTool<{ posts: RedditPost[] }>(
      "get_subreddit_top_posts",
      { subreddit, time_filter: timeFilter, limit }
    );
    return result.posts || [];
  }

  /**
   * Get rising posts from a subreddit
   */
  async getSubredditRisingPosts(
    subreddit: string,
    limit = 25
  ): Promise<RedditPost[]> {
    const result = await this.callTool<{ posts: RedditPost[] }>(
      "get_subreddit_rising_posts",
      { subreddit, limit }
    );
    return result.posts || [];
  }

  /**
   * Get full post content with comments
   */
  async getPostContent(
    postId: string,
    commentDepth = 3
  ): Promise<{ post: RedditPost; comments: RedditComment[] }> {
    return this.callTool<{ post: RedditPost; comments: RedditComment[] }>(
      "get_post_content",
      { post_id: postId, comment_depth: commentDepth }
    );
  }

  /**
   * Get comments from a post
   */
  async getPostComments(
    postId: string,
    limit = 50,
    depth = 3
  ): Promise<RedditComment[]> {
    const result = await this.callTool<{ comments: RedditComment[] }>(
      "get_post_comments",
      { post_id: postId, limit, comment_depth: depth }
    );
    return result.comments || [];
  }
}

/**
 * Identify relevant subreddits for a query
 */
export function identifySubreddits(query: string): string[] {
  const queryLower = query.toLowerCase();
  const matchedSubreddits = new Set<string>();

  // Check each mapping for keyword matches
  for (const mapping of SUBREDDIT_MAPPINGS) {
    const hasMatch = mapping.keywords.some((keyword) =>
      queryLower.includes(keyword.toLowerCase())
    );

    if (hasMatch) {
      mapping.subreddits.forEach((sub) => matchedSubreddits.add(sub));
    }
  }

  // If no matches, use fallback
  if (matchedSubreddits.size === 0) {
    FALLBACK_SUBREDDITS.forEach((sub) => matchedSubreddits.add(sub));
  }

  // Limit to top 5 subreddits
  return Array.from(matchedSubreddits).slice(0, 5);
}

/**
 * Flatten nested comments into a list
 */
function flattenComments(
  comments: RedditComment[],
  maxDepth = 3
): RedditComment[] {
  const result: RedditComment[] = [];

  function traverse(comment: RedditComment, currentDepth: number) {
    if (currentDepth > maxDepth) return;

    result.push(comment);

    if (comment.replies) {
      for (const reply of comment.replies) {
        traverse(reply, currentDepth + 1);
      }
    }
  }

  for (const comment of comments) {
    traverse(comment, 1);
  }

  return result;
}

/**
 * Fetch research results using Reddit MCP
 */
export async function fetchReddit(
  query: string,
  options: RedditFetchOptions = {}
): Promise<MCPResult> {
  const startTime = Date.now();

  try {
    const client = new RedditMCPClient();

    // Step 1: Identify relevant subreddits
    const subreddits = options.subreddits || identifySubreddits(query);
    const limit = options.limit ?? 10;
    const timeFilter = options.timeFilter ?? "month";
    const commentDepth = options.commentDepth ?? 3;
    const commentLimit = options.commentLimit ?? 20;

    // Step 2: Fetch posts from each subreddit in parallel
    const subredditResults = await Promise.allSettled(
      subreddits.map((sub) =>
        client.getSubredditTopPosts(sub, timeFilter, limit)
      )
    );

    // Collect all posts
    const allPosts: RedditPost[] = [];
    for (const result of subredditResults) {
      if (result.status === "fulfilled") {
        allPosts.push(...result.value);
      }
    }

    // Step 3: Sort by score and select top posts
    const topPosts = allPosts
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Step 4: Fetch comments for top posts
    const postsWithComments: Array<{
      post: RedditPost;
      comments: RedditComment[];
    }> = [];

    const commentResults = await Promise.allSettled(
      topPosts.map((post) =>
        client.getPostComments(post.id, commentLimit, commentDepth)
      )
    );

    for (let i = 0; i < topPosts.length; i++) {
      const commentResult = commentResults[i];
      postsWithComments.push({
        post: topPosts[i],
        comments:
          commentResult.status === "fulfilled" ? commentResult.value : [],
      });
    }

    // Step 5: Convert to MCPResultItems
    const items: MCPResultItem[] = [];

    for (const { post, comments } of postsWithComments) {
      // Add the post
      items.push({
        id: `reddit-post-${post.id}`,
        title: post.title,
        text: `${post.selftext}\n\n[${post.score} upvotes, ${post.numComments} comments on r/${post.subreddit}]`,
        url: `https://reddit.com${post.permalink}`,
        source: "reddit",
        relevanceScore: post.score / 1000, // Normalize
        metadata: {
          type: "post",
          subreddit: post.subreddit,
          author: post.author,
          score: post.score,
          numComments: post.numComments,
          awards: post.awards,
          createdUtc: post.createdUtc,
        },
      });

      // Add top comments
      const flatComments = flattenComments(comments, commentDepth);
      const topComments = flatComments
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      for (const comment of topComments) {
        items.push({
          id: `reddit-comment-${comment.id}`,
          title: `Comment on: ${post.title}`,
          text: `${comment.body}\n\n[${comment.score} upvotes by u/${comment.author}]`,
          url: `https://reddit.com${post.permalink}`,
          source: "reddit",
          relevanceScore: comment.score / 500, // Normalize
          metadata: {
            type: "comment",
            postId: post.id,
            postTitle: post.title,
            subreddit: post.subreddit,
            author: comment.author,
            score: comment.score,
            depth: comment.depth,
            createdUtc: comment.createdUtc,
          },
        });
      }
    }

    return {
      source: "reddit",
      success: true,
      items,
      metadata: {
        queriedAt: new Date().toISOString(),
        responseTimeMs: Date.now() - startTime,
      },
    };
  } catch (error) {
    return {
      source: "reddit",
      success: false,
      items: [],
      error: error instanceof Error ? error.message : "Unknown error",
      metadata: {
        queriedAt: new Date().toISOString(),
        responseTimeMs: Date.now() - startTime,
      },
    };
  }
}

/**
 * Create a Reddit MCP client
 * Note: No credentials needed!
 */
export function createRedditClient(): RedditMCPClient {
  return new RedditMCPClient();
}
```

---

## src/lib/mcp/google-deep-research.ts

```typescript
/**
 * Google Deep Research Wrapper
 *
 * Custom wrapper for Google's Interactions API (Deep Research Agent).
 * NOT an MCP - uses polling pattern for async results.
 *
 * Cost: ~$2-5 per complex query
 * Agent: deep-research-pro-preview-12-2025
 *
 * @see https://ai.google.dev/gemini-api/docs/deep-research
 */

import type {
  GoogleDeepResearchOptions,
  GoogleDeepResearchResult,
  MCPResultItem,
  MCPResult,
} from "./types";

const GOOGLE_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const DEEP_RESEARCH_AGENT = "deep-research-pro-preview-12-2025";

interface InteractionResponse {
  name: string;
  done: boolean;
  error?: {
    code: number;
    message: string;
  };
  result?: {
    output: string;
    groundingChunks?: Array<{
      web?: {
        uri: string;
        title: string;
      };
    }>;
    groundingSupports?: Array<{
      segment: {
        startIndex: number;
        endIndex: number;
        text: string;
      };
      groundingChunkIndices: number[];
    }>;
    metadata?: {
      totalTokenCount: number;
    };
  };
}

interface GoogleDeepResearchClientOptions {
  apiKey: string;
}

export class GoogleDeepResearchClient {
  private apiKey: string;

  constructor(options: GoogleDeepResearchClientOptions) {
    this.apiKey = options.apiKey;
  }

  private getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "x-goog-api-key": this.apiKey,
    };
  }

  /**
   * Start a deep research interaction
   */
  private async createInteraction(query: string): Promise<string> {
    const response = await fetch(
      `${GOOGLE_API_BASE}/models/${DEEP_RESEARCH_AGENT}:generateContent`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: query }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
          tools: [
            {
              googleSearch: {},
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google API error: ${response.status} - ${error}`);
    }

    const result = await response.json();

    // For sync response, return the name/id for polling
    if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
      // Immediate response - no polling needed
      return `sync:${JSON.stringify(result)}`;
    }

    // For async, get the operation name
    return result.name || `sync:${JSON.stringify(result)}`;
  }

  /**
   * Poll for interaction completion
   */
  private async pollInteraction(
    operationName: string,
    options: GoogleDeepResearchOptions
  ): Promise<InteractionResponse> {
    // Handle sync responses
    if (operationName.startsWith("sync:")) {
      const result = JSON.parse(operationName.substring(5));
      return {
        name: "sync",
        done: true,
        result: {
          output:
            result.candidates?.[0]?.content?.parts?.[0]?.text || "No response",
          groundingChunks: result.candidates?.[0]?.groundingMetadata?.groundingChunks,
          metadata: {
            totalTokenCount: result.usageMetadata?.totalTokenCount || 0,
          },
        },
      };
    }

    const maxAttempts = options.maxPollingAttempts ?? 60;
    const intervalMs = options.pollingIntervalMs ?? 5000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await fetch(
        `${GOOGLE_API_BASE}/${operationName}`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Polling error: ${response.status}`);
      }

      const result: InteractionResponse = await response.json();

      if (result.done) {
        if (result.error) {
          throw new Error(
            `Deep Research error: ${result.error.code} - ${result.error.message}`
          );
        }
        return result;
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error(
      `Deep Research timed out after ${maxAttempts * intervalMs}ms`
    );
  }

  /**
   * Execute a deep research query
   */
  async research(
    query: string,
    options: GoogleDeepResearchOptions = {}
  ): Promise<GoogleDeepResearchResult> {
    const startedAt = new Date().toISOString();

    // Start the interaction
    const operationName = await this.createInteraction(query);

    // Poll for results
    const result = await this.pollInteraction(operationName, options);

    // Extract sources from grounding chunks
    const sources: GoogleDeepResearchResult["sources"] = [];
    if (result.result?.groundingChunks) {
      for (const chunk of result.result.groundingChunks) {
        if (chunk.web) {
          sources.push({
            url: chunk.web.uri,
            title: chunk.web.title,
          });
        }
      }
    }

    // Estimate cost based on tokens (~$0.0001 per token for research)
    const tokensUsed = result.result?.metadata?.totalTokenCount || 0;
    const costEstimate = tokensUsed * 0.0001;

    return {
      query,
      report: result.result?.output || "",
      sources,
      metadata: {
        startedAt,
        completedAt: new Date().toISOString(),
        costEstimate: Math.max(costEstimate, 2), // Minimum $2
        tokensUsed,
      },
    };
  }
}

/**
 * Fetch research results using Google Deep Research
 */
export async function fetchGoogleDeepResearch(
  query: string,
  apiKey: string,
  options: GoogleDeepResearchOptions = {}
): Promise<MCPResult> {
  const startTime = Date.now();

  try {
    const client = new GoogleDeepResearchClient({ apiKey });
    const result = await client.research(query, options);

    // Convert report to MCPResultItems
    const items: MCPResultItem[] = [];

    // Add the main report as a single item
    items.push({
      id: `google-dr-report-${Date.now()}`,
      title: `Deep Research: ${query.substring(0, 50)}...`,
      text: result.report,
      source: "google_deep_research",
      metadata: {
        type: "report",
        costEstimate: result.metadata.costEstimate,
        tokensUsed: result.metadata.tokensUsed,
      },
    });

    // Add sources as separate items
    for (const source of result.sources) {
      items.push({
        id: `google-dr-source-${Date.now()}-${items.length}`,
        title: source.title,
        text: source.excerpt || `Source from: ${source.url}`,
        url: source.url,
        source: "google_deep_research",
        metadata: {
          type: "source",
        },
      });
    }

    return {
      source: "google_deep_research",
      success: true,
      items,
      metadata: {
        queriedAt: new Date().toISOString(),
        responseTimeMs: Date.now() - startTime,
        cost: result.metadata.costEstimate,
      },
    };
  } catch (error) {
    return {
      source: "google_deep_research",
      success: false,
      items: [],
      error: error instanceof Error ? error.message : "Unknown error",
      metadata: {
        queriedAt: new Date().toISOString(),
        responseTimeMs: Date.now() - startTime,
      },
    };
  }
}

/**
 * Create a Google Deep Research client
 */
export function createGoogleDeepResearchClient(
  apiKey?: string
): GoogleDeepResearchClient | null {
  const key = apiKey || process.env.GOOGLE_AI_API_KEY;
  if (!key) {
    console.warn("Google AI API key not provided");
    return null;
  }

  return new GoogleDeepResearchClient({ apiKey: key });
}

/**
 * Check if Google Deep Research is configured
 */
export function isGoogleDeepResearchConfigured(): boolean {
  return !!process.env.GOOGLE_AI_API_KEY;
}
```

---

## src/lib/mcp/mcp-router.ts

```typescript
/**
 * MCP Router
 *
 * Routes queries to selected MCPs and aggregates results.
 * Supports parallel execution with Promise.allSettled.
 */

import type {
  MCPSource,
  MCPResult,
  MCPResultItem,
  MCPRouterOptions,
  MCPRouterResult,
} from "./types";
import { fetchJina } from "./jina-client";
import { fetchFirecrawl } from "./firecrawl-client";
import { fetchReddit } from "./reddit-client";
import { fetchGoogleDeepResearch } from "./google-deep-research";

/**
 * Route a query to selected MCPs and aggregate results
 */
export async function routeToMCPs(
  options: MCPRouterOptions
): Promise<MCPRouterResult> {
  const { selectedSources, query, credentials = {} } = options;

  // Filter out vectordb - it's handled separately
  const mcpsToQuery = selectedSources.filter((s) => s !== "vectordb");

  // Create fetch promises for each selected MCP
  const fetchPromises: Array<Promise<MCPResult>> = [];
  const sourceOrder: MCPSource[] = [];

  for (const source of mcpsToQuery) {
    switch (source) {
      case "jina": {
        const apiKey = credentials.jina || process.env.JINA_API_KEY;
        if (apiKey) {
          fetchPromises.push(fetchJina(query, apiKey));
          sourceOrder.push("jina");
        }
        break;
      }
      case "firecrawl": {
        const apiKey = credentials.firecrawl || process.env.FIRECRAWL_API_KEY;
        if (apiKey) {
          fetchPromises.push(fetchFirecrawl(query, apiKey));
          sourceOrder.push("firecrawl");
        }
        break;
      }
      case "reddit": {
        // Reddit doesn't need credentials
        fetchPromises.push(fetchReddit(query));
        sourceOrder.push("reddit");
        break;
      }
      case "google_deep_research": {
        const apiKey =
          credentials.google_deep_research || process.env.GOOGLE_AI_API_KEY;
        if (apiKey) {
          fetchPromises.push(fetchGoogleDeepResearch(query, apiKey));
          sourceOrder.push("google_deep_research");
        }
        break;
      }
    }
  }

  // Execute all fetches in parallel
  const settledResults = await Promise.allSettled(fetchPromises);

  // Process results
  const results: Record<MCPSource, MCPResult> = {} as Record<
    MCPSource,
    MCPResult
  >;
  const errors: Array<{ source: MCPSource; error: string }> = [];
  const aggregatedItems: MCPResultItem[] = [];

  for (let i = 0; i < settledResults.length; i++) {
    const source = sourceOrder[i];
    const settled = settledResults[i];

    if (settled.status === "fulfilled") {
      results[source] = settled.value;

      if (settled.value.success) {
        aggregatedItems.push(...settled.value.items);
      } else if (settled.value.error) {
        errors.push({ source, error: settled.value.error });
      }
    } else {
      const errorMsg =
        settled.reason instanceof Error
          ? settled.reason.message
          : String(settled.reason);

      results[source] = {
        source,
        success: false,
        items: [],
        error: errorMsg,
        metadata: {
          queriedAt: new Date().toISOString(),
          responseTimeMs: 0,
        },
      };

      errors.push({ source, error: errorMsg });
    }
  }

  // Apply source diversity bonus for ranking
  const itemsWithBonus = applySourceDiversityBonus(aggregatedItems);

  // Sort by relevance score (higher is better)
  itemsWithBonus.sort(
    (a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0)
  );

  return {
    results,
    aggregatedItems: itemsWithBonus,
    sourcesQueried: sourceOrder,
    totalItems: aggregatedItems.length,
    errors,
  };
}

/**
 * Apply source diversity bonus to items
 * Items from multiple sources get higher ranking
 */
function applySourceDiversityBonus(items: MCPResultItem[]): MCPResultItem[] {
  // Count sources
  const sourceCounts = new Map<MCPSource, number>();
  for (const item of items) {
    sourceCounts.set(item.source, (sourceCounts.get(item.source) || 0) + 1);
  }

  const numSources = sourceCounts.size;

  // Apply bonus based on source diversity
  return items.map((item) => {
    let bonus = 0;

    // Bonus for having multiple sources
    if (numSources >= 2) bonus += 0.1;
    if (numSources >= 3) bonus += 0.1;
    if (numSources >= 4) bonus += 0.1;

    // Penalty for sources with too many items (normalize)
    const sourceCount = sourceCounts.get(item.source) || 1;
    if (sourceCount > 20) {
      bonus -= 0.05;
    }

    return {
      ...item,
      relevanceScore: (item.relevanceScore ?? 0.5) + bonus,
    };
  });
}

/**
 * Check which MCPs are available (have credentials configured)
 */
export function getAvailableMCPs(
  credentials?: Record<MCPSource, string>
): MCPSource[] {
  const available: MCPSource[] = [];

  // Reddit is always available (no auth needed)
  available.push("reddit");

  // Check Jina
  if (credentials?.jina || process.env.JINA_API_KEY) {
    available.push("jina");
  }

  // Check Firecrawl
  if (credentials?.firecrawl || process.env.FIRECRAWL_API_KEY) {
    available.push("firecrawl");
  }

  // Check Google Deep Research
  if (credentials?.google_deep_research || process.env.GOOGLE_AI_API_KEY) {
    available.push("google_deep_research");
  }

  // VectorDB is always available
  available.push("vectordb");

  return available;
}

/**
 * Validate MCP selection
 */
export function validateMCPSelection(
  selected: MCPSource[],
  available: MCPSource[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (selected.length === 0) {
    errors.push("At least one MCP must be selected");
  }

  if (selected.length > 4) {
    errors.push("Maximum 4 MCPs can be selected");
  }

  for (const mcp of selected) {
    if (!available.includes(mcp) && mcp !== "reddit") {
      errors.push(`${mcp} is not configured. Add API key in Settings.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

---

## src/lib/mcp/index.ts

```typescript
/**
 * MCP (Model Context Protocol) Module
 *
 * Exports all MCP clients, types, and utilities.
 */

// Types
export * from "./types";

// Clients
export { JinaMCPClient, fetchJina, createJinaClient } from "./jina-client";

export {
  FirecrawlMCPClient,
  fetchFirecrawl,
  createFirecrawlClient,
} from "./firecrawl-client";

export {
  RedditMCPClient,
  fetchReddit,
  createRedditClient,
  identifySubreddits,
  SUBREDDIT_MAPPINGS,
} from "./reddit-client";

export {
  GoogleDeepResearchClient,
  fetchGoogleDeepResearch,
  createGoogleDeepResearchClient,
  isGoogleDeepResearchConfigured,
} from "./google-deep-research";

// Router
export {
  routeToMCPs,
  getAvailableMCPs,
  validateMCPSelection,
} from "./mcp-router";
```

---

## src/lib/credentials.ts

```typescript
/**
 * Credential Encryption Utilities
 *
 * Provides secure encryption/decryption for API keys and other credentials.
 * Uses AES-256-CBC with random IV for each encryption.
 */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

/**
 * Get the encryption key from environment
 * Key must be 32 bytes (256 bits) in hex format (64 characters)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.CREDENTIALS_ENCRYPTION_KEY;

  if (!key) {
    throw new Error(
      "CREDENTIALS_ENCRYPTION_KEY environment variable is not set. " +
        "Generate a 32-byte key with: openssl rand -hex 32"
    );
  }

  if (key.length !== 64) {
    throw new Error(
      "CREDENTIALS_ENCRYPTION_KEY must be 64 hex characters (32 bytes). " +
        "Generate with: openssl rand -hex 32"
    );
  }

  return Buffer.from(key, "hex");
}

/**
 * Encrypt a credential value
 *
 * @param value - The plaintext credential to encrypt
 * @returns Encrypted string in format: iv:encryptedData (both hex encoded)
 */
export function encryptCredential(value: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(value, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt an encrypted credential
 *
 * @param encrypted - The encrypted string in format: iv:encryptedData
 * @returns The original plaintext credential
 */
export function decryptCredential(encrypted: string): string {
  const key = getEncryptionKey();

  const parts = encrypted.split(":");
  if (parts.length !== 2) {
    throw new Error("Invalid encrypted credential format");
  }

  const [ivHex, data] = parts;
  const iv = Buffer.from(ivHex, "hex");

  if (iv.length !== IV_LENGTH) {
    throw new Error("Invalid IV length in encrypted credential");
  }

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(data, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Mask a credential for display (show first 4 and last 4 characters)
 *
 * @param value - The plaintext credential
 * @returns Masked string like "abc1****xyz9"
 */
export function maskCredential(value: string): string {
  if (!value || value.length < 8) {
    return "****";
  }

  const first = value.substring(0, 4);
  const last = value.substring(value.length - 4);
  const middle = "*".repeat(Math.min(value.length - 8, 20));

  return `${first}${middle}${last}`;
}

/**
 * Validate that a credential looks like an API key
 *
 * @param value - The credential to validate
 * @param minLength - Minimum required length (default 20)
 * @returns true if valid format
 */
export function isValidCredentialFormat(
  value: string,
  minLength = 20
): boolean {
  if (!value || typeof value !== "string") {
    return false;
  }

  // Trim whitespace
  const trimmed = value.trim();

  // Check minimum length
  if (trimmed.length < minLength) {
    return false;
  }

  // Check for common invalid patterns
  if (
    trimmed.includes(" ") ||
    trimmed === "your_api_key" ||
    trimmed === "your-api-key" ||
    trimmed.startsWith("YOUR_") ||
    trimmed.includes("<") ||
    trimmed.includes(">")
  ) {
    return false;
  }

  return true;
}

/**
 * Generate a random encryption key
 * Use this to generate a new CREDENTIALS_ENCRYPTION_KEY
 */
export function generateEncryptionKey(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Service-specific credential validators
 */
export const credentialValidators: Record<
  string,
  (value: string) => { valid: boolean; error?: string }
> = {
  jina: (value) => {
    if (!isValidCredentialFormat(value)) {
      return { valid: false, error: "Invalid API key format" };
    }
    // Jina keys often start with specific prefixes
    return { valid: true };
  },

  firecrawl: (value) => {
    if (!isValidCredentialFormat(value)) {
      return { valid: false, error: "Invalid API key format" };
    }
    return { valid: true };
  },

  google_ai: (value) => {
    if (!isValidCredentialFormat(value, 30)) {
      return { valid: false, error: "Google AI API key should be at least 30 characters" };
    }
    return { valid: true };
  },

  canva: (value) => {
    if (!isValidCredentialFormat(value)) {
      return { valid: false, error: "Invalid Canva API key format" };
    }
    return { valid: true };
  },

  shopify: (value) => {
    if (!isValidCredentialFormat(value)) {
      return { valid: false, error: "Invalid Shopify API key format" };
    }
    return { valid: true };
  },
};

/**
 * Validate a credential for a specific service
 */
export function validateCredential(
  service: string,
  value: string
): { valid: boolean; error?: string } {
  const validator = credentialValidators[service];

  if (!validator) {
    // Default validation
    if (!isValidCredentialFormat(value)) {
      return { valid: false, error: "Invalid credential format" };
    }
    return { valid: true };
  }

  return validator(value);
}
```

---

## Prisma Schema Changes (Task 20)

Add these models to `prisma/schema.prisma`:

```prisma
// User preferences for research and MCP configuration
model UserPreferences {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  userId          String    @unique

  // MCP Research Tool Preferences
  defaultMCPs     String[]  @default(["jina", "reddit"])
  mcpPriority     String[]  @default(["jina", "firecrawl", "reddit", "google_deep_research"])

  // Research defaults
  defaultDepth    Int       @default(3)
  defaultBreadth  Int       @default(3)

  // UI preferences
  showAdvancedOptions Boolean @default(false)

  // Relations
  apiCredentials  APICredential[]

  @@index([userId])
}

// Encrypted API credentials for external services
model APICredential {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  userPrefsId     String
  userPrefs       UserPreferences @relation(fields: [userPrefsId], references: [id], onDelete: Cascade)

  service         String    // 'jina', 'firecrawl', 'google_ai', 'canva', 'shopify', etc.
  credentialType  String    @default("api_key") // 'api_key', 'oauth_token', 'password'
  encryptedValue  String    // Encrypted with AES-256-CBC
  isValid         Boolean   @default(false)
  lastValidated   DateTime?

  @@unique([userPrefsId, service])
  @@index([service])
}
```

Also add these fields to the existing `ResearchJob` model:

```prisma
model ResearchJob {
  // ... existing fields ...

  // MCP tracking
  mcpsUsed    String[]  @default([])
  mcpResults  Json?     // Per-MCP results for comparison and fact-checking
}
```

---

## Environment Variables

Add to `.env` and `.env.example`:

```bash
# MCP Research Sources
JINA_API_KEY=your_jina_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Reddit MCP - NO KEY NEEDED!

# Credential Encryption (required for storing user API keys)
# Generate with: openssl rand -hex 32
CREDENTIALS_ENCRYPTION_KEY=your_32_byte_hex_key
```

---

## Usage Notes

### Reddit MCP - No Credentials Required!

Reddit MCP uses the public Reddit API via `uvx mcp-server-reddit`. No API keys needed. Install `uvx` (from uv package manager) in your environment.

### Google Deep Research Costs

Google Deep Research costs ~$2-5 per complex query. The UI should warn users before using this source.

### MCP Selection Limits

- Minimum: 1 MCP
- Maximum: 4 MCPs (parallel)
- VectorDB is always active for internal semantic search

### Task Dependencies

- Task 16 (MCP Infrastructure) - No dependencies, can start first
- Task 20 (Database Models) - Depends on Task 16 for types
- Task 19 (Update gather-context) - Depends on Tasks 16, 18
- Task 21-23 (UI Components) - Depend on Task 20

---

## Plan File Reference

See `~/.claude/plans/refactored-cuddling-wand.md` for the complete upgrade plan including:
- Architecture diagrams
- Settings Panel UI mockups
- Task dependencies
- Verification plan
