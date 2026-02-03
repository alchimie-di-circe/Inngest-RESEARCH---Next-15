---
tags: [agentkit, patterns, advanced, all-agents]
description: 9 AgentKit workflow patterns with examples
alwaysApply: false
---

# AgentKit Advanced Patterns - Complete Guide

**Based on official AgentKit LLM documentation + SOP integration**

---

## 📌 Overview

Questo documento fornisce **9 pattern avanzati** estratti dalla documentazione ufficiale di AgentKit, optimizzati per la tua SOP (Deep Research + Context Research + Content Generation + Publishing).

Ogni pattern include:
- ✅ Quando usarlo nella tua app
- ✅ Codice completo pronto per la copia
- ✅ Gotchas e best practices
- ✅ Integrazione con Inngest

---

## 🎯 Quick Reference Table

| Pattern | Use Case | Complexity | Inngest Required | Fase SOP |
|---------|----------|------------|------------------|----------|
| **1. Agent with Tools** | Basic agent con strumenti | ⭐ | No | Tutte |
| **2. Multi-Agent Network (Routing)** | Routing deterministico tra agenti | ⭐⭐ | Yes | Tutte |
| **3. Human-in-the-Loop** | Attesa input umano | ⭐⭐⭐ | Yes | Reasoning, Publishing |
| **4. Multi-Steps Tools** | Tool complessi con retry | ⭐⭐ | Yes | Deep Research, Content Gen |
| **5. UI Streaming (useAgent)** | Real-time updates al frontend | ⭐⭐⭐ | Yes | Tutte |
| **6. MCP Server Integration** | Connessione a 2000+ MCP tools | ⭐⭐ | No | Publishing (Canva, Social) |
| **7. State-Based Routing** | Routing basato su stato | ⭐⭐⭐ | Yes | Tutte |
| **8. Multitenancy & Concurrency** | Limiti per utente | ⭐⭐ | Yes | Production |
| **9. Dynamic System Prompts** | Prompt contestuali | ⭐ | No | Tutte |

---

## 📝 Pattern 1: Basic Agent with Tools

**Quando**: Creare un agent singolo con strumenti

**Usa in SOP**:
- Deep Research: agent che fa web scraping
- Content Gen: agent che genera contenuti
- Publishing: agent che pubblica sui social

### Codice

```typescript
// src/agents/research-agent.ts
import { createAgent, createTool, openai } from "@inngest/agent-kit";
import z from "zod";

// Definisci il tool
const searchWebTool = createTool({
  name: "search_web",
  description: "Search the web for information about a topic",
  parameters: z.object({
    query: z.string().describe("The search query"),
    numResults: z.number().optional().describe("Number of results (default 5)"),
  }),
  handler: async ({ query, numResults = 5 }) => {
    // Chiama Pinecone o API di ricerca
    const results = await searchExternalAPI(query, numResults);
    return {
      success: true,
      results: results.map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.snippet,
        relevanceScore: r.score,
      })),
    };
  },
});

const readArticleTool = createTool({
  name: "read_article",
  description: "Read the full content of an article from a URL",
  parameters: z.object({
    url: z.string().describe("The URL to read"),
  }),
  handler: async ({ url }) => {
    const content = await fetchArticleContent(url);
    return {
      success: true,
      url,
      content,
      wordCount: content.split(/\s+/).length,
    };
  },
});

// Crea l'agent
export const researchAgent = createAgent({
  name: "Research Agent",
  description:
    "Expert research agent that searches and synthesizes information from the web",
  system: `You are an expert research agent. Your goal is to:
1. Search for relevant information about the topic
2. Read full articles to gather detailed context
3. Synthesize findings into comprehensive research notes
4. Cite all sources

Be thorough and systematic in your research approach.`,
  model: openai({ model: "gpt-4-turbo" }),
  tools: [searchWebTool, readArticleTool],
});

// Uso
const result = await researchAgent.run(
  "Research the latest trends in AI-powered content creation"
);
console.log("Research complete:", result.output);
```

