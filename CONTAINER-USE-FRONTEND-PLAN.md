# 🐳 Container-Use Frontend Build Plan

**Status**: Phase 2 at 96% - Ready for Frontend Cycle  
**Date Prepared**: 2026-02-06  
**Branch**: `phase-2--tasks-parallel-wave--11-3-4-14-12`  
**MCP Available**: Yes - Docker Desktop running

---

## 🎯 Session Objective

Use **Container-Use MCP** to build and validate Phase 2 frontend in an isolated container environment.

**Goals:**
- ✅ `npm install` - Verify dependencies
- ✅ `npm run build` - Next.js 15 build (TypeScript + Next.js validation)
- ✅ Type checking - Verify no TypeScript errors
- ✅ Validate build artifacts
- ✅ Merge results back to branch OR iterate

---

## 📊 Context: What's Already Done

### ✅ Completed in Phase 2
| Task | Status | Details |
|------|--------|---------|
| T11 - Types & Schemas | 100% | All Zod schemas + Inngest client configured |
| T12 - Testing Infra | 100% | Jest + Playwright setup complete |
| T3 - Brand Config | 100% | API routes + UI components ready |
| T4 - Deep Research | 78% | Backend ready, **UI needs frontend build** |
| T14 - API Routes | 100% | REST API layer complete |
| **Overall Backend** | **96%** | **Ready for frontend validation** |

### 🔧 Latest Commit
```
5f5dbf7 chore: sync all local changes before container-use
14e55e3 chore: Phase 2 TestSprite Backend Cycle Complete
```

---

## 🚀 Container-Use Workflow

### Step 1: Create Frontend Build Environment
```bash
# Start container-use environment
# This will:
# - Clone current branch into isolated container
# - Prepare Node.js 20 environment
# - Return environment ID (e.g., "fancy-mallard")

# Agent command:
"Create a container environment and run: npm install && npm run build"
```

**Expected Output:**
```
✅ Environment created: {ID}
🔧 Running npm install...
🔨 Running npm run build...
📦 Build artifacts ready at: /workspace/dist or .next
```

### Step 2: Monitor Container-Use (YOU MUST OBSERVE)
```bash
# While agent works, use these commands:

# Check environment status
container-use list

# See what agent is doing (live logs)
container-use log {ID}

# See code changes (after build completes)
container-use diff {ID}

# Check container output/errors
container-use terminal {ID}
```

**Watch For:**
- ⏳ > 2 min with no output → Escalate
- ⏳ > 5 min total → Switch to Codespace
- ❌ "Cannot find module" → Dependency missing
- ❌ TypeScript errors → Type issues in code
- ✅ "Build succeeded" → Ready to merge

### Step 3: Review Build Results
Once container finishes, review:

```bash
# 1. See exactly what changed
container-use diff {ID}

# 2. Review detailed commit log
container-use log {ID}

# 3. Check if there are errors in the log
container-use log {ID} | grep -i error
```

### Step 4: Decision - Accept or Iterate

#### ✅ If Build PASSED (No Errors)
```bash
# Option A: Merge (preserve commit history)
container-use merge {ID}
git log --oneline -3  # Verify merged

# Option B: Apply (stage for custom commit)
container-use apply {ID}
git diff
git commit -m "feat: Frontend build validated in container"

# Clean up
container-use delete {ID}
```

#### ❌ If Build FAILED (Errors Found)
```bash
# Option 1: Fix locally and retry
# Edit files in IDE, commit, and re-run container-use

# Option 2: Iterate in same container
# Prompt agent: "Continue in {ID} and fix the following errors: ..."
# Agent works in same container with same environment

# Option 3: Start fresh
container-use delete {ID}
# Fix issues and create new environment
```

---

## 📋 Exact Commands Reference

### Container-Use MCP Commands
| Command | Purpose | Example |
|---------|---------|---------|
| `container-use list` | See all environments | `container-use list` |
| `container-use log {ID}` | View agent's commits and output | `container-use log fancy-mallard` |
| `container-use diff {ID}` | See code changes | `container-use diff fancy-mallard` |
| `container-use terminal {ID}` | Drop into shell | `container-use terminal fancy-mallard` |
| `container-use merge {ID}` | Accept work + merge to branch | `container-use merge fancy-mallard` |
| `container-use apply {ID}` | Stage changes (no auto-commit) | `container-use apply fancy-mallard` |
| `container-use delete {ID}` | Remove environment | `container-use delete fancy-mallard` |

