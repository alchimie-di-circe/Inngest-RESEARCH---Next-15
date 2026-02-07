# QUICKSTART - Research & Publishing Suite

> **Goal**: Get running in 30 minutes  
> **Environment**: GitHub Codespace (Cloud)  
> **Last Updated**: February 7, 2026  
> **Status**: Phase 2 - Build Fixed & Ready for Testing

---

## 🎯 3-Step Setup

### Step 1: Cloud Accounts Setup (You - 15 min)

**Create these accounts and copy the credentials:**

| Service | Action | What to Copy |
|---------|--------|--------------|
| **Neon** | https://neon.tech | Project already created → Copy connection strings for your branch |
| **Inngest** | https://app.inngest.com | Create app + 3 environments → Copy Event Key + Signing Key |
| **Pinecone** | https://www.pinecone.io | Create index "research-suite-vectors" (dim=1536) → Copy API key |
| **Vercel** | https://vercel.com | Connect GitHub repo → Copy preview/production URLs |

### Neon Database (Pre-configured)

**Project**: `summer-haze-17190561`
**Database**: `neondb`
**Owner**: `neondb_owner`

**Branches**:

| Branch | ID | Use For | Connection String |
|--------|-----|---------|-------------------|
| **production** | `br-jolly-salad-agb6asse` | Live app | `DATABASE_URL` |
| **preview** | `br-fragrant-dawn-ag82fjdz` | PR previews | `DATABASE_URL_PREVIEW` |
| **dev** | `br-sparkling-darkness-agdcyxfm` | Development | `DATABASE_URL_DEV` |

Get connection strings from [Neon Console](https://console.neon.tech) or use Neon MCP tools.

**Detailed HITL Setup**: See [project-SETUP-HITL.md.txt](project-SETUP-HITL.md.txt) for step-by-step screenshots.

---

### Step 2: Environment Configuration (You - 5 min)

```bash
# In Codespace terminal:
cp .env.example .env.local

# Edit .env.local and paste keys from Step 1:
DATABASE_URL=postgresql://...neon.tech/research
INNGEST_EVENT_KEY=your_event_key
INNGEST_SIGNING_KEY=signkey_xxx
PINECONE_API_KEY=your_pinecone_key
ANTHROPIC_API_KEY=sk-ant-xxx
```

---

### Step 3: Development Start (Agent - 10 min)

```bash
# 1. Install dependencies
npm install

# 2. Database setup
npx prisma migrate dev --name init
npx prisma generate

# 3. Start development servers
npm run dev         # Terminal 1: Next.js http://localhost:3000
npm run inngestdev # Terminal 2: Inngest http://localhost:8288

# Or run both with:
npm run devall
```

---

## ✅ Verification Checklist

- [ ] http://localhost:3000 loads without errors
- [ ] http://localhost:8288 shows registered functions
- [ ] At least one Inngest function visible in sidebar
- [ ] `npx tsc --noEmit` passes (no TypeScript errors)
- [ ] Database connection working (Prisma Studio: `npx prisma studio`)

---

## 🚀 Next Steps

### For Development
- **Testing Strategy**: Read [AGENTS.md](AGENTS.md)
- **Inngest Workflow**: Read [docs/inngest/dev-workflow.md](docs/inngest/dev-workflow.md)
- **Architecture**: Read [docs/project-architecture.md](docs/project-architecture.md)

### For Testing
| Test Type | Tool | How |
|-----------|------|-----|
| Unit | Wallaby MCP | User: `Wallaby: Start` in VS Code → Agent uses MCP tools |
| Integration | TestSprite MCP | `testsprite_bootstrap_tests` → `testsprite_run_tests` |
| E2E | Dagger Container-use | `container-use checkout {id}` |

See [docs/mcp-server-instructions/](docs/mcp-server-instructions/) for detailed guides.

---

## 🔗 Documentation Map

| Need | File |
|------|------|
| Testing workflow | [AGENTS.md](AGENTS.md) |
| Project context (Claude Code) | [.claude/CLAUDE.md](.claude/CLAUDE.md) |
| Complete doc index | [docs/INDEX.md](docs/INDEX.md) |
| Inngest development | [docs/inngest/dev-workflow.md](docs/inngest/dev-workflow.md) |
| Architecture deep-dive | [docs/project-architecture.md](docs/project-architecture.md) |
| Detailed cloud setup | [project-SETUP-HITL.md.txt](project-SETUP-HITL.md.txt) |

---

## 🆘 Troubleshooting

### Port already in use
```bash
# Kill process on port 3000 or 8288
npx kill-port 3000
npx kill-port 8288
```

### Database connection failed
- Check `DATABASE_URL` in `.env.local`
- Ensure Neon database is active (not suspended)

### Inngest functions not showing
- Verify `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`
- Check http://localhost:3000/api/inngest responds correctly

---

**You're ready to develop! 🎉**

See [AGENTS.md](AGENTS.md) for the complete testing workflow.