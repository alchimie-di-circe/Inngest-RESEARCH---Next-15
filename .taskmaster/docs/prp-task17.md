# PRP: Task 17 - Implement Reddit MCP Integration with Workflow

## Goal
Implement a sophisticated, research-oriented Reddit integration using the `mcp-server-reddit` tool. This integration will serve as a specialized "Community Intelligence" provider within the broader Deep Research pipeline, capable of extracting trends, sentiment, and authentic user discussions from relevant subreddits based on dynamic query analysis.

**Target Output:**
- A robust `fetchReddit(query)` workflow in `src/lib/mcp/reddit-workflow.ts`.
- Intelligent subreddit mapping logic (Keyword -> Subreddit).
- Parallel fetching capabilities for multi-subreddit research.
- Deep comment traversal for "thick" context.
- Integration with the `MCPRouter` defined in Task 16.

## Why
- **Authentic Insight**: Reddit provides unfiltered user opinions often missing from SEO-optimized web articles.
- **Trend Detection**: High-velocity comment threads signal emerging topics before they hit mainstream news.
- **Problem Discovery**: "Complaint" threads in niche subreddits are goldmines for product research (context for Phase 2).
- **Zero-Cost Intelligence**: The Reddit MCP via `uvx` requires no API credentials for public read-only access, lowering barrier to entry.

## What
- **Workflow Engine**: A dedicated module (`reddit-workflow.ts`) to orchestrate the fetch process.
- **Subreddit Discovery**: Logic to map a broad query (e.g., "AI agents") to specific high-signal communities (e.g., `r/LocalLLaMA`, `r/ArtificialInteligence`).
- **Data Normalization**: Transforming raw Reddit JSON (posts, comments, upvotes) into the standardized `ContextItem` format used by the Research Agent.
- **Realtime Feedback**: Specific events/topics for Reddit progress (e.g., "Scanning r/LocalLLaMA...", "Found 15 relevant threads").

### Success Criteria
- [ ] `fetchReddit("AI agents")` automatically identifies relevant subreddits (e.g., `r/LocalLLaMA`, `r/openai`).
- [ ] Workflow fetches top posts from multiple subreddits in parallel.
- [ ] Workflow extracts top comments for the most relevant posts.
- [ ] Results are returned as `ContextItem[]` with metadata (upvotes, subreddit, author).
- [ ] Error handling robustly manages timeouts or empty results (common with `stdio` transport).
- [ ] Integration test confirms data flow from Reddit MCP -> Workflow -> Router.

---

## All Needed Context

### Documentation & References
```yaml
# Reddit MCP Server
- url: https://github.com/Hawstein/mcp-server-reddit
  why: "Reference implementation for the underlying MCP server."
  critical: "Tools available: get_frontpage_posts, get_subreddit_hot_posts, get_post_comments."

# Python Asyncio Scraping Patterns
- doc: "Web Search Results (asyncio scraping)"
  why: "Best practices for concurrency. Although we use MCP, the *workflow* orchestrating the MCP calls should use Promise.all for parallelism similar to async python patterns."

# Reddit Algorithm
- doc: "Web Search Results (Reddit Algorithm)"
  why: "Understanding ranking: Upvotes + Comment Velocity = Trend. We should prioritize posts with high comment counts for 'research' value."

# Project Context
- file: src/lib/mcp/types.ts
  why: "ContextItem definition and MCP interfaces."
  
- file: src/lib/mcp/client-factory.ts
  why: "How to instantiate the Reddit client."
```

### Current Codebase Structure (Relevant)
```bash
src/
└── lib/
    └── mcp/
        ├── types.ts              # Defined in Task 16
        ├── clients/
        │   └── reddit.ts         # Basic wrapper (Task 16 output)
        └── index.ts
```

### Desired Structure Additions
```bash
src/
└── lib/
    └── mcp/
        └── workflows/
            └── reddit.ts         # The complex workflow logic (this task)
```

### Known Gotchas
- **Stdio Latency**: Spawning `uvx` for every single call can be slow.
    - *Mitigation*: The `RedditClient` class (Task 16) should maintain a persistent connection if possible, or we batch requests.
- **Rate Limiting**: Even without API keys, Reddit IPs can be rate-limited.
    - *Mitigation*: Add slight delays or jitter between sub-requests if we see failures.
- **Noise**: Reddit has lots of low-quality posts.
    - *Mitigation*: Filter by `num_comments > 5` and `score > 10`.
- **Comment Tree Depth**: fetching *all* comments is too slow.
    - *Mitigation*: Fetch only top-level comments or depth=2 max.

---

## Implementation Blueprint

### 1. Subreddit Mapping Logic
Create a static or dynamic mapper. For Phase 2, a robust static map is sufficient and reliable.

