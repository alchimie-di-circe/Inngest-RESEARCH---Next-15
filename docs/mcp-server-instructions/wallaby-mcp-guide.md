---
tags: [testing, mcp, cloud, guides, all-agents]description: Wallaby.js MCP Server - Unit testing in real-time with VS Code integration
globs: **/*.test.ts,**/*.test.js
alwaysApply: false
---

# Wallaby.js MCP Server Guide

> **Environment**: Cloud (GitHub Codespace / VS Code)  
> **Extension Required**: Wallaby.js VS Code Extension  
> **Documentation**: https://wallabyjs.com/docs/features/mcp/

## 🎯 Purpose

Wallaby MCP provides **real-time test execution data** to AI assistants without re-running tests. It integrates with the Wallaby.js VS Code extension for instant feedback during TDD.

## ⚠️ CRITICAL: Manual Start Required

**L'agente NON può avviare Wallaby autonomamente.** L'utente deve:

1. Aprire Command Palette: `Cmd/Ctrl + Shift + P`
2. Digitare: **`Wallaby: Start`** (NOT "wallaby watch")
3. Attendere l'indicatore verde nella status bar
4. Ora l'agente può usare i tool MCP

Reference: https://wallabyjs.com/docs/intro/visual-studio/

## 🔧 Available MCP Tools

| Tool | Purpose |
|------|---------|
| `wallaby_failingTests` | Get all failing tests with errors and stack traces |
| `wallaby_allTests` | Get all tests (useful for test IDs) |
| `wallaby_failingTestsForFile` | Get failing tests for a specific file |
| `wallaby_allTestsForFile` | Get tests covering a specific file |
| `wallaby_runtimeValues` | Inspect variable values at a code location |
| `wallaby_runtimeValuesByTest` | Get runtime values for a specific test |
| `wallaby_coveredLinesForFile` | Get coverage data for a file |
| `wallaby_testById` | Get detailed test data by ID |
| `wallaby_updateTestSnapshots` | Update snapshots for a test |

## 🔄 Debugging Workflow

### Step 1: User Starts Wallaby
```bash
# In VS Code Command Palette (manual user action)
Wallaby: Start
```

### Step 2: Agent Gets Failing Tests
```
Use tool: wallaby_failingTests
→ Returns: test IDs, error messages, stack traces
```

### Step 3: Agent Inspects Runtime Values (Optional)
```
Use tool: wallaby_runtimeValues
Parameters: { file: "src/calc.ts", line: 15, lineContent: "return a + b" }
```

### Step 4: Agent Fixes Code

### Step 5: Verify Fix
```
Use tool: wallaby_testById
Parameters: { testId: "test-123" }
→ Returns: Updated test status
```

## 📋 Example: Debugging an Assertion Failure

**User**: "The calculator test is failing"

**Agent actions**:
1. Call `wallaby_failingTests` → Get test ID and error
2. Error shows: "expected 4, got 5" in multiply function
3. (Optional) Call `wallaby_runtimeValues` for variable inspection
4. Analyze: multiply used `+` instead of `*`
5. Fix: Change `+` to `*` in calculator.ts
6. Call `wallaby_failingTests` → Confirm no failures remain

## 🔗 Cross-References

- **Testing Strategy**: See [AGENTS.md](../../AGENTS.md) for when to use Wallaby vs other tools
- **TDD Workflow**: See [docs/testing/tdd-workflow.md](../testing/tdd-workflow.md)
- **Configuration**: Wallaby auto-detects Jest/Vitest from project config

## 💡 Best Practices

- **Use Wallaby tools first** - They provide real-time data without re-running tests
- **Get test IDs early** - Many tools require the test ID from initial queries
- **Inspect runtime values** - More reliable than guessing variable states
- **Verify after fixes** - Always confirm the test passes before finishing
- **Check for regressions** - Ensure fixes don't break other tests

---

**Last Updated**: January 28, 2026  
**Status**: Production Ready