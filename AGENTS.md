# AGENTS.md - AI Agent Development & Testing Guide

> **Status**: Production Ready  
> **Last Updated**: January 28, 2026  
> **For**: Claude Code, Droid, Kilocode, Gemini CLI  
> **Cross-Reference**: See [.claude/CLAUDE.md](.claude/CLAUDE.md) for project context

---

## 🎯 Core Principle: Environment-Aware Tool Selection

**Never run heavy tests locally on the Mac Air. Always use the appropriate environment.**

```
┌─────────────────────────────────────────────────────────────┐
│  LOCAL (Mac Air - PROTECTED)                                │
│  ✅ Dagger container-use CLI  → Isolated test sandboxes     │
│  ✅ TestSprite MCP            → Integration/E2E tests       │
│  ❌ NO npm install/build/test locally                       │
├─────────────────────────────────────────────────────────────┤
│  CLOUD (GitHub Codespace / DevContainer)                    │
│  ✅ Wallaby MCP               → Unit tests (requires ext)   │
│  ✅ Chrome DevTools MCP       → Frontend debugging          │
│  ✅ Inngest DevServer MCP     → Inngest functions dev       │
│  ✅ npm install/build/test    → All operations here         │
├─────────────────────────────────────────────────────────────┤
│  CI/CD (GitHub Actions)                                     │
│  ✅ Jest                      → Unit tests automated        │
│  ✅ Playwright                → E2E tests automated         │
│  ✅ Build & Deploy            → Vercel/Cloud Run            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Tools Matrix

| Test Type | Environment | Tool | How to Use | Documentation |
|-----------|-------------|------|------------|---------------|
| **Unit Tests** | Cloud (Codespace) | **Wallaby MCP** | User runs `Wallaby: Start` in VS Code, then agent uses MCP tools | [docs/mcp-server-instructions/wallaby-mcp-guide.md](docs/mcp-server-instructions/wallaby-mcp-guide.md) |
| **Integration Tests** | Local Sandbox | **TestSprite MCP** | `testsprite_bootstrap_tests` → `testsprite_run_tests` | [docs/mcp-server-instructions/testsprite-mcp-guide.md](docs/mcp-server-instructions/testsprite-mcp-guide.md) |
| **E2E with Real APIs** | Local Container | **Dagger Container-use** | `container-use checkout {id}` CLI commands | [docs/mcp-server-instructions/dagger-container-use.md](docs/mcp-server-instructions/dagger-container-use.md) |
| **Frontend Debugging** | Cloud | **Chrome DevTools MCP** | MCP tools for DOM, console, network | [docs/mcp-server-instructions/chrome-devtools-mcp-guide.md](docs/mcp-server-instructions/chrome-devtools-mcp-guide.md) |
| **Inngest Functions** | Cloud | **Inngest DevServer MCP** | `send_event`, `invoke_function`, `poll_run_status` | [docs/inngest/dev-workflow.md](docs/inngest/dev-workflow.md) |
| **Unit Tests (CI)** | CI/CD | **Jest** | `npm run test:ci` | jest.config.js |
| **E2E Tests (CI)** | CI/CD | **Playwright** | `npm run test:e2e` | playwright.config.ts |

---

## 🗄️ Database Strategy: Neon + Prisma

**ORM**: Prisma (NOT Drizzle)
**Driver**: @neondatabase/serverless via @prisma/adapter-neon
**MCP Server**: Neon MCP (database operations, branches, projects)

### Project Configuration

| Setting | Value |
|---------|-------|
| **Project ID** | `summer-haze-17190561` |
| **Database** | `neondb` |
| **Owner Role** | `neondb_owner` |

### Branches

| Branch | ID | Environment | Connection String |
|--------|-----|-------------|-------------------|
| **production** | `br-jolly-salad-agb6asse` | Production | `DATABASE_URL` (main) |
| **preview** | `br-fragrant-dawn-ag82fjdz` | Preview/PR | `DATABASE_URL_PREVIEW` |
| **dev** | `br-sparkling-darkness-agdcyxfm` | Development | `DATABASE_URL_DEV` |

### Why Prisma (Not Drizzle)?

While Neon supports multiple ORMs (Drizzle, Prisma, Kysely), this project standardized on **Prisma** for:
- Rich migration system with `npx prisma migrate`
- Type-safe database operations with `@prisma/client`
- Native Neon serverless driver support via `@prisma/adapter-neon`
- Neon MCP Server for AI-assisted database operations (branches, endpoints)

### Prisma + Neon Stack

| Component | Package/Purpose |
|-----------|-----------------|
| **ORM** | `prisma` + `@prisma/client` - Database operations, migrations |
| **Neon Adapter** | `@prisma/adapter-neon` - Serverless driver integration |
| **Neon MCP** | `npx -y @neondatabase/mcp-server` - AI-assisted DB management |
| **Prisma CLI** | `npx prisma migrate/dev/generate` - Schema migrations (Codespace only) |

### Neon MCP Tools

Available via Neon MCP server for database operations:
- `list_projects` - View Neon projects
- `list_branches` - View branches per project
- `create_branch` - Create new branch
- `delete_branch` - Remove branch
- `get_connection_string` - Get DATABASE_URL for branch
- `execute_sql` - Run SQL queries

### Important: Do NOT Use
- ❌ Drizzle ORM (not used in this project)
- ❌ @neondatabase/serverless directly (use via Prisma adapter)
- ❌ Raw SQL queries (use Prisma Client)
- ❌ Prisma MCP (does not exist for ORM operations - use CLI)

### References
- **Prisma Guides**: [docs/prisma/](docs/prisma/) - Project-specific setup
- **Neon + Prisma**: [docs/prisma/neon-guide.md](docs/prisma/neon-guide.md)
- **Prisma+Neon Skill**: [.kilocode/skills/skill-PRISMA-ORM-Neon-integration/SKILL.md](.kilocode/skills/skill-PRISMA-ORM-Neon-integration/SKILL.md) - Serverless adapter setup
- **Neon Skill**: [.kilocode/skills/using-neon/SKILL.md](.kilocode/skills/using-neon/SKILL.md) - General Neon usage with MCP

### Specialized Neon Droids

Custom droids for advanced Neon database operations beyond standard MCP tools:

| Droid | Use Case | Workflow |
|-------|----------|----------|
| **Neon Migration Specialist** | Safe Postgres schema migrations | Create test branch → Run migrations → Validate → Delete branch → PR |
| **Neon Performance Analyzer** | Query performance optimization | Create analysis branch → Identify slow queries → Test optimizations → Before/after metrics |

**When to use:**
- **Migration Specialist**: New schema changes, complex migrations, testing on isolated branches before production
- **Performance Analyzer**: Slow query identification, execution plan analysis, index optimization, zero-downtime tuning

Both droids leverage Neon's branching for safe, isolated testing before applying changes to production.

---

## 🔧 Inngest Development Workflow

**Quick Reference** - See [docs/inngest/dev-workflow.md](docs/inngest/dev-workflow.md) for complete guide.

### 3-Level Development Model

| Level | Environment | Command | Purpose |
|-------|-------------|---------|---------|
| **1** | Local Dev (Codespace) | `npm run inngest:dev` | Dev Server on :8288, auto-discovery |
| **2** | Vercel Preview | `git push origin feature/x` | Auto-deploy, real APIs test |
| **3** | Production | `git push origin main` | Live deployment |

### Inngest MCP Tools (DevServer)

Available when Dev Server is running on http://localhost:8288:

- `send_event` - Trigger functions
- `list_functions` - View all functions
- `invoke_function` - Execute sync
- `get_run_status` / `poll_run_status` - Monitor execution
- `grep_docs` / `read_doc` - Search documentation

---

## 🚫 Local Machine Restrictions

**This project is FULL CLOUD. The Mac Air is for code editing only.**

### ✅ ALLOWED on Mac Air
```bash
git status / diff / commit / push   # Git operations
npx prettier --write <files>        # Format (uses npx cache)
npx tsc --noEmit                    # Type check only
code . / cursor .                   # Open editor
container-use diff {id}             # Review container changes
container-use merge {id}            # Accept container work
```

### ❌ NEVER on Mac Air
```bash
npm install                         # → Use Codespace
npm run build                       # → Use Codespace
npm run dev                         # → Use Codespace
npm test                            # → Use TestSprite MCP or CI
npx prisma migrate                  # → Use Codespace or CI
```

---

## 📋 Agent Decision Tree

```
Request: "Implement feature X with tests"
    ↓
