# 1Password for Developers: Complete Guide for AI-Assisted Workflows

**Version:** 1.0  
**Last Updated:** November 2025  
**Purpose:** Comprehensive reference guide for dev-assisted agents working with 1Password across local, cloud, and CI/CD workflows.

---

## Table of Contents

1. [Quick Reference Matrix](#quick-reference-matrix)
2. [Core Concepts](#core-concepts)
3. [Local Development Workflows](#local-development-workflows)
4. [Cloud & CI/CD Workflows](#cloud--cicd-workflows)
5. [Environments & Organization](#environments--organization)
6. [Common Use Cases](#common-use-cases)
7. [Security Best Practices](#security-best-practices)
8. [Troubleshooting & FAQ](#troubleshooting--faq)

---

## Quick Reference Matrix

| Scenario | Solution | Authentication | Scope | When to Use |
|----------|----------|-----------------|-------|------------|
| **Local dev, single app** | `.env` file mounting (Environments beta) | Desktop App + Biometric | Local machine only | Rapid prototyping, sandbox, team onboarding |
| **Local dev, multi-env switching** | Shell Plugins + Environments | User account + Biometric | Local machine only | CLI tools (Terraform, AWS CLI), switching between staging/prod creds |
| **Local dev, CLI integration** | `op run` or `op inject` | Desktop App + Biometric | Local machine only | Running apps with injected secrets, building without plaintext `.env` |
| **Cloud-only app on GitHub** | Service Account | Service Account credentials | Cloud pipeline | CI/CD, GitHub Actions, low overhead, rate-limited |
| **Self-hosted infrastructure** | Connect Server | Service Account or Bearer Token | Self-hosted + infrastructure | Kubernetes, Docker Swarm, multiple services, unlimited requests, caching |
| **Multi-service production** | Connect Server | Bearer Token | Infrastructure + REST API | Production, complex orchestration, load balancing, redundancy |
| **Team collaboration on dev secrets** | Shared Environments + `.env` mounting | User accounts + shared vault | Team + local | Onboarding, consistency, zero plaintext sharing |

---

## Core Concepts

### 1. **Environments (Beta)**

**What it is:**  
A container for grouping project-specific secrets in 1Password. Each environment is a dedicated space for storing environment variables for a specific app, project, or deployment stage.

**Key characteristics:**
- Created in 1Password Desktop App (Developer > View Environments > New environment)
- Self-contained: variables in Environment A do not affect Environment B
- Shareable: you can grant view/edit access to team members
- Can be mounted as a local `.env` file (only on Mac/Linux desktop)
- Never written to disk as plaintext

**When to create:**
- One environment per app/project/service
- Separate environments for different stages (dev, staging, production) if needed
- Use descriptive names (e.g., `myapp-local`, `myapp-staging`, `myapp-prod`)

**Workflow:**
1. Open 1Password Desktop > Developer > View Environments
2. Click "New environment" → name it
3. Add variables (name/value pairs)
4. Optional: import existing `.env` file
5. Optional: share with team members (Manage Environment > Manage Access)
6. Mount or integrate with your app/workflow

---

### 2. **1Password CLI (`op`)**

The command-line tool for accessing 1Password from terminal workflows. Central to automation, scripting, and development.

**Three main use patterns:**

#### a) **`op run` — Inject secrets into running commands**
```bash
op run -- your-command-here
```
- Prompts for biometric auth (first time)
- Reads `.env` file with `op://` references
- Injects resolved secrets into child process environment
- Secrets never touch disk

**Example:**
```bash
# .env file (reference-based)
DATABASE_URL=op://myapp/db/url
API_KEY=op://myapp/api/key

# Run with injected secrets
op run -- npm start
```

#### b) **`op inject` — Generate a temporary `.env` file**
```bash
op inject -i .env.template -o .env.temp
```
- Reads `.env.template` with `op://` references
- Resolves and outputs to file (or stdout)
- File is temporary and not tracked by Git

#### c) **`op item create/get` — Manage secrets programmatically**
```bash
op item create --vault "dev" --title "My Secret" username=value password=secret
op item get "my-secret" --vault "dev" --raw
```
- CRUD operations on 1Password items
- Use for automation, provisioning, admin tasks

---

### 3. **Shell Plugins**

CLI tools (Terraform, AWS CLI, Kubernetes, etc.) pre-configured to authenticate using 1Password biometrics.

**Key points:**
- Works only with **personal user accounts** (not Service Accounts)
- Requires 1Password Desktop App installed and unlocked
- No Shell Plugins support with Service Accounts or Connect Servers
- Enables seamless switching between environments in your shell

**Supported tools:** AWS CLI, Terraform, Kubernetes, GitHub CLI, and others

**Use case:** Switching AWS credentials without retyping or copying secrets:
```bash
# Shell plugin automatically selects credential from 1Password
aws s3 ls  # prompts biometric, then runs with 1Password-stored AWS creds
```

---

### 4. **Service Accounts**

Authentication mechanism for **cloud/automated workflows** (no biometric, no user).

**Characteristics:**
- Standalone credentials (ID + secret token)
- Works with 1Password CLI or directly
- **Rate-limited:** request quotas per minute
- No self-hosting required
- Suitable for GitHub Actions, Lambda, Docker containers

**When to use:**
- CI/CD pipelines
- Serverless functions
- Automation scripts in cloud
- Container deployments
- When you cannot use Desktop App + biometric

**Limitations:**
- No Shell Plugins
- No Environments switching capability
- Request rate limits apply
- Not designed for high-volume, multi-service architectures

---

### 5. **Connect Server**

Self-hosted bridge that caches 1Password secrets in your infrastructure and exposes them via REST API.

**Characteristics:**
- Deployed in your infrastructure (Docker, Kubernetes, VM)
- Reduces latency and dependency on 1Password API
- **No rate limits** (unlimited requests after initial fetch + local caching)
- REST API (not just CLI)
- SDKs available (Go, Python, JavaScript, .NET)
- Redundancy and load-balancing capable

**When to use:**
- Production environments with multiple services
- Kubernetes or container orchestration
- Complex architectures needing REST API access
- High request volume workflows
- Zero-downtime, self-hosted requirements

**Limitations:**
- Requires infrastructure and deployment
- Higher setup overhead
- Self-hosting responsibility (security, updates, backups)

---

## Local Development Workflows

### Scenario 1: `.env` File Mounting (Environments Beta)

**Best for:** Single developer, local machine, rapid prototyping, team onboarding.

**Setup:**
1. Open 1Password Desktop > Developer > View Environments
2. Create environment: `myapp-local`
3. Add variables (e.g., `DATABASE_URL`, `API_KEY`, `SECRET`)
4. The environment auto-mounts a virtual `.env` file in a default local path
5. Your app reads the mounted file as if it were a real `.env`

**Key benefits:**
- Zero plaintext on disk
- No Git accidents (file doesn't exist in repo)
- Instant team sharing (share environment access)
- Seamless for Docker/local dev containers
- Offline access (cached)

**Important notes:**
- Only works on Mac/Linux (not Windows natively)
- Requires 1Password Desktop running and unlocked
- Only accessible locally (not cloud-accessible)
- `[.env added to `.gitignore`, but no file ever committed anyway]`

**Developer workflow:**
```bash
# 1. Create environment in 1Password Desktop
# 2. App/script reads from mounted path
# 3. Run your app (reads secrets automatically)
npm start
# or
docker-compose up  # container mounts the same file
```

---

### Scenario 2: Shell Plugins for CLI Tools

**Best for:** Developers switching between multiple environments (dev/staging/prod credentials).

**Setup:**
1. Install 1Password CLI: `brew install 1password-cli`
2. Enable in 1Password Desktop > Settings > Developer > "Integrate with 1Password CLI"
3. Create environments for each stage (e.g., `app-dev`, `app-staging`, `app-prod`)
4. Add credentials to each environment
5. Use supported CLI with biometric prompt

**Example: AWS CLI with Shell Plugins**
```bash
# First run prompts for biometric
aws s3 ls

# 1Password automatically injects the AWS credentials from your current environment
# Seamlessly switch by changing environment in 1Password Desktop
```

**Example: Terraform with Shell Plugins**
```bash
# Terraform CLI pulls AWS creds from 1Password Shell Plugin
terraform init
terraform plan
# All authenticated via biometric, zero plaintext AWS keys
```

**Workflow for multi-environment dev:**
1. Open 1Password Desktop
2. Switch to `app-staging` environment
3. Run `terraform apply` (uses staging creds)
4. Switch to `app-prod` environment
5. Run `terraform apply` (uses prod creds)
6. Never copy/paste credentials

---

### Scenario 3: `op run` for Local Development

**Best for:** Running apps with injected secrets without storing plaintext `.env`.

**Setup:**
1. Create `.env.template` with `op://` references:
   ```
   DATABASE_URL=op://myapp/database/url
   API_KEY=op://myapp/services/api_key
   ```
2. Run app with `op run`:
   ```bash
   op run -- npm start
   ```
3. First run prompts for biometric, then secrets injected into process

**Benefits:**
- No plaintext `.env` ever written
- Portable across machines (just reference the vault)
- Works in CI/CD with Service Account too
- Audit trail in 1Password

**Example workflow for team:**
```bash
# Developer clones repo (no .env in repo)
git clone myapp
cd myapp

# Runs with secrets injected from 1Password
op run -- npm start

# Same command works on any machine with 1Password Desktop installed
# and vault access
```

---

## Cloud & CI/CD Workflows

### Scenario 1: GitHub Actions with Service Account

**Best for:** Apps living only on GitHub, CI/CD pipelines, no local runner.

**Setup:**
1. Create Service Account in 1Password (Admin > Integrations > Service Accounts)
2. Generate Service Account token
3. Add token as GitHub Secret: `OP_SERVICE_ACCOUNT_TOKEN`
4. In GitHub Actions workflow:
   ```yaml
   - name: Load secrets from 1Password
     run: |
       # Service Account authenticates with token
       op item get "my-secret" --vault "deployment" --raw
   ```

**Example workflow:**
```yaml
name: Deploy App

on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Authenticate with 1Password
        env:
          OP_SERVICE_ACCOUNT_TOKEN: ${{ secrets.OP_SERVICE_ACCOUNT_TOKEN }}
        run: |
          # Secrets automatically available via op CLI
          DATABASE_URL=$(op item get "app-db" --vault "deployment" --raw)
          echo "DB_URL=$DATABASE_URL" >> $GITHUB_ENV
      
      - name: Deploy
        run: npm run deploy
        env:
          DATABASE_URL: ${{ env.DB_URL }}
```

**Advantages:**
- Low overhead
- No infrastructure to deploy
- Works out-of-the-box with GitHub
- Included with 1Password subscription

**Limitations:**
- Rate-limited (suitable for typical CI/CD volumes)
- CLI-only (no REST API)
- Not ideal for high-concurrency workflows

---

### Scenario 2: Self-Hosted Infrastructure with Connect Server

**Best for:** Production, Kubernetes, Docker Swarm, multi-service architectures, high request volume.

**Architecture:**
```
1Password Vault (cloud)
    ↓ (authenticate once)
Connect Server (self-hosted, Docker/K8s)
    ↓ (cache, REST API, unlimited local requests)
Your Apps & Services
```

**Setup:**
1. Deploy Connect Server in your infrastructure (Docker image or Helm chart)
2. Create Service Account in 1Password for Connect
3. Start Connect with Service Account token
4. Apps query Connect Server via REST API (no 1Password CLI needed)

**Example: Docker Compose**
```yaml
version: '3'
services:
  connect:
    image: 1password/connect-api:latest
    environment:
      OP_CONNECT_TOKEN: $OP_SERVICE_ACCOUNT_TOKEN
    ports:
      - "8080:8080"
  
  myapp:
    image: myapp:latest
    environment:
      SECRET_API: http://connect:8080/v1/vaults/vault-id/items/item-id
    depends_on:
      - connect
```

**Example: Kubernetes with Helm**
```bash
helm install 1password 1password/connect-api \
  --set connect.credentials.serviceAccountToken=$OP_SERVICE_ACCOUNT_TOKEN
```

**Benefits:**
- No rate limits
- Cached secrets (low latency)
- REST API (not just CLI)
- Scalable (multiple Connect instances, load balancing)
- Offline resilience (cached locally)
- SDK support (Go, Python, JS)

**Limitations:**
- Self-hosting overhead
- Security responsibility (firewall, TLS, access control)
- Requires deployment pipeline

---

### Scenario 3: AWS Lambda / Serverless with 1Password

**Option A: Direct Service Account + `op` CLI**
```python
import subprocess
import json

def lambda_handler(event, context):
    # Set Service Account token (from AWS Secrets Manager or environment)
    result = subprocess.run(
        ['op', 'item', 'get', 'my-secret', '--vault', 'prod', '--raw'],
        capture_output=True,
        text=True
    )
    secret_value = result.stdout.strip()
    
    # Use secret in function
    return {'statusCode': 200, 'body': secret_value}
```

**Option B: Connect Server (recommended for Lambda)**
```python
import requests

def lambda_handler(event, context):
    # Call Connect Server (internal endpoint in VPC)
    response = requests.get(
        'http://connect-server:8080/v1/vaults/vault-id/items/item-id/fields',
        headers={'Authorization': f'Bearer {os.environ["CONNECT_TOKEN"]}'}
    )
    secret_value = response.json()['fields'][0]['value']
    
    return {'statusCode': 200, 'body': secret_value}
```

**Recommendation:** Use Connect Server for Lambda if secrets are accessed frequently (avoid rate limits).

---

## Environments & Organization

### Best Practices for Organizing Environments

**One environment per:**
- Project/app
- Deployment stage (dev, staging, prod) — OR — separate vaults
- Team or namespace

**Naming convention:**
```
{project}-{stage}
{project}-{service}
team-{resource}-{stage}
```

Examples:
- `api-local` (local development)
- `api-staging` (staging environment)
- `api-prod` (production)
- `frontend-stripe` (Stripe integration for frontend)
- `data-pipeline-dev` (data pipeline dev)

### Managing Multi-Environment Secrets

**Pattern 1: One Environment per Stage + Separate Vaults**
```
Vault: "api-dev"
  └─ Environment: "api-dev"
     ├─ DATABASE_URL=...
     └─ API_KEY=...

Vault: "api-prod"
  └─ Environment: "api-prod"
     ├─ DATABASE_URL=...
     └─ API_KEY=...
```

**Pattern 2: Single Vault + Multiple Environments**
```
Vault: "api-secrets"
  ├─ Environment: "api-dev"
  │  ├─ DATABASE_URL=op://api-secrets/db-dev/url
  │  └─ API_KEY=op://api-secrets/key-dev/secret
  │
  └─ Environment: "api-prod"
     ├─ DATABASE_URL=op://api-secrets/db-prod/url
     └─ API_KEY=op://api-secrets/key-prod/secret
```

**Recommendation:** Use separate vaults per stage for access control (principle of least privilege); use shared vault with multiple environments only for small teams.

---

## Common Use Cases

### Use Case 1: Onboarding New Developer (Local Dev)

**Goal:** New dev gets repo + credentials without ever seeing plaintext secrets.

**Steps:**
1. Dev clones repo (no `.env` in Git)
2. Admin shares 1Password environment with dev account
3. Dev installs 1Password Desktop + CLI
4. Dev enables `.env` mounting for the project environment
5. Dev runs: `op run -- npm start`
6. App works with injected secrets

**Zero friction, zero plaintext sharing.**

---

### Use Case 2: Multi-Stage Deployment (Dev → Staging → Prod)

**Goal:** Deploy same code with different secrets to multiple environments.

**Setup:**
```bash
# Three separate environments
1Password > dev/api-dev
1Password > dev/api-staging
1Password > dev/api-prod
```

**GitHub Actions workflow:**
```yaml
deploy:
  strategy:
    matrix:
      environment: [dev, staging, prod]
  steps:
    - name: Deploy to ${{ matrix.environment }}
      env:
        OP_SERVICE_ACCOUNT_TOKEN: ${{ secrets.OP_SERVICE_ACCOUNT_TOKEN }}
      run: |
        SECRETS=$(op item get "app-${{ matrix.environment }}" --vault "deployment" --raw)
        # Deploy with environment-specific secrets
        npm run deploy
```

---

### Use Case 3: Local Docker Containers with Mounted Secrets

**Goal:** Docker container in local dev reads secrets from 1Password.

**Setup:**
1. Create environment: `myapp-local`
2. Mount `.env` file via 1Password Desktop
3. Docker Compose mounts the same file:
   ```yaml
   volumes:
     - ~/.1password/myapp.env:/app/.env:ro
   ```

**Result:** Container has read-only access to mounted secrets, zero plaintext in Dockerfile or compose file.

---

### Use Case 4: Kubernetes with Secret Sync

**Goal:** K8s pods access 1Password secrets without managing Kubernetes secrets manually.

**Solution:** Deploy 1Password Connect Server in cluster:
```bash
# Install Connect with Helm
helm install 1password 1password/connect-api \
  --set connect.credentials.serviceAccountToken=$TOKEN

# Pods query Connect Server
curl http://1password-connect-api:8080/v1/vaults/{vault-id}/items/{item-id}
```

---

### Use Case 5: Offline-First Development

**Goal:** Developer can work offline with cached secrets.

**How it works:**
- 1Password Desktop caches secrets locally (encrypted)
- Environments with `.env` mounting work offline
- Secrets available even without internet connection

**Workflow:**
1. Connect to 1Password (online) and unlock Desktop App
2. Mount environment `.env` file
3. Disconnect from internet
4. Dev continues working (cached secrets still available)
5. Changes sync when reconnected

---

## Security Best Practices

### 1. **Principle of Least Privilege**

- **Service Accounts:** Restrict to specific vaults, not all vaults
  ```
  Service Account "github-deploy" → access only "prod" vault
  Service Account "ci-test" → access only "test" vault
  ```

- **Environments:** Share only with team members who need access
  - Use "View only" for read-only access
  - Use "View & Edit" sparingly

- **Vaults:** Separate prod/staging/dev vaults, restrict access per role

### 2. **Never Commit `.env` Files**

- Add `.env` to `.gitignore` immediately
- If a plaintext `.env` was ever committed, treat all secrets as compromised
- Rotate all credentials

### 3. **Use References Instead of Plaintext**

- Store `op://vault/item/field` references in `.env.template`
- Inject actual values at runtime
- Template files can be committed (no secrets in them)

### 4. **Rotate Service Account Tokens Regularly**

- Treat Service Account tokens like passwords
- Rotate them periodically (e.g., quarterly)
- Use AWS Secrets Manager / GitHub Secrets for storing tokens

### 5. **Enable Audit Logging**

- 1Password logs all secret access
- Review audit logs for unexpected access patterns
- Set up alerts for suspicious activity

### 6. **Use Biometric Authentication Locally**

- Always use Shell Plugins with biometric (not copy/paste)
- Don't export secrets to shell scripts
- Prefer `op run -- command` over manual injection

### 7. **Separate Dev, Staging, Prod Credentials**

- Never share production credentials with dev team
- Use different Service Accounts per environment
- Restrict access to prod vault to authorized personnel only

---

## Troubleshooting & FAQ

### Q: Can I use `.env` file mounting in cloud environments (Claude Code, GitHub Codespaces)?

**A:** No, not directly. Mounting requires 1Password Desktop running locally. For cloud IDEs:
- Use Service Account + `op` CLI in cloud environment
- Or deploy Connect Server in your infrastructure and query it
- Or use environment-specific secret injection (GitHub Secrets, AWS Secrets)

---

### Q: Does Shell Plugins work with Service Account?

**A:** No. Shell Plugins require personal user account + biometric. For Service Account automation, use `op` CLI directly or Connect Server REST API.

---

### Q: I accidentally committed a `.env` file with secrets. What do I do?

**A:** 
1. **Immediately rotate all secrets** in 1Password (consider them compromised)
2. Force-push with corrected history or start fresh branch without secrets
3. Add `.env` to `.gitignore`
4. Remove plaintext `.env` from Git history (use `git filter-branch` or `bfg`)

---

### Q: Should I store database passwords in an Environment?

**A:** Yes, absolutely. Environments are designed for this. Store:
- Database URLs + passwords
- API keys
- OAuth tokens
- Third-party service credentials
- Encryption keys (non-master keys)

**Never store:**
- Master/admin credentials (use SSO or MFA-protected vaults)
- Private keys for SSH (use separate SSH vault)
- Backup codes

---

### Q: Can I import an existing `.env` file into an Environment?

**A:** Yes, in 1Password Desktop:
1. Create environment
2. Click "Import" → select `.env` file
3. Variables imported automatically
4. Review and confirm

---

### Q: How do I debug why `op run` is failing?

**A:** Add verbose flag:
```bash
op run --debug -- your-command
```

Common issues:
- 1Password Desktop not running: `Error: 1Password CLI not authenticated`
- Vault/item reference incorrect: `Error: Item not found`
- Biometric auth expired: Re-unlock 1Password Desktop

---

### Q: Can Connect Server cache handle offline scenarios?

**A:** Yes. Connect Server caches secrets locally:
- First fetch from 1Password cloud
- Subsequent requests served from cache (instant)
- If 1Password cloud is down, cached secrets still available
- New secrets require cloud connectivity (but cached ones work)

---

### Q: How do I rotate secrets across all environments?

**A:** Workflow:
1. In 1Password, create new version of secret (or new item)
2. Update all environment references to point to new secret
3. Verify all apps/pipelines fetching new version
4. Deprecate old secret after verification period

---

### Q: Should I use Service Account or Connect Server for my use case?

**Decision tree:**
- **Single CI/CD pipeline** → Service Account
- **< 100 API requests/minute** → Service Account
- **Multiple services/microservices** → Connect Server
- **Self-hosted infrastructure** → Connect Server
- **Kubernetes** → Connect Server
- **High availability / redundancy needed** → Connect Server
- **REST API required** → Connect Server
- **Minimal setup overhead** → Service Account

---

## Additional Resources

- [1Password Developer Documentation](https://developer.1password.com)
- [1Password Environments Beta](https://developer.1password.com/docs/environments/local-env-file)
- [1Password CLI Reference](https://developer.1password.com/docs/cli)
- [1Password Connect Documentation](https://developer.1password.com/docs/connect)
- [1Password Service Accounts](https://developer.1password.com/docs/service-accounts)
- [1Password Shell Plugins](https://developer.1password.com/docs/cli/shell-plugins/environments)
- [1Password Security Best Practices](https://developer.1password.com/docs/cli/best-practices)

---

## Summary Table: When to Use What

| Feature | Local Dev | CI/CD | Production | Self-Hosted | Multi-Env |
|---------|-----------|-------|------------|-------------|-----------|
| **`.env` Mounting** | ✅ Best | ❌ No | ❌ No | ❌ No | ✅ Easy |
| **Shell Plugins** | ✅ Best | ❌ No | ❌ No | ❌ No | ✅ Yes |
| **`op run`** | ✅ Good | ✅ Yes | ⚠️ Possible | ⚠️ Possible | ✅ Yes |
| **Service Account** | ❌ No | ✅ Best | ⚠️ OK | ⚠️ OK | ❌ No |
| **Connect Server** | ❌ No | ✅ Good | ✅ Best | ✅ Best | ✅ Yes |

---

**End of Guide**