```typescript
// src/lib/mcp/workflows/reddit-mapping.ts

export const SUBREDDIT_MAP: Record<string, string[]> = {
  'tech': ['technology', 'gadgets', 'hardware'],
  'ai': ['artificial', 'machinelearning', 'localllama', 'singularity', 'openai'],
  'marketing': ['marketing', 'socialmedia', 'entrepreneur', 'saas'],
  'business': ['business', 'startups', 'smallbusiness', 'economics'],
  'coding': ['programming', 'webdev', 'reactjs', 'javascript', 'python'],
  // ... add more categories
};

export function identifySubreddits(query: string): string[] {
  const normalized = query.toLowerCase();
  const matches = new Set<string>();
  
  // Keyword matching
  Object.entries(SUBREDDIT_MAP).forEach(([category, subs]) => {
    if (normalized.includes(category)) {
      subs.forEach(s => matches.add(s));
    }
  });
  
  // Default fallback
  if (matches.size === 0) return ['all', 'technology', 'news'];
  
  return Array.from(matches).slice(0, 5); // Limit to top 5
}
```

### 2. The Fetch Workflow
Orchestrate the calls to the `RedditClient`.

```typescript
// src/lib/mcp/workflows/reddit.ts
import { redditClient } from '../index'; // From barrel
import { identifySubreddits } from './reddit-mapping';
import { ContextItem } from '../types';

export async function fetchRedditResearch(query: string): Promise<ContextItem[]> {
  // 1. Identify targets
  const subreddits = identifySubreddits(query);
  console.log(`[Reddit] Targeting: ${subreddits.join(', ')}`);

  // 2. Parallel Fetch (Posts)
  const postPromises = subreddits.map(sub => 
    redditClient.getSubredditHot(sub, { limit: 5 }) // Get top 5 hot posts
      .catch(e => {
        console.warn(`[Reddit] Failed to fetch r/${sub}:`, e);
        return [];
      })
  );
  
  const postsResults = await Promise.all(postPromises);
  const allPosts = postsResults.flat();

  // 3. Filter High-Signal Posts
  const topPosts = allPosts
    .sort((a, b) => b.score - a.score) // Sort by upvotes
    .filter(p => p.num_comments > 5)   // Must have discussion
    .slice(0, 10);                     // Top 10 global

  // 4. Fetch Comments (Deep Context) for top 3 posts only (save time)
  const commentPromises = topPosts.slice(0, 3).map(post => 
    redditClient.getPostComments(post.id, { limit: 10 })
      .then(comments => ({ ...post, comments }))
      .catch(() => post)
  );
  
  const enrichedPosts = await Promise.all(commentPromises);

  // 5. Normalize
  return enrichedPosts.map(post => ({
    source: 'reddit',
    url: `https://reddit.com${post.permalink}`,
    title: post.title,
    content: `
      Subreddit: r/${post.subreddit}
      Score: ${post.score}
      Comments: ${post.num_comments}
      
      ${post.selftext || '(Link Post)'}
      
      --- TOP COMMENTS ---
      ${(post.comments || []).map((c: any) => `- [${c.score}] ${c.body}`).join('
')}
    `.trim(),
    metadata: {
      subreddit: post.subreddit,
      author: post.author,
      score: post.score
    }
  }));
}
```

### 3. Realtime Updates (Optional but Recommended)
If `inngest` context is passed, we can emit events.
*(For this Task 17, we focus on the logic. Integration into Inngest happens in Task 19/24).*

---

## Validation Loop

### Level 1: Static Analysis
```bash
npx tsc --noEmit
```

### Level 2: Unit Tests (Logic)
Create `tests/unit/mcp/reddit-mapping.test.ts`:
```typescript
import { identifySubreddits } from '@/lib/mcp/workflows/reddit-mapping';

test('maps "ai agents" to ai subreddits', () => {
  const subs = identifySubreddits("building ai agents");
  expect(subs).toContain('localllama');
  expect(subs).toContain('artificial');
});
```

### Level 3: Integration Tests (Live Stdio)
Create `tests/integration/mcp/reddit-workflow.test.ts`.
*Note: This requires `uvx` installed in the environment.*
```typescript
import { fetchRedditResearch } from '@/lib/mcp/workflows/reddit';

test('fetches real reddit data', async () => {
  if (process.env.CI) return; // Skip in CI if no uvx
  const results = await fetchRedditResearch("python programming");
  expect(results.length).toBeGreaterThan(0);
  expect(results[0].source).toBe('reddit');
  expect(results[0].content).toContain('--- TOP COMMENTS ---');
});
```

---

## Final Checklist
- [ ] `reddit-mapping.ts` created with at least 5 categories.
- [ ] `reddit.ts` workflow implemented with parallel fetching.
- [ ] Comment fetching logic added for depth.
- [ ] Normalization to `ContextItem` complete.
- [ ] Unit tests for mapping passing.
- [ ] Integration test manual run successful.
