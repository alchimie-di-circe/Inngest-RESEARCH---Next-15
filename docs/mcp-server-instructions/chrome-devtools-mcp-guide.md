---
tags: [testing, mcp, cloud, guides, all-agents]description: Chrome DevTools MCP - Browser debugging and performance analysis
globs: src/**/*.tsx,src/**/*.ts
alwaysApply: false
---

# Chrome DevTools MCP Server Guide

> **Environment**: Cloud (GitHub Codespace / VS Code)  
> **Purpose**: Browser debugging, performance analysis, DOM inspection  
> **Efficiency**: 95% less context usage than Playwright

## 🎯 Purpose

Chrome DevTools MCP provides **direct browser control** for debugging runtime issues, analyzing performance, and inspecting DOM/network - all with significantly less context usage than traditional E2E tools.

## 🔧 Key Capabilities

- **DOM Inspection**: Navigate pages, click elements, fill forms
- **Console Access**: Read console logs, errors, warnings
- **Network Analysis**: Monitor requests, responses, timing
- **Performance**: LCP, layout shift, CPU profiling, waterfall
- **Screenshots**: Capture visual state for debugging
- **Storage**: Inspect localStorage, cookies, session

## 🚀 Quick Start

### Launch MCP
The Chrome DevTools MCP connects to a real Chrome instance via DevTools Protocol.

### Example Prompts

**Debug Console Errors:**
```
Open http://localhost:3000, check console errors, and take a screenshot
```

**Analyze Performance:**
```
Navigate to the dashboard, record performance trace, and report LCP metrics
```

**Debug Layout Issues:**
```
Go to /settings page, inspect the form layout, identify CSS problems
```

## 🔄 Workflow

1. **Launch MCP**: Connect to Chrome instance
2. **Navigate**: Go to target URL
3. **Interact**: Click, fill forms, scroll as needed
4. **Inspect**: Check console, network, DOM
5. **Analyze**: Review performance metrics
6. **Report**: Screenshot + findings

## 📋 Use Cases

| Scenario | Tool Usage |
|----------|-----------|
| Debug runtime errors | Check console logs |
| Layout/CSS issues | Screenshot + DOM inspection |
| Performance tuning | LCP, CPU, network waterfall |
| Form validation | Fill forms, verify behavior |
| Visual regression | Screenshots before/after |

## 🔗 Cross-References

- **Testing Strategy**: See [AGENTS.md](../../AGENTS.md) for when to use Chrome DevTools vs other tools
- **Frontend Debugging**: See [docs/testing/frontend-debugging.md](../testing/frontend-debugging.md)
- **Performance Guide**: See [docs/testing/performance-testing.md](../testing/performance-testing.md)

## 💡 Best Practices

- **Pro Tip**: More efficient to tell LLM "use MCP" than writing long debugging prompts
- **Pro Tip 2**: For web dev, it can perform its own tests when prompted correctly
- **Visible Chrome**: Enable visible (non-headless) mode to see what agent does
- **Limited Scenarios**: In CI, run only 1-3 critical scenarios to avoid overhead
- **Screenshots**: Always capture visual state for layout issues

## ⚠️ Important Notes

- **Environment**: Works in Codespace/Cloud (not local Mac)
- **Browser Required**: Needs Chrome instance (visible or headless)
- **Context Efficient**: 95% less tokens than Playwright for same tasks
- **Real Browser**: Tests actual Chrome behavior, not simulation

---

**Last Updated**: January 28, 2026  
**Status**: Production Ready