---
tags: [database, neon, api-reference, all-agents]
description: Neon compute endpoint API
alwaysApply: false
---

# Neon API - Compute Endpoints

> **Source**: Neon API Documentation  
> **Scope**: Compute endpoint management via REST API

## Overview

Compute endpoints are the actual running PostgreSQL instances that you connect to. They provide the CPU and RAM for processing queries.

## Core Concepts

| Concept | Description |
|---------|-------------|
| **Endpoint** | A PostgreSQL compute instance attached to a branch |
| **Type** | `read_write` or `read_only` |
| **State** | `active`, `idle`, `init`, `scheduling` |
| **CU** | Compute Units (0.25 minimum) |
| **Auto-suspend** | Scale to zero after inactivity |

## API Endpoints

### Create Compute Endpoint

**Endpoint**: `POST /projects/{project_id}/endpoints`

```bash
curl 'https://console.neon.tech/api/v2/projects/summer-haze-17190561/endpoints' \
  -H 'Accept: application/json' \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
  "endpoint": {
    "branch_id": "br-sparkling-darkness-agdcyxfm",
    "type": "read_write",
    "autoscaling_limit_min_cu": 0.25,
    "autoscaling_limit_max_cu": 2,
    "suspend_timeout_seconds": 300
  }
}'
```

### List All Endpoints

**Endpoint**: `GET /projects/{project_id}/endpoints`

```bash
curl 'https://console.neon.tech/api/v2/projects/summer-haze-17190561/endpoints' \
  -H 'accept: application/json' \
  -H "Authorization: Bearer $NEON_API_KEY"
```

### List Branch Endpoints

**Endpoint**: `GET /projects/{project_id}/branches/{branch_id}/endpoints`

```bash
curl 'https://console.neon.tech/api/v2/projects/summer-haze-17190561/branches/br-sparkling-darkness-agdcyxfm/endpoints' \
  -H 'accept: application/json' \
  -H "Authorization: Bearer $NEON_API_KEY"
```

### Retrieve Endpoint Details

**Endpoint**: `GET /projects/{project_id}/endpoints/{endpoint_id}`

```bash
curl 'https://console.neon.tech/api/v2/projects/summer-haze-17190561/endpoints/ep-endpoint-id' \
  -H 'accept: application/json' \
  -H "Authorization: Bearer $NEON_API_KEY"
```

### Update Endpoint

**Endpoint**: `PATCH /projects/{project_id}/endpoints/{endpoint_id}`

```bash
curl -X 'PATCH' \
  'https://console.neon.tech/api/v2/projects/summer-haze-17190561/endpoints/ep-endpoint-id' \
  -H 'accept: application/json' \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
  "endpoint": {
    "autoscaling_limit_max_cu": 4,
    "suspend_timeout_seconds": 600
  }
}'
```

### Delete Endpoint

**Endpoint**: `DELETE /projects/{project_id}/endpoints/{endpoint_id}`

```bash
curl -X 'DELETE' \
  'https://console.neon.tech/api/v2/projects/summer-haze-17190561/endpoints/ep-endpoint-id' \
  -H 'accept: application/json' \
  -H "Authorization: Bearer $NEON_API_KEY"
```

## Endpoint Lifecycle Operations

### Start Endpoint

Manually starts an `idle` endpoint:

```bash
curl -X 'POST' \
  'https://console.neon.tech/api/v2/projects/summer-haze-17190561/endpoints/ep-endpoint-id/start' \
  -H 'accept: application/json' \
  -H "Authorization: Bearer $NEON_API_KEY"
```

### Suspend Endpoint

Manually suspends an `active` endpoint:

```bash
curl -X 'POST' \
  'https://console.neon.tech/api/v2/projects/summer-haze-17190561/endpoints/ep-endpoint-id/suspend' \
  -H 'accept: application/json' \
  -H "Authorization: Bearer $NEON_API_KEY"
```

### Restart Endpoint

Suspends and starts an endpoint:

```bash
curl -X 'POST' \
  'https://console.neon.tech/api/v2/projects/summer-haze-17190561/endpoints/ep-endpoint-id/restart' \
  -H 'accept: application/json' \
  -H "Authorization: Bearer $NEON_API_KEY"
```

## Endpoint Configuration

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `type` | string | `read_write` or `read_only` | required |
| `autoscaling_limit_min_cu` | number | Minimum compute units | 0.25 |
| `autoscaling_limit_max_cu` | number | Maximum compute units | 0.25 |
| `suspend_timeout_seconds` | integer | Seconds before auto-suspend | 300 |
| `provisioner` | string | `k8s-pod` or `k8s-neonvm` | `k8s-neonvm` |

## Connection Strings

Endpoints provide connection URIs:

```json
{
  "endpoint": {
    "host": "ep-xxx.us-east-2.aws.neon.tech",
    "id": "ep-xxx",
    "proxy_host": "us-east-2.aws.neon.tech"
  }
}
```

Connection string format:
```
postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/db?sslmode=require
```

## Related

- [Branches](./branches.md) - Branch management
- [TypeScript SDK](./typescript-sdk.md) - Programmatic endpoint control