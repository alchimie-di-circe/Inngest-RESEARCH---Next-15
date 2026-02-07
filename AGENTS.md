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
| **1** | Local Dev (Codespace) | `npm run inngestdev` | Dev Server on :8288, auto-discovery |
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

Testing & Development Orchestration

> **Status**: Master Agent Guidelines for Research & Publishing Suite  
> **Last Updated**: January 16, 2026  
> **For**: Claude Code, Droid, Kilocode, Gemini CLI (all AI agent orchestrators)  
> **Context**: Used with TestSprite MCP + Wallaby MCP + Dagger container-use MCP

---

## 🎯 CORE PRINCIPLE

**Never run tests locally on the Mac Air. Always use sandboxes.**

```
User's Mac (8GB RAM, 250GB HD)     ← PROTECTED
    ↓
Development & coding (normal)      ← Full IDE experience
    ↓
Test execution (ALWAYS delegated)  ← TestSprite MCP, Wallaby MCP, CI/CD
```

---

## 🚫 LOCAL MACHINE RESTRICTIONS (Cloud-First Development)

**This project is FULL CLOUD. The Mac Air is for code editing only.**

### Development Environment: GitHub Codespace

```
┌─────────────────────────────────────────────────────────────┐
│  GitHub Codespace = Your Cloud Dev Machine                  │
├─────────────────────────────────────────────────────────────┤
│  ✅ npm install          → Runs in cloud, not on Mac       │
│  ✅ npm run dev          → localhost:3000 forwarded        │
│  ✅ npm run build        → Build in cloud                  │
│  ✅ npx prisma migrate   → DB operations in cloud          │
│  ✅ Full testing suite   → Jest, Playwright, etc.          │
└─────────────────────────────────────────────────────────────┘
```

**How to start:**

1. GitHub repo → Code → Codespaces → "New codespace"
2. Wait for devcontainer setup (~2 min first time)
3. In Codespace terminal: `npm install && npm run dev`
4. Click forwarded port → Opens localhost:3000 in browser

### Local Mac Air: Code Editing Only

```bash
# ✅ ALLOWED on Mac Air (lightweight, no install)
git status / diff / commit / push   # Git operations
npx prettier --write <files>        # Format (uses npx cache)
npx tsc --noEmit                    # Type check only
code . / cursor .                   # Open editor

# ❌ NEVER on Mac Air (heavy operations)
npm install       # → Use Codespace instead
npm run build     # → Use Codespace instead
npm run dev       # → Use Codespace instead
docker compose up # → Use Codespace instead
npx prisma migrate deploy  # → Use CI/CD or Codespace
```

### Agent Decision: "Should I run this locally?"

```
User/Task asks: "Run npm install", "Build the project", or "Start dev server"
    ↓
Agent Response:
    "This project uses cloud-first development. I won't run npm install/build
     on your Mac Air.

     To test the app:
     1. Open GitHub Codespace: gh codespace create -r <repo>
     2. In Codespace terminal: npm install && npm run dev
     3. Click the forwarded port link to open in browser

     Need me to help with something else while you set up Codespace?"
```

### Recommended Workflow: Task → Branch → PR → Review

```yaml
Task assigned: 1. Create branch locally       → git checkout -b feat/task-xyz
  2. Write code on Mac Air       → Edit files in VSCode/Cursor
  3. Format & type-check         → npx prettier --write . && npx tsc --noEmit
  4. Commit & push               → git commit -m "..." && git push

Testing (Pre-PR): 5. Open GitHub Codespace       → Test app locally in cloud
  6. npm install && npm run dev  → Verify feature works
  7. Run integration tests       → Use TestSprite MCP in Codespace

PR & Review: 8. Create PR                   → gh pr create
  9. Reviewer opens Codespace    → Tests in their cloud env
  10. Review → Approve
  11. Merge                      → Squash & merge to main
```

### Future: Vercel Preview (Optional Enhancement)

When ready (after stable main branch), add Vercel for automatic PR previews:

```
User pushes branch
    ↓
Vercel auto-builds & deploys preview
    ↓
PR comment: "Preview: https://inngest-research-feat-xyz.vercel.app"
    ↓
Reviewers click link instead of opening Codespace
```

**Setup when needed:**

