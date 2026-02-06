# 1Password CLI + AI Agents: Secure Reference Guide

**Obiettivo:** Permettere ai tuoi CLI agents (Claude Code, Droid, Gemini CLI, Continue, Kilocode, OpenCode) di auto-autenticarsi e cercare credenziali nel vault 1Password *senza mai vedere i valori reali*, usando solo secret references (`op://...`).

---

## 📋 Prerequisiti & Rilevamento Ambiente

### 1. Verificare installazione di `op` CLI

```bash
# Rilevare se 1Password CLI è installato
which op

# Se non presente, output vuoto. Allora:
# macOS (con Homebrew)
brew install 1password-cli

# Linux (Debian/Ubuntu)
sudo apt-get update && sudo apt-get install 1password-cli

# Linux (RPM-based)
sudo rpm --import https://downloads.1password.com/linux/keys/1password.asc
sudo dnf install 1password-cli

# o scarica binario: https://downloads.1password.com/linux/amd64/stable/1password-latest.linux.amd64.tar.gz
```

### 2. Verificare versione e check sanità

```bash
# Versione
op --version

# Test di connessione (sarà usato da tutti i CLI agents)
# Se non autenticato, fallirà con istruzioni di signin
op item list --vault "Private" --format json > /dev/null 2>&1 && echo "✅ 1Password CLI OK" || echo "❌ Richiede autenticazione o vault non accessibile"

# Elencare vault disponibili
op vault list --format json | jq -r '.[] | .title'
```

---

## 🔐 Autenticazione per Sandbox/Container/Codespace

### Pattern 1: Service Account (CONSIGLIATO per ambienti isolati)

**Vantaggi:**
- Non richiede accesso biometrico
- Ideale per CI/CD, DevContainer, Codespace, container dockerizzati
- Permette di limitare i permessi a specifici vault
- Non dipende da `~/.op/config`

**Setup:**

```bash
# 1. In 1Password (macOS/desktop):
#    Impostazioni > Developer > Service Account > Crea
#    Seleziona vault di accesso (es. "Development", "Secrets")
#    Copia il token

# 2. Nel tuo DevContainer / Codespace / container:
export OP_SERVICE_ACCOUNT_TOKEN="ops_example_token_here..."

# 3. Test
op item list --vault "Development" --format json | jq '. | length'

# 4. In Dockerfile / devcontainer.json:
# ENV OP_SERVICE_ACCOUNT_TOKEN=${OP_SERVICE_ACCOUNT_TOKEN}
# RUN op item list --vault Development > /dev/null
```

**In `.devcontainer/devcontainer.json`:**
```json
{
  "name": "Dev Container with 1Password",
  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",
  "features": {
    "ghcr.io/devcontainers/features/1password-cli:latest": {}
  },
  "remoteEnv": {
    "OP_SERVICE_ACCOUNT_TOKEN": "${localEnv:OP_SERVICE_ACCOUNT_TOKEN}"
  },
  "postCreateCommand": "op vault list > /dev/null && echo '✅ 1Password Service Account active'"
}
```

### Pattern 2: Session Biometrica (Desktop/Local Dev)

```bash
# Sign in interattivo (una volta)
eval $(op signin)

# Oppure con account shorthand salvato
op signin my.1password.com user@example.com

# La sessione rimane valida finché il sistema è sbloccato
# Per logout:
op signout
```

### Pattern 3: Connect Server (per ambienti enterprise)

```bash
# Se 1Password Connect è in uso (Kubernetes, server dedicato):
export OP_CONNECT_HOST="https://connect.example.com:8080"
export OP_CONNECT_TOKEN="connect_token_here"

# Test
op item list --format json
```

**Priorità di autenticazione (in ordine):**
1. `OP_CONNECT_TOKEN` + `OP_CONNECT_HOST`
2. `OP_SERVICE_ACCOUNT_TOKEN`
3. Sessione biometrica salvata (`~/.op/config`)

---

## 🔍 Comandi per Ricerca e Estrazione Reference

### A. Ricerca elemento per nome in un vault

```bash
# Cercare elemento per nome esatto
VAULT="Development"
ITEM_NAME="github-api-token"

op item get "$ITEM_NAME" --vault "$VAULT" --format json

# Cercare per tag
op item list --vault "$VAULT" --tags "mcp-server" --format json

# Cercare per categoria (Login, API Credential, Database, ecc.)
op item list --vault "$VAULT" --category "api credential" --format json

# Filtrare per nome usando jq
op item list --vault "$VAULT" --format json | jq -r ".[] | select(.title | contains(\"$(printf '%s' \"$ITEM_NAME\")\")) | {title: .title, id: .id}"
```

