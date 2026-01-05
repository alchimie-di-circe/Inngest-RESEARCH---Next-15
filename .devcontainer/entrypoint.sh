#!/bin/bash
set -e

# Install node_modules if missing (idempotent)
if [ ! -d "/workspace/node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm ci --prefer-offline --no-audit
else
  echo "✓ Dependencies already installed"
fi

# Execute the main command
exec "$@"
