# CLAUDE.md - Research & Publishing Suite

> **Context File for Claude Code**  
> **Stack**: Next.js 15, TypeScript, Inngest, Neon PostgreSQL, AgentKit  
> **Last Updated**: January 28, 2026  
> **Cross-Reference**: See [AGENTS.md](../AGENTS.md) for testing workflow

---

## 🎯 Project Overview

**Research & Publishing Suite** unifies four phases:
1. **Deep Research**: Multi-agent staging → reasoning → reporting
2. **Context Research**: Multi-source gathering + brand contextualization  
3. **Content Generation**: Text + design with Canva MCP
4. **Publishing**: Automated distribution to Shopify, Twitter, LinkedIn

### The Vision (4 Tabs, 1 Flow)

```
Deep Research Tab → Context Research Tab → Content Generation Tab → Publishing Tab
     [Staging]            [Gathering]            [Writing]              [Queue]
   [Reasoning]          [Planning]             [Design]             [Publish]
   [Reporting]          [Context Brief]        [Approval]           [Monitor]
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15, React 19, TailwindCSS | App router, server components |
| **Backend** | **Inngest + AgentKit** | Event-driven, durable execution |
| **Database** | **Neon PostgreSQL + Prisma ORM** | Serverless, branching, Prisma migrations |
| **Vector Store** | **Pinecone** | Semantic search, RAG for research agents |
| **Realtime** | Inngest SDKs, SSE | Live progress updates |
| **LLM** | Anthropic Claude 3.5 Sonnet | Reasoning, writing, analysis |
| **Design** | Canva MCP + MCP SDK | Brand-aware designs |
| **Testing** | Wallaby, TestSprite, Dagger | See [AGENTS.md](../AGENTS.md) |
| **DevOps** | GitHub Codespaces, Vercel | Cloud-first development |

---

## 🚀 Quick Start

### Prerequisites
- GitHub account (for Codespaces)
- Neon PostgreSQL account
- Inngest account + keys
- Anthropic API key

### Start Development

**1. Create Codespace**
```bash
# In GitHub: Code → Codespaces → Create codespace on main
# Wait 2-3 min for setup
```

**2. Environment Setup**
```bash
cp .env.example .env.local
# Fill in: NEON_DATABASE_URL, INNGEST_EVENT_KEY, INNGEST_SIGNING_KEY, ANTHROPIC_API_KEY
```

**3. Install & Run**
```bash
npm install
npx prisma migrate dev
npm run dev      # Terminal 1: Next.js :3000
npm run inngest:dev  # Terminal 2: Inngest :8288
```

**4. Verify**
- Frontend: http://localhost:3000
- Inngest UI: http://localhost:8288

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # 4 tabs: deep, context, content, publishing
│   └── api/
│       ├── inngest/route.ts    # Inngest webhook
│       └── .../
├── inngest/
│   ├── client.ts           # Inngest SDK client
│   ├── events.ts           # TypeScript event schema
│   └── functions/          # AgentKit functions
│       ├── deep-research/
│       ├── context-research/
│       ├── content-generation/
│       └── publishing/
├── components/             # React components
├── lib/                    # Utilities, DB client
└── types/                  # TypeScript types
```

---

## 🔗 Key Documentation

### For Development
- **[.factory/AGENTS.md](../.factory/AGENTS.md)** - Detailed Dev-Workflow & Testing strategy & MCP tools
- **[AGENTS.md](../AGENTS.md)** - Testing strategy & MCP tools
- **[docs/inngest/dev-workflow.md](../docs/inngest/dev-workflow.md)** - 3-level dev model
- **[docs/INDEX.md](../docs/INDEX.md)** - Complete documentation map

### For Architecture
- **[docs/project-architecture.md](../docs/project-architecture.md)** - System design, DB schema
- **[docs/inngest/patterns.md](../docs/inngest/patterns.md)** - Inngest workflow patterns
- **[docs/agentkit-advanced-patterns.md](../docs/agentkit-advanced-patterns.md)** - AgentKit patterns

### For Testing

## Skills Usage Guide
- **[.factory/AGENTS.md](../.factory/AGENTS.md)** - Complete testing strategy and detailed skills usage guide
- **[AGENTS.md](../AGENTS.md)** - Testing strategy & MCP tools
- 
## Documentation
- **[docs/mcp-server-instructions/wallaby-mcp-guide.md](../docs/mcp-server-instructions/wallaby-mcp-guide.md)** - Unit tests
- **[docs/mcp-server-instructions/testsprite-mcp-guide.md](../docs/mcp-server-instructions/testsprite-mcp-guide.md)** - E2E tests
- **[docs/mcp-server-instructions/dagger-container-use.md](../docs/mcp-server-instructions/dagger-container-use.md)** - Container tests