- `vercel link` in Codespace
- Configure env vars in Vercel Dashboard
- All subsequent pushes auto-deploy

---

## 📦 Git Sparse-Checkout Configuration

To avoid downloading heavy directories (like `node_modules/`) while keeping all project files (.claude, .taskmaster, .factory, etc.):

```bash
# Setup sparse-checkout (one-time, during initial clone)
git sparse-checkout init --cone
git sparse-checkout set --no-cone '*' '!node_modules'

# Verify configuration
git sparse-checkout list
# Should show:
#   *
#   !node_modules
```

**Why sparse-checkout?**

- **Saves disk space**: Excludes `node_modules/` (884MB+) from local checkout
- **Keeps all configs**: ALL project files visible (.claude, .taskmaster, .factory, .gemini, .codex, docs, etc.)
- **Git still tracks everything**: Just doesn't materialize node_modules locally (it's in .gitignore anyway)
- **Cloud-first aligned**: You install packages in Codespace, not locally

**What gets checked out:**

```
✅ Visible (checkout):
   .claude, .codex, .factory, .gemini, .taskmaster
   src, prisma, public, scripts, docs, e2e, tests
   .devcontainer, .github, .env.example, package.json, etc.

❌ NOT visible (excluded):
   node_modules/ (won't be downloaded)
```

---

## 🔍 AGENT DECISION TREE

When Droid/Claude Code/Kilocode receives a development request:

```
Request: "Implement feature X with tests"
    ↓
Agent (You reading this):
    1. Check: Is this a unit test edit/write?
       → YES: Use Wallaby MCP (local IDE integration or cloud)
       → NO: Continue

    2. Check: Is this an integration/E2E test?
       → YES: Use TestSprite MCP sandbox
       → NO: Continue

    3. Check: Is this a feature implementation?
       → YES: Code in local IDE (Codespaces or devcontainer)
       → Then: Trigger TestSprite MCP for integration tests
       → Then: CI/CD runs full suite

    4. Default: Never `npm test` locally. Always delegate.
```

---

## 🧪 TEST RUNNER MATRIX

| Test Type       | Runner         | Where              | Config File                   | When       | Command              |
| --------------- | -------------- | ------------------ | ----------------------------- | ---------- | -------------------- |
| **Unit**        | Wallaby (MCP)  | Local IDE or Cloud | `.mcp/wallaby-config.json`    | On save    | `wallaby watch`      |
| **Unit** (CI)   | Jest           | GitHub Actions     | `jest.config.js`              | On push    | `npm test:ci`        |
| **Integration** | TestSprite MCP | Sandbox (headless) | `.mcp/testsprite-config.json` | Pre-commit | `mcp run testsprite` |
| **E2E**         | TestSprite MCP | Sandbox + Docker   | `.mcp/testsprite-config.json` | Pre-commit | `mcp run testsprite` |
| **Performance** | GitHub Actions | Server             | `.github/workflows/perf.yml`  | On push    | Auto                 |
| **Build**       | GitHub Actions | Server             | `.github/workflows/build.yml` | On push    | Auto                 |

---

## 📖 DETAILED AGENT WORKFLOWS

### Scenario 1: Agent Implements a New Feature (Common)

**Request to Agent**:

```
"Implement deep-research-agent.ts with proper error handling and tests"
```

**Agent Execution Plan**:

