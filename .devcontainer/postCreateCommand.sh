#!/bin/bash
set -e

echo "🔧 DevContainer Setup - Inngest Research Suite"

# 1. Verify Git
echo "✓ Verifying Git repository..."
git --version && git status

# 2. Verify 1Password (optional, non-fatal if missing)
echo "✓ Checking 1Password CLI..."
if command -v op &> /dev/null; then
  op --version
else
  echo "⚠️ 1Password CLI not found. To enable 1Password integration:"
  echo "   - Enable the '1password' devcontainer feature in devcontainer.json"
  echo "   - Or install manually: https://developer.1password.com/docs/cli/get-started/"
fi

# 3. Setup direnv
echo "✓ Initializing direnv..."

# Ensure .envrc exists before attempting to load
if [ ! -f ".envrc" ]; then
  echo "❌ ERROR: .envrc file not found"
  echo "   To fix this issue:"
  echo "   1. cp envrc.example .envrc"
  echo "   2. Update the vault paths in .envrc (replace YOUR_VAULT)"
  echo "   3. Or set environment variables manually"
  exit 1
fi

eval "$(direnv hook bash)"
direnv allow

# 4. Install Node dependencies (npm ci already run by entrypoint)
echo "✓ Node dependencies ready"

# 5. Verify Inngest CLI
echo "✓ Verifying Inngest CLI..."
inngest --version

# 6. Setup database
echo "✓ Setting up database..."

# Pre-check: DATABASE_URL must be set and valid
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️ DATABASE_URL not set, skipping database setup"
  echo "   Set DATABASE_URL to enable automatic schema sync"
elif ! [[ "$DATABASE_URL" =~ ^(postgresql|postgres):// ]]; then
  echo "❌ ERROR: DATABASE_URL format invalid"
  echo "   Expected format: postgresql://user:password@host:port/database"
  echo "   Current: $DATABASE_URL"
  exit 1
fi

# Pre-check: prisma/schema.prisma must exist
if [ ! -f "prisma/schema.prisma" ]; then
  echo "❌ ERROR: prisma/schema.prisma not found"
  echo "   Prisma schema file is required for database operations"
  echo "   Expected location: ./prisma/schema.prisma"
  exit 1
fi

# Pre-check: Prisma must be installed
if ! command -v npx &> /dev/null || ! npm list prisma &> /dev/null; then
  echo "❌ ERROR: Prisma CLI not installed"
  echo "   Run 'npm install' to install dependencies including prisma"
  exit 1
fi

# All checks passed - run Prisma db push
if [ -n "$DATABASE_URL" ]; then
  echo "   Running Prisma schema sync..."
  npx prisma db push --skip-generate
fi

# 7. Setup pre-commit hooks
echo "✓ Setting up Git hooks..."
if command -v husky &> /dev/null; then
  npx husky install
else
  echo "⚠️ Husky not installed, Git hooks setup skipped"
fi

# 8. Generate TypeScript types
echo "✓ Generating TypeScript types..."
npm run type-check || true

echo "✅ DevContainer setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. npm run dev          - Start Next.js dev server"
echo "   2. npm run inngestdev   - Start Inngest dev server (in another terminal)"
echo "   3. npm run devall       - Run both in parallel"

echo ""
echo "🔍 Available AI Coding Tools:"
echo "   -  Claude Code (in VS Code or terminal)"
echo "   -  Continue.dev (slash commands in editor)"
echo "   -  Droid CLI (command-line agent)"
echo "   -  Kilocode (knowledge-base agent)"
echo "   -  Qodo (testing agent)"
echo ""
echo "📚 Documentation: See DEVCONTAINER_SETUP.md"
