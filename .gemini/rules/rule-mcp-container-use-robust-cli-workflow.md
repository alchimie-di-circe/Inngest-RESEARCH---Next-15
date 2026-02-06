# Rule: Robust Container-Use Workflow (CLI & Docker First)

> **Status**: Mandatory for Container-Use interactions
> **Reason**: Mitigates MCP JSON-RPC timeouts (-32001) during long-running operations
> **Tools**: `run_shell_command`, `container-use` CLI, `docker` CLI

## 🛑 The Problem
The `container-use` MCP server often times out (Error -32001) during heavy operations like `npm install`, `environment_create`, or `environment_run_cmd` because the operation exceeds the default client timeout (often 60s), even if the operation continues in the background.

## ✅ The Solution: CLI-First Strategy

Instead of relying on MCP tools (`environment_*`), **ALWAYS** prefer executing `container-use` and `docker` commands directly via the shell.

### 1. Pre-flight Checks (Shell Only)
Before starting any work, ensure a clean state using shell commands:

```bash
# 1. Verify Git state (CRITICAL: Container ignores uncommitted changes)
git status
# IF dirty: git add . && git commit -m "wip: pre-container"

# 2. Check existing environments via CLI (not MCP)
container-use list

# 3. Cleanup stale environments via CLI
container-use delete --all
```

### 2. Configuration via CLI (Prevent Timeouts)
Do not pass heavy setup commands via the `environment_create` tool arguments. Pre-configure them globally via CLI to ensure the container is lightweight on boot.

```bash
# Clear heavy defaults
container-use config setup-command clear

# Set optimized, non-interactive commands
container-use config setup-command add "npm ci --prefer-offline --no-audit"
container-use config setup-command add "npx prisma generate"
```

### 3. Creation & Verification
Since `container-use` CLI lacks a direct `create` command (it's agent-driven), use the MCP tool **ONLY** for the creation trigger, but handle the timeout gracefully.

1.  Call `environment_create` (MCP).
2.  **IF IT TIMEOUTS**: Do NOT retry immediately.
3.  Run `container-use list` via `run_shell_command`.
4.  If the environment appears in the list, **it was created successfully** despite the timeout. Proceed.

### 4. Running Commands ( The "Docker Backdoor" )
**NEVER** use `environment_run_cmd` for commands that might take >30 seconds (tests, builds, installs).
Instead, interact directly with the underlying Docker container.

1.  **Find the Container**:
    ```bash
    docker ps --format "table {{.ID}}	{{.Names}}	{{.Image}}"
    # Look for the container running the 'container-use' image
    ```

2.  **Execute Directly**:
    ```bash
    # Bypass MCP overhead completely
    docker exec -w /workdir <container_id_or_name> npm run test:unit
    ```

### 5. Review & Monitoring
Use the CLI to inspect changes, avoiding MCP overhead for large diffs.

```bash
# Check logs
container-use log <env_id>

# Check diffs
container-use diff <env_id>
```

### 6. File Editing
**DO NOT** use special MCP tools to write files in the container.
`container-use` mounts your current local directory to `/workdir`.
*   **Action**: Edit files locally using `write_file` or `replace`.
*   **Effect**: Changes appear immediately inside the container.

---

## Workflow Summary

| Operation | ❌ Avoid (MCP) | ✅ Prefer (Shell) |
|-----------|----------------|-------------------|
| **Check Status** | `environment_list` | `run_shell_command("container-use list")` |
| **Cleanup** | `environment_delete` | `run_shell_command("container-use delete <id>")` |
| **Setup Config** | `environment_config` | `run_shell_command("container-use config ...")` |
| **Run Tests/Build** | `environment_run_cmd` | `run_shell_command("docker exec ...")` |
| **Review Code** | (Slow response) | `run_shell_command("container-use diff <id>")` |