```yaml
Step 1: Code Implementation (Local IDE)
  └─ Create: src/inngest/deep-research-agent.ts
  └─ Add types: src/types/research.ts (if needed)
  └─ Code follows AgentKit Pattern 4 (multi-steps tools)
  └─ Status: ✅ Typed, compilable

Step 2: Unit Test Writing (Wallaby MCP Coordination)
  └─ Create: src/inngest/deep-research-agent.test.ts
  └─ Write: Test search orchestration, parallel execution, error handling
  └─ Pattern: Mocks for search_web tool + Neon DB
  └─ Status: Tests FAIL (red) - as expected in TDD
  └─ Wallaby MCP runs in IDE (watch mode)
  └─ Agent watches Wallaby output in IDE console

Step 3: Implementation Loop
  └─ Agent implements until unit tests PASS (green)
  └─ No `npm test` locally - Wallaby handles it
  └─ Status: Unit tests ✅ PASS

Step 4: Integration Test Creation (TestSprite MCP)
  └─ Create: tests/integration/deep-research.test.ts
  └─ Write: Real Neon DB, real Inngest functions
  └─ Pattern: Setup test DB, run function, verify schema
  └─ **Execution**: Delegate to TestSprite MCP
  └─ Command: "mcp invoke testsprite --test tests/integration/deep-research.test.ts"
  └─ TestSprite runs in sandbox ← ZERO local overhead
  └─ Agent monitors: TestSprite output in logs/testsprite.log
  └─ Status: Integration tests ✅ PASS

Step 5: Pre-Commit Checklist
  └─ ✅ Prettier formatting applied (npx prettier --write <files>)
  └─ ✅ Unit tests passing (Wallaby)
  └─ ✅ Integration tests passing (TestSprite)
  └─ ✅ TypeScript compilation succeeds
  └─ ✅ No console errors
  └─ ✅ Coverage meets thresholds (80% lines)

Step 6: Commit & Push
  └─ git add src/inngest/deep-research-agent.ts tests/
  └─ git commit -m "feat(Phase 1): Implement deep research agent with multi-step orchestration"
  └─ git push
  └─ Status: ✅ Ready for CI/CD

Step 7: CI/CD Verification (GitHub Actions - Automatic)
  └─ GitHub automatically runs:
     ├─ npm run test:ci (all unit tests via Jest)
     ├─ npm run test:integration (all integration tests)
     ├─ npm run lint (ESLint + TypeScript check)
     ├─ npm run build (Next.js build)
  └─ Status: ✅ All checks pass → PR mergeable
```

**Key Points**:

- Agent NEVER runs `npm test` locally
- Wallaby MCP provides feedback in IDE (fast, watch mode)
- TestSprite MCP sandbox isolated from Mac Air (network request)
- CI/CD is final verification (parallel, server-side)

---

### Scenario 2: Agent Debugs a Failing Test

**Request to Agent**:

```
"Integration test for context-research-agent is failing. Debug and fix."
```

**Agent Execution Plan**:

````yaml
Step 1: Analyze Test Failure
  └─ Look at CI output: github.com/repo/actions/run/XXX
  └─ See error: "Cannot find brand_config table"
  └─ Root cause: Migration not run in test setup

Step 2: Inspect Test Setup (Code)
  └─ File: tests/integration/context-research.test.ts
  └─ Look: setupFilesAfterEnv in jest.config.js
  └─ Issue: DB migrations need to run BEFORE tests

Step 3: Fix: Update Test Setup
  └─ Edit: tests/setup/integration.ts
  └─ Add: Run migrations before tests
  └─ Pattern:
     ```typescript
     beforeAll(async () => {
       await runMigrations(); // ← Add this
       await db.$connect();
     });
     ```

Step 4: Verify Fix (TestSprite MCP)
  └─ Don't run locally - delegate:
  └─ "mcp invoke testsprite --test tests/integration/context-research.test.ts"
  └─ TestSprite runs in sandbox with fresh DB
  └─ Output: Test PASSES ✅
  └─ Agent sees result in testsprite.log

Step 5: Commit Fix
  └─ git add tests/setup/integration.ts
  └─ git commit -m "fix(tests): Add DB migration setup for integration tests"
  └─ git push
  └─ CI/CD re-runs automatically
````

**Key Pattern**:

- Agent identifies issue from CI logs (not local reproduction)
- Agent fixes in IDE (edits test/setup files)
- Agent uses TestSprite MCP to verify (not local npm test)
- Agent commits + pushes (CI/CD final check)

---

### Scenario 3: Agent MCP server implementation (in Codebase)

**Request to Agent**:

```
"i want to add Canva MCP server to one of our Agentkit agents to let him create design using Canva MCP server tools. After implementing test some real possible user requests to the agent to check if it works without problems with our API. "
```

**Agent Execution Plan**:

````yaml
Step 1: Implement MCP Integration (Code)
  └─ File: src/inngest/canva-agent.ts
  └─ Pattern: AgentKit Pattern 6 (MCP integration)
  └─ Code calls: MCP Canva server via agentkit.tools.canva_create()

