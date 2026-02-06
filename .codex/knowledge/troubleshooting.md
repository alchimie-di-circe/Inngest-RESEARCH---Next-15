# Agent Browser Troubleshooting Guide

## Installation Issues

### Chromium Download Fails

**Problem**: `agent-browser install` fails to download Chromium

**Solutions:**
```bash
# Try manual installation
npx playwright install chromium

# Or use system Chrome
agent-browser --executable-path /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome open example.com
```

### Linux Missing Dependencies

**Problem**: Browser crashes on Linux with missing library errors

**Solution:**
```bash
# Install system dependencies
agent-browser install --with-deps

# Or manually
npx playwright install-deps chromium
```

### Permission Issues (macOS/Linux)

**Problem**: `EACCES` permission denied errors

**Solution:**
```bash
# Fix npm global permissions
sudo chown -R $USER ~/.npm
sudo chown -R $USER /usr/local/lib/node_modules

# Reinstall
npm install -g agent-browser
```

---

## Runtime Issues

### Daemon Not Starting

**Problem**: Commands hang or timeout

**Diagnosis:**
```bash
agent-browser session list
# If empty or errors, daemon issue
```

**Solutions:**
```bash
# Kill existing daemon
pkill -f "agent-browser"

# Clear session files
rm -rf ~/.agent-browser/*

# Restart
agent-browser open example.com
```

### Socket File Errors

**Problem**: `Error: EADDRINUSE` or socket connection issues

**Solution:**
```bash
# Clear socket files
rm -rf ~/.agent-browser/*.sock

# Restart daemon
agent-browser close
agent-browser open example.com
```

### Headless Mode Fails

**Problem**: Browser crashes in headless mode

**Solution:**
```bash
# Try headed mode
agent-browser open example.com --headed

# Or disable GPU acceleration
export AGENT_BROWSER_ARGS="--disable-gpu,--disable-dev-shm-usage"
agent-browser open example.com
```

---

## Command Issues

### Refs Not Found

**Problem**: `@e2` ref not found error

**Cause**: Stale refs after page navigation

**Solution:**
```bash
# Always re-snapshot after page changes
agent-browser snapshot -i --json
# Use fresh refs from new snapshot
```

### Element Not Interactable

**Problem**: `Element is not visible` or `Element is not enabled`

**Solutions:**
```bash
# Wait for element
agent-browser wait <selector>

# Scroll into view first
agent-browser scrollintoview <selector>
agent-browser click <selector>

# Check state
agent-browser is visible <selector>
agent-browser is enabled <selector>
```

### Snapshot Too Large

**Problem**: Snapshot output exceeds token limits

**Solutions:**
```bash
# Use aggressive filtering
agent-browser snapshot -i -c -d 3 --json

# Scope to specific section
agent-browser snapshot -i -s "#main-content" --json

# Interactive only (removes ~70% of elements)
agent-browser snapshot -i --json
```

---

## Session Issues

### Multiple Sessions Interfere

**Problem**: Sessions affecting each other

**Cause**: Missing `--session` flag

**Solution:**
```bash
# Always use session names for isolation
agent-browser --session agent1 open site-a.com
agent-browser --session agent2 open site-b.com

# Or use environment variable
export AGENT_BROWSER_SESSION=agent1
agent-browser open example.com
```

### Session Not Cleaning Up

**Problem**: Old sessions persist

**Solution:**
```bash
# List sessions
agent-browser session list

# Close specific session
agent-browser --session old-session close

# Or kill all
pkill -f "agent-browser"
rm -rf ~/.agent-browser/*
```

---

## Authentication Issues

### Headers Not Applied

**Problem**: Auth headers not sent with requests

**Cause**: Headers only apply to matching origin

**Solution:**
```bash
# Headers scoped to origin of opened URL
agent-browser open https://api.example.com --headers '{"Authorization": "Bearer TOKEN"}'

# For global headers (all domains)
agent-browser set headers '{"X-Custom": "value"}'
```

### State Load Fails

**Problem**: `state load` doesn't restore auth

**Solution:**
```bash
# Save state after successful login
agent-browser state save auth.json

# Load in new session
agent-browser --session new state load auth.json
agent-browser --session new open https://app.example.com
```

---

## CDP Issues

### Cannot Connect to CDP

**Problem**: `agent-browser connect 9222` fails

**Diagnosis:**
```bash
# Check if port is open
curl http://localhost:9222/json/version
```

**Solutions:**
```bash
# Start Chrome with remote debugging
google-chrome --remote-debugging-port=9222

# Or for Electron
electron . --remote-debugging-port=9222

# Then connect
agent-browser connect 9222
```

### Remote CDP Connection Fails

**Problem**: WebSocket CDP URL not working

**Solution:**
```bash
# Ensure WebSocket URL is correct
agent-browser --cdp "ws://localhost:9222/devtools/browser/<id>" open example.com

# For cloud browsers, verify token/auth
agent-browser --cdp "wss://browser-service.com/cdp?token=YOUR_TOKEN" open example.com
```

---

## Streaming Issues

### Streaming Port Already in Use

**Problem**: `EADDRINUSE` on streaming port

**Solution:**
```bash
# Kill process using port
lsof -ti:9223 | xargs kill -9

# Or use different port
AGENT_BROWSER_STREAM_PORT=9224 agent-browser open example.com
```

### No Frames Received

**Problem**: WebSocket connected but no frames

**Diagnosis:**
```bash
# Check WebSocket connection
wscat -c ws://localhost:9223
```

**Solution:**
```bash
# Ensure browser is active and page loaded
agent-browser open example.com
# Then connect to stream
```

---

## Performance Issues

### Slow Command Execution

**Problem**: Commands take >5 seconds

**Solutions:**
```bash
# Use native binary (check installation)
which agent-browser
# Should point to native binary, not node

# Reduce snapshot size
agent-browser snapshot -i -c -d 3

# Use refs instead of selectors
agent-browser click @e2  # Fast
# vs
agent-browser click "#complex > div:nth-child(3) > button"  # Slow
```

### High Memory Usage

**Problem**: Browser consuming excessive RAM

**Solutions:**
```bash
# Close unused sessions
agent-browser session list
agent-browser --session unused close

# Limit tabs
agent-browser tab close 2
agent-browser tab close 3

# Restart daemon
agent-browser close
agent-browser open example.com
```

---

## Cloud Provider Issues

### Browserbase Connection Fails

**Problem**: Cannot connect to Browserbase

**Diagnosis:**
```bash
# Check environment variables
echo $BROWSERBASE_API_KEY
echo $BROWSERBASE_PROJECT_ID
```

**Solution:**
```bash
# Set correct credentials
export BROWSERBASE_API_KEY="your-api-key"
export BROWSERBASE_PROJECT_ID="your-project-id"

# Verify connection
agent-browser open https://example.com
```

### Browser Use Fails

**Problem**: Browser Use cloud provider errors

**Solution:**
```bash
# Ensure provider flag and API key
export AGENT_BROWSER_PROVIDER=browseruse
export BROWSER_USE_API_KEY="your-key"

# Or use flag
agent-browser -p browseruse open example.com
```

---

## Debug Mode

For any issue, enable debug output:

```bash
agent-browser --debug open example.com
agent-browser --debug snapshot
```

This shows:
- Daemon communication
- Playwright actions
- CDP messages
- Error stack traces

---

## Getting Help

1. Check official docs: https://agent-browser.dev
2. GitHub issues: https://github.com/vercel-labs/agent-browser/issues
3. Enable `--debug` and capture logs
4. Try `--headed` mode to visually inspect
5. Test with minimal reproduction case
```

