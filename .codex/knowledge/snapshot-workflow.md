# Snapshot-Refs Workflow for AI Agents

## The Optimal Pattern

This is the **fastest and most reliable** way for AI agents to use agent-browser.

### 1. Navigate to Target URL

```bash
agent-browser open https://example.com
```

### 2. Capture Snapshot with Interactive Filter

```bash
agent-browser snapshot -i --json
```

**Output structure:**
```json
{
  "success": true,
  "data": {
    "snapshot": "- heading \"Example Domain\" [ref=e1] [level=1]\n- button \"Submit\" [ref=e2]\n- textbox \"Email\" [ref=e3]\n- link \"Learn more\" [ref=e4]",
    "refs": {
      "e1": {"role": "heading", "name": "Example Domain", "level": 1},
      "e2": {"role": "button", "name": "Submit"},
      "e3": {"role": "textbox", "name": "Email"},
      "e4": {"role": "link", "name": "Learn more"}
    }
  }
}
```

### 3. AI Identifies Target Refs

Parse the snapshot tree and identify:
- Which elements to interact with
- Their ref identifiers (@e1, @e2, etc.)
- The sequence of actions

**Example task**: "Fill email and submit form"
- Target ref @e3 (textbox "Email")
- Target ref @e2 (button "Submit")

### 4. Execute Deterministic Actions

```bash
# Fill the email field
agent-browser fill @e3 "test@example.com"

# Click submit button
agent-browser click @e2
```

**Why this is fast:**
- No DOM re-query
- Direct element targeting
- Minimal latency

### 5. Re-Snapshot After Page Changes

```bash
# After navigation or dynamic content load
agent-browser snapshot -i --json
```

**When to re-snapshot:**
- After navigation (page URL changes)
- After form submission
- After clicking elements that trigger UI changes
- Before next set of interactions

## Advanced: Compact + Depth Limiting

For large pages, reduce token usage:

```bash
# Interactive + compact + max depth 5
agent-browser snapshot -i -c -d 5 --json
```

**Token savings:**
- `-i`: ~70% reduction (only interactive elements)
- `-c`: ~30% reduction (remove empty containers)
- `-d 5`: Limits tree depth to 5 levels

## Error Recovery

If a ref becomes invalid:

```bash
# Re-snapshot to get fresh refs
agent-browser snapshot -i --json

# Or use semantic locators as fallback
agent-browser find role button click --name "Submit"
```

## Multi-Step Flows

Example: Login → Dashboard → Settings

```bash
# Step 1: Login page
agent-browser open https://app.example.com/login
agent-browser snapshot -i --json
# AI identifies @e1=email, @e2=password, @e3=submit

agent-browser fill @e1 "user@test.com"
agent-browser fill @e2 "password123"
agent-browser click @e3

# Step 2: Wait for navigation
agent-browser wait --url "**/dashboard"
agent-browser snapshot -i --json
# AI identifies dashboard elements

# Step 3: Navigate to settings
agent-browser click @e5  # Settings link
agent-browser snapshot -i --json
# AI processes settings page
```

## Best Practices

1. **Always use `-i` flag**: Reduces noise for AI
2. **Use `--json` output**: Easier to parse programmatically
3. **Re-snapshot after state changes**: Keep refs fresh
4. **Combine filters**: `-i -c -d 5` for optimal token usage
5. **Use refs over selectors**: More reliable and faster
6. **Scope snapshots**: Use `-s <selector>` for specific sections

## Anti-Patterns

❌ **Don't**: Use CSS selectors when refs are available
❌ **Don't**: Snapshot entire page without filters (wastes tokens)
❌ **Don't**: Reuse refs across navigation boundaries
❌ **Don't**: Skip re-snapshot after dynamic changes

✅ **Do**: Snapshot → identify refs → execute → re-snapshot
✅ Do: Filter aggressively with -i -c
✅ Do: Use deterministic ref-based actions
✅ Do: Re-snapshot after every page state change