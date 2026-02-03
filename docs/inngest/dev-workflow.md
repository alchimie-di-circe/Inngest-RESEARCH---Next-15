---
tags: [inngest, guides, setup, cloud, all-agents]description: Inngest Development Workflow - 3-level development model
globs: src/inngest/**/*.ts
alwaysApply: true
---

# Inngest Development Workflow

> **Stack**: Inngest + AgentKit + Next.js  
> **Environments**: Local Dev → Vercel Preview → Production

## 🎯 3-Level Development Model

```
┌─────────────────────────────────────────────────────────────┐
│  LEVEL 1: Local Dev (Codespace + Inngest Dev Server)       │
├─────────────────────────────────────────────────────────────┤
│  ✅ Inngest Dev Server (http://localhost:8288)              │
│  ✅ Auto-discovery of functions                             │
│  ✅ Test events via UI                                      │
│  ✅ Inngest MCP Server for AI-assisted development          │
│  ✅ NO production keys required                             │
└─────────────────────────────────────────────────────────────┘
           ↓ Push to feature branch
┌─────────────────────────────────────────────────────────────┐
│  LEVEL 2: Vercel Preview (Automatic per PR)                │
├─────────────────────────────────────────────────────────────┤
│  ✅ Auto-deploy on Vercel for each feature branch          │
│  ✅ Preview environment Inngest (separate keys)            │
│  ✅ Auto-sync with Inngest Cloud (Vercel Integration)      │
│  ✅ Test real webhooks, real APIs, real DB                 │
└─────────────────────────────────────────────────────────────┘
           ↓ Merge to main
┌─────────────────────────────────────────────────────────────┐
│  LEVEL 3: Production (Vercel + Inngest Cloud)              │
├─────────────────────────────────────────────────────────────┤
│  ✅ Production Inngest App                                  │
│  ✅ Production signing keys                                 │
│  ✅ Real Neon Database                                      │
│  ✅ Monitoring & observability                              │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Level 1: Local Development (Codespace)

### Terminal Setup

**Terminal 1: Next.js App**
```bash
npm run dev  # http://localhost:3000
```

**Terminal 2: Inngest Dev Server**
```bash
npm run inngest:dev  # Starts on http://localhost:8288
# Equivalent to: npx inngest-cli@latest dev --no-poll
```

### How Auto-Discovery Works

1. Dev Server scans port 3000 for `/api/inngest` endpoint
2. Automatically finds functions registered in `src/inngest/`
3. UI available at http://localhost:8288 for:
   - ✅ View registered functions
   - ✅ Invoke manually with payload
   - ✅ See execution timeline + step results
   - ✅ Replay failed runs
   - ✅ Test events manually

### Verify Setup
```bash
# Dev Server running?
curl http://localhost:8288

# Functions discovered?
curl http://localhost:3000/api/inngest
# Should return: { "message": "Inngest endpoint configured correctly.", functionsFound: N }
```

## 🔧 Inngest DevServer MCP

### What It Is

Inngest provides an **MCP server built into the Dev Server** that allows AI agents to:
- ✅ List all registered functions
- ✅ Send test events
- ✅ Monitor run status in real-time
- ✅ Read Inngest documentation offline
- ✅ Invoke functions directly (sync execution)

### Setup in .mcp.json

```json
{
  "mcpServers": {
    "inngest-dev": {
      "url": "http://127.0.0.1:8288/mcp"
    }
  }
}
```

### Available MCP Tools

| Tool | Purpose |
|------|---------|
| `send_event` | Trigger functions via events |
| `list_functions` | View all registered functions |
| `invoke_function` | Execute function directly (sync) |
| `get_run_status` | Check run details |
| `poll_run_status` | Monitor multiple runs until completion |
| `grep_docs` | Search Inngest documentation |
| `read_doc` | Read specific documentation file |
| `list_docs` | List available documentation |

### Usage Examples

**Send Test Event:**
```
Use tool: send_event
Parameters: {
  "name": "app/research.requested",
  "data": { "topic": "AI agents" }
}
```

**Monitor Execution:**
```
Use tool: poll_run_status
Parameters: {
  "runIds": ["01J5QH90..."],
  "timeout": 60
}
```

**Search Documentation:**
```
Use tool: grep_docs
Parameters: {
  "pattern": "rate limiting"
}
```

## 🌐 Level 2: Vercel Preview

### Setup (One-time)

1. **Install Vercel Integration for Inngest**
   - Go to: https://vercel.com/integrations/inngest
   - Configure for auto-sync on deploy

2. **Environment Variables in Vercel**
   ```bash
   # Preview Environment
   INNGEST_EVENT_KEY=preview_xxx
   INNGEST_SIGNING_KEY=signkey_preview_xxx
   NEON_DATABASE_URL=postgresql://preview_db
   ```

### Automatic Workflow
```
Push to feature/xyz branch
        ↓
Vercel auto-deploys to https://inngest-research-xyz.vercel.app
        ↓
Inngest Vercel Integration auto-syncs app
        ↓
Preview environment ready with Inngest functions live
        ↓
Test on real URL with real APIs, real DB, real events
```

### When to Use Preview vs Local Dev
- **Local Dev (Level 1)**: Fast development, quick iterations, zero costs
- **Preview (Level 2)**: Full integration testing, external webhooks, real API calls

## 🚀 Level 3: Production

### Sync (if NO Vercel Integration)
```bash
# After deploy to Vercel production
curl -X PUT https://your-production-app.vercel.app/api/inngest \
  --fail-with-body

# Or via Inngest Cloud UI:
# Apps → Sync New App → https://your-app.vercel.app/api/inngest
```

### With Vercel Integration → All Automatic ✅

## 🧠 Agent Decision Tree

```
User asks: "Develop new Inngest function"
          ↓
Agent: Where to develop?
    ├─ Writing function code? → Local IDE (Codespace)
    ├─ Testing function logic? → Inngest Dev Server (Terminal 2)
    ├─ Testing integration? → Vercel Preview (push to branch)
    └─ Production deploy? → Merge to main (auto-sync)

Agent: Need to test function now?
    ├─ Unit test? → Jest (mocked Inngest client)
    ├─ Integration test? → TestSprite MCP sandbox
    ├─ Manual invoke? → Inngest Dev Server UI (:8288)
    └─ Real events? → Send via Inngest SDK or Dev Server UI
```

## 📋 Commands Cheat Sheet

```bash
# LOCAL DEVELOPMENT (Codespace)
npm run dev          # Next.js on :3000
npm run inngest:dev  # Inngest Dev Server on :8288

# Or both at once:
npm run dev:all      # concurrently runs both

# VERCEL PREVIEW
git push origin feature/xyz   # Auto-deploys to Vercel
# → Preview URL: https://inngest-research-xyz.vercel.app
# → Inngest auto-syncs (if integration installed)

# PRODUCTION
git push origin main   # Deploys to production
# → Auto-syncs if Vercel Integration active
# → Or manual sync: curl -X PUT https://prod.vercel.app/api/inngest

# INNGEST MCP (for AI agents)
# Use MCP tools: send_event, list_functions, get_run_status, etc.
```

## 🔗 Cross-References

- **Inngest Patterns**: See [docs/inngest/patterns.md](./patterns.md)
- **AgentKit Integration**: See [docs/inngest/agentkit-integration.md](./agentkit-integration.md)
- **Testing Strategy**: See [AGENTS.md](../../AGENTS.md)
- **MCP Server Details**: See [docs/inngest/mcp-server.md](./mcp-server.md)

---

**Last Updated**: January 28, 2026  
**Status**: Production Ready