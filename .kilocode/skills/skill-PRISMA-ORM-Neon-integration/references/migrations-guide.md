# Migration Workflows

> **⚠️ Environment Restriction**: Per [AGENTS.md](../../../../AGENTS.md), run migrations ONLY in Cloud (Codespace), never on local Mac.

## Migration Commands Overview

| Command | Purpose | Environment | When to Use |
|---------|---------|-------------|-------------|
| `prisma migrate dev` | Create & apply migrations | Codespace | Active development |
| `prisma migrate deploy` | Apply migrations (no create) | CI/CD | Production deployment |
| `prisma migrate reset` | Reset DB + re-run migrations | Codespace | Development reset |
| `prisma db push` | Sync schema without migrations | Codespace | Prototyping only |
| `prisma db pull` | Introspect existing DB | Codespace | Legacy DB setup |
| `prisma generate` | Generate Prisma Client | Any | After schema changes |

## Development Workflow (Codespace)

### 1. Create Migration

```bash
# In Codespace terminal
npx prisma migrate dev --name add_users_table
```

### 2. Apply to Database

```bash
# Migrate runs automatically with dev command above
# To apply pending migrations only:
npx prisma migrate deploy
```

### 3. Generate Client

```bash
npx prisma generate
```

### 4. Verify

```bash
npx prisma validate
npx prisma format
```

## Production Workflow (CI/CD)

```yaml
# .github/workflows/deploy.yml
- name: Apply Migrations
  run: npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}

- name: Generate Client
  run: npx prisma generate
```

## Branching Strategy with Neon

| Environment | Neon Branch | Prisma Workflow |
|-------------|-------------|-----------------|
| Local Dev | dev | `migrate dev` |
| Preview | preview | `migrate deploy` or `db push` |
| Production | production | `migrate deploy` only |

## Dangerous Operations

⚠️ **Never run in Production**:
- `prisma migrate reset` (drops all data)
- `prisma db push` (can destroy data)
- Direct SQL without backups

## Troubleshooting Migrations

| Issue | Solution |
|-------|----------|
| Migration failed | Check logs, fix schema, run `migrate resolve` |
| Drift detected | Run `prisma migrate dev` to create fix migration |
| Locked migration | Run `prisma migrate resolve --rolled-back` |