### B. Estrarre la SECRET REFERENCE (il puntatore, non il valore)

```bash
# Opzione 1: Dal JSON completo dell'item
VAULT="Development"
ITEM_ID="x4yz1234abcd"

# Leggere il JSON, cercare il campo desiderato, estrarre .reference
op item get "$ITEM_ID" --vault "$VAULT" --format json | \
  jq -r '.fields[] | select(.label=="password") | .reference'

# Output: op://Development/x4yz1234abcd/password

# Opzione 2: Per il campo "username"
op item get "$ITEM_ID" --vault "$VAULT" --format json | \
  jq -r '.fields[] | select(.label=="username") | .reference'

# Output: op://Development/x4yz1234abcd/username
```

### C. Ottenere l'ID di un item per nome

```bash
VAULT="Development"
ITEM_NAME="github-api-token"

# Ricerca e estrazione dell'ID
ITEM_ID=$(op item list --vault "$VAULT" --format json | \
  jq -r ".[] | select(.title==\"$ITEM_NAME\") | .id")

echo "Item ID: $ITEM_ID"
# Output: Item ID: x4yz1234abcd

# Se non trovato, ITEM_ID sarà vuoto
[ -z "$ITEM_ID" ] && echo "❌ Item non trovato" || echo "✅ Found: $ITEM_ID"
```

### D. Estrarre multiple reference (per file .env o config)

```bash
#!/bin/bash
# Script: extract_references.sh
# Uso: ./extract_references.sh <vault> <item-name>

VAULT="${1:-Development}"
ITEM_NAME="${2:-github-api-token}"

ITEM_JSON=$(op item get "$ITEM_NAME" --vault "$VAULT" --format json 2>/dev/null)

if [ $? -ne 0 ]; then
  echo "❌ Item '$ITEM_NAME' not found in vault '$VAULT'"
  exit 1
fi

# Estrai tutte le reference e formatta come KEY="op://..."
echo "# Generated references for: $ITEM_NAME"
echo "$ITEM_JSON" | jq -r '.fields[] | select(.reference) | "\(.label | ascii_upcase)=\"\(.reference)\""'
```

**Uso:**
```bash
./extract_references.sh Development github-api-token
# Output:
# GITHUB_TOKEN="op://Development/x4yz1234abcd/password"
# USERNAME="op://Development/x4yz1234abcd/username"
```

---

## ⛔ Comandi/Pattern da PROIBIRE ai CLI Agents

I seguenti comandi **ESPONGONO I VALORI REALI** e devono essere vietati:

| Comando | Rischio | Alternativa Sicura |
|---------|--------|-------------------|
| `op item get <item> --fields label=password` | Stampa il valore in chiaro | Estrarre solo `.reference` con `jq` |
| `op read op://...` | Risolve e stampa il segreto | Lasciare come `op://...` in config |
| `op run --env-file ... printenv` | Stampa env con valori | Usare solo `op run -- <cmd>` senza intercettazione |
| `op signin` + `op signout` | Consente login/logout non controllati | Usare Service Account token fisso |
| `op item edit` | Modifica credenziali (surface attack) | Solo read-only per agents |
| `op vault create/delete` | Alterazione della struttura | Vault read-only per agents |
| Pipe output a file locale | Persiste il segreto su disco | Usare solo runtime in-memory |

### Regola Claude Code / Droid / Continue (AGENTS.md)

Crea un file **`.claude/AGENTS.md`** o **`.droid/AGENTS.md`** nel repo:

```markdown
# Secure Agents Policy

## 1Password CLI Restrictions

### ✅ Allowed Tools & Commands
- `op item list --vault <vault> --format json`
- `op item get <item-id> --vault <vault> --format json`
- `op item list --vault <vault> --tags <tag> --format json`
- Shell pipe to `jq` for extracting `.reference` field only
- `bash` / `sh` (read-only commands)

### ⛔ Forbidden Commands
- `op read` (risolve segreti)
- `op item edit` / `op item create` / `op item delete` (modifica)
- `op signin` / `op signout` (session management non controllato)
- `op run -- <cmd> | printenv` (intercetta variabili)
- Scrivere file `.env` in chiaro
- Pipe verso file non in `.gitignore`

### 🔧 Execution Policy
- If agent attempts forbidden command → immediately deny and explain
- All 1Password CLI calls must be through read-only discovery methods
- Secret resolution ONLY via wrapper script `scripts/get_secret_reference.sh`
- Agent can request reference, wrapper returns `op://...` format only

