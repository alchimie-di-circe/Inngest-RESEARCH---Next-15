---
tags: [database, neon, api-reference, all-agents]
description: Neon CLI toolkit reference
alwaysApply: false
---

# Neon Toolkit

> **Package**: `@neondatabase/toolkit`  
> **Purpose**: Create ephemeral PostgreSQL databases for testing and prototyping

## Overview

The Neon Toolkit is a terse client designed for scenarios where a temporary, fully-functional Postgres database is needed quickly. It bundles:
- `@neondatabase/api-client` - Full Neon API access
- `@neondatabase/serverless` - Serverless driver for queries

## Installation

```bash
npm install @neondatabase/toolkit
# or
deno add jsr:@neon/toolkit
```

## Core Workflow

The toolkit follows a simple **Create → Query → Delete** lifecycle:

```typescript
import { NeonToolkit } from '@neondatabase/toolkit';

const toolkit = new NeonToolkit(process.env.NEON_API_KEY!);
```

### 1. Create Project

Creates a complete Neon project with default branch, database, and endpoint:

```typescript
const project = await toolkit.createProject({
  name: 'ephemeral-test-db',
  pg_version: 17,
});

console.log('Connection URI:', project.connectionURIs[0].connection_uri);
// postgresql://neondb_owner:xxx@ep-xxx.neon.tech/neondb?sslmode=require
```

**Returns**: `ToolkitProject` with:
- `project` - Project details
- `connectionURIs` - Array of connection strings
- `roles`, `databases`, `branches`, `endpoints`

### 2. Execute SQL

Run queries using the serverless driver:

```typescript
// Create table
await toolkit.sql(
  project,
  `CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE
  );`
);

// Insert data
await toolkit.sql(
  project,
  `INSERT INTO tasks (description) VALUES ('Test task');`
);

// Query data
const tasks = await toolkit.sql(
  project,
  `SELECT * FROM tasks WHERE completed = FALSE;`
);
// [{ id: 1, description: 'Test task', completed: false }]
```

### 3. Delete Project

Clean up when done:

```typescript
await toolkit.deleteProject(project);
console.log('Project deleted');
```

## Complete Example

Always use `try...finally` to ensure cleanup:

```typescript
import { NeonToolkit } from '@neondatabase/toolkit';

async function runTest() {
  const toolkit = new NeonToolkit(process.env.NEON_API_KEY!);
  let project;

  try {
    // Create
    project = await toolkit.createProject({ name: 'test-runner' });
    
    // Setup schema
    await toolkit.sql(project, `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE,
        name TEXT
      );
    `);
    
    // Insert test data
    await toolkit.sql(project, `
      INSERT INTO users (email, name) 
      VALUES ('test@example.com', 'Test User');
    `);
    
    // Run tests
    const users = await toolkit.sql(project, 'SELECT * FROM users;');
    console.log('Users:', users);
    
  } finally {
    // Always cleanup
    if (project) {
      await toolkit.deleteProject(project);
    }
  }
}

runTest();
```

## Advanced: API Client Access

For operations beyond the toolkit's scope:

```typescript
const apiClient = toolkit.apiClient;

// List all projects
const { data } = await apiClient.listProjects({});
console.log(data.projects.map(p => p.name));

// Create branch
await apiClient.createProjectBranch(project.project.id, {
  branch: { name: 'feature-branch' }
});
```

## Use Cases

| Scenario | Approach |
|----------|----------|
| Unit tests | Create → Run tests → Delete |
| CI/CD pipelines | Ephemeral DB per test run |
| Prototyping | Quick DB without manual setup |
| Load testing | Spin up multiple instances |
| Schema migrations | Test migrations on copy |

## Environment Setup

```bash
# Required
export NEON_API_KEY=napi_xxx

# Optional: Project configuration
export NEON_REGION=aws-us-east-1
export NEON_PG_VERSION=17
```

## Comparison with Other Approaches

| Approach | Best For | Persistence |
|----------|----------|-------------|
| **Neon Toolkit** | Tests, ephemeral workloads | Temporary |
| **Neon MCP** | AI-assisted operations | Permanent |
| **Prisma + Neon** | Production applications | Permanent |
| **Neon Console** | Manual management | Permanent |

## Related

- [TypeScript SDK](./typescript-sdk.md) - Full API client
- [Branches](./branches.md) - Branch management API