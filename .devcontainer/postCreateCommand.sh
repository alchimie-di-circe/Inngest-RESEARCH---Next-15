#!/bin/bash
set -e

echo "🔧 DevContainer Setup - Inngest Research Suite"

# 1. Verify Git
echo "✓ Verifying Git repository..."
git --version && git status

# 2. Initialize 1Password
echo "✓ Setting up 1Password CLI..."
if ! op --version &> /dev/null; then
  echo "⚠ 1Password CLI not found, installing..."
  sudo apt-get update && sudo apt-get install -y 1password-cli
fi

# 3. Setup direnv
echo "✓ Initializing direnv..."
eval "$(direnv hook bash)"
direnv allow

# 4. Install Node dependencies
echo "✓ Installing Node dependencies..."
npm ci --prefer-offline --no-audit

# 5. Setup Inngest CLI
echo "✓ Setting up Inngest CLI..."
npm install -g inngest-cli || npm install inngest-cli

# 6. Setup database
echo "✓ Setting up Neon database connection..."
if [ -z "$DATABASE_URL" ]; then
  echo "⚠ DATABASE_URL not set, skipping database setup"
else
  npx prisma db push --skip-generate
fi

# 7. Setup pre-commit hooks
echo "✓ Setting up Git hooks..."
npx husky install 2>/dev/null || echo "⚠ Husky setup skipped"

# 8. Generate TypeScript types
echo "✓ Generating TypeScript types..."
npm run type-check || true

# 9. Start Docker Compose containers in background (optional)
echo "✓ Starting Docker Compose services..."
docker-compose -f .devcontainer/docker-compose.yml up -d 2>/dev/null || echo "⚠ Docker Compose not available"

echo "✅ DevContainer setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. npm run dev          - Start Next.js dev server"
echo "   2. npm run inngestdev   - Start Inngest dev server (in another terminal)"
echo "   3. npm run devall       - Run both in parallel (requires concurrently)"
echo ""
echo "🔍 Available AI Coding Tools:"
echo "   -  Claude Code (in VS Code or terminal)"
echo "   -  Continue.dev (slash commands in editor)"
echo "   -  Droid CLI (command-line agent)"
echo "   -  Kilocode (knowledge-base agent)"
echo "   -  Qodo (testing agent)"
echo ""
echo "📚 Documentation: See DEVCONTAINER_SETUP.md"