### Best Practices

✅ **DO:**
- Descrivi i tool chiaramente (l'LLM li sceglie in base alla descrizione)
- Usa Zod per validare i parametri
- Gestisci errori nel handler (usa try-catch)
- Return strutture JSON coerenti

❌ **DON'T:**
- Non usare tool generico che fa "tutto"
- Non omettere descrizioni dei parametri
- Non assumere il tool sarà sempre disponibile

### Gotchas

⚠️ **Tool Calling Timeout**: Se il tool impiega >30s, il provider model timeout. Usa `step.run()` con Inngest.

⚠️ **Tool Return Type**: Sempre JSON-serializable (no Functions, Symbols).

---

## 🔄 Pattern 2: Multi-Agent Network with State-Based Routing

**Quando**: Workflow con più agenti che cooperano

**Usa in SOP**: Deep Research → Context Research → Content Generation → Publishing

### Architettura

```
┌─────────────────────────────────────────┐
│         Network Router                  │
│  (ispeziona state, decide next agent)   │
└─────────────────────────────────────────┘
          ↓
┌─────────────────┬─────────────────┬──────────────┐
│ Research Agent  │ Reasoning Agent │ Writer Agent │
│ (tools)         │ (tools)         │ (tools)      │
└─────────────────┴─────────────────┴──────────────┘
          ↓ (aggiorna state)
┌─────────────────────────────────────────┐
│     Shared State (Inngest + Neon)       │
│ { research, reasoning, output, done }   │
└─────────────────────────────────────────┘
```

### Codice

```typescript
// src/inngest/types/state.ts
export interface ResearchNetworkState {
  // Dati in ingresso
  topic: string;
  userId: string;

  // Fasi di ricerca
  research?: {
    query: string;
    sources: Array<{
      title: string;
      url: string;
      content: string;
    }>;
    summary: string;
    completedAt: string;
  };

  // Fase di reasoning
  analysis?: {
    keyInsights: string[];
    patterns: string[];
    gaps: string[];
    completedAt: string;
  };

  // Fase di content generation
  content?: {
    title: string;
    body: string;
    sections: Array<{
      heading: string;
      content: string;
    }>;
    completedAt: string;
  };

  // Controllo flusso
  phase: "research" | "analysis" | "content" | "done";
  error?: string;
}

// src/inngest/networks/research-network.ts
import {
  createAgent,
  createNetwork,
  createTool,
  anthropic,
} from "@inngest/agent-kit";
import { createState } from "@inngest/agent-kit";
import type { ResearchNetworkState } from "../types/state";

// ====== AGENTS ======

const researchAgent = createAgent<ResearchNetworkState>({
  name: "Research Agent",
  description:
    "Performs deep web research on a topic and synthesizes findings",
  system: `You are a research specialist. Your job is to:
1. Search for comprehensive information
2. Read and analyze sources
3. Create a clear summary of findings
4. Call the 'save_research' tool with your findings`,

  model: anthropic({
    model: "claude-3-5-sonnet-latest",
    max_tokens: 2000,
  }),

  tools: [
    createTool({
      name: "save_research",
      description: "Save research findings to proceed to analysis phase",
      parameters: z.object({
        summary: z.string(),
        sources: z.array(
          z.object({
            title: z.string(),
            url: z.string(),
            content: z.string(),
          })
        ),
      }),
      handler: async (input, { network, step }) => {
        if (network) {
          network.state.data.research = {
            ...input,
            completedAt: new Date().toISOString(),
          };
          network.state.data.phase = "analysis";
        }
        return { success: true, message: "Research saved" };
      },
    }),
  ],
});

const reasoningAgent = createAgent<ResearchNetworkState>({
  name: "Reasoning Agent",
  description: "Analyzes research data and derives insights",
  system: ({ network }) => `You are an analysis specialist. Based on this research:

${network?.state.data.research?.summary || "No research yet"}

Your job is to:
1. Identify key insights
2. Find patterns and trends
3. Note gaps in knowledge
4. Call the 'save_analysis' tool`,

  model: anthropic({
    model: "claude-3-5-sonnet-latest",
    max_tokens: 1500,
  }),

  tools: [
    createTool({
      name: "save_analysis",
      description: "Save analysis to proceed to content generation",
      parameters: z.object({
        keyInsights: z.array(z.string()),
        patterns: z.array(z.string()),
        gaps: z.array(z.string()),
      }),
      handler: async (input, { network }) => {
        if (network) {
          network.state.data.analysis = {
            ...input,
            completedAt: new Date().toISOString(),
          };
          network.state.data.phase = "content";
        }
        return { success: true, message: "Analysis saved" };
      },
    }),
  ],
});

const contentAgent = createAgent<ResearchNetworkState>({
  name: "Content Writer",
  description: "Generates polished content based on research and analysis",
  system: ({ network }) => `You are a professional content writer. 

Research: ${network?.state.data.research?.summary || ""}
Analysis: ${JSON.stringify(network?.state.data.analysis || {}, null, 2)}

Create a comprehensive article and call 'save_content' when done.`,

  model: anthropic({
    model: "claude-3-5-sonnet-latest",
    max_tokens: 3000,
  }),

  tools: [
    createTool({
      name: "save_content",
      description: "Save generated content and complete workflow",
      parameters: z.object({
        title: z.string(),
        body: z.string(),
        sections: z.array(
          z.object({
            heading: z.string(),
            content: z.string(),
          })
        ),
      }),
      handler: async (input, { network }) => {
        if (network) {
          network.state.data.content = {
            ...input,
            completedAt: new Date().toISOString(),
          };
          network.state.data.phase = "done";
        }
        return { success: true, message: "Content generated" };
      },
    }),
  ],
});

// ====== ROUTER ======

const researchNetworkRouter = ({ network }: { network: any }) => {
  const phase = network.state.data.phase;

  if (phase === "done") {
    return; // Completato
  }

  if (phase === "research") {
    return researchAgent;
  }

  if (phase === "analysis") {
    return reasoningAgent;
  }

  if (phase === "content") {
    return contentAgent;
  }

  // Default: inizia dalla ricerca
  return researchAgent;
};

// ====== NETWORK ======

export const researchNetwork = createNetwork<ResearchNetworkState>({
  name: "Research & Content Network",
  agents: [researchAgent, reasoningAgent, contentAgent],
  router: researchNetworkRouter,
});

// src/inngest/functions/run-research.ts
import { inngest } from "../client";
import { researchNetwork } from "../networks/research-network";
import { createState } from "@inngest/agent-kit";

export const runResearchWorkflow = inngest.createFunction(
  {
    id: "run-research-workflow",
    concurrency: [
      {
        key: "event.data.userId",
        limit: 5, // Max 5 ricerche parallele per utente
      },
    ],
  },
  { event: "research/requested" },
  async ({ event, step }) => {
    const { topic, userId } = event.data;

    const initialState = createState<ResearchNetworkState>(
      { userId },
      {
        topic,
        phase: "research",
      }
    );

    const result = await step.run("network-execution", async () => {
      return await researchNetwork.run(topic, {
        state: initialState,
      });
    });

    return result;
  }
);
```

### Best Practices

✅ **State Management**:
- State è immutabile dentro l'agent
- Modifica state tramite tools
- Salva state nel DB (Neon) per persistenza

✅ **Router Logic**:
- Determina next agent basato su `state.phase`
- Return `undefined` per completare il workflow
- Non fare logica complessa nel router

❌ **DON'T**:
- Non passare interi DB record nello state
- Non aver router che causano loop infiniti
- Non assumere tool sarà chiamato sempre

### Gotchas

⚠️ **State Concurrency**: Se stessa ricerca lanciata 2x, solo 1 vince. Usa `userId` o `researchId` come concurrency key.

⚠️ **Agent Order**: Il router deve garantire agenti eseguiti nel giusto ordine.

---

## 👥 Pattern 3: Human-in-the-Loop

**Quando**: Workflow che richiede approvazione/input umano

**Usa in SOP**:
- Reasoning: "Approvi questa analisi?"
- Publishing: "Pronto a pubblicare?"

### Codice

```typescript
// src/inngest/tools/ask-human.ts
import { createTool } from "@inngest/agent-kit";
import z from "zod";

export const askApprovalTool = createTool({
  name: "ask_approval",
  description:
    "Ask the user for approval on content before proceeding (waits up to 24h for response)",
  parameters: z.object({
    question: z.string().describe("The question to ask the user"),
    contentPreview: z.string().describe("Preview of content to approve"),
  }),
  handler: async ({ question, contentPreview }, { step, network }) => {
    if (!step) {
      return { error: "This tool requires Inngest step context" };
    }

    const userId = network?.state.data.userId;
    if (!userId) {
      return { error: "Missing userId in state" };
    }

    // Invia notifica all'utente (via email, Slack, webhook, etc.)
    await notificationService.sendApprovalRequest({
      userId,
      question,
      contentPreview,
    });

    // Aspetta la risposta
    const approvalEvent = await step.waitForEvent("user.approved", {
      event: "user/approval-response",
      timeout: "24h",
      match: "data.userId", // Matcha l'userId di chi ha lanciato il workflow
    });

    if (!approvalEvent) {
      return {
        error: "Approval request timed out after 24h",
        timedOut: true,
      };
    }

    return {
      success: true,
      approved: approvalEvent.data.approved,
      userComment: approvalEvent.data.comment,
      approvedAt: approvalEvent.data.timestamp,
    };
  },
});

// src/inngest/agents/reasoning-agent-with-approval.ts
const reasoningAgentWithApproval = createAgent<ResearchNetworkState>({
  name: "Reasoning Agent",
  description: "Analyzes research with human approval step",
  system: ({ network }) => `Analyze the research and ask for approval.
When you're ready to proceed, use the ask_approval tool.`,

  model: anthropic({
    model: "claude-3-5-sonnet-latest",
  }),

  tools: [
    createTool({
      name: "complete_analysis",
      // ...
    }),
    askApprovalTool, // Aggiungi il tool
  ],
});

