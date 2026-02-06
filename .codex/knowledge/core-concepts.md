# Agent Browser Core Concepts

## Architecture

**Client-Daemon Model**
- Rust CLI (fast native binary) - parses commands, communicates with daemon
- Node.js Daemon - manages Playwright browser instance
- Daemon persists between commands for speed
- Fallback to Node.js if native binary unavailable

**Browser Engine**: Chromium by default (Firefox/WebKit via Playwright protocol)

## Key Differentiators vs Other Tools

### vs Playwright
- **Playwright**: Full testing framework, CI/CD optimized, suite-based
- **agent-browser**: CLI for AI-driven interactive automation, local-first

### vs Stagehand
- **Stagehand**: AI framework extending Playwright with natural language
- **agent-browser**: Standalone CLI with snapshot-refs architecture

### vs MCP Testing Tools
- **MCP Tools**: Protocol-based testing, IDE integration
- **agent-browser**: Direct CLI, can be exposed as MCP tool

## Snapshot-Refs Pattern

The core innovation for AI agents:

```bash
# 1. Get snapshot with element references
agent-browser snapshot -i --json
# Output: refs like @e1, @e2, @e3 mapped to interactive elements

# 2. AI identifies target refs from accessibility tree
# Example: @e2 = button "Submit", @e3 = textbox "Email"

# 3. Execute deterministic actions
agent-browser click @e2
agent-browser fill @e3 "test@example.com"

# 4. Re-snapshot after page changes
agent-browser snapshot -i --json
```

**Why deterministic?**
- Ref points to exact element from snapshot
- No re-query of DOM needed
- Fast execution
- LLM-friendly workflow

## Session Isolation

Each session has:
- Own browser instance
- Own cookies/storage
- Own navigation history
- Own auth state

**Use cases:**
- Multi-agent parallel development
- Testing different user roles simultaneously
- Isolated authenticated sessions

## Snapshot Filtering

Reduce token usage for LLMs:

- `-i, --interactive`: Only buttons, links, inputs (best for AI)
- `-c, --compact`: Remove empty structural elements
- `-d <n>, --depth`: Limit tree depth
- `-s <selector>`: Scope to CSS selector

**Recommended for AI**: `agent-browser snapshot -i -c -d 5 --json`

## Authentication Patterns

### Header-Based (Recommended)
```bash
# Headers scoped to origin only
agent-browser open api.example.com --headers '{"Authorization": "Bearer TOKEN"}'
```

**Advantages:**
- Skip login UI flows
- Switch users instantly
- Secure (origin-scoped)
- Fast testing

### State Save/Load
```bash
# Save after manual login
agent-browser state save auth.json

# Load in new session
agent-browser state load auth.json
```

## CDP (Chrome DevTools Protocol)

Connect to existing browsers:

```bash
# Local Chrome with remote debugging
google-chrome --remote-debugging-port=9222
agent-browser connect 9222

# Remote browser via WebSocket
agent-browser --cdp "wss://browser.service/cdp?token=..."
```

**Control:**
- Electron apps
- Chrome/Chromium instances
- WebView2 applications
- Any CDP-compatible browser

## Streaming Mode

Enable live viewport streaming:

```bash
AGENT_BROWSER_STREAM_PORT=9223 agent-browser open example.com
```

WebSocket server on port 9223:
- Receives frames (base64 JPEG/PNG)
- Accepts input events (mouse, keyboard, touch)
- Enables "pair browsing" (human + AI)

## Cloud Providers

### Browserbase
```bash
export BROWSERBASE_API_KEY="key"
export BROWSERBASE_PROJECT_ID="id"
# Auto-connects to remote browser
agent-browser open example.com
```

### Browser Use
```bash
export AGENT_BROWSER_PROVIDER=browseruse
export BROWSER_USE_API_KEY="key"
agent-browser open example.com
```

**Use when:**
- Serverless environments
- CI/CD without local browser
- Remote agent execution
```