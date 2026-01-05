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
eval "$(direnv hook bash)"
direnv allow

# 4. Install Node dependencies (npm ci already run by entrypoint)
echo "✓ Node dependencies ready"

# 5. Verify Inngest CLI
echo "✓ Verifying Inngest CLI..."
inngest --version

# 6. Setup database
echo "✓ Setting up database..."
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️ DATABASE_URL not set, skipping database setup"
elif [ ! -f "prisma/schema.prisma" ]; then
  echo "⚠️ prisma/schema.prisma not found, skipping Prisma setup"
else
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