// src/app/api/approve/route.ts
// Endpoint per ricevere l'approvazione dell'utente
export async function POST(req: NextRequest) {
  const { userId, approved, comment } = await req.json();

  // Invia l'evento di approvazione a Inngest
  await inngest.send({
    name: "user/approval-response",
    data: {
      userId,
      approved,
      comment,
      timestamp: new Date().toISOString(),
    },
  });

  return NextResponse.json({ success: true });
}

// src/components/ApprovalNotification.tsx
// Mostra la notifica all'utente
export function ApprovalNotification() {
  const handleApprove = async () => {
    await fetch("/api/approve", {
      method: "POST",
      body: JSON.stringify({
        userId: user.id,
        approved: true,
        comment: "Looks good!",
      }),
    });
  };

  return (
    <div>
      <p>Agent chiedendo approvazione...</p>
      <button onClick={handleApprove}>Approva</button>
    </div>
  );
}
```

### Best Practices

✅ **Timeout Management**: Sempre set timeout ragionevole (4h-24h)

✅ **Notification**: Invia notifica via email/Slack quando aspetti input

✅ **Error Handling**: Gestisci timeout, rifiuto, e cambi di idea

❌ **DON'T**:
- Non aspettare input indefinitamente (rischi deadlock)
- Non dimenticare di persistere lo stato prima di aspettare

---

## 🔧 Pattern 4: Multi-Steps Tools

**Quando**: Tool che richiede più step con retry automatico

**Usa in SOP**: Deep Research tool che fa: cerca → leggi → riassumi

### Codice

```typescript
// src/inngest/tools/deep-research-multi-step.ts
import { inngest } from "../client";

