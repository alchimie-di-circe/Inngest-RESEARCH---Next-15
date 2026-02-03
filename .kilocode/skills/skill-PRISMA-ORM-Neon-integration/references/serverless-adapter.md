# @prisma/adapter-neon Configuration

## Why Adapter-Neon?

Standard Prisma uses connection pooling incompatible with edge/serverless.  
`@prisma/adapter-neon` enables Prisma on Vercel Edge, Cloudflare Workers, etc.

## Installation

```bash
npm install @prisma/adapter-neon @neondatabase/serverless
```

## Configuration (src/lib/db.ts)

```typescript
import { Pool } from '@neondatabase/serverless';
import { PrismaAdapter } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaAdapter(pool);
export const prisma = new PrismaClient({ adapter });
```

## Prisma Schema Requirements

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Connection String

```
DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"
```

> **Note**: No `pgbouncer=true` needed - adapter handles pooling internally.

## Global Instance Pattern (Hot Reload Safe)

```typescript
// src/lib/db.ts
import { Pool } from '@neondatabase/serverless';
import { PrismaAdapter } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient | undefined 
};

const createPrismaClient = () => {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL 
  });
  const adapter = new PrismaAdapter(pool);
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

## Health Check

```typescript
export async function checkDatabaseConnection() {
  try {
    const result = await prisma.$queryRaw`SELECT NOW()`;
    return { connected: true, timestamp: result };
  } catch (error) {
    return { connected: false, error };
  }
}