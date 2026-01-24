# AGENTS.md - Testing & Development Orchestration

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

| Test Type | Runner | Where | Config File | When | Command |
|-----------|--------|-------|-------------|------|---------|
| **Unit** | Wallaby (MCP) | Local IDE or Cloud | `.mcp/wallaby-config.json` | On save | `wallaby watch` |
| **Unit** (CI) | Jest | GitHub Actions | `jest.config.js` | On push | `npm test:ci` |
| **Integration** | TestSprite MCP | Sandbox (headless) | `.mcp/testsprite-config.json` | Pre-commit | `mcp run testsprite` |
| **E2E** | TestSprite MCP | Sandbox + Docker | `.mcp/testsprite-config.json` | Pre-commit | `mcp run testsprite` |
| **Performance** | GitHub Actions | Server | `.github/workflows/perf.yml` | On push | Auto |
| **Build** | GitHub Actions | Server | `.github/workflows/build.yml` | On push | Auto |

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

```yaml
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
```

**Key Pattern**:
- Agent identifies issue from CI logs (not local reproduction)
- Agent fixes in IDE (edits test/setup files)
- Agent uses TestSprite MCP to verify (not local npm test)
- Agent commits + pushes (CI/CD final check)

---

### Scenario 3: Agent Uses MCP Tools in Codebase

**Request to Agent**:
```
"i want to add Canva MCP server to one of our Agentkit agents to let him create design using Canva MCP server tools. After implementing test some real possible user requests to the agent to check if it works without problems with our API. "
```

**Agent Execution Plan**:

```yaml
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
```

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
  "capabilities": [
    "test_execution",
    "sandbox_management",
    "parallel_runs"
  ],
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
  "capabilities": [
    "file_watcher",
    "test_execution",
    "coverage_reporting"
  ],
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
  "capabilities": [
    "container_execution",
    "mcp_tool_isolation",
    "docker_socket"
  ],
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

## 📋 TESTING WORKFLOW BY PHASE

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

| Failure | Cause | Fix | Who |
|---------|-------|-----|-----|
| `Cannot find DB table` | Migration not run | Add migration to test setup | Agent |
| `Timeout: 5000ms` | Test too slow | Increase timeout or optimize | Agent + TestSprite |
| `Mock not working` | Mock declared after import | Move mock before import | Agent |
| `Port 3000 in use` | Dev server still running | Kill process or use different port | Agent |
| `MCP connection failed` | TestSprite/Wallaby not started | Check `.mcp/` config + API key | Agent |

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

| Metric | Tool | Target | Action |
|--------|------|--------|--------|
| Test Coverage | Jest coverage reports | 80%+ lines | PR blocked if < 80% |
| Test Speed (unit) | Wallaby MCP | < 500ms | Wallaby highlights slow tests |
| Test Speed (integration) | TestSprite MCP | < 10s each | TestSprite reports if > 10s |
| Flaky Tests | CI/CD retries | 0 flaky tests | Disable & investigate |
| Build Time | GitHub Actions | < 5 min | Alert if > 5 min |

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
npm run inngest:dev          # Start Inngest CLI in separate terminal

# Testing (Delegated)
mcp invoke testsprite --test tests/integration/FILE.test.ts   # Integration test
mcp invoke testsprite --test tests/e2e/FILE.test.ts          # E2E test
mcp invoke container-use --test tests/e2e/FILE.test.ts       # With MCP tools

# Pre-Commit Verification
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
    await runMigrations();  // Real DB
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

## 🔗 RELATED DOCUMENTATION

- **PRD**: See `prd.txt` (Requirements & Architecture)
- **Architecture**: See `.claude/knowledge/project-architecture.md`
- **Inngest Patterns**: See `.claude/knowledge/inngest-patterns.md`
- **AgentKit Patterns**: See `.claude/knowledge/agentkit-advanced-patterns.md`
- **Factory.ai Token Efficiency**: https://docs.factory.ai/guides/power-user/token-efficiency

---

## 📝 CHANGELOG

| Date | Change | Impact |
|------|--------|--------|
| 2026-01-16 | Created AGENTS.md | Agent testing coordination established |
| TBD | Add Wallaby cloud integration | Remove local Wallaby if cloud available |
| TBD | Add TestSprite failure analysis | Auto-suggest fixes for common test failures |

---

**This file is the source of truth for AI agent testing workflows.**  
**Last Updated**: January 16, 2026  
**Status**: Production-Ready for Implementation