export const deepResearchMultiStepTool = inngest.createFunction(
  {
    id: "deep-research-multi-step-tool",
  },
  { event: "deep-research-tool/run" },
  async ({ event, step }) => {
    const { topic, maxResults = 5 } = event.data;

    // Step 1: Genera search queries
    const searchQueries = await step.ai.infer("generate-queries", {
      model: step.ai.models.anthropic({
        model: "claude-3-5-sonnet-latest",
      }),
      body: {
        messages: [
          {
            role: "user",
            content: `Generate 3-5 comprehensive search queries for: "${topic}"
            Return as JSON array of strings.`,
          },
        ],
      },
    });

    const queries = JSON.parse(
      searchQueries.choices[0].message.content
    ) as string[];

    // Step 2: Esegui ricerche in parallelo
    const searchResults = await Promise.all(
      queries.map((query) =>
        step.run(`search-${query}`, async () => {
          return await performSearch(query, maxResults);
        })
      )
    );

    // Step 3: Leggi articoli
    const articles = await Promise.all(
      searchResults
        .flat()
        .slice(0, 10)
        .map((result) =>
          step.run(`read-${result.url}`, async () => {
            return await fetchArticleContent(result.url);
          })
        )
    );

    // Step 4: Riassumi con AI
    const summary = await step.ai.infer("summarize", {
      model: step.ai.models.anthropic({
        model: "claude-3-5-sonnet-latest",
      }),
      body: {
        messages: [
          {
            role: "user",
            content: `Summarize the following articles about "${topic}":

${articles.map((a) => a.content).join("\n\n---\n\n")}

Provide key findings, trends, and patterns.`,
          },
        ],
      },
    });

    // Step 5: Salva risultati
    await step.run("save-research", async () => {
      return await db.research.create({
        topic,
        queries,
        articleCount: articles.length,
        summary: summary.choices[0].message.content,
        completedAt: new Date(),
      });
    });

    return {
      topic,
      queriesGenerated: queries.length,
      articlesAnalyzed: articles.length,
      summary: summary.choices[0].message.content,
    };
  }
);