## MCP Server Allowlist (if using Continue/Claude Desktop)
- Only allow: `op://` secret reference extraction MCP
- Deny file system write access to `.env` or `config/`

## Example: Agent Task
✅ GOOD:
> "Find the API key named 'github-api-token' in the Development vault and return its reference"
> → Agent calls: `op item list --vault Development --format json | jq`
> → Returns: `op://Development/x4yz1234abcd/password`
> → Never sees: `ghp_abc123...`

❌ BAD:
> "Get me the GitHub API key value"
> → Agent calls: `op read op://Development/.../password`
> → Returns: `ghp_abc123...` (exposed!)
> → Forbidden.
```

### OpenCode / Gemini CLI - `opencode.json` / `gemini-config.yaml`

```json
{
  "tools": {
    "op": true,
    "op_item_list": true,
    "op_item_get": true,
    "op_read": false,
    "shell_exec": {
      "patterns": [
        "^op item list",
        "^op item get.*--format json",
        "^jq"
      ],
      "allow": true,
      "deny": [
        "printenv",
        "export",
        "> /tmp",
        "| tee"
      ]
    }
  },
  "environment": {
    "OP_SERVICE_ACCOUNT_TOKEN": "${env.OP_SERVICE_ACCOUNT_TOKEN}"
  }
}
```

---

## 🛠️ Script Helper: `scripts/get_secret_reference.sh`

Crea questo script nel repo per centralizzare la ricerca di reference. Gli agent possono chiamarlo, ma **non possono fare pipe su `op read`** direttamente.

```bash
#!/bin/bash
# scripts/get_secret_reference.sh
# Uso: ./get_secret_reference.sh <vault> <item-name> <field-label>
# Output: op://vault/item-id/field-label (SOLO REFERENCE, mai il valore)

set -euo pipefail

VAULT="${1:?Vault name required}"
ITEM_NAME="${2:?Item name required}"
FIELD_LABEL="${3:-password}"  # default: password field

# Validazione semplice (anti-injection)
if [[ ! "$VAULT" =~ ^[a-zA-Z0-9_-]+$ ]]; then
  echo "❌ Invalid vault name" >&2
  exit 1
fi

# Ricerca item nel vault
ITEM_JSON=$(op item get "$ITEM_NAME" --vault "$VAULT" --format json 2>/dev/null || echo "{}")

if [[ "$ITEM_JSON" == "{}" ]]; then
  echo "❌ Item '$ITEM_NAME' not found in vault '$VAULT'" >&2
  exit 1
fi

# Estrai la reference (non il valore!)
REFERENCE=$(echo "$ITEM_JSON" | \
  jq -r ".fields[] | select(.label==\"$FIELD_LABEL\") | .reference" 2>/dev/null || echo "")

if [[ -z "$REFERENCE" ]]; then
  echo "❌ Field '$FIELD_LABEL' not found in item '$ITEM_NAME'" >&2
  exit 1
fi

# Output SOLO la reference
echo "$REFERENCE"

# Logging (per audit)
echo "[$(date +'%Y-%m-%d %H:%M:%S')] Query: vault=$VAULT item=$ITEM_NAME field=$FIELD_LABEL → reference_found" >> /tmp/1password_audit.log 2>/dev/null || true
```

**Setup:**
```bash
chmod +x scripts/get_secret_reference.sh

# Aggiungere a .gitignore
echo "/tmp/1password_audit.log" >> .gitignore
```

---

## 💬 Prompt & Metaprompt per CLI Agents

### Prompts da usare in CLAUDE.md / AGENTS.md

#### Metaprompt 1: "Search & Reference Retrieval"

```markdown
# [Skill] Find 1Password Secret Reference

