# Agent Browser CLI Commands Reference

## Navigation

```bash
agent-browser open <url>          # Navigate (aliases: goto, navigate)
agent-browser back                # Go back
agent-browser forward             # Go forward
agent-browser reload              # Reload page
```

## Snapshot & Inspection

```bash
agent-browser snapshot            # Full accessibility tree with refs
agent-browser snapshot -i         # Interactive elements only
agent-browser snapshot -c         # Compact (remove empty elements)
agent-browser snapshot -d 5       # Limit depth to 5
agent-browser snapshot -s "#main" # Scope to CSS selector
agent-browser snapshot --json     # JSON output for AI
```

## Element Actions

```bash
agent-browser click <selector>    # Click element
agent-browser dblclick <selector> # Double-click
agent-browser hover <selector>    # Hover
agent-browser focus <selector>    # Focus element
agent-browser fill <selector> <text>  # Clear and fill
agent-browser type <selector> <text>  # Type into element
agent-browser check <selector>    # Check checkbox
agent-browser uncheck <selector>  # Uncheck checkbox
agent-browser select <selector>   # Select dropdown option
```

## Ref-Based Actions (Recommended for AI)

```bash
agent-browser click @e2           # Click by ref from snapshot
agent-browser fill @e3 "text"     # Fill by ref
agent-browser hover @e1           # Hover by ref
agent-browser get text @e4        # Get text by ref
```

## Semantic Locators

```bash
agent-browser find role button click --name "Submit"
agent-browser find text "Sign In" click
agent-browser find label "Email" fill "test@test.com"
agent-browser find placeholder "Search" fill "query"
agent-browser find first ".item" click
agent-browser find nth 2 "a" text
```

## Get Information

```bash
agent-browser get text <selector>     # Get text content
agent-browser get html <selector>     # Get innerHTML
agent-browser get value <selector>    # Get input value
agent-browser get attr <selector> <attr>  # Get attribute
agent-browser get title               # Get page title
agent-browser get url                 # Get current URL
agent-browser get count <selector>    # Count matching elements
agent-browser get box <selector>      # Get bounding box
```

## State Checks

```bash
agent-browser is visible <selector>   # Check if visible
agent-browser is enabled <selector>   # Check if enabled
agent-browser is checked <selector>   # Check if checked
```

## Wait Commands

```bash
agent-browser wait <selector>         # Wait for element visible
agent-browser wait <ms>               # Wait for time
agent-browser wait --text "Welcome"   # Wait for text
agent-browser wait --url "**/dash"    # Wait for URL pattern
agent-browser wait --load networkidle # Wait for network idle
agent-browser wait --fn "window.ready === true"  # Wait for JS condition
```

## Input

```bash
agent-browser press <key>             # Press key (Enter, Tab, Control+a)
agent-browser keydown <key>           # Hold key down
agent-browser keyup <key>             # Release key
agent-browser upload <selector> <path>  # Upload files
```

## Scrolling

```bash
agent-browser scroll <direction> [px] # Scroll up/down/left/right
agent-browser scrollintoview <selector>  # Scroll element into view
```

## Mouse Control

```bash
agent-browser mouse move <x> <y>      # Move mouse
agent-browser mouse down [button]     # Press button (left/right/middle)
agent-browser mouse up [button]       # Release button
agent-browser mouse wheel <dy> [dx]   # Scroll wheel
```

## Screenshots & PDFs

```bash
agent-browser screenshot [path]       # Screenshot (stdout if no path)
agent-browser screenshot --full page.png  # Full page screenshot
agent-browser pdf <path>              # Save as PDF
```

## Sessions

```bash
agent-browser session list            # List active sessions
agent-browser session                 # Show current session
agent-browser --session <name> open <url>  # Use specific session
```

**Environment variable:**
```bash
export AGENT_BROWSER_SESSION=agent1
agent-browser open example.com
```

## Browser Settings