// Uso nel tool
export const researchTool = createTool({
  name: "research_topic_deep",
  description: "Performs deep multi-step research on a topic",
  parameters: z.object({
    topic: z.string(),
  }),
  handler: async ({ topic }, { step }) => {
    if (!step) {
      return { error: "Requires Inngest step context" };
    }

    // Invia evento a Inngest
    const result = await step.run("trigger-deep-research", async () => {
      return await inngest.send({
        name: "deep-research-tool/run",
        data: { topic },
      });
    });

    // Aspetta risultato (note: in produzione, use waitForEvent)
    return result;
  },
});
```

### Best Practices

✅ **Parallel Steps**: Usa `Promise.all()` quando i step sono indipendenti

✅ **Retry Automatic**: Inngest riprova automaticamente step falliti

✅ **Granularity**: Ogni step = 1 cosa, così retry è efficiente

❌ **DON'T**:
- Non fare step lunghi (>5min senza sub-step)
- Non dipendere da variabili globali tra step

---

## 🔌 Pattern 5: UI Streaming with useAgent Hook

**Quando**: Real-time updates della UI mentre l'agent esegue

**Usa in SOP**: Mostra al frontend cosa sta succedendo durante Deep Research

### Codice

```typescript
// src/inngest/functions/run-research-with-streaming.ts
import { inngest } from "../client";
import { userChannel } from "@/lib/realtime";

