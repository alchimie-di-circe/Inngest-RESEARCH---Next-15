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
│  ✅ Container-Use MCP         → Full dev in containers      │
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
| **Full Development (TaskMaster)** | Local Container | **Container-Use MCP** | Agent develops → tests → imports to feature branch → TestSprite | [.factory/rules/](/.factory/rules/) |
| **Unit Tests** | Cloud (Codespace) | **Wallaby MCP** | User runs `Wallaby: Start` in VS Code, then agent uses MCP tools | [docs/mcp-server-instructions/wallaby-mcp-guide.md](docs/mcp-server-instructions/wallaby-mcp-guide.md) |
| **Integration Tests** | Local Sandbox | **TestSprite MCP** | `testsprite_bootstrap_tests` → `testsprite_run_tests` | [docs/mcp-server-instructions/testsprite-mcp-guide.md](docs/mcp-server-instructions/testsprite-mcp-guide.md) |
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

## 🐳 Container-Use Development Workflow

**Alternative Development Mode**: Full implementation and testing in isolated Dagger containers instead of Codespace.

> **Reference Rules**: See [.factory/rules/](/.factory/rules/) for complete container-use documentation:
> - [QUICKSTART](/.factory/rules/rule-mcp-container-use-QUICKSTART.md) - Getting started with containers
> - [Environment Workflows](/.factory/rules/rule-mcp-container-use_environmente-workflows.md) - Full workflow patterns
> - [CLI Reference](/.factory/rules/rule-mcp-container-use_cli-ref-official.md) - All commands
> - [Environment Config](/.factory/rules/rule-mcp-container-use_environmente-config.md) - Setup & configuration
> - [1Password Secrets](/.factory/rules/rule-mcp-container-use-secret-1password-management.md) - Secure secret management

### When to Use Container-Use vs Codespace

| Scenario | Container-Use | Codespace |
|----------|---------------|-----------|
| TaskMaster task implementation | ✅ Preferred | ✅ Alternative |
| Parallel task waves (e.g., T3+T4+T14) | ✅ Best (multiple isolated containers) | ❌ Single instance |
| Quick prototyping | ✅ Disposable sandboxes | ✅ Persistent environment |
| CI-like isolation | ✅ Full isolation per task | ❌ Shared state |
| Long running sessions | ❌ Ephemeral containers | ✅ Persistent |

### Container Development Workflow for TaskMaster Tasks

**Phase 1: Container Development (Droid in Container-Use)**

```
1. User Request
   └─ "Implement Task 3" or "Execute wave T3+T4+T14"

2. Droid Creates Container(s)
   ├─ Single task → 1 container
   └─ Wave/parallel → N containers (example: 3 parallel for comparison)

3. In Each Container
   ├─ npm install (dependencies)
   ├─ Develop code following TaskMaster task requirements
   ├─ npm run build (verify compilation)
   ├─ npm test (run all tests in container)
   └─ Notify user: ✅ GREEN or ❌ RED

4. If Tests FAIL
   └─ Droid iterates in container or notifies user for guidance

5. If Tests PASS
   └─ Container development complete, ready for import phase
```

**Phase 2: Import & Pre-PR Validation (Mac Air - Local)**

```
6. Review Changes (User)
   └─ container-use diff {id}    # See what changed
   └─ container-use log {id}     # See commit history
   └─ container-use terminal {id} # (Optional) Debug in container

7. Import to Feature Branch (User)
   ├─ git checkout -b feat/task-3   # Create feature branch FIRST
   ├─ container-use merge {id}      # Preserve commit history
   └─ (or container-use apply {id}) # Staged changes for custom commit

8. For Parallel Waves
   ├─ Wait ALL containers to complete ✅
   ├─ Import all containers in sequence to same feature branch
   └─ (container-use never merges to main directly!)

9. TestSprite Bootstrap (Pre-PR Test)
   ├─ testsprite_bootstrap_tests    # Unit + integration tests
   └─ Catches any missed tests from containers

10. If TestSprite PASSES ✅
    └─ Open PR with complete implementation

11. If TestSprite FAILS ❌
    ├─ Fix locally and re-commit, OR
    └─ Re-delegate to container for fixes
```

