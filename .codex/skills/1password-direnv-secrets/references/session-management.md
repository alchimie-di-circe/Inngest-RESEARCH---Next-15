# Session Management & Reducing Prompts

Strategies to minimize 1Password biometric prompts in development workflows.

## Table of Contents

- [How Sessions Work](#how-sessions-work)
- [Prompt Reduction Strategies](#prompt-reduction-strategies)
- [Service Accounts for CI/CD](#service-accounts-for-cicd)
- [Platform-Specific Behavior](#platform-specific-behavior)
- [Troubleshooting Excessive Prompts](#troubleshooting-excessive-prompts)

---

## How Sessions Work

### Session Duration

- **Duration:** 10 minutes
- **Auto-refresh:** Each `op` command refreshes the timer
- **Scope:** Per-terminal session (macOS/Linux)

### Session Identification

1Password CLI identifies sessions by:

- Terminal session ID
- Process start time
- Account being accessed

This means:

- Same terminal window = same session (no re-prompt within 10 min)
- New terminal window = new session (requires prompt)
- Different account = requires separate authorization

### Authentication Flow

```text
First op command in terminal
        │
        ▼
┌─────────────────────────┐
│ 1Password app unlocked? │
└─────────────────────────┘
        │
   Yes  │  No
        │   └──▶ Biometric prompt appears
        ▼
┌─────────────────────────┐
│ CLI integrated with app?│
└─────────────────────────┘
        │
   Yes  │  No
        │   └──▶ Biometric prompt appears
        ▼
┌─────────────────────────┐
│ Session < 10 min old?   │
└─────────────────────────┘
        │
   Yes  │  No
        │   └──▶ Biometric prompt appears
        ▼
    ✓ Command executes
```

---

## Prompt Reduction Strategies

### Strategy 1: direnv + op run (Recommended for Dev)

Load all secrets once when entering a directory:

```bash
# .envrc
direnv_load op run --env-file=.env.op --no-masking \
  --account=mycompany.1password.com -- direnv dump
```

**Result:** 1 prompt when you `cd` into the project. No prompts while working.

**Why it works:**

- `op run` fetches all secrets in a single CLI invocation
- direnv caches the resolved values in memory
- Values persist until you leave the directory

### Strategy 2: credential_process (Recommended for AWS)

AWS CLI calls the script on-demand:

```ini
[profile my-profile]
credential_process = /path/to/helper.sh
```

**Result:** 1 prompt per 10-minute session when running AWS commands.

**Why it works:**

- Script only runs when AWS needs credentials
- 10-minute session covers most development tasks
- Each AWS command refreshes the timer

### Strategy 3: Keep 1Password App Unlocked

The CLI inherits the app's unlock state:

1. Open 1Password desktop app
2. Unlock with biometrics
3. Keep it running (can minimize)

**Result:** CLI commands use app's session; fewer prompts.

### Strategy 4: Batch Operations

Instead of multiple `op item get` calls:

```bash
# BAD: Potentially 3 prompts
VAR1=$(op item get "Item1" --fields "field1")
VAR2=$(op item get "Item2" --fields "field2")
VAR3=$(op item get "Item3" --fields "field3")

# GOOD: 1 prompt maximum
op run --env-file=.env.op -- ./my-script.sh
```

### Strategy 5: Pre-warm Session

Before starting work, run a simple command to establish session:

```bash
# Add to shell startup or project entry
op whoami --account mycompany.1password.com >/dev/null 2>&1
```

---

## Service Accounts for CI/CD

For automated environments where biometric prompts are impossible.

### What are Service Accounts?

- Machine identity (not tied to a person)
- Token-based authentication
- No biometric/password prompts
- Limited vault access (principle of least privilege)

### Setup

1. **Create service account** at 1Password.com:
   - Developer → Infrastructure Secrets → Service Accounts
   - Grant access to specific vaults only

2. **Save token securely:**
   - Store in CI/CD secrets (GitHub Secrets, GitLab CI Variables, etc.)
   - Token is shown once; save immediately

3. **Use in environment:**

```bash
export OP_SERVICE_ACCOUNT_TOKEN="ops_xxxxxxxxxxxx"

# All subsequent op commands work without prompts
op item get "My Item" --fields "password" --reveal
```

### CI/CD Examples

**GitHub Actions:**

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Install 1Password CLI
        run: |
          curl -sSfLo op.zip https://cache.agilebits.com/dist/1P/op2/pkg/v2.24.0/op_linux_amd64_v2.24.0.zip
          unzip op.zip && sudo mv op /usr/local/bin/

      - name: Get secrets
        env:
          OP_SERVICE_ACCOUNT_TOKEN: ${{ secrets.OP_SERVICE_ACCOUNT_TOKEN }}
        run: |
          export DB_PASSWORD=$(op item get "Database" --fields "password" --reveal)
          ./deploy.sh
```

**GitLab CI:**

```yaml
deploy:
  script:
    - export OP_SERVICE_ACCOUNT_TOKEN=$OP_TOKEN
    - export API_KEY=$(op item get "API Credentials" --fields "key" --reveal)
    - ./deploy.sh
```

### Service Account Limitations

- Cannot create/modify items (read-only by default)
- Cannot access vaults not explicitly granted
- Token doesn't expire (must be rotated manually)
- 1Password CLI v2.18.0+ required

---

## Platform-Specific Behavior

### macOS

- **Authentication:** Touch ID or Apple Watch
- **Fallback:** System password if biometrics unavailable
- **Session scope:** Terminal window (extends to subshells)

### Linux

- **Authentication:** PolKit prompt (fingerprint or password)
- **Session scope:** Terminal window (extends to subshells)
- **Note:** Biometric support depends on system configuration

### Windows

- **Authentication:** Windows Hello (fingerprint, face, or PIN)
- **Session scope:** More restrictive; subshells may require separate auth
- **Note:** Commands in sub-shells often need separate authorization

---

## Troubleshooting Excessive Prompts

### Every Command Prompts

**Possible causes:**

1. 1Password app not running
2. CLI integration not enabled
3. Session expired (10+ minutes idle)

**Fixes:**

```bash
# Check if signed in
op whoami

# Check app integration
# 1Password app → Settings → Developer → "Integrate with 1Password CLI"

# Re-establish session
op signin --account mycompany.1password.com
```

### New Terminal = New Prompt

**This is expected behavior.** Each terminal is a separate session for security.

**Workaround:** Use direnv so secrets load once per directory, not per command.

### Prompts Even With App Unlocked

**Check CLI integration:**

1. Open 1Password desktop app
2. Settings → Developer
3. Enable "Integrate with 1Password CLI"
4. Restart terminal

### Service Account Not Working

**Check environment variable:**

```bash
echo $OP_SERVICE_ACCOUNT_TOKEN
# Should show: ops_xxxxx (not empty)

# Test with explicit token
OP_SERVICE_ACCOUNT_TOKEN="ops_xxx" op whoami
```

**Check CLI version:**

```bash
op --version
# Must be 2.18.0 or later for service accounts
```

### "Authorization prompt dismissed"

**Cause:** Touch ID/password prompt was cancelled or timed out.

**Fix:** Run command again and approve the prompt when it appears.

---

## Summary: Choosing the Right Approach

| Scenario                      | Best Approach                | Expected Prompts      |
|-------------------------------|------------------------------|-----------------------|
| Local development             | direnv + `op run`            | 1 per directory entry |
| AWS CLI usage                 | `credential_process`         | 1 per 10-min session  |
| Running tests locally         | direnv (secrets as env vars) | 1 per directory entry |
| CI/CD pipelines               | Service account token        | 0                     |
| One-off secret lookup         | `op item get`                | 1 per command         |
| Scripts with multiple secrets | `op run --env-file`          | 1 per script run      |

---

## Quick Reference

```bash
# Check current session
op whoami

# Pre-warm session (suppress output)
op whoami >/dev/null 2>&1

# Test service account
OP_SERVICE_ACCOUNT_TOKEN="ops_xxx" op whoami

# Check CLI version (need 2.18.0+ for service accounts)
op --version

# Clear service account to use personal account
unset OP_SERVICE_ACCOUNT_TOKEN
```