export const runResearchWithStreaming = inngest.createFunction(
  { id: "run-research-with-streaming" },
  { event: "research/requested" },
  async ({ event, step, publish }) => {
    const { topic, userId, threadId } = event.data;

    const initialState = createState<ResearchNetworkState>(
      { userId },
      { topic, phase: "research" }
    );

    // Esegui network con streaming
    const result = await researchNetwork.run(topic, {
      state: initialState,
      streaming: {
        publish: async (chunk) => {
          // chunk = { type, data, agentId, ... }
          const enrichedChunk = {
            ...chunk,
            data: {
              ...chunk.data,
              threadId,
              userId,
            },
          };

          // Pubblica al user's channel
          await publish(
            userChannel(userId).research_stream(enrichedChunk)
          );
        },
      },
    });

    return { success: true, threadId, result };
  }
);

// src/hooks/useResearch.ts
"use client";

import { useInngestSubscription } from "@inngest/realtime/hooks";
import { useState, useCallback } from "react";

export function useResearch({ userId, threadId }: { userId: string; threadId: string }) {
  const [messages, setMessages] = useState<Array<{
    role: "user" | "assistant";
    content: string;
    phase: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time events
  useInngestSubscription({
    channel: {
      name: `user/${userId}`,
      topics: ["research_stream"],
    },
    onEvent: (event) => {
      const { type, data } = event;

      if (type === "run.started") {
        setIsLoading(true);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Starting research...",
            phase: "started",
          },
        ]);
      }

      if (type === "part.created") {
        if (data.partType === "text") {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: data.content,
              phase: data.agentName || "unknown",
            },
          ]);
        }
      }

      if (type === "text.delta") {
        // Update last message with streaming text
        setMessages((prev) => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1].content += data.delta;
          }
          return updated;
        });
      }

      if (type === "run.completed") {
        setIsLoading(false);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Research complete!",
            phase: "completed",
          },
        ]);
      }

      if (type === "run.failed") {
        setIsLoading(false);
        setError(data.error);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Error: ${data.error}`,
            phase: "error",
          },
        ]);
      }
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const startResearch = useCallback(
    async (topic: string) => {
      // Chiama API per inviare evento a Inngest
      const response = await fetch("/api/research/start", {
        method: "POST",
        body: JSON.stringify({
          topic,
          userId,
          threadId,
        }),
      });

      if (!response.ok) {
        setError("Failed to start research");
      }
    },
    [userId, threadId]
  );

  return {
    messages,
    isLoading,
    error,
    startResearch,
  };
}

// src/components/ResearchDashboard.tsx
export function ResearchDashboard() {
  const { messages, isLoading, error, startResearch } = useResearch({
    userId: user.id,
    threadId: threadId,
  });

  return (
    <div className="research-container">
      <div className="messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${msg.role} phase-${msg.phase}`}
          >
            <strong>{msg.phase}</strong>: {msg.content}
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const topic = e.currentTarget.topic.value;
          startResearch(topic);
        }}
      >
        <input
          name="topic"
          placeholder="Research topic..."
          disabled={isLoading}
        />
        <button disabled={isLoading}>
          {isLoading ? "Researching..." : "Start"}
        </button>
      </form>

      {error && <div className="error">{error}</div>}
    </div>
  );
}

// src/app/api/realtime/token/route.ts
// Genera token per la connessione realtime
import { getSubscriptionToken } from "@inngest/realtime";

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  const token = await getSubscriptionToken(inngest, {
    channel: {
      name: `user/${userId}`,
      topics: ["research_stream"],
    },
  });

  return NextResponse.json(token);
}
```

### Best Practices

✅ **Chunking**: Pubblica piccoli chunk frequenti (non interi messaggi rari)

✅ **Error Recovery**: Subscribe con error handler

✅ **Cleanup**: Unsubscribe quando component unmount

---

## 🔌 Pattern 6: MCP Server Integration

**Quando**: Usare MCP server come tool (Canva, Social media, etc.)

**Usa in SOP**: Publishing agent accede a Canva MCP

### Codice

```typescript
// src/agents/canva-publisher-agent.ts
import { createAgent, anthropic } from "@inngest/agent-kit";
import { createSmitheryUrl } from "@smithery/sdk/config.js";

