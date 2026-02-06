# Project Guide for AI Agents

## Project Overview

This project uses **Vercel agent-browser** for vibe coding browser automation workflows. The custom droid `agent-browser-vibe` specializes in rapid testing, multi-agent coordination, and authenticated session management.

## Quick Start

### Installation
```bash
npm install -g agent-browser
agent-browser install  # Download Chromium
Basic Workflow
bash
# 1. Navigate
agent-browser open http://localhost:3000

# 2. Get snapshot with refs
agent-browser snapshot -i --json

# 3. Interact using refs
agent-browser click @e2
agent-browser fill @e3 "value"

# 4. Re-snapshot after changes
agent-browser snapshot -i --json
Custom Droid Usage
Invoke the specialized droid:

bash
# Via Factory CLI
/task Use agent-browser-vibe to validate the login flow
The droid automatically:

Consults knowledge base files

Applies snapshot-refs workflow

Uses optimal filtering flags

Manages session isolation

Architecture & Conventions
Knowledge Base Location
text
.factory/knowledge/agent-browser/
├── core-concepts.md      # Architecture patterns
├── snapshot-workflow.md  # Optimal AI workflow
├── use-cases.md          # Six primary scenarios
├── cli-commands.md       # Full command reference
└── troubleshooting.md    # Common issues
When to Use agent-browser
✅ Use for:

Vibe coding rapid validation

Authenticated API testing

Multi-agent parallel sessions

Quick E2E smoke tests

Electron/CDP control

Browser streaming workflows

❌ Don't use for:

Production test suites (use Playwright)

CI/CD automated testing (use proper framework)

Complex assertion logic

Long-running scenarios

Build & Test
Local Development Server
bash
# Start dev server (adjust for your stack)
npm run dev
# or
pnpm dev
Testing with agent-browser
bash
# Test local app
agent-browser open http://localhost:3000 --headed
agent-browser snapshot -i -c -d 5 --json

# Test with auth
agent-browser open http://localhost:3000/admin \
  --headers '{"Authorization": "Bearer DEV_TOKEN"}'
Multi-Agent Coordination
When using multiple agents simultaneously:

bash
# Agent 1 - Feature A
AGENT_BROWSER_SESSION=feature-a agent-browser open http://localhost:3000

# Agent 2 - Feature B (isolated)
AGENT_BROWSER_SESSION=feature-b agent-browser open http://localhost:3000
Each session maintains:

Isolated cookies/storage

Independent navigation state

Separate auth tokens

Environment Variables
Required for cloud deployment:

bash
# Browserbase (optional)
export BROWSERBASE_API_KEY="your-key"
export BROWSERBASE_PROJECT_ID="your-project"

# Browser Use (optional)
export AGENT_BROWSER_PROVIDER=browseruse
export BROWSER_USE_API_KEY="your-key"

# Streaming (optional)
export AGENT_BROWSER_STREAM_PORT=9223
Security
Authentication Patterns
Header-based (recommended):

bash
agent-browser open https://api.example.com \
  --headers '{"Authorization": "Bearer TOKEN"}'
Headers are origin-scoped - only sent to matching domain.

State save/load:

bash
# After manual login
agent-browser state save auth.json

# Restore in new session
agent-browser state load auth.json
Sensitive Data
Never commit auth.json state files

Use environment variables for tokens

Rotate API keys regularly

Use --session for user role isolation

Git Workflows
Branch Naming
Feature branches: feature/agent-browser-{use-case}

Testing branches: test/vibe-coding-{feature}

Commit Messages
text
feat(vibe): add multi-agent session testing
test(vibe): validate auth header scoping
fix(vibe): resolve snapshot stale ref issue
Conventions & Patterns
Snapshot Filtering (Token Optimization)
bash
# Standard filter for AI
agent-browser snapshot -i -c -d 5 --json

# Flags explained:
# -i: interactive elements only (~70% reduction)
# -c: compact mode (~30% reduction)
# -d 5: max depth 5 levels
# --json: structured output for AI parsing
Ref-Based Actions (Preferred)
bash
# Good - deterministic, fast
agent-browser click @e2

# Avoid - fragile, slow
agent-browser click "#app > div > button.submit"
Re-Snapshot After Changes
bash
# Always re-snapshot after navigation/state change
agent-browser click @e2
agent-browser wait --url "**/success"
agent-browser snapshot -i --json  # Fresh refs


Common Commands

Smoke Test Critical Path

bash
agent-browser open https://production.example.com
agent-browser snapshot -i --json
agent-browser fill @e1 "search query"
agent-browser press Enter
agent-browser wait --text "Results"
agent-browser screenshot smoke-test.png

Test Authenticated Endpoint
bash
agent-browser open https://api.example.com/data \
  --headers '{"Authorization": "Bearer TOKEN"}' \
  --json
agent-browser snapshot -i --json

Debug with Visual Browser
bash
agent-browser open http://localhost:3000 --headed
# Browser window opens for visual inspection


Troubleshooting

Daemon not starting:

bash
pkill -f "agent-browser"
rm -rf ~/.agent-browser/*
agent-browser open example.com


Stale refs:

bash
# Re-snapshot to get fresh refs
agent-browser snapshot -i --json


High token usage:

bash
# Use aggressive filtering
agent-browser snapshot -i -c -d 3 --json


For detailed troubleshooting, see: .factory/knowledge/agent-browser/troubleshooting.md



External Resources

Official docs: https://agent-browser.dev

GitHub repo: https://github.com/vercel-labs/agent-browser

Claude Code plugin: /plugin install agent-browser

Browserbase: https://browserbase.com

Browser Use: https://browser-use.com

Contact & Support
For vibe coding specific questions, invoke the agent-browser-vibe droid:

bash
/task Use agent-browser-vibe to help with [your task]
The droid has full context from the knowledge base and follows Factory.ai best practices.

text

***

## How to Use This Setup

### 1. Create the Files

```bash
# Create folder structure
mkdir -p .factory/droids
mkdir -p .factory/knowledge/agent-browser

# Copy each file content from above into respective locations

2. Invoke the Droid
bash
# Via Factory CLI
/task Use agent-browser-vibe to test the login flow on localhost:3000

# Or specific use case
/task Use agent-browser-vibe to set up multi-agent sessions for testing checkout and profile flows

# Or authenticated testing
/task Use agent-browser-vibe to validate the admin panel with Bearer token authentication

3. Droid Will Automatically:

✅ Consult .factory/knowledge/agent-browser/ files before acting

✅ Apply snapshot-refs workflow pattern

✅ Use optimal filtering flags (-i -c -d 5 --json)
​
✅ Manage session isolation for multi-agent scenarios
​
✅ Follow Factory.ai best practices for droids