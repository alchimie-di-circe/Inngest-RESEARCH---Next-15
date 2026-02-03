---
tags: [database, neon, api-reference, all-agents]
description: Neon TypeScript SDK
alwaysApply: false
---

# Neon TypeScript SDK

> **Package**: `@neondatabase/api-client`  
> **Purpose**: Full programmatic access to Neon API

## Installation

```bash
npm install @neondatabase/api-client
```

## Authentication

```typescript
import { createApiClient } from '@neondatabase/api-client';

const apiClient = createApiClient({
  apiKey: process.env.NEON_API_KEY!,
});
```

## API Key Types

| Type | Scope | Use Case |
|------|-------|----------|
| **Personal** | User's projects | Individual scripting |
| **Organization** | All org resources | CI/CD, automation |
| **Project-scoped** | Single project | Third-party integrations |

## Core Resources

### Projects

#### List Projects
```typescript
const response = await apiClient.listProjects({});
console.log(response.data.projects);
```

#### Create Project
```typescript
const response = await apiClient.createProject({
  project: {
    name: 'my-new-project',
    pg_version: 17,
    region_id: 'aws-us-east-1',
  },
});

const connectionUri = response.data.connection_uris[0]?.connection_uri;
```

#### Get Project
```typescript
const response = await apiClient.getProject('summer-haze-17190561');
```

#### Update Project
```typescript
await apiClient.updateProject('project-id', {
  project: { name: 'new-name' },
});
```

#### Delete Project
```typescript
await apiClient.deleteProject('project-id');
```

#### Get Connection URI
```typescript
const response = await apiClient.getConnectionUri({
  projectId: 'summer-haze-17190561',
  database_name: 'neondb',
  role_name: 'neondb_owner',
  pooled: true,
});

console.log(response.data.uri);
```

### Branches

#### Create Branch
```typescript
import { EndpointType } from '@neondatabase/api-client';

const response = await apiClient.createProjectBranch('project-id', {
  branch: { name: 'feature-branch' },
  endpoints: [{
    type: EndpointType.ReadWrite,
    autoscaling_limit_max_cu: 1,
  }],
});
```

#### List Branches
```typescript
const response = await apiClient.listProjectBranches({
  projectId: 'summer-haze-17190561',
});

response.data.branches.forEach(branch => {
  console.log(`${branch.name}: ${branch.id}`);
});
```

#### Get Branch
```typescript
const response = await apiClient.getProjectBranch(
  'project-id',
  'br-sparkling-darkness-agdcyxfm'
);
```

#### Update Branch
```typescript
await apiClient.updateProjectBranch('project-id', 'branch-id', {
  branch: { name: 'new-name', protected: true },
});
```

#### Delete Branch
```typescript
await apiClient.deleteProjectBranch('project-id', 'branch-id');
```

### Endpoints

#### Create Endpoint
```typescript
const response = await apiClient.createProjectEndpoint('project-id', {
  endpoint: {
    branch_id: 'br-branch-id',
    type: EndpointType.ReadOnly,
    autoscaling_limit_max_cu: 0.5,
  },
});
```

#### List Endpoints
```typescript
const response = await apiClient.listProjectEndpoints('project-id');
```

#### Start/Suspend/Restart
```typescript
await apiClient.startProjectEndpoint('project-id', 'endpoint-id');
await apiClient.suspendProjectEndpoint('project-id', 'endpoint-id');
await apiClient.restartProjectEndpoint('project-id', 'endpoint-id');
```

### Databases

#### Create Database
```typescript
await apiClient.createProjectBranchDatabase(
  'project-id',
  'branch-id',
  {
    database: {
      name: 'my_app_db',
      owner_name: 'neondb_owner',
    },
  }
);
```

#### List Databases
```typescript
const response = await apiClient.listProjectBranchDatabases(
  'project-id',
  'branch-id'
);
```

### Roles

#### Create Role
```typescript
const response = await apiClient.createProjectBranchRole(
  'project-id',
  'branch-id',
  { role: { name: 'app_user' } }
);

console.log('Password:', response.data.role.password);
```

#### List Roles
```typescript
const response = await apiClient.listProjectBranchRoles(
  'project-id',
  'branch-id'
);
```

### API Keys

#### List Keys
```typescript
const response = await apiClient.listApiKeys();
```

#### Create Key
```typescript
const response = await apiClient.createApiKey({
  key_name: 'automation-key',
});

console.log('Key (store securely!):', response.data.key);
```

#### Revoke Key
```typescript
await apiClient.revokeApiKey(12345);
```

### Operations

Operations track async actions (branch creation, endpoint start, etc.):

```typescript
// List operations
const response = await apiClient.listProjectOperations({
  projectId: 'summer-haze-17190561',
  limit: 10,
});

// Get specific operation
const op = await apiClient.getProjectOperation(
  'project-id',
  'operation-id'
);
console.log(op.data.operation.status); // 'running', 'finished', 'failed'
```

## Error Handling

```typescript
try {
  const response = await apiClient.getProject('project-id');
} catch (error: any) {
  if (error.isAxiosError) {
    const status = error.response?.status;
    const data = error.response?.data;
    
    switch (status) {
      case 401:
        console.error('Invalid API key');
        break;
      case 404:
        console.error('Project not found');
        break;
      case 429:
        console.error('Rate limit exceeded');
        break;
      default:
        console.error(`API Error ${status}:`, data?.message);
    }
  }
}
```

## Common Status Codes

| Code | Meaning |
|------|---------|
| 401 | Unauthorized - Invalid API key |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 422 | Unprocessable Entity - Invalid parameters |
| 429 | Too Many Requests - Rate limit hit |
| 500 | Internal Server Error |

## Complete Example

```typescript
import { createApiClient, EndpointType } from '@neondatabase/api-client';

async function manageNeonResources() {
  const client = createApiClient({ apiKey: process.env.NEON_API_KEY! });
  
  try {
    // Create branch for feature
    const branchRes = await client.createProjectBranch(
      'summer-haze-17190561',
      {
        branch: { name: 'feature-auth' },
        endpoints: [{ type: EndpointType.ReadWrite }],
      }
    );
    
    const branchId = branchRes.data.branch.id;
    console.log('Created branch:', branchId);
    
    // Wait for branch to be ready
    await new Promise(r => setTimeout(r, 5000));
    
    // Get connection string
    const connRes = await client.getConnectionUri({
      projectId: 'summer-haze-17190561',
      branch_id: branchId,
      database_name: 'neondb',
      role_name: 'neondb_owner',
    });
    
    console.log('Database URL:', connRes.data.uri);
    
    // Cleanup when done
    // await client.deleteProjectBranch('summer-haze-17190561', branchId);
    
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## Related

- [Toolkit](./toolkit.md) - Simplified ephemeral databases
- [Branches](./branches.md) - Branch API reference
- [Endpoints](./endpoints.md) - Endpoint API reference