# DevContainer Setup - Inngest Research Suite

This repository ships with a production-grade DevContainer for the Inngest Research Publishing Suite. It supports multi-agent workflows, Inngest orchestration, and local AI coding tools.

## What's Included

- **DevContainer**: `.devcontainer/devcontainer.json`
- **Docker image**: `.devcontainer/Dockerfile` with Node.js 20, Docker CLI, and tooling
- **Multi-container dev**: `.devcontainer/docker-compose.yml` with Next.js, Inngest, Postgres, Redis
- **Automation**: `.devcontainer/postCreateCommand.sh`
- **Secrets management**: `.envrc.example` (1Password + direnv)
- **Environment validation**: `scripts/verify-env.js`
- **Zed**: `.zed/settings.json`
- **Continue.dev**: `.continue/config.json`

## Quick Start

1. Copy `envrc.example` to `.envrc` and update your 1Password vault paths.
2. Open the repo in VS Code or Zed with Dev Containers support.
3. Select **Reopen in Container**.
4. Wait for `postCreateCommand.sh` to finish.

## Common Commands

```bash
npm run dev
npm run inngestdev
npm run devall
npm run type-check
npm run verify:env
```

## Multi-Container Development

To bring up the full stack using Docker Compose:

```bash
docker-compose -f .devcontainer/docker-compose.yml up -d
```

Services:
- **app**: Next.js dev server (port 3000)
- **inngest-dev**: Inngest dev server (port 8288)
- **postgres**: PostgreSQL 15 (port 5432)
- **redis**: Redis 7 (port 6379)

## 1Password + direnv

Use the template in `.envrc.example` and run:

```bash
op account add

direnv allow
```

## Notes

- Inngest CLI is installed globally and available as `inngest-cli`.
- Database initialization scripts live in `.devcontainer/initdb`.