Step 2: Unit Test (Wallaby MCP)
  └─ File: src/inngest/canva-agent.test.ts
  └─ Mock: MCP Canva responses
  └─ Pattern:
     ```typescript
     jest.mock('@anthropic-sdk/tools', () => ({
       canva_create: jest.fn().mockResolvedValue({
         designUrl: 'https://canva.com/...'
       })
     }));
     ```
  └─ Status: Tests PASS (mocked)

Step 3: Container Sandbox Test (Dagger MCP)
  └─ For REAL MCP interaction, need container environment
  └─ File: tests/e2e/canva-integration.test.ts
  └─ Delegate to Dagger container-use:
  └─ "mcp invoke container-use --test tests/e2e/canva-integration.test.ts"
  └─ Container has MCP tools available
  └─ Real Canva API calls (test account)
  └─ Status: Design created ✅

Step 4: Verify in Integration Test (TestSprite MCP)
  └─ File: tests/integration/canva-agent.test.ts
  └─ Test: Agent receives Canva API response, saves to DB
  └─ Delegate to TestSprite MCP sandbox
  └─ Status: Integration works ✅

Step 5: Commit
  └─ git add src/inngest/canva-agent.ts tests/
  └─ git commit -m "feat(Phase 3): Implement Canva design agent with MCP integration"
````

**Key Tool Usage**:

- **Wallaby MCP**: Fast unit test feedback (mocks)
- **Dagger MCP**: Container sandboxes for real tool interaction
- **TestSprite MCP**: Integration tests (DB + API mocks)
- **CI/CD**: Final production verification

---

## 🛠️ MCP SERVER SETUP

### 1. TestSprite MCP Configuration

**File: `.mcp/testsprite-config.json`**

```json
{
  "name": "testsprite",
  "type": "mcp-server",
  "command": "mcp-testsprite-server",
  "args": ["--token", "${TESTSPRITE_API_KEY}"],
  "env": {
    "TESTSPRITE_API_KEY": "ts_prod_xxxxx",
    "DATABASE_URL": "postgresql://test:test@localhost:5432/research_suite_test",
    "NODE_ENV": "test"
  },
  "capabilities": ["test_execution", "sandbox_management", "parallel_runs"],
  "options": {
    "timeout": 60000,
    "parallel_workers": 4,
    "cleanup": "always"
  }
}
```

**Available Commands**:

```bash
# Run specific test file
mcp invoke testsprite --test tests/integration/deep-research.test.ts

# Run all integration tests
mcp invoke testsprite --test tests/integration/**/*.test.ts

# Run with coverage
mcp invoke testsprite --test tests/e2e/*.test.ts --coverage

# Run with debugging enabled
mcp invoke testsprite --test tests/e2e/*.test.ts --debug --verbose

# Get test report
mcp invoke testsprite --report json --output testsprite-report.json
```

### 2. Wallaby MCP Configuration

**File: `.mcp/wallaby-config.json`**

```json
{
  "name": "wallaby",
  "type": "mcp-server",
  "command": "wallaby-server",
  "args": ["--port", "5555"],
  "env": {
    "NODE_ENV": "test",
    "WALLABY_PORT": "5555"
  },
  "capabilities": ["file_watcher", "test_execution", "coverage_reporting"],
  "options": {
    "watch_mode": true,
    "auto_run": true,
    "coverage_overlay": true
  }
}
```

**IDE Integration** (VSCode):

```json
// .vscode/settings.json
{
  "wallaby.testFramework": "jest",
  "wallaby.autoRun": "on-demand",
  "wallaby.showCoverageOnLoad": true
}
```

**Available Commands**:

```bash
# Watch unit tests (IDE integrated)
wallaby watch

# Watch specific tests only
wallaby watch --testNamePattern="context-research"

# Single run with coverage
wallaby run --coverage

# Debug a test
wallaby debug --test deep-research-agent.test.ts
```

### 3. Dagger Container-Use MCP Configuration

**File: `.mcp/container-use-config.json`**

```json
{
  "name": "container-use",
  "type": "mcp-server",
  "command": "container-use",
  "args": ["--engine", "docker"],
  "capabilities": ["container_execution", "mcp_tool_isolation", "docker_socket"],
  "options": {
    "image": "node:20-alpine",
    "mounts": {
      "/workspace": "${PWD}",
      "/mcp": "/mcp"
    },
    "network": "host"
  }
}
```

