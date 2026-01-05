#!/usr/bin/env node

// Whitelist of allowed environment variables (prevents object injection via dynamic keys)
const allowedEnvVars = new Set([
  "NODE_ENV",
  "INNGEST_API_KEY",
  "INNGEST_EVENT_KEY",
  "NEXT_PUBLIC_API_URL",
  "ANTHROPIC_API_KEY",
  "OPENAI_API_KEY",
  "DATABASE_URL"
]);

const requiredEnvVars = Array.from(allowedEnvVars);

const missing = requiredEnvVars.filter((value) => {
  // Only access whitelisted environment variables (prevents object injection)
  if (!allowedEnvVars.has(value)) {
    throw new Error(`Attempted access to non-whitelisted environment variable: ${value}`);
  }
  
  // eslint-disable-next-line security/detect-object-injection
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
