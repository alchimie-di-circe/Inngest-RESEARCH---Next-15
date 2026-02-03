---
name: prisma-neon-serverless
description: Configure Prisma ORM with Neon PostgreSQL using @prisma/adapter-neon driver for serverless/edge environments. Covers connection setup, migrations workflow, and Neon MCP integration for database operations. Follows AGENTS.md environment restrictions (Cloud-first for migrations).
---

# Prisma + Neon Serverless Setup

> **Stack**: Prisma + @prisma/adapter-neon + Neon Serverless Driver  
> **Environment**: Serverless/Edge (Next.js, Vercel)  
> **MCP Server**: Neon MCP (for branches, projects, SQL operations)  
> **Cross-Reference**: See [AGENTS.md](../../../../AGENTS.md) for environment restrictions

## When to Use This Skill

- Setting up Prisma with Neon in serverless/edge environments
- Using `@prisma/adapter-neon` instead of standard Prisma Client for edge compatibility
- Managing database operations via Neon MCP (branches, connection strings)
- Following cloud-first workflow (AGENTS.md restrictions)

## Key Differences from Standard Prisma

| Aspect | Standard Prisma | This Setup |
|--------|----------------|------------|
| **Driver** | `@prisma/client` direct | `@prisma/adapter-neon` + Neon `Pool` |
| **Runtime** | Node.js only | Edge/Serverless (Vercel, Cloudflare) |
| **Connection** | Direct PostgreSQL | Neon Serverless Driver (HTTP/WebSocket) |
| **DB Operations** | Prisma CLI only | Prisma CLI + Neon MCP tools |

## Project Context

**Neon Project**: `summer-haze-17190561`  
**Database**: `neondb`  
**Branches**:
- `production` (`br-jolly-salad-agb6asse`) → `DATABASE_URL`
- `preview` (`br-fragrant-dawn-ag82fjdz`) → `DATABASE_URL_PREVIEW`
- `dev` (`br-sparkling-darkness-agdcyxfm`) → `DATABASE_URL_DEV`

## Quick Steps

1. **Install deps**: `npm install @prisma/adapter-neon @neondatabase/serverless`
2. **Configure db.ts**: Use `PrismaAdapter` with Neon `Pool`
3. **Setup env**: `DATABASE_URL` with connection string from Neon MCP
4. **Run migrations**: In Codespace only (`npx prisma migrate dev`)
5. **Verify**: Test query via Prisma Client

## Environment Workflow (AGENTS.md)

| Environment | Allowed Operations |
|-------------|-------------------|
| **Local (Mac)** | `prisma generate`, `validate`, `format` (read-only) |
| **Cloud (Codespace)** | All operations: `migrate dev`, `migrate reset`, `studio` |
| **CI/CD** | `migrate deploy`, `generate` |

## References

- [references/serverless-adapter.md](references/serverless-adapter.md) - @prisma/adapter-neon configuration
- [references/connection-setup.md](references/connection-setup.md) - DATABASE_URL and SSL
- [references/migrations-guide.md](references/migrations-guide.md) - Migration workflows per environment
- [references/troubleshooting.md](references/troubleshooting.md) - Common errors (P1001, SSL, etc.)
- [examples/db-client.ts](examples/db-client.ts) - Working example with adapter

## Neon MCP Tools for Database Ops

Use Neon MCP (already connected) for:
- `list_projects` - View Neon projects
- `list_branches` - View branches per project
- `get_connection_string` - Get DATABASE_URL for branch
- `execute_sql` - Run SQL queries directly
- `create_branch` / `delete_branch` - Manage branches

**Note**: For ORM operations (migrations, schema changes), use Prisma CLI in Codespace.

## Related Documentation

- [docs/prisma/neon-guide.md](../../../../docs/prisma/neon-guide.md)
- [docs/prisma/best-practices.md](../../../../docs/prisma/best-practices.md)
- [NEON-rules/](../../../../NEON-rules/) - Neon Platform API reference
- [.kilocode/skills/using-neon/SKILL.md](../using-neon/SKILL.md) - General Neon usage