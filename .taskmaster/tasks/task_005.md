# Task ID: 5

**Title:** Implement Context Research Phase 2 Agent

**Status:** pending

**Dependencies:** 1, 3, 4

**Priority:** high

**Description:** Create the context research agent that analyzes deep research reports, applies brand context matching, and implements the multi-agent analysis network per PRD Feature 2.1-2.3.

**Details:**

1. Create `src/inngest/functions/context-research-agent.ts`:
```typescript
export const contextResearchAgent = inngest.createFunction(
  { id: 'context-research-agent', name: 'Context Research Agent' },
  { event: 'context.research.requested' },
  async ({ event, step, publish }) => {
    const { researchJobId, brandId, sessionId } = event.data;
    
    // Step 1: Fetch deep research report from DB
    const researchJob = await step.run('fetch-research', async () => {
      return await prisma.researchJob.findUnique({
        where: { id: researchJobId }
      });
    });
    
    // Step 2: Fetch brand config
    const brandConfig = await step.run('fetch-brand', async () => {
      return await prisma.brandConfig.findUnique({
        where: { id: brandId }
      });
    });
    
    // Step 3: Multi-agent analysis (pattern 2)
    const analysisResults = await Promise.all([
      step.invoke('theme-detector', { function: themeDetectorAgent, data: {...} }),
      step.invoke('opportunity-analyzer', { function: opportunityAnalyzer, data: {...} }),
      step.invoke('trend-identifier', { function: trendIdentifier, data: {...} })
    ]);
    
    // Step 4: Apply brand context matching using dynamic system prompts
    const contextualizedBrief = await step.run('brand-matching', async () => {
      // Use Claude with brand TOV as system prompt
    });
    
    return { contextualizedBrief, analysisResults };
  }
);
```

2. Create sub-agents in `src/inngest/functions/agents/`:
- `theme-detector-agent.ts`
- `opportunity-analyzer-agent.ts`
- `trend-identifier-agent.ts`

3. Add event types for context research in `src/inngest/client.ts`

4. Create Context Research page with form to select research job and brand

**Test Strategy:**

Unit tests for each sub-agent in isolation. Integration test for full context research pipeline. Verify brand TOV is correctly applied to analysis output.

## Subtasks

### 5.1. Create context-research-agent.ts main orchestrator function

**Status:** pending  
**Dependencies:** None  

Implement the main context research agent that orchestrates the multi-agent analysis network, handles event triggers, fetches research reports and brand configs from database, and coordinates sub-agent invocation.

**Details:**

Create `src/inngest/functions/context-research-agent.ts` following the analyst-agent.ts pattern (115 lines). Define the inngest.createFunction with id 'context-research-agent', event trigger 'context.research.requested', retries: 2, and throttle config. Implement steps: 1) 'fetch-research' to query researchJob by researchJobId using prisma, 2) 'fetch-brand' to get brandConfig by brandId, 3) parallel step.invoke calls using Promise.all to fan-out to theme-detector, opportunity-analyzer, and trend-identifier agents (AgentKit Pattern 2), 4) 'brand-matching' step for brand context synthesis. Use researchChannel for realtime updates with 'agent-update' and 'agent-chunk' topics. Return { contextualizedBrief, analysisResults }.

### 5.2. Create theme-detector-agent.ts sub-agent

**Status:** pending  
**Dependencies:** 5.1  

Implement the theme detector sub-agent that analyzes research reports to identify key themes, patterns, and recurring topics for brand contextualization.

**Details:**

Create `src/inngest/functions/agents/theme-detector-agent.ts` following analyst-agent.ts structure. Define inngest.createFunction with id 'theme-detector-agent', event 'context/theme.detect', retries: 2, throttle: 10/min keyed by userId. Implement: 1) 'publish-theme-start' step with agent-update topic, 2) 'detect-themes' step using streamText with Claude model, system prompt instructing thematic analysis of research content. Input: researchReport JSON with findings and sources. Output structured themes: { primaryThemes: string[], secondaryThemes: string[], themeConnections: Array<{from, to, relationship}> }. Use publishTokenByTokenUpdates for streaming chunks to 'agent-chunk' topic.

### 5.3. Create opportunity-analyzer-agent.ts sub-agent

**Status:** pending  
**Dependencies:** 5.1  

Implement the opportunity analyzer sub-agent that identifies content opportunities, gaps in existing content, and potential angles for brand messaging based on research findings.

**Details:**

Create `src/inngest/functions/agents/opportunity-analyzer-agent.ts` following analyst-agent.ts pattern. Define inngest.createFunction with id 'opportunity-analyzer-agent', event 'context/opportunity.analyze', retries: 2, throttle: 10/min. Implement: 1) 'publish-opportunity-start' step, 2) 'analyze-opportunities' step using Claude with system prompt for content gap analysis and opportunity identification. Input: researchReport + brandConfig (TOV guidelines, brand knowledge). Output: { opportunities: Array<{type, description, priority, relevantFindings}>, contentGaps: string[], suggestedAngles: string[] }. Stream analysis to 'agent-chunk' topic with agent='opportunity-analyzer'.

### 5.4. Create trend-identifier-agent.ts sub-agent

**Status:** pending  
**Dependencies:** 5.1  

Implement the trend identifier sub-agent that detects emerging trends, temporal patterns, and relevance signals from research data for timely content creation.

**Details:**

Create `src/inngest/functions/agents/trend-identifier-agent.ts` following analyst-agent.ts pattern. Define inngest.createFunction with id 'trend-identifier-agent', event 'context/trend.identify', retries: 2, throttle: 10/min. Implement: 1) 'publish-trend-start' step, 2) 'identify-trends' step using Claude with system prompt focused on trend detection, temporal analysis, and relevance scoring. Input: researchReport with timestamps and source metadata. Output: { emergingTrends: Array<{name, momentum, timeframe, sources}>, decliningTrends: string[], relevanceSignals: Array<{signal, strength, actionability}> }. Include trend velocity calculation logic. Stream to 'agent-chunk' topic.

### 5.5. Add context research event types and create Context Research UI page

**Status:** pending  
**Dependencies:** 5.1, 5.2, 5.3, 5.4  

Extend the Inngest client with new event types for context research workflow, update channels.ts with context-specific topics, and create the Context Research page component with research job and brand selection.

**Details:**

1) Update `src/inngest/client.ts` to add new event schemas: 'context.research.requested' (researchJobId, brandId, sessionId, userId), 'context/theme.detect', 'context/opportunity.analyze', 'context/trend.identify', 'context.research.completed'. 2) Extend channels.ts with 'context-progress' topic type<{stage: 'analysis' | 'brand-matching' | 'synthesis', progress: number, message: string, timestamp: string}>. Add context agent types to AgentUpdate and agent-chunk interfaces. 3) Create `src/app/research/context/page.tsx` with: dropdown to select completed research jobs (status='completed'), dropdown to select brand configs, trigger button calling POST /api/context-research, real-time progress display using researchChannel subscription, results display showing contextualizedBrief and sub-agent outputs.
