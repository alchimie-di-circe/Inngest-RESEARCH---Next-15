# Connection Setup & SSL

## DATABASE_URL Format

```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

## Getting Connection String via Neon MCP

Use Neon MCP tools (already connected):

```bash
# List branches
list_projects → list_branches

# Get connection string for specific branch
get_connection_string --project-id summer-haze-17190561 --branch-id br-sparkling-darkness-agdcyxfm
```

## Environment Variables

```bash
# .env.local
DATABASE_URL="postgresql://neondb_owner:password@host.neon.tech/neondb?sslmode=require"
```

## SSL Configuration

Neon requires SSL. The connection string must include:

- `sslmode=require` (minimum)
- `sslmode=verify-full` (recommended for production)

## Project-Specific Branches

| Branch | ID | Environment Variable |
|--------|-----|---------------------|
| production | br-jolly-salad-agb6asse | `DATABASE_URL` |
| preview | br-fragrant-dawn-ag82fjdz | `DATABASE_URL_PREVIEW` |
| dev | br-sparkling-darkness-agdcyxfm | `DATABASE_URL_DEV` |

## Testing Connection

```typescript
// Test with Prisma
const result = await prisma.$queryRaw`SELECT NOW()`;
console.log('Connected:', result);
```

## Common Connection Issues

| Error | Cause | Fix |
|-------|-------|-----|
| `P1001` | Can't reach database | Check hostname, SSL mode |
| `P1002` | Timeout | Check network, firewall |
| `P1003` | Database not found | Check database name |
| `P1008` | Operations timed out | Increase connection timeout |