```bash
agent-browser set viewport <width> <height>  # Set viewport size
agent-browser set device "iPhone 14"         # Emulate device
agent-browser set geo <lat> <lon>            # Set geolocation
agent-browser set offline [on|off]           # Toggle offline mode
agent-browser set headers <json>             # Extra HTTP headers
agent-browser set credentials <user> <pass>  # HTTP basic auth
agent-browser set media [dark|light]         # Emulate color scheme
```

## Cookies & Storage

```bash
agent-browser cookies                 # Get all cookies
agent-browser cookies set <name> <value>  # Set cookie
agent-browser cookies clear           # Clear cookies

agent-browser storage local           # Get all localStorage
agent-browser storage local <key>     # Get specific key
agent-browser storage local set <key> <value>  # Set value
agent-browser storage local clear     # Clear all

agent-browser storage session         # Same for sessionStorage
```

## Network

```bash
agent-browser network route <url>     # Intercept requests
agent-browser network route <url> --abort  # Block requests
agent-browser network route <url> --body <json>  # Mock response
agent-browser network unroute [url]   # Remove routes
agent-browser network requests        # View tracked requests
agent-browser network requests --filter api  # Filter requests
```

## Tabs & Windows

```bash
agent-browser tab                     # List tabs
agent-browser tab new [url]           # New tab
agent-browser tab <n>                 # Switch to tab n
agent-browser tab close [n]           # Close tab
agent-browser window new              # New window
```

## Frames

```bash
agent-browser frame <selector>        # Switch to iframe
agent-browser frame main              # Back to main frame
```

## Dialogs

```bash
agent-browser dialog accept [text]    # Accept (with prompt text)
agent-browser dialog dismiss          # Dismiss
```

## Debug

```bash
agent-browser trace start [path]      # Start recording trace
agent-browser trace stop [path]       # Stop and save trace
agent-browser console                 # View console messages
agent-browser console --clear         # Clear console
agent-browser errors                  # View page errors
agent-browser errors --clear          # Clear errors
agent-browser highlight <selector>    # Highlight element
```

## State Management

```bash
agent-browser state save <path>       # Save auth state
agent-browser state load <path>       # Load auth state
```

## CDP Mode

```bash
agent-browser connect <port>          # Connect to CDP port
agent-browser --cdp 9222 snapshot     # Use CDP for command
agent-browser --cdp "wss://..." open <url>  # Remote WebSocket CDP
```

## JavaScript Evaluation

```bash
agent-browser eval <code>             # Run JavaScript
```

## Setup

```bash
agent-browser install                 # Download Chromium
agent-browser install --with-deps     # Install system deps (Linux)
```

## Global Options

```bash
--session <name>                      # Isolated session
--headers <json>                      # HTTP headers (origin-scoped)
--executable-path <path>              # Custom browser executable
--args <args>                         # Browser launch args
--user-agent <ua>                     # Custom User-Agent
--proxy <url>                         # Proxy server
--proxy-bypass <hosts>                # Bypass proxy for hosts
--json                                # JSON output
--headed                              # Show browser window
--cdp <port|url>                      # CDP connection
--debug                               # Debug output
```

## Environment Variables

```bash
AGENT_BROWSER_SESSION                 # Default session name
AGENT_BROWSER_EXECUTABLE_PATH         # Browser executable
AGENT_BROWSER_ARGS                    # Launch arguments
AGENT_BROWSER_USER_AGENT              # User-Agent string
AGENT_BROWSER_PROXY                   # Proxy URL
AGENT_BROWSER_PROXY_BYPASS            # Proxy bypass list
AGENT_BROWSER_STREAM_PORT             # Streaming WebSocket port
BROWSERBASE_API_KEY                   # Browserbase integration
BROWSERBASE_PROJECT_ID                # Browserbase project
AGENT_BROWSER_PROVIDER                # Cloud provider (browseruse)
BROWSER_USE_API_KEY                   # Browser Use API key