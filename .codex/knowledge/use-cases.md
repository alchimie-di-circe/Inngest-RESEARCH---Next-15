# Six Primary Use Cases for Agent Browser

## 1. Vibe Coding & Rapid Prototyping

**Scenario**: AI generates new feature code, need immediate validation

**Workflow:**
```bash
# AI just generated login form component
# Quick validation without writing tests

agent-browser open http://localhost:3000/login --headed
agent-browser snapshot -i --json

# AI identifies form elements from snapshot
agent-browser fill @e1 "test@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3

# Verify success
agent-browser wait --text "Welcome"
agent-browser screenshot success.png
```

**Benefits:**
- No test setup required
- Instant feedback loop
- Visual confirmation with `--headed`
- Screenshot capture for documentation

---

## 2. Authenticated Testing (Skip Login Flows)

**Scenario**: Test protected API/UI without manual login

**Workflow:**
```bash
# Use header-based auth (origin-scoped)
agent-browser open https://api.example.com/admin \
  --headers '{"Authorization": "Bearer eyJhbGc..."}'

# Access protected resources immediately
agent-browser snapshot -i --json
agent-browser click @e2  # Admin action button

# Switch users instantly
agent-browser open https://api.example.com/admin \
  --headers '{"Authorization": "Bearer different_token"}'
```

**Benefits:**
- Skip repetitive login UI flows
- Test different user roles quickly
- Secure (headers scoped to origin)
- Fast user switching

**Use cases:**
- Admin panel testing
- Multi-role permission validation
- API endpoint exploration
- Protected route testing

---

## 3. Multi-Agent Development (Parallel Sessions)

**Scenario**: Multiple AI agents working on different features simultaneously

**Workflow:**
```bash
# Agent 1: Testing checkout flow
agent-browser --session checkout open http://localhost:3000/cart
agent-browser --session checkout snapshot -i --json
agent-browser --session checkout click @e5

# Agent 2: Testing user profile (isolated)
agent-browser --session profile open http://localhost:3000/profile
agent-browser --session profile snapshot -i --json
agent-browser --session profile fill @e2 "New Name"

# Agent 3: Testing search functionality (isolated)
agent-browser --session search open http://localhost:3000
agent-browser --session search fill @e1 "test query"
agent-browser --session search press Enter
```

**Benefits:**
- Complete isolation between agents
- Parallel testing workflows
- Independent cookies/storage per session
- No state interference

**Use cases:**
- Coordinated multi-agent vibe coding
- Parallel feature development
- A/B testing different implementations
- Concurrent user scenario testing

---

## 4. Browser Preview Streaming (Pair Browsing)

**Scenario**: Human developer wants to watch AI agent navigate browser

**Workflow:**
```bash
# Start with streaming enabled
AGENT_BROWSER_STREAM_PORT=9223 agent-browser open https://example.com

# AI executes automation
agent-browser snapshot -i --json
agent-browser click @e2
agent-browser fill @e3 "data"

# Human watches live stream on WebSocket ws://localhost:9223
# Can inject mouse/keyboard events to guide agent
```

**Benefits:**
- Live viewport monitoring
- Human can intervene/guide
- Visual debugging
- Training data collection

**Use cases:**
- Debugging complex agent workflows
- Human-in-the-loop validation
- Recording agent behavior
- Interactive co-pilot mode

---

## 5. CDP Control (Electron/Chrome Remote)

**Scenario**: Test Electron app or control existing Chrome instance

**Workflow:**

### Electron App Testing
```bash
# Electron app running with remote debugging
# Launch electron with: --remote-debugging-port=9222

agent-browser connect 9222
agent-browser snapshot -i --json
agent-browser click @e4  # Desktop app button
agent-browser screenshot electron-state.png
```

### Remote Chrome Instance
```bash
# Connect to Chrome with remote debugging
google-chrome --remote-debugging-port=9222

agent-browser --cdp 9222 open https://example.com
agent-browser --cdp 9222 snapshot -i --json
```

### Cloud Browser Service
```bash
# Connect via WebSocket to remote browser
agent-browser --cdp "wss://browser-service.com/cdp?session=abc" \
  open https://example.com
```

**Benefits:**
- Control native desktop apps (Electron)
- Test against real Chrome instances
- Remote browser orchestration
- WebView2 compatibility

**Use cases:**
- Electron app E2E testing
- Chrome extension development
- Remote browser automation
- WebView2 embedded browser testing

---

## 6. Quick E2E Checks (Non-Formal Testing)

**Scenario**: Validate critical path without full test suite

**Workflow:**
```bash
# Smoke test after deployment
agent-browser open https://production.example.com
agent-browser snapshot -i --json

# Critical path: Search → Results → Detail
agent-browser fill @e1 "test product"
agent-browser press Enter
agent-browser wait --text "Results"
agent-browser snapshot -i --json

agent-browser click @e3  # First result
agent-browser wait --load networkidle
agent-browser screenshot product-page.png

# Verify key elements exist
agent-browser get text @e7  # Product title
agent-browser get text @e8  # Price
```

**Benefits:**
- Fast smoke testing
- No test framework overhead
- Quick deployment validation
- Visual evidence with screenshots

**Use cases:**
- Post-deployment sanity checks
- Pre-release critical path validation
- Quick regression checks during vibe coding
- Manual test automation

**NOT for:**
- Production test suites (use Playwright)
- CI/CD automated testing (use proper framework)
- Complex assertion logic
- Long-running test scenarios

---

## Use Case Selection Matrix

| Use Case | Best For | NOT For |
|----------|----------|---------|
| **Vibe Coding** | Rapid feature validation | Production test suites |
| **Authenticated Testing** | Multi-role testing, API exploration | Long-term auth management |
| **Multi-Agent Sessions** | Parallel agent development | Single-agent workflows |
| **Browser Streaming** | Human-AI collaboration | Fully autonomous agents |
| **CDP Control** | Electron/desktop apps | Standard web apps |
| **Quick E2E Checks** | Smoke tests, critical paths | Comprehensive test coverage |

## Tool Comparison

### Use agent-browser when:
- Vibe coding with AI agents
- Need fast iteration cycles
- Testing authenticated flows
- Multi-agent coordination
- Electron/CDP scenarios
- Quick validation (not formal testing)

### Use Playwright when:
- Building production test suites
- CI/CD automation required
- Complex assertions needed
- Long-running scenarios
- Team-wide test framework
- Video/trace debugging needed

### Use Stagehand when:
- Natural language test descriptions
- Extending existing Playwright setup
- Need AI-powered element finding
- Building on Playwright's ecosystem

### Use MCP Testing Tools when:
- IDE-integrated testing
- Standardized protocol needed
- Cross-tool compatibility important
- Building agent ecosystems