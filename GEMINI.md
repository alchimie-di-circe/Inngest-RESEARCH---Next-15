# GEMINI.md - Context & Operational Guide

> **Role**: Lead Orchestrator & Developer Agent
> **System**: Research & Publishing Suite (Next.js 15 + Inngest)
> **Environment**: Hybrid (Local Mac Air + Dagger Containers + Cloud Codespaces)

---

## 🛑 CRITICAL OPERATIONAL MANDATES

**1. LOCAL MACHINE PROTECTION (Mac Air)**
You are running on the user's local machine. To protect the environment:
*   ❌ **NEVER** run `npm install`, `npm build`, or `npm test` directly on the local filesystem.
*   ❌ **NEVER** run heavy Docker composes locally unless explicitly instructed.
*   ✅ **ALWAYS** use the **Container-Use MCP** or **Codespaces** for execution.
*   ✅ **ALLOWED locally**: `git` operations, file editing (`write_file`), static analysis (`tsc --noEmit`, `prettier`).

**2. TESTING STRATEGY**
Never assume local environment readiness. Use the appropriate sandbox:
*   **Unit Tests**: Delegate to **Wallaby MCP** (if active) or run inside Container.
*   **Integration/E2E**: Delegate to **TestSprite MCP** or **Container-Use MCP**.
*   **DB Migrations**: Execute inside Container or Cloud environment.

**3. DATABASE INTERACTION**
*   **ORM**: Prisma (Strictly). Do not use Drizzle.
*   **Driver**: Neon Serverless driver.
*   **Changes**: ALL schema changes must pass through a migration validation flow (see `docs/prisma/neon-guide.md`).

---

## 🧠 INTELLIGENT KNOWLEDGE ROUTING

Before starting a task, verify if you need specific context. Search for these tags in `docs/` or use the referenced files.

| Context Needed | Search Tag | Primary Documentation |
|----------------|------------|-----------------------|
| **Development Workflow** | `#container` | `.factory/rules/rule-mcp-container-use-QUICKSTART.md` |
| **Inngest / Agents** | `#agentkit` | `docs/agentkit/advanced-patterns.md` |
| **Database / ORM** | `#prisma` | `docs/prisma/neon-guide.md` |
| **Testing Patterns** | `#testing` | `docs/mcp-server-instructions/testsprite-mcp-guide.md` |
| **Project Arch** | `#arch` | `docs/project-architecture.md` |
| **Next.js 15** | `#nextjs` | `UPGRADE/next-16_mcp-next-shadcn-UPGRADE-tasks.txt` |

---

## 🛠️ DEVELOPMENT WORKFLOWS

### A. Feature Implementation (Container-First)
**Preferred method for all coding tasks.**

1.  **Setup**: Initialize a Dagger container using `container-use`.
    ```bash
    # Example internal thought process
    # User asks: "Implement Task 4"
    # Action: Spin up container -> npm install -> Ready to code
    ```
2.  **Develop**: Write code using `write_file` into the mounted workspace.
3.  **Verify**: Run tests *inside* the container.
    ```bash
    # Inside container
    npm run test:unit
    ```
4.  **Finalize**: Once green, commit changes via local git.

### B. Testing & Validation
Use the specific MCPs configured in `.mcp.json`.

*   **TestSprite**: `mcp invoke testsprite --test <file>` for standalone integration tests.
*   **Wallaby**: Use for real-time TDD feedback if the user has the IDE extension active.
*   **Inngest DevServer**: Use for testing event triggers and step orchestration.

---

## 📂 PROJECT STRUCTURE & CONVENTIONS

### Core Stack
*   **Framework**: Next.js 15 (App Router)
*   **Orchestration**: Inngest (v3 SDK) + Checkpointing (Low Latency)
*   **Streaming**: Inngest Realtime (Native WebSocket)
*   **Database**: Neon Postgres + Prisma
*   **AI**: Vercel AI SDK + AgentKit

### Directory Map
*   `src/inngest/`: **CRITICAL**. Contains all Agent definitions and Workflows.
    *   `functions/`: Individual Inngest functions.
    *   `client.ts`: Inngest client configuration.
*   `.taskmaster/`: Project management state.
    *   `tasks/`: Active tasks (JSON).
    *   `docs/`: PRPs (Product Requirement Pyramids) and research.
*   `prisma/`: Database schema and seeds.
*   `src/lib/mcp/`: Custom MCP clients (Jina, Firecrawl, etc.).

### Coding Standards
1.  **Types**: Strict TypeScript. Zod schemas for all Inngest events.
2.  **Formatting**: Prettier is law. Run `npx prettier --write <file>` after editing.
3.  **Exports**: Use named exports. Avoid default exports in `src/lib`.

---

## 📋 COMMAND REFERENCE (Local Safe)

You may safely execute these on the host machine:

*   `git status` / `git diff`
*   `npx prettier --write .`
*   `npx tsc --noEmit`
*   `/jules` (To delegate large refactors to the Jules agent)
*   `container-use ...` (To interact with dev containers)

**DO NOT EXECUTE:** `npm run dev`, `npm install` (Redirect user to Codespace or Container).