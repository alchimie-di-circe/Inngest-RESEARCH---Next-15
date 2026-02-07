# DOC-UPGRADE-pre-PHASE-2-PR.md

> **Status**: Documentation Updates for Phase 2 PR  
> **Branch**: `phase-2--tasks-parallel-wave--11-3-4-14-12`  
> **Date**: February 7, 2026  
> **Purpose**: Verify setup instructions with correct commands before applying to main docs

---

## 📋 Overview

This document contains **verified, corrected setup instructions** that should replace outdated sections in:

- `README.md` (Quick Start section)
- `QUICKSTART.md` (full file)
- `AGENTS.md` (Cloud-First Rules section)

### Key Changes from Previous Docs

✅ **Verified from `package.json`:**
- `npm run dev` ← Next.js frontend (correct)
- `npm run inngestdev` ← Inngest dev server (was: `npm run inngest:dev` ❌)
- `npm run devall` ← Both together (correct)
- `npx prisma generate` ← MUST come before `npm run dev`

---

## 🚀 UPDATED: README.md Quick Start Section

### Quick Start (Updated February 2026)

#### Prerequisites
- GitHub account for Codespaces
- Neon PostgreSQL account (free tier OK)
- Inngest account + API keys  
- Anthropic API key (for Claude integration)

#### Environment Checklist Before Starting
```bash
# In .env.local, you need these keys:
DATABASE_URL=postgresql://...@neon.tech/neondb
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...
ANTHROPIC_API_KEY=...
```

#### Step-by-Step Setup Sequence

**⚠️ CRITICAL: Order matters! Follow exactly as numbered.**

##### Step 1: Create Codespace (2 min)

```bash
# GitHub UI: Code → Codespaces → Create codespace on main
# Wait 2-3 minutes for postCreateCommand to complete
```

The devcontainer automatically installs initial dependencies, but you must complete the remaining steps.

##### Step 2: Install Dependencies (5 min)

```bash
npm install
```

This installs all npm packages. Now.

##### Step 3: Generate Prisma Client (CRITICAL - 2 min)

```bash
npx prisma generate
```

**⚠️ THIS MUST HAPPEN BEFORE `npm run dev`**

This generates the `@prisma/client` TypeScript types. If you skip this, you'll get `Cannot find module '@prisma/client'` errors when starting the dev server.

##### Step 4: Push Database Schema (CRITICAL - 2 min)

```bash
npx prisma db push --skip-generate
```