Agent:
    1. Code Implementation (Local IDE / Codespace)
       └─ Write code in src/
    
    2. Unit Tests? (Cloud/Codespace)
       └─ User starts Wallaby → Agent uses wallaby_* tools
    
    3. Integration Tests? (Local Sandbox)
       └─ Use TestSprite MCP tools
    
    4. E2E with Real APIs? (Local Container)
       └─ Use Dagger container-use CLI
    
    5. Inngest Functions? (Cloud DevServer)
       └─ Use Inngest MCP tools
```

---

## 🔗 Cross-References

- **Project Context**: [.claude/CLAUDE.md](.claude/CLAUDE.md)
- **Inngest Workflow**: [docs/inngest/dev-workflow.md](docs/inngest/dev-workflow.md)
- **MCP Guides**: [docs/mcp-server-instructions/](docs/mcp-server-instructions/)
- **Quick Start**: [QUICKSTART.md](QUICKSTART.md)
- **Documentation Index**: [docs/INDEX.md](docs/INDEX.md)

---

## ✅ Agent Checklist (Before Committing)

```yaml
□ Code Implementation
  □ Feature in src/
  □ Types updated
  □ Absolute imports (@/)
  □ No console.log()

□ Unit Tests (Wallaby MCP - Cloud)
  □ User started Wallaby manually
  □ Tests written
  □ All passing (wallaby_failingTests shows 0)

□ Integration/E2E (TestSprite/Dagger - Local Sandbox)
  □ TestSprite tests pass OR
  □ Container-use verification complete

□ Code Quality
  □ Prettier: npx prettier --write <files>
  □ TypeScript: npx tsc --noEmit
  □ No lint errors

□ Git
  □ Descriptive commit message
  □ No unrelated changes
```

---

## 🎓 Quick Command Reference

```bash
# LOCAL MAC (lightweight only)
npx prettier --write <files>
npx tsc --noEmit
git add/commit/push
container-use diff/merge/apply {id}

# CLOUD CODESPACE (full development)
npm install
npm run dev              # Next.js :3000
npm run inngest:dev      # Inngest :8288
npm run test:ci          # Jest

# MCP TOOLS (via agent)
# - Wallaby: wallaby_failingTests, wallaby_allTests, etc.
# - TestSprite: testsprite_bootstrap_tests, testsprite_run_tests
# - Inngest: send_event, poll_run_status, list_functions
# - Chrome DevTools: navigate, screenshot, console
```

---

**This file is the source of truth for AI agent testing workflows.**  
For project architecture and patterns, see [.claude/CLAUDE.md](.claude/CLAUDE.md) and [docs/INDEX.md](docs/INDEX.md).