// Configura Canva MCP via Smithery
const canvaUrl = createSmitheryUrl(
  "https://server.smithery.ai/canva/ws",
  {
    canvaApiKey: process.env.CANVA_API_KEY,
  }
);

const canvaPublisherAgent = createAgent({
  name: "Canva Publisher",
  description:
    "Creates and publishes designs to Canva using MCP tools",
  system: `You are a Canva design specialist. Your job is to:
1. Use Canva tools to create designs
2. Add text content to designs
3. Publish to Canva workspace
Always use the available Canva MCP tools for all operations.`,

  model: anthropic({
    model: "claude-3-5-sonnet-latest",
  }),

  // MCP servers forniscono automaticamente tools
  mcpServers: [
    {
      name: "canva",
      transport: {
        type: "streamable-http",
        url: canvaUrl.toString(),
      },
    },
  ],
});

// Usare l'agent
const designResult = await canvaPublisherAgent.run(
  `Create a social media post design for Instagram. 
   Title: "AI Content Creation Trends 2025"
   Include the top 5 trends as bullet points.
   Use modern, professional colors.`
);

// Esempio di MCP tools che verranno auto-disponibili:
// - canva-createDesign
// - canva-addText
// - canva-addImage
// - canva-publish
// - etc.
```

### Smithery Integration

```typescript
// Trova 2000+ MCP server su Smithery.ai
// Esempi per la tua SOP:
const mcpServers = [
  {
    name: "canva",
    // Per design publishing
    transport: { type: "streamable-http", url: canvaSmitheryUrl },
  },
  {
    name: "slack",
    // Per notifiche durante workflow
    transport: { type: "streamable-http", url: slackSmitheryUrl },
  },
  {
    name: "github",
    // Se integri con GitHub
    transport: { type: "streamable-http", url: githubSmitheryUrl },
  },
  {
    name: "postgres",
    // Database operations
    transport: { type: "streamable-http", url: postgresSmitheryUrl },
  },
];
```

### Best Practices

✅ **Choose Right Transport**: HTTP per scalabilità, WS per realtime

✅ **Error Handling**: MCP tools possono fallire (API rate limit, auth, etc.)

✅ **Cache MCP tools**: Fai fetch una volta all'avvio

---

## 🎛️ Pattern 7: State-Based Routing (Deterministic)

**Quando**: Routing complexo basato su stato (non LLM-driven)

**Usa in SOP**: Decide quale agent eseguire basato su phase/status

Vedi **Pattern 2** sopra - quello è già state-based routing!

### Advanced Example

```typescript
// State-based routing con condizioni multiple
const advancedRouter = ({ network, callCount }: {
  network: any;
  callCount: number;
}) => {
  // Evita loop infiniti
  if (callCount > 20) {
    return; // Forza completamento
  }

  const { phase, research, analysis, error } = network.state.data;

  // Se c'è errore, non procedere
  if (error) {
    return; // Completato con errore
  }

  // Workflow logico
  if (!research) return researchAgent; // Mancano dati di ricerca
  if (!analysis) return reasoningAgent; // Mancano analisi
  if (analysis && !content) return contentAgent; // Mancano contenuti

  return; // Tutto completo
};
```

---

## 🔐 Pattern 8: Multitenancy & Concurrency

**Quando**: Production - limita richieste per utente

**Usa in SOP**: Max 5 ricerche parallele per utente

Vedi **Pattern 2** - include concurrency configuration:

```typescript
const runResearchWorkflow = inngest.createFunction(
  {
    id: "run-research-workflow",
    // Limita a 5 ricerche parallele per utente
    concurrency: [
      {
        key: "event.data.userId",
        limit: 5,
      },
    ],
    // Inoltre: throttling, rate limiting, priority
    throttle: [
      {
        key: "event.data.userId",
        limit: 100, // Max 100 richieste al giorno per utente
        period: "1d",
      },
    ],
  },
  // ...
);
```

---

## 💭 Pattern 9: Dynamic System Prompts

**Quando**: Prompt cambiano basato su stato/storia

**Usa in SOP**: Content Agent cambia stile basato su target audience

### Codice

```typescript
const contentAgentDynamic = createAgent<ResearchNetworkState>({
  name: "Content Writer",
  description: "Generates content tailored to audience",

  // Sistema prompt dinamico
  system: async ({ network, history }) => {
    const { research, analysis, targetAudience = "general" } = network?.state.data || {};

    const basePrompt = `You are a professional content writer.`;

    // Aggiungi contesto
    const researchContext = research
      ? `\n\nResearch Summary:\n${research.summary}`
      : "";

    // Adatta lo stile all'audience
    const audienceGuidelines =
      targetAudience === "technical"
        ? "\n\nWrite for technical audience with code examples and deep technical details."
        : targetAudience === "business"
          ? "\n\nWrite for business leaders, focus on ROI and business impact."
          : "\n\nWrite for general audience, explain concepts simply.";

    // Aggiungi history per continuità
    const historyContext =
      history && history.length > 0
        ? `\n\nPrevious messages:\n${history
            .slice(-5)
            .map((m: any) => `${m.role}: ${m.content}`)
            .join("\n")}`
        : "";

    return `${basePrompt}${researchContext}${audienceGuidelines}${historyContext}`;
  },

  model: anthropic({ model: "claude-3-5-sonnet-latest" }),
  tools: [/* ... */],
});
```

---

## 📊 Integration Matrix: Pattern → SOP Phase

```
Phase 1: Deep Research
├─ Pattern 1: Basic tools (search_web, read_article)
├─ Pattern 4: Multi-steps tool (deep-research-multi-step)
├─ Pattern 5: Streaming to frontend
└─ Pattern 8: Multitenancy (max 5 ricerche/utente)

