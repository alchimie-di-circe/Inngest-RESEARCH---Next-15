# PR Auto-Fix Handler

A GitHub Actions workflow and supporting scripts for automatically handling PR fixes when `@kilo-autofix` is mentioned.

## Overview

This system responds to PR comments containing `@kilo-autofix`, analyzes review comments from various code review tools, and applies suggested fixes systematically.

## Supported Review Tools

- **Qodo** - AI-powered code review
- **Coderabbit** - Automated code review
- **Greptile** - AI code review
- **Sentry** - Error monitoring and suggestions
- **Gemini Code Assist** - Google's AI code assistant
- **Kilo** - Internal AI assistant

## Usage

### Triggering Auto-Fix

Comment on any PR with:

```
@kilo-autofix
```

This will trigger the workflow to:
1. Fetch and analyze all review comments
2. Generate a fix plan
3. Apply fixes to files
4. Run tests
5. Commit changes to the PR branch

### Commands

The workflow responds to these keywords in comments:

- `@kilo-autofix` - Full auto-fix process
- `@kilo-autofix analyze` - Analyze reviews without applying
- `@kilo-autofix dry-run` - Show what would be fixed without changes

## Scripts

### analyze-reviews.ts

Parses PR review comments and generates a fix plan.

```bash
npx tsx scripts/pr-autofix/analyze-reviews.ts \
  --pr-number 123 \
  --output review-analysis.json \
  --repo owner/repo
```

### apply-fixes.ts

Applies fixes from a generated plan.

```bash
npx tsx scripts/pr-autofix/apply-fixes.ts \
  --plan fix-plan.json \
  --repo owner/repo \
  --dry-run  # Optional: preview without changes
```

### npm scripts

```bash
# Analyze reviews for a PR
npm run pr-autofix:analyze

# Apply fixes from the plan
npm run pr-autofix:apply

# Run tests for PR
npm run pr-autofix:test

# Commit changes
npm run pr-autofix:commit
```

## Workflow File

Located at: [`.github/workflows/pr-autofix.yml`](.github/workflows/pr-autofix.yml)

### Triggers

- **PR Comments**: When a comment contains `@kilo-autofix`
- **Manual**: Can be triggered manually from GitHub Actions tab

### Permissions Required

- `contents: write` - Commit changes
- `pull-requests: write` - Post comments
- `checks: read` - Check test results
- `repository: read` - read_file repository content

## Fix Classification

Comments are classified by:

### Type
- **security** - Vulnerability or security concern
- **bug** - Bug fix or error correction
- **performance** - Performance optimization
- **style** - Formatting or style issues
- **best-practice** - Following best practices
- **quality** - Code quality improvements

### Priority
- **critical** - Must fix (security, blockers)
- **high** - Important issues
- **medium** - Normal issues
- **low** - Nice to have

## Execution Order

Fixes are applied in this order:

1. **Sequential (before)** - Critical and security fixes first
2. **Parallel** - Independent fixes applied together
3. **Sequential (after)** - Low priority fixes last

## File Support

The system handles these file types:

- **TypeScript/JavaScript** (`.ts`, `.tsx`, `.js`, `.jsx`)
- **CSS/SCSS/Sass** (`.css`, `.scss`, `.sass`, `.less`)
- **JSON** (`.json`)
- **Generic** - Text-based files

## Output Files

The workflow generates:

| File | Description |
|------|-------------|
| `scripts/pr-autofix/review-analysis.json` | Full analysis of review comments |
| `scripts/pr-autofix/fix-plan.json` | Executable fix plan |
| `scripts/pr-autofix/SUMMARY.md` | Human-readable summary report |

## Example

Given a PR comment like:

```
@kilo-autofix

Please fix the security issue in auth.ts:
- Line 42: Use parameterized queries to prevent SQL injection
```

The system will:
1. Parse the comment as a security issue (high priority)
2. Generate a fix plan for `auth.ts`
3. Apply the fix
4. Run type-check and lint
5. Commit the changes

## Configuration

No additional configuration required. The workflow uses the default GitHub Actions environment.

## Limitations

- Cannot apply fixes that require human judgment
- Cannot access external APIs or services
- Cannot create new files (only modify existing ones)
- Cannot make architectural decisions

## Troubleshooting

### Workflow doesn't trigger

1. Ensure the comment contains exactly `@kilo-autofix`
2. Verify the PR is from a fork (workflows may have different permissions)
3. Check GitHub Actions permissions for the repository

### Fixes not applied

1. Review the workflow logs for errors
2. Check if suggestions are in code blocks
3. Verify the file path in the comment exists

### Tests fail after fixes

1. Review the failing test output
2. Manually verify the changes
3. Re-run the workflow with `@kilo-autofix` after making manual corrections

## Contributing

To add support for a new review tool:

1. Add the tool pattern to `REVIEW_TOOLS` in [`scripts/pr-autofix/github-utils.ts`](scripts/pr-autofix/github-utils.ts)
2. Test with a sample PR comment from the new tool
3. Update this documentation

## License

Same as the parent project.