### Parallel Container Strategy (TaskMaster Waves)

For complex waves like **Phase 2: T3+T4+T14**:

```
CONTAINER 1: brand-config-alpha
├─ Task 3: Brand Configuration Management
├─ Develops API routes + UI components
└─ Tests independently

CONTAINER 2: deep-research-beta
├─ Task 4: Deep Research Agent Refactor
├─ Develops research pipeline
└─ Tests independently

CONTAINER 3: api-routes-gamma
├─ Task 14: API Routes & Structure
├─ Develops REST endpoints
└─ Tests independently

Synchronization:
  container 1 ✅ → import
  container 2 ✅ → import  
  container 3 ✅ → import
  all imported → TestSprite unified test
  tests ✅ → single PR for entire wave
```

**Workflow for Parallel Containers**:
1. Droid creates N containers simultaneously
2. Each container develops + tests independently
3. Monitor with `container-use watch` and `container-use log {id}`
4. ALL containers must pass before import phase
5. Import all in sequence to same `feat/wave-*` branch
6. Run TestSprite once with ALL changes combined
7. Open single PR for entire wave

### Updated Agent Decision Tree

```
Request: "Implement TaskMaster Task X" or "Execute Wave Y"
    ↓
Agent checks: Container-Use MCP available?
    ├─ YES → Container Development Workflow
    │        1. Create container(s) → develop → test
    │        2. Notify user when complete
    │        3. User reviews with container-use commands
    │        4. User imports to feature branch
    │        5. TestSprite pre-PR validation
    │        6. Open PR
    │
    └─ NO → Fallback to Codespace Workflow
             1. Instruct user to open Codespace
             2. Develop code there
             3. TestSprite validation
             4. Open PR
```

### Container-Use Commands Quick Reference

```bash
# Monitor & Review (User on Mac Air)
container-use list                    # See all active containers
container-use watch                   # Real-time progress monitoring
container-use log {id}                # What did Droid do? (commit history)
container-use log {id} --patch        # Show detailed code changes
container-use diff {id}               # Quick code review
container-use terminal {id}           # (Debug) Enter container if needed

# Import to Feature Branch (User on Mac Air)
git checkout -b feat/task-3           # CRITICAL: Feature branch first!
container-use merge {id}              # Option 1: Preserve commit history
# OR
container-use apply {id}              # Option 2: Stage for custom commit
git commit -m "custom message"

# Cleanup (Optional - User on Mac Air)
container-use delete {id}             # Remove one container
container-use delete --all            # Remove all containers
```

### Pre-PR Checklist (Container Workflow)

```yaml
□ Container Development Phase
  □ All containers completed successfully
  □ Tests pass ✅ in container(s)
  □ Droid notified user of completion

□ Import & Feature Branch Phase
  □ Created feature branch (NOT main!)
  □ Used container-use merge or apply
  □ All wave containers imported (if parallel)
  □ No untracked files in branch

□ Pre-PR Validation
  □ TestSprite bootstrap: testsprite_bootstrap_tests
  □ TestSprite full: testsprite_run_tests
  □ All tests pass (unit + integration + E2E)
  □ No console.log() or debug code
  □ Prettier formatted: npx prettier --write

□ PR Ready
  □ Descriptive PR title (e.g., "feat: Implement Task 3 - Brand Config Management")
  □ PR references TaskMaster task(s)
  □ No sensitive data in commits
  □ Ready for code review
```

### Important Container Rules

1. **NEVER merge containers directly to main** - Always use feature branches first
2. **Wait for ALL containers** in a wave before importing
3. **TestSprite is MANDATORY** before opening PR - Critical safety check
4. **User approval required** before import - Droid notifies, waits for user decision
5. **Secrets via 1Password** - Containers use `op://` refs, never expose raw values
6. **Cleanup containers** after merge - `container-use delete {id}` to save resources

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
- **Container-Use Rules**: [.factory/rules/](/.factory/rules/) - Complete container development guide
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
