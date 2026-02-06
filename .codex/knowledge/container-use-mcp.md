# Container Use (Dagger MCP)

Canonical documentation lives in `.codex/container-use/`.

Quick references:
- Rules: `.codex/container-use/rules/agent.md`
- Defaults: `.codex/container-use/environment.json`
- Secrets: `.codex/container-use/reference/secrets.md`
- Upstream docs: `.codex/container-use/reference/`

## Vault policy
 - Sensitive keys (API keys, tokens, passwords, secrets) live in `AI DEV`.
 - For AI DEV lookups, search by service keywords (e.g., `qdrant`, `morph`, `neo4j`) and match fields to required keys.
 - Non-sensitive env vars that Codex can create live in a project vault named `<project>`.
 - Use an item named `container-use.env` for project env fields, with field names like `service_specific` (example: `qdrant_database-url`).
 - Tag items with `container-use` and `project:<name>` to make lookup easier.
 - A single container-use config can reference multiple vaults.

## Secrets workflow (preferred)
1) Read required keys from `.env.example`.
2) For sensitive keys, search `AI DEV` by service keyword and map fields to required keys.
3) For non-sensitive keys, create/update vault `<project>` and item `container-use.env` using `service_specific` field names.
4) Set secrets using container-use references, e.g.:
   `container-use config secret set KEY "op://<vault>/<item>/<field>"`
5) If `op` is not authenticated, ask the user to run `op signin` (Touch ID) and retry.

## Fallback (.env)
- Export a temporary `.env` from 1Password or request missing values from the user.
- Delete the `.env` file after the run.
- Never commit or log secrets.