**Available Commands**:

```bash
# Run test in container with MCP tools available
mcp invoke container-use --test tests/e2e/canva-integration.test.ts

# Run full workflow in container
mcp invoke container-use --test tests/e2e/full-publish-flow.test.ts

# Interactive debugging
mcp invoke container-use --interactive --shell /bin/sh
```

---

## 📋 TESTING WORKFLOW BY PROJECT INNGEST-AGENTKIT PHASE

### Phase 1: Deep Research (Agent Development)

**Workflow**:

```bash
# Development (you in IDE)
1. Agent writes: src/inngest/deep-research-agent.ts
2. Agent writes: src/inngest/deep-research-agent.test.ts (failing tests first - TDD)
3. Wallaby MCP watches + shows failures in IDE margin
4. Agent fixes implementation until Wallaby shows ✅ PASS

# Pre-commit (agent delegates)
5. Agent: "mcp invoke testsprite --test tests/integration/deep-research.test.ts"
6. TestSprite runs in sandbox → agent waits for result
7. TestSprite: ✅ PASS or ❌ FAIL
   → If PASS: Continue to step 8
   → If FAIL: Agent edits test/code, re-invokes TestSprite

# Commit
8. Agent: git add/commit/push
9. CI/CD (automatic) runs full suite
10. GitHub Actions: ✅ All checks pass → PR mergeable
```

**Agent Commands Cheat Sheet**:

```bash
# Development (watch unit tests)
wallaby watch

# Pre-commit (test integration)
mcp invoke testsprite --test tests/integration/deep-research.test.ts

# Full suite (CI equivalent locally)
npm run test:ci

# If tests fail, debug
mcp invoke testsprite --test tests/integration/deep-research.test.ts --debug --verbose
```

### Phase 2: Context Research (Multi-Agent Network)

**Special Pattern**: Multi-agent routing requires integration testing

```bash
# Agent writes agents first
1. Agent writes: src/inngest/context-research-agent.ts (multi-agent network)
2. Agent writes unit tests (mocks all sub-agents)
3. Wallaby MCP watches → ✅ PASS for mocks

# Integration: Real multi-agent interaction
4. Agent: "mcp invoke testsprite --test tests/integration/context-research-network.test.ts"
5. TestSprite spins up real Inngest functions, real routing
6. TestSprite: ✅ Agents route correctly, all communicate

# Approval workflow (human-in-the-loop)
7. Agent tests approval gate separately (AgentKit Pattern 3)
8. Pattern: Pause Inngest → show UI → resume
9. File: tests/integration/approval-workflow.test.ts
10. TestSprite: ✅ Pause/resume works
```

### Phase 3: Content Generation (MCP Tools)

**Special Pattern**: MCP Canva requires container sandbox

```bash
# Unit tests (mocks)
1. Agent writes: src/inngest/canva-agent.test.ts (mock MCP)
2. Wallaby MCP: ✅ PASS (mocked responses)

# Container sandbox (real MCP)
3. Agent writes: tests/e2e/canva-integration.test.ts
4. Agent: "mcp invoke container-use --test tests/e2e/canva-integration.test.ts"
5. Container has MCP tools + Canva API access
6. Container: ✅ Real design created

# Integration (TestSprite)
7. Agent: "mcp invoke testsprite --test tests/integration/content-writer.test.ts"
8. TestSprite: ✅ Content + designs coordinated
```

### Phase 4: Publishing (Queue + Retries)

**Special Pattern**: Exponential backoff requires timeout testing

```bash
# Unit tests (queue logic)
1. Agent writes: src/inngest/queue-manager.test.ts
2. Test patterns:
   - Job enqueued → pending
   - Job succeeds → completed
   - Job fails → retries with exponential backoff
3. Wallaby MCP: ✅ PASS (mocked external APIs)

# Integration (real queue)
4. Agent writes: tests/integration/queue-manager.test.ts
5. Pattern: Enqueue job, mock API failures, verify retry logic
6. Agent: "mcp invoke testsprite --test tests/integration/queue-manager.test.ts"
7. TestSprite: ✅ Retries work, exponential backoff verified

# E2E (full publish flow)
8. Agent writes: tests/e2e/full-publish-flow.test.ts
9. Pattern: Research → Context → Content → Queue → Publish
10. Agent: "mcp invoke testsprite --test tests/e2e/full-publish-flow.test.ts"
11. TestSprite: ✅ Full workflow succeeds
```

