---
tags: [testing, mcp, container, guides, all-agents]description: Dagger Container-use MCP - Run agents in isolated containers for testing
globs: tests/**/*.test.ts,e2e/**/*.spec.ts
alwaysApply: false
---

# Dagger Container-use MCP Server Guide

> **Environment**: Local (Mac Air - Protected)  
> **Purpose**: Isolated container sandboxes for real API testing  
> **Official CLI**: `container-use`  
> **Documentation**: Dagger Container-use official docs

## 🎯 Purpose

Dagger Container-use MCP provides **isolated container environments** for running tests with real MCP tools and APIs, protecting the local Mac from heavy operations.

## 🔧 Available CLI Commands

Container-use operates via **CLI commands**, not MCP tools:

| Command | Purpose |
|---------|---------|
| `container-use diff {id}` | See what the agent changed in container |
| `container-use checkout {id}` | Check out the environment locally to explore |
| `container-use merge {id}` | Accept work and keep agent's commit history |
| `container-use apply {id}` | Stage changes to create your own commit |
| `container-use list` | List all environments |
| `container-use log {id}` | View dev log |

## 🚀 Quick Start

### 1. Start a Demo Repository
```bash
mkdir hello
cd hello
git init
touch README.md
git add README.md
git commit -m "initial commit"
```

### 2. Prompt Your Agent
```
"Create a Flask hello-world app in Python."
```

### 3. Review Results
After a short run you'll see:
```
✅ App running at http://127.0.0.1:58455
🔍 View files:  container-use checkout {id}
📋 Dev log:     container-use log {id}
```

### 4. Review the Work
```bash
# See what the agent changed:
container-use diff {id}

# Check out the environment locally:
container-use checkout {id}
```

### 5. Accept or Discard
```bash
# Accept work and keep agent's commit history:
container-use merge {id}

# Or stage the changes to create your own commit:
container-use apply {id}
```

## 📋 Testing Workflow with Container-use

**Use Case**: Testing with real MCP tools (Canva, external APIs)

```bash
# 1. Agent implements feature with MCP integration
# 2. Agent writes E2E test file
# 3. Run test in isolated container:

# Terminal command (NOT MCP tool):
container-use checkout {environment-id}

# Agent verifies in container environment
# Real API calls executed safely in sandbox
```

## 🔗 Cross-References

- **Testing Strategy**: See [AGENTS.md](../../AGENTS.md) for when to use Container-use vs other tools
- **E2E Patterns**: See [docs/testing/e2e-patterns.md](../testing/e2e-patterns.md)
- **Protection Rule**: Never run heavy tests locally - always use Container-use sandbox

## 💡 Best Practices

- **Isolated Testing**: Each test runs in its own container
- **Real APIs**: Safe to use production API keys (container is ephemeral)
- **Zero Local Impact**: Mac Air stays protected
- **Review Before Merge**: Always `diff` before `merge` or `apply`

## ⚠️ Important Notes

- Container-use is a **CLI tool**, NOT an MCP server with tools
- Environments are identified by `{id}` (e.g., `fancy-mallard`)
- Local directory stays empty during container execution
- Use `container-use list` to see all active environments

---

**Last Updated**: January 28, 2026  
**Status**: Production Ready