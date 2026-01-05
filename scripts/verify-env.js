#!/usr/bin/env node
const requiredEnvVars = [
  "NODE_ENV",
  "INNGEST_API_KEY",
  "INNGEST_EVENT_KEY",
  "NEXT_PUBLIC_API_URL",
  "ANTHROPIC_API_KEY",
  "OPENAI_API_KEY",
  "DATABASE_URL"
];

// Validate environment variable names to prevent object injection
const validVarPattern = /^[A-Z0-9_]+$/;
const missing = requiredEnvVars.filter((value) => {
  if (!validVarPattern.test(value)) {
    throw new Error(`Invalid environment variable name: ${value}`);
  }
  const envValue = process.env[value];
  // Treat empty string or sentinel values as missing
  return !envValue || envValue === "VAULT_READ_FAILED";
});

if (missing.length > 0) {
  console.error("❌ Missing or invalid environment variables:", missing);
  console.error("ℹ️  Please check your .envrc file or set these variables manually");
  process.exit(1);
}

console.log("✅ All required environment variables are set");
