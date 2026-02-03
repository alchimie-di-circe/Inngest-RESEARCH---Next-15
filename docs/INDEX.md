---
tags: [all-agents, navigation]
description: Documentation Index - Tag-based navigation for AI agents
alwaysApply: true
---

# Documentation Index

> **Project**: Research & Publishing Suite
> **Stack**: Next.js 15, Inngest, AgentKit, Neon PostgreSQL
> **Last Updated**: February 3, 2026

## 🎯 Quick Navigation

### By Task (Most Common)

| I Need To... | Go To | Tags |
|--------------|-------|------|
| **Add an Inngest function** | [Dev Workflow](inngest/dev-workflow.md)<br>[AgentKit Patterns](agentkit/advanced-patterns.md) | `#inngest` `#agentkit` |
| **Set up testing** | [MCP Testing Guides](mcp-server-instructions/) | `#testing` `#mcp` |
| **Configure Prisma + Neon** | [Neon Guide](prisma/neon-guide.md) | `#database` `#prisma` |
| **Debug Inngest functions** | [Dev Workflow](inngest/dev-workflow.md)<br>[Patterns](inngest/inngest-patterns.md) | `#inngest` `#troubleshooting` |
| **Use Container-Use** | [Factory Rules](/.factory/rules/) | `#container` `#guides` |
| **Understand system architecture** | [Architecture](project-architecture.md) | `#architecture` |

---

## 📂 By Folder

### agentkit/ - AgentKit Framework
`#agentkit #patterns`

| File | Description | Tags |
|------|-------------|------|
| [advanced-patterns.md](agentkit/advanced-patterns.md) | 9 workflow patterns | `#patterns` `#advanced` |
| [agents.md](agentkit/agents.md) | Agent basics | `#setup` |
| [deployments.md](agentkit/deployments.md) | Deployment strategies | `#setup` |
| [models.md](agentkit/models.md) | Model providers | `#api-reference` |
| [tools.md](agentkit/tools.md) | Tool integration | `#api-reference` |
| [memory.md](agentkit/memory.md) | Memory patterns | `#patterns` |
| [networks.md](agentkit/networks.md) | Multi-agent networks | `#patterns` |
| [routers.md](agentkit/routers.md) | Routing logic | `#patterns` |
| [state.md](agentkit/state.md) | State management | `#patterns` |
| [history.md](agentkit/history.md) | History management | `#patterns` |
| [inngest-llm-integration.md](agentkit/inngest-llm-integration.md) | Inngest + LLM | `#inngest` `#patterns` |
| [streaming/](agentkit/streaming/) | Streaming patterns | `#patterns` `#advanced` |

### inngest/ - Inngest Workflows
`#inngest #patterns`

| File | Description | Tags |
|------|-------------|------|
| [dev-workflow.md](inngest/dev-workflow.md) | 3-level dev model | `#setup` `#cloud` |
| [inngest-patterns.md](inngest/inngest-patterns.md) | Workflow patterns | `#patterns` |
| [inngest-devserver-mcp.md](inngest/inngest-devserver-mcp.md) | MCP integration | `#mcp` `#setup` |
| [inngest-devserver-mcp-quickstart.md](inngest/inngest-devserver-mcp-quickstart.md) | MCP quick start | `#mcp` `#setup` |
| [inngest-neon-db-integration.md](inngest/inngest-neon-db-integration.md) | DB event triggers | `#database` `#patterns` |
| [local-dev.md](inngest/local-dev.md) | Local setup | `#setup` `#local` |
| [local-dev-docker.md](inngest/local-dev-docker.md) | Docker setup | `#setup` `#local` |

### mcp-server-instructions/ - Testing Tools
`#testing #mcp`

| File | Description | Environment | Tags |
|------|-------------|-------------|------|
| [wallaby-mcp-guide.md](mcp-server-instructions/wallaby-mcp-guide.md) | Unit tests | Cloud (Codespace) | `#cloud` |
| [testsprite-mcp-guide.md](mcp-server-instructions/testsprite-mcp-guide.md) | E2E tests | Local (Sandbox) | `#local` |
| [dagger-container-use.md](mcp-server-instructions/dagger-container-use.md) | Container tests | Local (Container) | `#container` |
| [chrome-devtools-mcp-guide.md](mcp-server-instructions/chrome-devtools-mcp-guide.md) | Browser debug | Cloud (Codespace) | `#cloud` |

