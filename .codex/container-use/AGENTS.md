# Container Use (Dagger) - Project Guide

This folder keeps the Container Use (Dagger) documentation and rules we use
to run safe, isolated agent environments for ADS ALCHEMY.

## Why we use Container Use
- Run agent work in disposable containers with isolated git branches.
- Avoid polluting the local machine (disk/memory constraints).
- Keep a clean audit trail of commands and changes.

## Core rules
See the official rules in:
`.codex/container-use/rules/agent.md`

Short version:
- Use container environments for all file/shell operations.
- Do not touch `.git` directly inside environments.
- Always report `container-use log <id>` and `container-use checkout <id>`.

## Suggested default environment (project-specific)
We will store defaults in `.codex/container-use/environment.json` (not committed yet).
Suggested baseline:
- Base image: `node:20-bookworm` (or `node:20-slim` if smaller)
- Install commands: `npm ci`
- Optional: add Python 3.11 if/when agents require it

Example template (current default in `.codex/container-use/environment.json`):
```json
{
  "workdir": "/workdir",
  "base_image": "node:20-bookworm",
  "setup_commands": [
    "apt-get update && apt-get install -y python3 python3-venv"
  ],
  "install_commands": [
    "npm ci"
  ]
}
```

## Quick workflow
1) Create environment with your agent via MCP.
2) Inspect: `container-use log <id>` and `container-use diff <id>`.
3) Explore: `container-use checkout <id>` or `container-use terminal <id>`.
4) Accept: `container-use merge <id>` or `container-use apply <id>`.

## Reference docs (upstream) and container SECRET management with 1Password CLI
Full upstream docs are in:
- `.codex/container-use/reference/`
- `.codex/container-use/rules/`
- `.codex/container-use/examples/`
