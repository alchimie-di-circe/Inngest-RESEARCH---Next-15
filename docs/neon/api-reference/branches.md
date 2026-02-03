---
tags: [database, neon, api-reference, all-agents]
description: Neon branch management API
alwaysApply: false
---

# Neon API - Branches

> **Source**: Neon API Documentation  
> **Scope**: Branch management via REST API

## Overview

This document outlines the rules for managing branches in a Neon project using the Neon API.

## Core Concepts

| Concept | Description |
|---------|-------------|
| **Branch** | A lightweight, copy-on-write clone of a database's state at a specific point in time |
| **Parent** | The source branch from which a new branch is created |
| **LSN** | Log Sequence Number - for point-in-time branching |
| **Protected** | Protected branches cannot be deleted accidentally |

## API Endpoints

### Create Branch

**Endpoint**: `POST /projects/{project_id}/branches`

Creates a new branch within a specified project. By default, a branch is created from the project's default branch.

**Body Parameters**:

```json
{
  "endpoints": [
    {
      "type": "read_write",
      "autoscaling_limit_min_cu": 0.25,
      "autoscaling_limit_max_cu": 2,
      "provisioner": "k8s-neonvm",
      "suspend_timeout_seconds": 300
    }
  ],
  "branch": {
    "parent_id": "br-parent-branch-id",
    "name": "my-new-feature-branch",
    "protected": false,
    "init_source": "parent-data"
  }
}
```

**Example Request**:

```bash
curl 'https://console.neon.tech/api/v2/projects/summer-haze-17190561/branches' \
  -H 'Accept: application/json' \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
  "endpoints": [{"type": "read_write"}],
  "branch": {"name": "feature-branch"}
}'
```

### List Branches

**Endpoint**: `GET /projects/{project_id}/branches`

Retrieves a list of branches for the specified project.

**Query Parameters**:
- `search` - Filter by partial match on name or ID
- `sort_by` - `name`, `created_at`, `updated_at` (default: `updated_at`)
- `sort_order` - `asc`, `desc` (default: `desc`)
- `limit` - Number of branches (1-10000)
- `cursor` - Pagination cursor

**Example**:

```bash
curl 'https://console.neon.tech/api/v2/projects/summer-haze-17190561/branches?sort_by=created_at' \
  -H 'accept: application/json' \
  -H "Authorization: Bearer $NEON_API_KEY"
```

### Retrieve Branch Details

**Endpoint**: `GET /projects/{project_id}/branches/{branch_id}`

```bash
curl 'https://console.neon.tech/api/v2/projects/summer-haze-17190561/branches/br-sparkling-darkness-agdcyxfm' \
  -H 'accept: application/json' \
  -H "Authorization: Bearer $NEON_API_KEY"
```

### Update Branch

**Endpoint**: `PATCH /projects/{project_id}/branches/{branch_id}`

```bash
curl -X 'PATCH' \
  'https://console.neon.tech/api/v2/projects/summer-haze-17190561/branches/br-branch-id' \
  -H 'accept: application/json' \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"branch": {"name": "updated-name", "protected": true}}'
```

### Delete Branch

**Endpoint**: `DELETE /projects/{project_id}/branches/{branch_id}`

⚠️ Cannot delete default branch or branches with children.

```bash
curl -X 'DELETE' \
  'https://console.neon.tech/api/v2/projects/summer-haze-17190561/branches/br-branch-id' \
  -H 'accept: application/json' \
  -H "Authorization: Bearer $NEON_API_KEY"
```

## Database Operations on Branches

### Create Database

**Endpoint**: `POST /projects/{project_id}/branches/{branch_id}/databases`

```bash
curl 'https://console.neon.tech/api/v2/projects/summer-haze-17190561/branches/br-branch-id/databases' \
  -H 'Accept: application/json' \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"database": {"name": "my_app_db", "owner_name": "neondb_owner"}}'
```

### List Databases

**Endpoint**: `GET /projects/{project_id}/branches/{branch_id}/databases`

### List Roles

**Endpoint**: `GET /projects/{project_id}/branches/{branch_id}/roles`

## Project Branches Reference

| Branch | ID | Environment |
|--------|-----|-------------|
| production | `br-jolly-salad-agb6asse` | Live |
| preview | `br-fragrant-dawn-ag82fjdz` | PR previews |
| dev | `br-sparkling-darkness-agdcyxfm` | Development |

## Related

- [TypeScript SDK](./typescript-sdk.md) - Programmatic API access
- [Endpoints](./endpoints.md) - Compute endpoint management