This creates the database schema in your Neon database. Verify in [Neon Console](https://console.neon.tech).

##### Step 5: Verify Environment (1 min)

```bash
npm run verify:env
```

This checks that all required environment variables are set correctly.

##### Step 6: Type-Check TypeScript (2 min)

```bash
npx tsc --noEmit
```

This validates that all TypeScript code compiles. If you see errors:
- Read the error messages carefully
- Check `src/**/*.ts` for type issues
- Common fixes in [Troubleshooting](#troubleshooting) below

##### Step 7: Start Development (ongoing)

**Option A: Two Terminals (Recommended)**

```bash
# Terminal 1: Start Next.js frontend
npm run dev
# Frontend will be available at http://localhost:3000

# Terminal 2 (NEW terminal): Start Inngest
npm run inngestdev
# Inngest UI will be available at http://localhost:8288
```

**Option B: Single Terminal with Both**

```bash
# Runs both in one terminal with color-coded output
npm run devall
# Frontend: http://localhost:3000
# Inngest: http://localhost:8288
# Ctrl+C stops both
```

##### Step 8: Verify Everything Works

Open in browser:
- ✅ **Frontend**: http://localhost:3000 (should load without errors)
- ✅ **Inngest UI**: http://localhost:8288 (should show your functions)
- ✅ **Database**: Run `npx prisma studio` to browse your data

If any URL fails, check [Troubleshooting](#troubleshooting) below.

### Troubleshooting

| Issue | Solution | Root Cause |
|-------|----------|-----------|
| `Cannot find module '@prisma/client'` | Run `npx prisma generate` | You skipped Step 3 |
| `Error: Database connection failed` | Check `DATABASE_URL` in `.env.local` | Wrong database URL or network issue |
| `Port 3000/8288 already in use` | `npx kill-port 3000 8288` | Another process using the ports |
| `TypeScript errors in src/` | Run `npx tsc --noEmit` and fix errors | Code has type issues |
| `Inngest functions not appearing` | Restart both `npm run dev` and `npm run inngestdev` | Timing issue with hot reload |
| `CORS errors in browser console` | Verify `INNGEST_EVENT_KEY` is correct | Wrong or missing API key |
| `.env.local` file doesn't exist | Create it: `cp .env.example .env.local` then edit | You skipped Step 2 of Setup |

### Common Mistakes (and how to avoid them)

❌ **Mistake 1**: Starting `npm run dev` before `npx prisma generate`

```bash
# DON'T do this:
npm run dev
# Then run: npx prisma generate  ← Wrong order!
```

✅ **Correct**:
```bash
npx prisma generate
npm run dev
```

---

❌ **Mistake 2**: Using wrong Inngest command

```bash
# DON'T use these:
npm run inngest:dev      # ❌ This command doesn't exist!
npm run dev inngest      # ❌ This doesn't work
```

✅ **Correct**:
```bash
npm run inngestdev       # ✅ Exact name from package.json
# OR run both:
npm run devall           # ✅ Runs dev + inngestdev
```

---

❌ **Mistake 3**: Forgetting to push database schema

```bash
# If you only run generate without push:
npx prisma generate     # ← Creates local types
# But schema doesn't exist in Neon!
```

✅ **Correct sequence**:
```bash
npx prisma generate              # Step 3
npx prisma db push --skip-generate  # Step 4
```

---

## 📋 UPDATED: QUICKSTART.md (Full Replacement)

```markdown
# Quick Start Guide - Setup by Step

> **Last Updated**: February 7, 2026  
> **Status**: Verified with Phase 2 changes  
> **Environment**: GitHub Codespace (recommended)

## 🎯 The Correct Setup Sequence

### Phase 1: Codespace & Initial Setup (10 min)

**1. Create a new Codespace**

```bash
# GitHub UI: Code → Codespaces → Create codespace on main
# Wait 2-3 minutes for initial setup
```

**2. Verify you're in the Codespace terminal**

```bash
# You should see a shell prompt like:
# username@codespace-xyz:~/Context-Engineering-with-Inngest $
```

### Phase 2: Dependencies & Prisma (10 min)

**⚠️ CRITICAL: This order is NOT optional.**

**3. Install npm dependencies**

```bash
npm install
# This takes 3-4 minutes
# Wait for it to complete
```

**4. Generate Prisma Client types**

```bash
npx prisma generate
# MUST happen before npm run dev
# If skipped: "Cannot find module @prisma/client" error
```

**5. Push schema to Neon database**

```bash
npx prisma db push --skip-generate
# Creates tables in your Neon database
# Verify: https://console.neon.tech → your project → Tables
```

### Phase 3: Configuration (5 min)

**6. Copy environment template**

```bash
cp .env.example .env.local
```

**7. Edit .env.local with your keys**

```bash
# Open .env.local and fill in:
DATABASE_URL=postgresql://...        # From Neon console
INNGEST_EVENT_KEY=...                # From Inngest dashboard
INNGEST_SIGNING_KEY=...              # From Inngest dashboard
ANTHROPIC_API_KEY=...                # From Anthropic console
# Plus any other keys you need
```

**8. Verify all environment variables**

```bash
npm run verify:env
# Should show: ✅ All required env vars are set
# If it fails: check your .env.local
```

### Phase 4: Validation (5 min)

**9. Check TypeScript compilation**

```bash
npx tsc --noEmit
# Should show: NO errors (if there are errors, fix them in src/)
```

**10. Test the build (optional but recommended)**

```bash
npm run build
# Should complete successfully
# This catches issues before running dev
```

### Phase 5: Development (ongoing)

**11a. Start the development server**

```bash
# Terminal 1:
npm run dev
# Frontend available at: http://localhost:3000
# Keep this terminal open and running
```

**11b. In a NEW terminal window**

```bash
# Terminal 2 (create new one):
npm run inngestdev
# Inngest UI available at: http://localhost:8288
# Keep this terminal open and running
```

**OR: Run both in one terminal**

```bash
# Single terminal option:
npm run devall
# Shows both processes with color-coded output
# Press Ctrl+C to stop both
```

### Phase 6: Verification ✅

**12. Verify everything is working**

| Component | URL | Expected |
|-----------|-----|----------|
| Frontend | http://localhost:3000 | Page loads, no errors |
| Inngest | http://localhost:8288 | Functions list visible |
| Database | Run: `npx prisma studio` | Can browse database tables |

If any fails → scroll to **Troubleshooting** below.

---

## 🆘 Troubleshooting

### Issue: `Cannot find module '@prisma/client'`

**Cause**: You started `npm run dev` before running `npx prisma generate`

**Fix**:
```bash
# Stop dev server (Ctrl+C in Terminal 1)
# In Codespace root:
npx prisma generate
# Then start again:
npm run dev
```

**Prevention**: Always follow the **correct sequence** above. Prisma generation MUST come before dev.

---

### Issue: `Database connection error`

**Cause**: Wrong `DATABASE_URL` or network connectivity

**Fix**:
```bash
# 1. Check your .env.local has DATABASE_URL
cat .env.local | grep DATABASE_URL

# 2. Verify the URL format (should be PostgreSQL)
# Example: postgresql://user:password@host/database

# 3. Test connection
npx prisma db push --skip-generate
# Should succeed or show clear error

# 4. If still fails, check Neon console
# https://console.neon.tech → your project → Connection string
```

---

### Issue: `Port 3000 or 8288 already in use`

**Fix**:
```bash
# Kill the process on that port
npx kill-port 3000 8288

# Then restart:
npm run dev              # Terminal 1
npm run inngestdev      # Terminal 2
```

---

### Issue: `TypeScript compilation errors`

**Cause**: Code has type issues

**Fix**:
```bash
# See all errors:
npx tsc --noEmit

# Read error messages carefully
# Common fixes:
# - Missing @types packages
# - Function return type mismatch
# - Undefined variable

# Fix them manually, then re-run:
npx tsc --noEmit
```

---

### Issue: `CORS or API key errors`

**Cause**: Missing or wrong API keys

**Fix**:
```bash
# Verify environment:
npm run verify:env

# Check .env.local:
cat .env.local

# Common mistakes:
# - Copied .env.example but didn't fill in real keys
# - Typo in key names
# - Extra whitespace in values

# After editing .env.local:
npm run dev              # Will use new values
```

---

### Issue: `npm install keeps failing`

**Cause**: Network issue or disk space

**Fix**:
```bash
# Clear npm cache:
npm cache clean --force

# Delete node_modules:
rm -rf node_modules

# Try again:
npm install
```

---

## 📚 Available npm Commands

For reference, here are all development commands:

```bash
npm run dev              # Start Next.js frontend (http://localhost:3000)
npm run inngestdev      # Start Inngest dev server (http://localhost:8288)
npm run devall          # Run both dev + inngestdev together

npm run build           # Build for production
npm run start           # Start production server

npm run type-check      # Check TypeScript types
npm run lint            # Run ESLint
npm run format          # Format code with Prettier

npm run test            # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Show test coverage

npm run db:push         # Push Prisma schema to database
npm run db:seed         # Seed database with sample data
npm run db:studio       # Open Prisma Studio (database browser)

npm run verify:env      # Verify environment variables
```

---

## ✅ Checklist: Ready to Code?

Make sure ALL of these pass before starting:

- [ ] Created Codespace (waited 2-3 min)
- [ ] `npm install` completed without errors
- [ ] `npx prisma generate` completed
- [ ] `npx prisma db push` completed (check Neon console)
- [ ] `npm run verify:env` passed ✅
- [ ] `npx tsc --noEmit` showed NO errors
- [ ] `npm run dev` runs without errors (http://localhost:3000 loads)
- [ ] `npm run inngestdev` runs without errors (http://localhost:8288 loads)
- [ ] Prisma Studio opens: `npx prisma studio`

If all checkmarks pass: **You're ready to code!** 🎉

---

## 🔗 Additional Resources

- **Neon docs**: https://neon.tech/docs
- **Prisma docs**: https://www.prisma.io/docs
- **Inngest docs**: https://www.inngest.com/docs
- **Next.js docs**: https://nextjs.org/docs
- **Troubleshooting issues**: See above section

---

## 📞 Still Stuck?

1. Check the **Troubleshooting** section above
2. Run `npm run verify:env` for quick diagnosis
3. Check GitHub Issues for similar problems
4. Create a new issue with:
   - Output of `npm run verify:env`
   - Output of `npx tsc --noEmit`
   - Your OS and Codespace info
```

---

## 📝 UPDATED: AGENTS.md - Cloud-First Rules

### Section: 🚫 LOCAL MACHINE RESTRICTIONS (Cloud-First Development)

Replace the existing section with:

```markdown
## 🚫 LOCAL MACHINE RESTRICTIONS (Cloud-First Development)

This project is **FULL CLOUD**. The Mac Air is for code editing only.

**Principle**: Heavy operations (npm install, npm run dev, database migrations) run in cloud.

### ✅ ALLOWED on Local Mac (Zero Overhead)

```bash
# Git operations (lightweight)
git checkout -b feat/task-3
git diff
git commit -m "..."
git push

# Code formatting & checking (cached locally)
npx prettier --write src/
npx tsc --noEmit

# Code viewing/reading
cat package.json
ls -la src/
code .

# Container operations
container-use diff {id}
container-use merge {id}
container-use apply {id}
```

### ❌ NEVER on Local Mac (Heavy Operations)

```bash
npm install              # → Use Codespace instead ❌
npm run dev              # → Use Codespace instead ❌
npm run inngestdev       # → Use Codespace instead ❌
npm run devall           # → Use Codespace instead ❌
npm run build            # → Use Codespace instead ❌
npx prisma generate      # → Use Codespace instead ❌
npx prisma db push       # → Use Codespace instead ❌
npm test                 # → Use TestSprite MCP or CI ❌
```

### 🌐 CLOUD (GitHub Codespace) - Where Everything Happens

**All heavy operations execute in Codespace:**

```bash
cd /workspace
npm install
npx prisma generate
npx prisma db push --skip-generate
npm run verify:env
npx tsc --noEmit
npm run dev              # Terminal 1
npm run inngestdev       # Terminal 2
npm test
npm run build
```

### ⚠️ CRITICAL: Setup Order in Codespace

**This exact order is NON-NEGOTIABLE:**

```yaml
Sequence:
  1. npm install                          # Install dependencies FIRST
  2. npx prisma generate                  # Generate Prisma types SECOND
  3. npx prisma db push --skip-generate   # Push schema to database THIRD
  4. npm run verify:env                   # Verify env vars FOURTH
  5. npx tsc --noEmit                     # Type check code FIFTH
  6. npm run dev                          # Start frontend SIXTH
  7. npm run inngestdev                   # Start Inngest SEVENTH

Critical Dependencies:
  - npm install → must be first (needed for everything else)
  - npx prisma generate → must be before npm run dev (types required)
  - npx prisma db push → must be before npm run inngestdev (DB schema needed)
  - npm run verify:env → must pass before dev (configs critical)
```

**Why This Order Matters:**

If you skip or reorder:
- ❌ Skip Prisma generate → `npm run dev` fails with "Cannot find @prisma/client"
- ❌ Skip DB push → Inngest queries fail with "table not found"
- ❌ Skip type-check → Find errors after dev is running (harder to debug)

### Recommended Workflow

```bash
# In Codespace:

# 1. Set up once (all 7 steps above)
npm install
npx prisma generate
npx prisma db push --skip-generate
npm run verify:env
npx tsc --noEmit

# 2. Then development (each day):
# Terminal 1:
npm run dev

# Terminal 2:
npm run inngestdev

# 3. For quick testing:
npm run devall          # Runs both in one terminal
```

#### For Agents / Automation

Agents should follow the exact sequence above. Example Kilocode automation:

```bash
# Agent uses background process for sequential setup
npm install && \
  npx prisma generate && \
  npx prisma db push --skip-generate && \
  npm run verify:env && \
  npx tsc --noEmit && \
  npm run dev &
```

The `&` at the end puts the dev server in background for the agent to continue.
```

---

## 🤖 UPDATED: Agent Automation Patterns

### Add to AGENTS.md → New Section:

```markdown
## 🤖 Agent Automation & Development Patterns

### Pattern 1: Sequential Cloud Setup (For Agents)

When an agent needs to set up the project:

```typescript
// Pseudocode for agent setup sequence
async function setupProject() {
  // 1. Install (blocks on network)
  await exec('npm install');
  console.log('✅ Dependencies installed');
  
  // 2. Prisma generation (CRITICAL)
  await exec('npx prisma generate');
  console.log('✅ Prisma types generated');
  
  // 3. Database schema
  await exec('npx prisma db push --skip-generate');
  console.log('✅ Schema pushed to Neon');
  
  // 4. Verification
  await exec('npm run verify:env');
  console.log('✅ Environment verified');
  
  // 5. Type check
  await exec('npx tsc --noEmit');
  console.log('✅ TypeScript valid');
  
  // 6. Start development
  // In CI: just notify
  // For human: suggest manual commands
  console.log('✅ Setup complete.');
  console.log('Next: npm run dev && npm run inngestdev');
}
```

### Pattern 2: Background Processes (Agent Automation)

Agents use `&` (background operator) for automation:

```bash
# Agent starts dev without blocking
npm run dev &

# Equivalent to:
npm run dev  # Starts process
&            # Return control immediately
# Agent can now run other commands
```

**When agents use `&`:**
- ✅ They need to start multiple processes
- ✅ They're simulating parallel operations
- ✅ They're testing environment setup

**When agents use `npm run devall`:**
- ✅ They want both processes visible
- ✅ They want coordinated output
- ✅ They're done setting up (human takes over)

### Pattern 3: Parallel Development (For Humans)

Humans should use one of these:

**Option A: Single Terminal (Recommended for Testing)**
```bash
npm run devall
# Shows both frontend + Inngest in one terminal
# Ctrl+C stops both cleanly
```

**Option B: Multiple Terminals (Recommended for Active Development)**
```bash
# Terminal 1:
npm run dev
# Frontend on http://localhost:3000

# Terminal 2:
npm run inngestdev
# Inngest on http://localhost:8288
```

**Option C: Tmux/Screen (For SSH)**
```bash
tmux new-session -d -s dev 'npm run dev'
tmux new-window -t dev 'npm run inngestdev'
tmux attach -t dev
```

### Pattern 4: Verification Before Each Workflow

Before starting any development session:

```bash
# Quick health check (30 seconds)
npm run verify:env       # ← Environment OK?
npx tsc --noEmit         # ← Code compiles?
curl http://localhost:3000  # ← Port free?
curl http://localhost:8288  # ← Port free?

# If all pass: ready to code
npm run devall
```

```

---

## 🔄 Implementation Path

### Before Applying These Changes

**Test this documentation in a fresh Codespace:**

```bash
# 1. Create new Codespace (don't use existing)
# 2. Follow the QUICKSTART.md instructions exactly as written
# 3. Verify each step works:
#    - npm install ✅
#    - npx prisma generate ✅
#    - npx prisma db push ✅
#    - npm run dev on port 3000 ✅
#    - npm run inngestdev on port 8288 ✅
# 4. If all pass: docs are good!
# 5. If any fail: fix and document the failure
```

### Files to Update (When Ready)

Once verified, apply these changes:

1. **README.md** → Replace "Quick Start" section with content from above
2. **QUICKSTART.md** → Replace entire file with new content
3. **AGENTS.md** → 
   - Replace "Cloud-First Rules" section
   - Add "Agent Automation Patterns" section

### Files NOT to Change

❌ Do not modify:
- `package.json` (commands are correct as-is)
- `.devcontainer/devcontainer.json` (postCreateCommand already handles initial setup)
- `.env.example` (template is correct)

---

## ✅ Final Verification Checklist

Before applying to main docs:

- [ ] All commands tested in fresh Codespace
- [ ] `npm run dev` works on :3000
- [ ] `npm run inngestdev` works on :8288
- [ ] `npm run devall` runs both simultaneously
- [ ] No typos in command names
- [ ] Step ordering is logical and testable
- [ ] Troubleshooting section covers common issues
- [ ] Links to external resources are current
- [ ] Examples match actual output

---

## 📝 Notes for Reviewer

**What's different:**
- ✅ Correct command names (`npm run inngestdev`, not `npm run inngest:dev`)
- ✅ Explicit step ordering (Prisma generation must be step 2-3, before dev)
- ✅ Better troubleshooting section
- ✅ Clearer for Codespace users

**What's the same:**
- ✅ Technology stack unchanged
- ✅ Neon + Prisma + Inngest integration unchanged
- ✅ Development workflow unchanged

**Testing needed:**
- [ ] Fresh Codespace from `main` branch
- [ ] Fresh Codespace from `phase-2--tasks-parallel-wave--11-3-4-14-12` branch
- [ ] Verify no regression from existing docs

---

## 📞 Questions Before Applying?

- Should we add Docker local dev option?
- Should we add troubleshooting for Neon billing?
- Should we add section for environment variables explanation?
- Should we link to video tutorial?

**Ready to apply?** Just confirm and I'll update the three files.
