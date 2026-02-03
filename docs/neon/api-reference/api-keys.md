---
tags: [database, neon, api-reference, all-agents]
description: Neon API key management
alwaysApply: false
---

# Neon API - API Keys Management

> **Source**: Neon API Documentation  
> **Scope**: API key lifecycle management

## Overview

Neon API keys provide programmatic access to the Neon platform. There are three types:
- **Personal API Key** - Access to user's projects
- **Organization API Key** - Admin access to organization resources
- **Project-scoped API Key** - Limited to a single project

## Important Note

> To create new API keys using the API, you must already possess a valid Personal API Key. The first key must be created from the Neon Console.

## API Endpoints

### List API Keys

**Endpoint**: `GET /api_keys`

Retrieves all API keys for your account (secret key not included).

```bash
curl "https://console.neon.tech/api/v2/api_keys" \
  -H "Authorization: Bearer $PERSONAL_API_KEY"
```

**Response**:
```json
[
  {
    "id": 2291506,
    "name": "my-personal-key",
    "created_at": "2025-09-10T09:44:04Z",
    "created_by": {
      "id": "487de658-08ba-4363-b387-86d18b9ad1c8",
      "name": "<USER_NAME>"
    },
    "last_used_at": "2025-09-10T09:44:09Z",
    "last_used_from_addr": "49.43.218.132"
  }
]
```

### Create API Key

**Endpoint**: `POST /api_keys`

Creates a new API key. The secret key is returned **only once**.

```bash
curl https://console.neon.tech/api/v2/api_keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PERSONAL_API_KEY" \
  -d '{"key_name": "my-new-key"}'
```

**Response**:
```json
{
  "id": 2291515,
  "key": "napi_9tlr13774gizljemrr133j5koy3bmsphj8iu38mh0yjl9q4r1b0jy2wuhhuxouzr",
  "name": "my-new-key",
  "created_at": "2025-09-10T09:47:59Z"
}
```

⚠️ **Store the key immediately** - it cannot be retrieved later!

### Revoke API Key

**Endpoint**: `DELETE /api_keys/{key_id}`

Permanently revokes an API key. This action cannot be undone.

```bash
curl -X DELETE \
  'https://console.neon.tech/api/v2/api_keys/2291515' \
  -H "Authorization: Bearer $PERSONAL_API_KEY"
```

**Response**:
```json
{
  "id": 2291515,
  "name": "my-new-key",
  "revoked": true
}
```

## Organization API Keys

For organization-scoped keys, use the organization endpoints:

### List Org API Keys

```bash
curl 'https://console.neon.tech/api/v2/organizations/{org_id}/api_keys' \
  -H "Authorization: Bearer $ORG_API_KEY"
```

### Create Org API Key

```bash
curl 'https://console.neon.tech/api/v2/organizations/{org_id}/api_keys' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ORG_API_KEY" \
  -d '{
    "key_name": "ci-key",
    "project_id": "summer-haze-17190561"
  }'
```

## Best Practices

1. **Use descriptive names** - Include purpose and environment
2. **Store securely** - Use environment variables or secret managers
3. **Rotate regularly** - Revoke old keys and create new ones
4. **Scope appropriately** - Use project-scoped keys when possible
5. **Monitor usage** - Check `last_used_at` for unused keys

## Environment Variables

```bash
# Personal key
export NEON_API_KEY=napi_xxx

# Organization key
export NEON_ORG_API_KEY=napi_xxx

# Project-scoped key
export NEON_PROJECT_API_KEY=napi_xxx
```

## Related

- [TypeScript SDK](./typescript-sdk.md) - Programmatic key management
- Neon Console: https://console.neon.tech/app/settings/api-keys