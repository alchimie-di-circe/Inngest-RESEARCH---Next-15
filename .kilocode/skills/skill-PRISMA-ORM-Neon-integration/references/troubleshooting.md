# Troubleshooting

## Common Errors

### P1001: Can't reach database server

**Causes:**
- Wrong connection string
- Missing `sslmode=require`
- Network/firewall issues
- Neon project suspended

**Fix:**
```bash
# Verify connection string format
DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"

# Test with Neon MCP
execute_sql --query "SELECT NOW()"
```

### P1008: Operations timed out

**Causes:**
- Large migration
- Connection pool exhausted
- Network latency

**Fix:**
- Increase timeout: `?connect_timeout=30`
- Check connection pool size
- Run in Codespace (closer to Neon)

### P2002: Unique constraint failed

**Fix:**
- Check existing data: `prisma db pull`
- Add `@unique` to schema or remove duplicate data

### Adapter-related errors

**"PrismaClient is not configured to use the adapter"**
- Ensure `@prisma/adapter-neon` is installed
- Check `new PrismaClient({ adapter })` syntax
- Verify schema uses `provider = "postgresql"`

## SSL/TLS Issues

| Error | Solution |
|-------|----------|
| `self-signed certificate` | Use `sslmode=require` not `verify-full` for dev |
| `certificate verify failed` | Check system CA certificates |
| `TLS handshake failed` | Verify Neon host, not generic postgres host |

## Debugging Steps

1. **Verify connection string** via Neon MCP
2. **Test raw SQL** with `execute_sql` tool
3. **Check schema** with `prisma validate`
4. **Enable query logging**:
   ```typescript
   const prisma = new PrismaClient({ 
     adapter,
     log: ['query', 'info', 'warn', 'error']
   });
   ```

## Resources

- [Prisma Error Reference](https://www.prisma.io/docs/reference/api-reference/error-reference)
- [Neon Connection Issues](https://neon.tech/docs/connect/connection-issues)