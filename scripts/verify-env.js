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

const missing = requiredEnvVars.filter((value) => !process.env[value]);

if (missing.length > 0) {
  console.error("❌ Missing environment variables:", missing);
  process.exit(1);
}

console.log("✅ All required environment variables are set");
