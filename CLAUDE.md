# Claude Code Instructions

## Agent Guidelines (MANDATORY)

**Follow all instructions in AGENTS.md for testing, development workflows, and pre-commit checks.**
@./AGENTS.md

---

## Code Quality Rules

### Pre-Commit Checks (MANDATORY)

Before ANY commit, you MUST run these checks on modified files:

```bash
# 1. Prettier format check and fix
npx prettier --write <modified-files>

# 2. Then stage the formatted files
git add <modified-files>
```

**Why:** This project uses Prettier for code formatting. Pre-commit hooks will reject unformatted code, wasting tokens on fix iterations.

**Quick command for all staged files:**

```bash
npx prettier --write $(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(js|jsx|ts|tsx|json|css|md)$' | xargs)
```

---

## Task Master AI Instructions

**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md