Phase 2: Context Research (Inngest Research Repo)
├─ Pattern 2: Multi-agent network (gathering → staging → reasoning)
├─ Pattern 9: Dynamic prompts (adatta analisi per utente)
└─ Pattern 3: Human-in-the-loop (approva pattern rilevanti)

Phase 3: Content Generation
├─ Pattern 1: Basic tools (text generation)
├─ Pattern 9: Dynamic system prompt (stile per audience)
├─ Pattern 5: Streaming (mostra draft mentre scrive)
└─ Pattern 3: Human-in-the-loop (approva prima di publishing)

Phase 4: Publishing (Canva, Social, etc.)
├─ Pattern 6: MCP integration (Canva)
├─ Pattern 1: Tools per social platforms
├─ Pattern 3: Approval prima di publish
└─ Pattern 5: Real-time publishing updates
```

---

## 🔍 Debugging Commands

```bash
# Vedi esecuzione Inngest
npx inngest-cli runs list --function run-research-workflow

# Vedi dettagli di una run
npx inngest-cli runs get <run-id>

# Riprova una run fallita
npx inngest-cli runs replay <run-id>

# Attendi result in dev
npm run dev  # Vedi Inngest dev UI a http://localhost:8288
```

---

## ✅ Checklist Implementazione

- [ ] Creato agent per ogni fase
- [ ] Definito state TypeScript interface
- [ ] Implementato router per flusso
- [ ] Aggiunti tools per stato modifica
- [ ] Test concurrency per utente
- [ ] Setup streaming al frontend
- [ ] Error handling per timeout
- [ ] Approved human-in-the-loop flow
- [ ] MCP server integrato (publishing)
- [ ] Monitoring attivo su Inngest dashboard

---

## 🎓 References

- [AgentKit Official Docs](https://agentkit.inngest.com)
- [Inngest Docs](https://www.inngest.com/docs)
- [Smithery MCP Registry](https://smithery.ai)
- [Examples Repo](https://github.com/inngest/agent-kit/tree/main/examples)

**Buona implementazione!** 🚀