---

## 🚨 ERROR HANDLING & ESCALATION

### Common Test Failures & Fixes

| Failure                 | Cause                          | Fix                                | Who                |
| ----------------------- | ------------------------------ | ---------------------------------- | ------------------ |
| `Cannot find DB table`  | Migration not run              | Add migration to test setup        | Agent              |
| `Timeout: 5000ms`       | Test too slow                  | Increase timeout or optimize       | Agent + TestSprite |
| `Mock not working`      | Mock declared after import     | Move mock before import            | Agent              |
| `Port 3000 in use`      | Dev server still running       | Kill process or use different port | Agent              |
| `MCP connection failed` | TestSprite/Wallaby not started | Check `.mcp/` config + API key     | Agent              |

### Escalation to Human (Rare)

**When to escalate**:

- 🆘 MCP server infrastructure issue (can't connect)
- 🆘 CI/CD system failure (GitHub Actions broken)
- 🆘 Database corruption (Neon issues)
- 🆘 Architectural design flaw (discovered during testing)

**How to escalate**:

```bash
# Save detailed logs
mcp invoke testsprite --test tests/integration/failing.test.ts --debug --verbose > testsprite-debug.log

# Report
echo "TestSprite MCP failed. See testsprite-debug.log for details."
echo "Escalating to human team."
```

---

## 📊 METRICS & MONITORING

### Metrics Tracked (Automatic)

| Metric                   | Tool                  | Target        | Action                        |
| ------------------------ | --------------------- | ------------- | ----------------------------- |
| Test Coverage            | Jest coverage reports | 80%+ lines    | PR blocked if < 80%           |
| Test Speed (unit)        | Wallaby MCP           | < 500ms       | Wallaby highlights slow tests |
| Test Speed (integration) | TestSprite MCP        | < 10s each    | TestSprite reports if > 10s   |
| Flaky Tests              | CI/CD retries         | 0 flaky tests | Disable & investigate         |
| Build Time               | GitHub Actions        | < 5 min       | Alert if > 5 min              |

### Dashboard (Monitoring)

```bash
# View test metrics
mcp invoke testsprite --report json --output metrics.json
cat metrics.json | grep -E "coverage|duration"

# CI/CD status
gh workflow view test.yml
gh run list --workflow test.yml --limit 10
```

---

## ✅ AGENT CHECKLIST (Before Committing)

```yaml
Before pushing to main:

□ Code Implementation
  □ Feature implemented in src/
  □ Types updated (src/types/)
  □ Imports use absolute paths (@/)
  □ No console.log() or commented code
  □ TypeScript: npx tsc --noEmit (no errors)

□ Unit Tests (Wallaby MCP)
  □ Tests written (follow existing patterns)
  □ All unit tests PASS ✅ (Wallaby shows green)
  □ Coverage >= 80% (Wallaby reports)
  □ No skipped tests (unless documented)

□ Integration Tests (TestSprite MCP)
  □ Integration tests written (tests/integration/)
  □ All integration tests PASS ✅
  □ "mcp invoke testsprite --test tests/integration/**/*.test.ts"
  □ No flaky tests (retried, still pass)

□ Code Quality
  □ Prettier format applied: npx prettier --write <modified-files>
  □ npm run lint (no errors)
  □ npm run build (next.js builds successfully)
  □ No security warnings (npm audit)

□ Git
  □ Commit message descriptive + follows convention
  □ Related issue linked (if applicable)
  □ No unrelated changes in commit

□ Readiness
  □ Reviewed code changes (readable, maintainable)
  □ Thought through edge cases
  □ Ready for CI/CD (GitHub Actions will verify)
```

---

## 🎓 REFERENCE GUIDE

### Command Quick Reference

```bash
# IDE Development (Local)
wallaby watch                # Watch unit tests (Wallaby MCP in IDE)
npm run dev                  # Start Next.js + Inngest
npm run inngestdev         # Start Inngest CLI in separate terminal

# Testing (Delegated)
mcp invoke testsprite --test tests/integration/FILE.test.ts   # Integration test
mcp invoke testsprite --test tests/e2e/FILE.test.ts          # E2E test
mcp invoke container-use --test tests/e2e/FILE.test.ts       # With MCP tools

# Pre-Commit Verification (MANDATORY ORDER)
npx prettier --write <modified-files>  # Format code FIRST
npm run lint                 # ESLint
npx tsc --noEmit           # TypeScript check
npm run test:ci            # Jest (all tests)

# Debugging
mcp invoke testsprite --test FILE.test.ts --debug --verbose  # Detailed logs
wallaby debug --test FILE.test.ts                             # Debug in IDE
```

### File Locations

```
Testing Config:
  .mcp/testsprite-config.json      ← TestSprite MCP settings
  .mcp/wallaby-config.json         ← Wallaby MCP settings
  jest.config.js                   ← Jest configuration

Test Files:
  src/**/*.test.ts                 ← Unit tests (with code)
  tests/integration/               ← Integration tests
  tests/e2e/                       ← End-to-end tests
  tests/fixtures/                  ← Test data
  tests/setup/                     ← Setup files (DB, mocks)
```

### Key Patterns

**Mocking (Unit Tests)**:

```typescript
jest.mock('@lib/db');
const mockDb = db as jest.MockedObject<typeof db>;
```

**Integration Tests (TestSprite)**:

```typescript
describe('Feature', () => {
  beforeAll(async () => {
    await runMigrations(); // Real DB
    await db.$connect();
  });

  it('should work', async () => {
    // Real test against real DB
  });
});
```

**E2E Tests (TestSprite + Container)**:

```typescript
describe('Full Workflow', () => {
  it('should complete Phase 1 → Phase 4', async () => {
    // Real agents, real APIs, real workflow
  });
}, 60000); // 60s timeout
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

## 📚 Documentation Routing by Task

Use these routing tables to find the right documentation for your specific task. All docs in `docs/` are tagged for smart discovery.

### Quick Tag Reference

| When You Need To... | Look For Tags | Files |
|---------------------|---------------|-------|
| **Understand AgentKit patterns** | `#agentkit` `#patterns` | [docs/agentkit/advanced-patterns.md](docs/agentkit/advanced-patterns.md) |
| **Set up Inngest Dev Server** | `#inngest` `#setup` | [docs/inngest/dev-workflow.md](docs/inngest/dev-workflow.md) |
| **Use MCP testing tools** | `#testing` `#mcp` | [docs/mcp-server-instructions/](docs/mcp-server-instructions/) |
| **Configure Prisma + Neon** | `#database` `#prisma` | [docs/prisma/neon-guide.md](docs/prisma/neon-guide.md) |
| **Debug slow queries** | `#database` `#troubleshooting` | [docs/neon/api-reference/toolkit.md](docs/neon/api-reference/toolkit.md) |
| **Use Container-Use workflow** | `#container` `#guides` | [.factory/rules/](/.factory/rules/) |

### By Environment

| Environment | Tags | Docs |
|-------------|------|------|
| **Mac Air (Local)** | `#local` | Container-use, git ops, TestSprite |
| **Codespace (Cloud)** | `#cloud` | Wallaby, Inngest DevServer, npm ops |
| **Container (Dagger)** | `#container` | Full dev workflow in isolation |
| **CI/CD (GitHub Actions)** | `#ci-cd` | Jest, Playwright, automated tests |

### By Technology

| Technology | Primary Docs | Tags |
|------------|--------------|------|
| **Inngest** | [docs/inngest/](docs/inngest/) | `#inngest` |
| **AgentKit** | [docs/agentkit/](docs/agentkit/) | `#agentkit` |
| **Prisma** | [docs/prisma/](docs/prisma/) | `#prisma` `#database` |
| **Neon** | [docs/neon/](docs/neon/)<br>[docs/prisma/neon-guide.md](docs/prisma/neon-guide.md) | `#neon` `#database` |
| **Testing** | [docs/mcp-server-instructions/](docs/mcp-server-instructions/) | `#testing` `#mcp` |

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

### Full Documentation Index
See [docs/INDEX.md](docs/INDEX.md) for complete tag-based navigation.

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
npm run inngestdev      # Inngest :8288
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