## Purpose
Agent can search for credentials in 1Password vault and retrieve their SECRET REFERENCE (the op:// pointer), but NEVER the actual value.

## Instructions
1. When asked to "find X credential" or "get X API key":
   - Use: `op item list --vault [vault] --format json | jq`
   - Search for item by title/tag
   - If found, extract ONLY the `.reference` field using jq
   - Return: `op://Vault/ItemID/FieldName` (this is a POINTER, not a secret)

2. NEVER:
   - Call `op read` 
   - Pipe output to `printenv` or file
   - Show the actual value
   - Run `op signin` / `op signout`

3. Example execution:
   ```bash
   op item list --vault Development --format json | \
     jq '.[] | select(.title=="github-token") | {title: .title, id: .id}'
   ```
   Then extract reference:
   ```bash
   op item get <ID> --vault Development --format json | \
     jq '.fields[] | select(.label=="password") | .reference'
   ```

## Output Format
Always return references like: `op://Development/x4yz1234/password`
Never resolve them (that's the MCP server's job).
```

#### Metaprompt 2: "Auto-Authenticate Agent"

```markdown
# [Skill] Initialize 1Password Authentication

## Purpose
Agent sets up 1Password CLI for headless execution (no biometric needed).

## Instructions
1. Check if op CLI is available:
   ```bash
   which op || (echo "Installing 1Password CLI..." && brew install 1password-cli)
   ```

2. Check authentication status:
   ```bash
   op item list --vault Development --format json > /dev/null 2>&1
   ```
   - If fails with "not authenticated": need service account setup
   - If succeeds: authentication ready

3. If using Service Account (sandbox/container):
   ```bash
   export OP_SERVICE_ACCOUNT_TOKEN="$(cat ~/.op_service_token)"
   op item list --vault Development > /dev/null && echo "✅ Service Account Active"
   ```

4. If using desktop session:
   ```bash
   eval $(op signin)  # Once per session
   ```

## Auto-detection Script
```bash
#!/bin/bash
# Auto-detect 1Password auth mode
if [ -n "${OP_SERVICE_ACCOUNT_TOKEN:-}" ]; then
  echo "Mode: Service Account"
elif [ -n "${OP_CONNECT_TOKEN:-}" ]; then
  echo "Mode: Connect Server"
else
  # Try session
  op item list > /dev/null 2>&1 && echo "Mode: Session Biometric" || echo "Mode: Not Authenticated"
fi
```
```

#### Metaprompt 3: "Environment Setup for MCP Servers"

```markdown
# [Skill] Generate .env with 1Password References

## Purpose
Agent creates config files with `op://...` references instead of plaintext secrets.

## Instructions
1. User says: "Setup .env for my Anthropic MCP server"

2. Agent discovers which env vars are needed (from docs/config)

3. For each var, search vault:
   ```bash
   scripts/get_secret_reference.sh Development "anthropic-api-key" "password"
   # Returns: op://Development/xyz/password
   ```

4. Generate .env:
   ```env
   # .env
   # Secrets are resolved at runtime by `op run`
   # Never commit this file if it contains op:// references!
   ANTHROPIC_API_KEY="op://Development/xyz/password"
   ```

5. Add to .gitignore:
   ```
   .env
   .env.local
   ```

6. Instructions for using:
   ```bash
   op run --env-file .env -- your-mcp-server start
   # This way: secrets decrypted only in that subprocess, never on disk
   ```

## Security Notes
- op:// references are NOT secrets themselves
- But .env files should still be in .gitignore
- Actual value never leaves 1Password vault
- Subprocess sees the decrypted value only while running
```

### Prompts da usare direttamente come `/slash-commands`

#### Slash Command 1: `/1p-search <item-name>`

```markdown
Search 1Password vault for an item and return its reference.

Example:
/1p-search github-api-token

Returns:
op://Development/x4yz1234abcd/password
op://Development/x4yz1234abcd/username
```

**Implementazione in Claude Code / Droid:**

```yaml
# .claude/commands.yaml (o .droid/commands.yaml)
commands:
  - name: "1p-search"
    description: "Find 1Password item and return its reference(s)"
    icon: "🔐"
    handler: |
      #!/bin/bash
      ITEM_NAME="${1:?Item name required}"
      VAULT="${2:-Development}"
      
      # Find and extract references
      ./scripts/get_secret_reference.sh "$VAULT" "$ITEM_NAME" "password" 2>/dev/null || echo "Item not found"
```

#### Slash Command 2: `/1p-setup-env <mcp-server-name>`

```markdown
Create a .env file for an MCP server using 1Password references.

Example:
/1p-setup-env anthropic

Discovers required env vars, creates .env with op:// references
```

---

## 📦 Complete DevContainer Setup Example

**`.devcontainer/devcontainer.json`:**

```json
{
  "name": "Agents + 1Password",
  "image": "mcr.microsoft.com/devcontainers/base:ubuntu-24.04",
  "features": {
    "ghcr.io/devcontainers/features/1password-cli:latest": {},
    "ghcr.io/devcontainers/features/node:latest": {
      "version": "20"
    }
  },
  "remoteEnv": {
    "OP_SERVICE_ACCOUNT_TOKEN": "${localEnv:OP_SERVICE_ACCOUNT_TOKEN}"
  },
  "mounts": [
    "source=${localEnv:HOME}/.ssh,target=/home/vscode/.ssh,readonly"
  ],
  "postCreateCommand": "bash .devcontainer/post-create.sh",
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-vscode.makefile-tools",
        "charliermarsh.ruff",
        "esbenp.prettier-vscode"
      ]
    }
  }
}
```

**`.devcontainer/post-create.sh`:**

```bash
#!/bin/bash
set -euo pipefail