### What Agent Should Execute in Container
```bash
# Primary build command
npm install
npm run build

# Verify no errors
npx tsc --noEmit

# Optional: check build output
ls -la .next/
```

---

## ⚡ Expected Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Container creation | 30-60 sec | Automatic |
| `npm install` | 2-3 min | Depends on network |
| `npm run build` | 1-2 min | TypeScript + Next.js build |
| Result review | ~30 sec | Your decision time |
| **TOTAL** | **~5 min** | If everything OK |

**Escalation Points:**
- ⏳ No progress after 2 min → Check with `container-use log {ID}`
- ⏳ No response after 5 min total → Fallback to GitHub Codespace
- ❌ Build fails → See error section below

---

## 🔍 What to Test After Build

### 1. TypeScript Compilation
```bash
# Should complete with 0 errors
# If errors: Review src/ files for type issues
npx tsc --noEmit
```

### 2. Next.js Build Output
```bash
# Check if .next folder created
ls -la .next/

# Look for:
# ✅ .next/server/ - Server code
# ✅ .next/static/ - Client assets
# ❌ .next/BUILD_ID (should exist)
```

### 3. No TypeScript Errors in
- `src/types/` - All schemas
- `src/app/api/` - All API routes
- `src/components/` - All components
- `src/inngest/` - All Inngest functions

---

## ❌ Common Issues & Fixes

### Issue: "Cannot find module X"
**Cause**: Dependency not installed or wrong import path  
**Fix**: 
```bash
# Check package.json for missing deps
# Add to package.json if needed
npm install missing-package
```

### Issue: "Property does not exist" (TypeScript)
**Cause**: Type mismatch or missing type definition  
**Fix**:
```bash
# Review error message line number
# Check src/types/ for schema definitions
# Ensure imports match exports
```

### Issue: "Cannot find module in tsconfig"
**Cause**: Module alias not configured  
**Fix**:
```bash
# Check tsconfig.json for:
# - "paths": { "@/*": ["src/*"] }
# - "baseUrl": "."
```

### Issue: Build takes > 10 minutes
**Cause**: Network issues or system overload  
**Fallback**:
```bash
# Use GitHub Codespace instead
gh codespace create
# (runs npm install + build in cloud)
```

---

## 🎯 Final Decision Tree

```
Container-Use Build Completes
    ↓
┌─────────────────────────────┐
│  Review: Any errors?        │
└─────────────────────────────┘
    ↙              ↘
  NO                YES
   ↓                 ↓
MERGE              DEBUG
   ↓                 ↓
✅ Accept       Iterate or
   work          Switch env
   │
   ↓
Push changes
   ↓
Ready for
TestSprite
Frontend
Cycle
```

---

## 📝 Next Steps After Successful Build

Once container-use build PASSES:

1. **Merge to branch** (via `container-use merge`)
2. **Verify local state**
   ```bash
   git status  # Should be clean
   git log --oneline -1  # Shows merged commits
   ```
3. **Ready for TestSprite Frontend Cycle**
   - Migrate to GitHub Codespace (requires `npm run dev`)
   - OR run full frontend tests in new container-use
   
4. **Create PR when ready**
   ```bash
   gh pr create --title "feat: Phase 2 Complete - Backend + Frontend Validated"
   ```

---

## 🆘 If Everything Fails

### Fallback: GitHub Codespace
```bash
# Start fresh Codespace with full dev environment
gh codespace create

# Inside Codespace:
npm install
npm run build
npm run dev  # Start dev server for frontend tests
```

### Fallback: Local Quick Check (No Install)
```bash
# Without installing (node_modules already exist):
npx tsc --noEmit  # Type check only
```

---

## 📞 Key Contacts/References

- **Container-Use Docs**: `.factory/rules/rule-mcp-container-use-*.md`
- **This Plan**: `CONTAINER-USE-FRONTEND-PLAN.md` (you are here)
- **Phase 2 PRD**: `PHASE2-COMBINED-PRD.md`
- **Backend Results**: `testsprite_tests/testsprite-mcp-test-report.md`

---

## ✅ Pre-Session Checklist (Do This First!)

Before starting container-use in next session:

- [ ] Docker Desktop is running
- [ ] `container-use` MCP is active and available
- [ ] Git branch is up to date: `git pull origin phase-2--tasks-parallel-wave--11-3-4-14-12`
- [ ] No uncommitted changes: `git status` shows clean
- [ ] Have this file open for reference

---

**Prepared by**: Droid  
**For**: Next session with container-use MCP active  
**Status**: Ready to execute  
**Expected Duration**: 5-10 minutes total

Good luck! 🚀
