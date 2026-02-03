---
tags: [testing, mcp, local, guides, all-agents]description: TestSprite MCP - E2E and integration testing with automated test generation
globs: tests/**/*.test.ts,e2e/**/*.spec.ts
alwaysApply: false
---

# TestSprite MCP Server Guide

> **Environment**: Local (Mac Air - Protected Sandbox)  
> **Purpose**: E2E testing, integration testing, automated test generation  
> **Framework**: Playwright-based (headless)

## 🎯 Purpose

TestSprite MCP provides **automated E2E and integration testing** with AI-driven test generation. Runs in isolated sandboxes to protect the local Mac.

## 🔧 Available MCP Tools

| Tool | Purpose |
|------|---------|
| `testsprite_bootstrap_tests` | Initialize testing environment and configuration |
| `testsprite_generate_tests` | Generate comprehensive test cases |
| `testsprite_run_tests` | Execute generated tests |
| `testsprite_analyze_results` | Analyze test results and provide insights |
| `testsprite_generate_report` | Generate comprehensive test report |
| `testsprite_cleanup` | Clean up testing environment |

## 🚀 Quick Start

### 1. Bootstrap Testing Environment

```json
{
  "tool": "testsprite_bootstrap_tests",
  "parameters": {
    "localPort": 5173,
    "type": "frontend",
    "projectPath": "/Users/username/projects/my-app",
    "testScope": "codebase"
  }
}
```

**Parameters:**
- `localPort` (number): Port where app is running (default: 5173)
- `type` (string): "frontend" or "backend"
- `projectPath` (string): Absolute path to project
- `testScope` (string): "codebase" (all) or "diff" (staged changes)

### 2. Generate Tests

```json
{
  "tool": "testsprite_generate_tests",
  "parameters": {
    "testScope": "codebase",
    "testType": "e2e"
  }
}
```

**Test Types:** "unit", "integration", "e2e"

### 3. Run Tests

```json
{
  "tool": "testsprite_run_tests",
  "parameters": {
    "testType": "integration",
    "testScope": "codebase"
  }
}
```

### 4. Analyze Results

```json
{
  "tool": "testsprite_analyze_results",
  "parameters": {
    "testType": "e2e"
  }
}
```

### 5. Generate Report

```json
{
  "tool": "testsprite_generate_report",
  "parameters": {
    "testType": "unit"
  }
}
```

## 🔄 Complete Workflow

```
testsprite_bootstrap_tests
        ↓
Read User PRD
        ↓
testsprite_generate_code_summary
        ↓
testsprite_generate_frontend_test_plan (or backend)
        ↓
testsprite_generate_code_and_execute
        ↓
Generate Test Code → Execute Tests → Results & Analysis
        ↓
IDE Fixes Issues → Rerun tests
```

## 📋 File Structure After Run

```
my-project/
├── testsprite_tests/
│   ├── tmp/
│   │   ├── prd_files/              # Temporary PRD files
│   │   ├── config.json             # Project configuration
│   │   ├── code_summary.json       # Code analysis
│   │   └── test_results.json       # Execution results
│   ├── standard_prd.json           # Product requirements
│   ├── TestSprite_MCP_Test_Report.md
│   ├── TestSprite_MCP_Test_Report.html
│   ├── TC001_Login_Success.py
│   ├── TC002_Login_Failure.py
│   └── ...                         # Additional test files
```

## 📋 Common Workflows

### Full Testing Workflow
```
"Help me test this project with TestSprite"
```

AI automatically:
1. Bootstraps environment
2. Analyzes codebase
3. Generates test plans
4. Executes all tests
5. Provides results and fix recommendations

### Targeted Testing
```
"Run tests TC001 and TC002 with focus on security"
```

```json
{
  "tool": "testsprite_generate_code_and_execute",
  "parameters": {
    "projectName": "my-project",
    "projectPath": "/path/to/project",
    "testIds": ["TC001", "TC002"],
    "additionalInstruction": "Focus on security vulnerabilities"
  }
}
```

## 🔗 Cross-References

- **Testing Strategy**: See [AGENTS.md](../../AGENTS.md) for when to use TestSprite vs other tools
- **E2E Patterns**: See [docs/testing/e2e-patterns.md](../testing/e2e-patterns.md)
- **Integration Testing**: See [docs/testing/integration-testing.md](../testing/integration-testing.md)

## 💡 Best Practices

- **Ensure App Running**: Bootstrap checks if app is running on specified port
- **Use Absolute Paths**: Always provide full absolute paths for projectPath
- **Authentication Setup**: Provide login credentials in TestSprite config portal
- **Incremental Testing**: Use testIds to run specific test cases
- **Additional Instructions**: Provide context for better test generation

## ⚠️ Important Notes

- **Sandboxed**: Runs in isolated environment (protects Mac)
- **Headless**: Uses Playwright under the hood
- **Real Browser**: Actual browser automation (not mocks)
- **Parallel Execution**: Can run tests in parallel if configured

---

**Last Updated**: January 28, 2026  
**Status**: Production Ready