### For Database
- **[docs/prisma/neon-guide.md](../docs/prisma/neon-guide.md)** - Neon setup
- **[docs/prisma/best-practices.md](../docs/prisma/best-practices.md)** - Prisma patterns

---

## 📚 Documentation Quick Access (Tag-Based Routing)

Use these routing tables to find the right documentation quickly. All docs have tags for smart discovery.

### When Working On...

| Task | Load | Tags |
|------|------|------|
| **Adding/modifying Inngest functions** | @docs/inngest/dev-workflow.md<br>@docs/agentkit/advanced-patterns.md | `#inngest` `#agentkit` |
| **AgentKit agents** | @docs/agentkit/<br>@docs/inngest/inngest-patterns.md | `#agentkit` `#patterns` |
| **Database schema changes** | @docs/prisma/neon-guide.md<br>@docs/prisma/best-practices.md | `#database` `#prisma` `#neon` |
| **Running tests** | @docs/mcp-server-instructions/ | `#testing` `#mcp` |
| **Unit tests (Wallaby)** | @docs/mcp-server-instructions/wallaby-mcp-guide.md | `#testing` `#cloud` |
| **E2E tests (TestSprite)** | @docs/mcp-server-instructions/testsprite-mcp-guide.md | `#testing` `#local` |
| **Container development** | @.factory/rules/ | `#container` |
| **API endpoints** | @docs/neon/api-reference/ | `#api-reference` |
| **Setup/troubleshooting** | @docs/guides/<br>@QUICKSTART.md | `#guides` `#setup` |

### Search by Tag (ripgrep)

```bash
# Find all AgentKit docs
rg "^tags:.*agentkit" docs/

# Find all testing guides
rg "^tags:.*testing" docs/

# Find cloud-specific docs
rg "^tags:.*cloud" docs/

# Find setup guides
rg "^tags:.*setup" docs/
```

### Complete Documentation Index
For full tag-based navigation, see @docs/INDEX.md

---

## 🔄 Development Workflow

### Cloud-First Rule
**Never run heavy operations on local Mac**. Use GitHub Codespace for:
- `npm install`
- `npm run dev`
- `npm run build`
- `npx prisma migrate`

### Testing Workflow
See [.factory/AGENTS.md](../.factory/AGENTS.md) and [AGENTS.md](../AGENTS.md) for complete testing strategy and detailed skills usage guide:

| Test Type | Tool | Environment |
|-----------|------|-------------|
| Unit | Wallaby MCP | Cloud (Codespace) |
| Integration | TestSprite MCP | Local sandbox |
| E2E with APIs | Dagger Container-use | Local container |

### Inngest Development
See [docs/inngest/dev-workflow.md](../docs/inngest/dev-workflow.md):

| Level | Environment | Command |
|-------|-------------|---------|
| 1 | Local Dev | `npm run inngest:dev` |
| 2 | Vercel Preview | `git push origin feature/x` |
| 3 | Production | `git push origin main` |

---

## 🧠 Using Claude Code with This Project

### Quick Context Loading
```bash
# In terminal, reference these for faster context:
@docs/project-architecture.md     # "Add a new agent"
@docs/inngest/patterns.md         # "How do I handle retries?"
@docs/agentkit-advanced-patterns.md  # "Implement MCP integration"
```

### Example Prompts
```
"Add a new publishing agent for Instagram following Pattern 9 in 
@docs/inngest/patterns.md"

"Debug why the deep research agent is failing. Check 
@docs/inngest/dev-workflow.md for debugging steps."

"Set up unit tests for the context gatherer. See 
@docs/mcp-server-instructions/wallaby-mcp-guide.md"
```

---

## 📝 Important Notes

### For AI Agents (All Except Claude Code)
**See [AGENTS.md](../AGENTS.md)** for:
- Testing matrix (when to use which tool)
- MCP server instructions
- Environment restrictions
- Agent checklist

### For Claude Code (This File)
This file provides:
- Quick project context
- Stack overview
- Documentation links
- Development workflow

**Do not duplicate content from AGENTS.md or docs/**. Use cross-references.

---

## ✅ Before You Start

- [ ] Read [QUICKSTART.md](../QUICKSTART.md) for setup
- [ ] Read [.factory/AGENTS.md](../.factory/AGENTS.md) for testing skills and dev-workflow
- [ ] Read [AGENTS.md](../AGENTS.md) for testing matrix and MCP tools
- [ ] Check [docs/INDEX.md](../docs/INDEX.md) for complete docs map
- [ ] Ensure Codespace is running (not local Mac)

---

**Happy coding! 🎉**

For detailed documentation, see [docs/INDEX.md](../docs/INDEX.md).  
For testing workflows, see [.factory/AGENTS.md](../.factory/AGENTS.md).