echo "🔐 Initializing 1Password CLI..."

# Check 1Password CLI
if ! command -v op &> /dev/null; then
  echo "❌ op CLI not found"
  exit 1
fi

# Verify service account
if [ -z "${OP_SERVICE_ACCOUNT_TOKEN:-}" ]; then
  echo "❌ OP_SERVICE_ACCOUNT_TOKEN not set"
  echo "   Set in your host shell: export OP_SERVICE_ACCOUNT_TOKEN='ops_...'"
  exit 1
fi

# Test connection
if op item list --vault Development > /dev/null 2>&1; then
  echo "✅ 1Password Service Account authenticated"
else
  echo "❌ Service account authentication failed"
  exit 1
fi

# Setup scripts
mkdir -p scripts
chmod +x scripts/get_secret_reference.sh

# Create audit log location
mkdir -p /tmp
touch /tmp/1password_audit.log

echo "✅ All systems ready!"
op vault list --format json | jq -r '.[] | "📦 Vault: \(.title)"'
```

---

## 🚀 Integration Checklist per CLI Agent

Quando usi un CLI agent (Claude Code, Droid, Gemini, Continue, Kilocode, OpenCode) per cercare/usare segreti:

- [ ] **Rilevamento ambiente**
  - [ ] `which op` restituisce un percorso
  - [ ] `op vault list` funziona
  - [ ] Service account o biometric session attiva

- [ ] **Configurazione agent**
  - [ ] `.claude/AGENTS.md` con policy di esclusione
  - [ ] Oppure `.droid/config.yaml` con tool allowlist
  - [ ] Oppure `opencode.json` con pattern di shell allowed

- [ ] **Script helper**
  - [ ] `scripts/get_secret_reference.sh` presente e eseguibile
  - [ ] `.gitignore` include `1password_audit.log`

- [ ] **DevContainer** (se usi container)
  - [ ] `OP_SERVICE_ACCOUNT_TOKEN` passato dall'host
  - [ ] `.devcontainer/post-create.sh` verifica connessione

- [ ] **Prompt/Skill definito**
  - [ ] Metaprompt "Find 1Password Secret Reference" nel context
  - [ ] Metaprompt "Auto-Authenticate Agent" nel context
  - [ ] Slash command `/1p-search` disponibile

- [ ] **Testing**
  - [ ] Agent può cercare un item per nome
  - [ ] Agent restituisce solo `op://...` reference, mai il valore
  - [ ] Agent rifiuta comandi `op read`, `op signin`, ecc.
  - [ ] Audit log registra le ricerche (facoltativo ma consigliato)

---

## 🐛 Troubleshooting

| Errore | Causa | Soluzione |
|--------|-------|-----------|
| `op: command not found` | CLI non installato | `brew install 1password-cli` |
| `OP_SERVICE_ACCOUNT_TOKEN invalid` | Token scaduto o malformato | Rigenera in 1Password Desktop → Developer |
| `Item 'xyz' not found in vault 'Development'` | Vault name o item name sbagliato | Verifica con `op vault list` e `op item list --vault <vault>` |
| `Field 'password' not found` | Label field differente | Controlla con `op item get <item> --format json \| jq '.fields[] \| .label'` |
| `jq: command not found` | `jq` non installato | `brew install jq` o `apt-get install jq` |
| Agent calls `op read` (forbidden) | Agent elude policy | Rivedi `.claude/AGENTS.md` + add `--no-exec-read` flag se disponibile |

---

## 📚 Riferimenti

- [1Password CLI Docs](https://developer.1password.com/docs/cli/)
- [Secret References](https://developer.1password.com/docs/cli/secret-references/)
- [Service Accounts](https://developer.1password.com/docs/service-accounts/)
- [Using op run](https://developer.1password.com/docs/cli/run-commands/)
- [MCP with 1Password (Blog Anthropic)](https://1password.com/blog/securing-mcp-servers-with-1password-stop-credential-exposure-in-your-agent)

---

**Versione:** 1.0 | **Data:** 2026-01-17 | **Ambiente:** macOS M2 + Linux + Codespaces