### prisma/ - Prisma ORM
`#database #prisma`

| File | Description | Tags |
|------|-------------|------|
| [quickstart.md](prisma/quickstart.md) | What is Prisma | `#setup` |
| [neon-guide.md](prisma/neon-guide.md) | Neon + Prisma setup | `#setup` `#neon` |
| [best-practices.md](prisma/best-practices.md) | Prisma patterns | `#patterns` |
| [best-practices-advanced.md](prisma/best-practices-advanced.md) | Advanced patterns | `#patterns` `#advanced` |
| [ai-sdk-integration.md](prisma/ai-sdk-integration.md) | Prisma + AI SDK | `#integrations` |
| [nextjs-guide.md](prisma/nextjs-guide.md) | Prisma + Next.js | `#setup` |
| [local-dev.md](prisma/local-dev.md) | Local workflow | `#setup` `#local` |
| [cli-quick-ref.md](prisma/cli-quick-ref.md) | CLI reference | `#api-reference` |
| [large-schemas.md](prisma/large-schemas.md) | Performance tips | `#patterns` |
| [mcp-tools.md](prisma/mcp-tools.md) | MCP server tools | `#mcp` |
| [mcp-json.md](prisma/mcp-json.md) | MCP config | `#mcp` |
| [vercel-workarounds.md](prisma/vercel-workarounds.md) | Vercel fixes | `#troubleshooting` |

**Reference**: Use official docs https://www.prisma.io/docs for full Prisma documentation.

### neon/ - Neon PostgreSQL
`#database #neon`

| File | Description | Tags |
|------|-------------|------|
| [api-reference/branches.md](neon/api-reference/branches.md) | Branch API | `#api-reference` |
| [api-reference/endpoints.md](neon/api-reference/endpoints.md) | Endpoint API | `#api-reference` |
| [api-reference/api-keys.md](neon/api-reference/api-keys.md) | API keys | `#api-reference` |
| [api-reference/toolkit.md](neon/api-reference/toolkit.md) | CLI toolkit | `#api-reference` |
| [api-reference/typescript-sdk.md](neon/api-reference/typescript-sdk.md) | TypeScript SDK | `#api-reference` |

### guides/ - Setup & Howtos
`#guides #setup`

| File | Description | Tags |
|------|-------------|------|
| [in-app-prod-agents.md](guides/in-app-prod-agents.md) | Production agents | `#agentkit` |
| [devcontainer-setup.md](guides/devcontainer-setup.md) | DevContainer config | `#setup` `#cloud` |

### integrations/ - External Services
`#integrations`

| File | Description | Tags |
|------|-------------|------|
| [pinecone-basics.md](integrations/pinecone-basics.md) | Pinecone vector DB | `#database` |

### Root Level
- [project-architecture.md](project-architecture.md) - `#architecture` - 5-layer system overview

---

## 🏷️ By Tag

### #architecture
- [project-architecture.md](project-architecture.md) - 5-layer system overview

### #agentkit
- [agentkit/](agentkit/) - All AgentKit docs
- [guides/in-app-prod-agents.md](guides/in-app-prod-agents.md) - Production agents

### #inngest
- [inngest/](inngest/) - All Inngest docs
- [agentkit/inngest-llm-integration.md](agentkit/inngest-llm-integration.md) - Inngest + LLM

### #testing
- [mcp-server-instructions/](mcp-server-instructions/) - All testing tools

### #database
- [prisma/](prisma/) - Prisma ORM docs
- [neon/](neon/) - Neon PostgreSQL docs
- [integrations/pinecone-basics.md](integrations/pinecone-basics.md) - Pinecone

### #patterns
- [agentkit/advanced-patterns.md](agentkit/advanced-patterns.md) - AgentKit patterns
- [inngest/inngest-patterns.md](inngest/inngest-patterns.md) - Inngest patterns
- [prisma/best-practices.md](prisma/best-practices.md) - Prisma patterns

### #setup
- [QUICKSTART.md](../QUICKSTART.md) - Project setup (root)
- [guides/devcontainer-setup.md](guides/devcontainer-setup.md) - DevContainer
- [guides/in-app-prod-agents.md](guides/in-app-prod-agents.md) - Production agents
- [inngest/dev-workflow.md](inngest/dev-workflow.md) - Inngest setup
- [prisma/quickstart.md](prisma/quickstart.md) - Prisma quickstart

### #local (Mac Air)
- [mcp-server-instructions/testsprite-mcp-guide.md](mcp-server-instructions/testsprite-mcp-guide.md) - TestSprite
- [prisma/local-dev.md](prisma/local-dev.md) - Prisma local dev
- [inngest/local-dev.md](inngest/local-dev.md) - Inngest local dev
- Container-use operations (see [.factory/rules/](/.factory/rules/))

### #cloud (Codespace)
- [mcp-server-instructions/wallaby-mcp-guide.md](mcp-server-instructions/wallaby-mcp-guide.md) - Wallaby
- [mcp-server-instructions/chrome-devtools-mcp-guide.md](mcp-server-instructions/chrome-devtools-mcp-guide.md) - Chrome DevTools
- [inngest/dev-workflow.md](inngest/dev-workflow.md) - Inngest setup
- [guides/devcontainer-setup.md](guides/devcontainer-setup.md) - DevContainer

### #container (Dagger)
- [mcp-server-instructions/dagger-container-use.md](mcp-server-instructions/dagger-container-use.md) - Dagger
- See [.factory/rules/](/.factory/rules/) for complete workflow

### #mcp
- [mcp-server-instructions/](mcp-server-instructions/) - All MCP tools
- [inngest/inngest-devserver-mcp.md](inngest/inngest-devserver-mcp.md) - Inngest MCP
- [prisma/mcp-tools.md](prisma/mcp-tools.md) - Prisma MCP

### #api-reference
- [neon/api-reference/](neon/api-reference/) - All Neon API docs
- [prisma/cli-quick-ref.md](prisma/cli-quick-ref.md) - Prisma CLI

---

## 🔍 Search by Tag

### Method 1: Command Line (ripgrep)

```bash
# Find all AgentKit docs
rg "^tags:.*agentkit" docs/

# Find all testing guides
rg "^tags:.*testing" docs/

# Find cloud-specific docs
rg "^tags:.*cloud" docs/

# Find setup guides
rg "^tags:.*setup" docs/

# Find database docs
rg "^tags:.*database" docs/
```

### Method 2: Custom CLI Tool (Future)

Future enhancement: Build a custom MCP server or CLI tool for smarter doc discovery:

```bash
# Example future commands
doc-find --tag agentkit --env cloud
doc-suggest "I need to test Inngest functions"
doc-context src/inngest/functions/deep-research.ts
```

This will integrate with existing MCP tooling for seamless agent access.

---

## 📝 Documentation Principles

1. **Tag-Based Navigation**: All files have YAML frontmatter with tags
2. **Single Source of Truth**: Each topic exists in exactly one file
3. **Cross-References**: Files link to each other, no duplication
4. **Environment-Specific**: Tagged with `#local`, `#cloud`, or `#container`
5. **Agent-Aware**: AI agents use tags to find right doc at right time

---

## 🔄 Cross-References

- **AGENTS.md**: Testing strategy, environment matrix → [/AGENTS.md](../AGENTS.md)
- **CLAUDE.md**: Claude Code context → [/.claude/CLAUDE.md](../.claude/CLAUDE.md)
- **QUICKSTART.md**: 30-min setup → [/QUICKSTART.md](../QUICKSTART.md)

---

**Need something not listed here?**
- Testing → [AGENTS.md](../AGENTS.md)
- Setup → [QUICKSTART.md](../QUICKSTART.md)
- Context → [CLAUDE.md](../.claude/CLAUDE.md)
