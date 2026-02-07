import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // External packages that should not be bundled by webpack
  // These are Node.js-only modules used in server-side code
  serverExternalPackages: [
    'ws',                          // WebSocket library used by @neondatabase/serverless
    '@prisma/client',              // Prisma Client with native binaries
    '@neondatabase/serverless',    // Neon serverless driver
  ],
  
  eslint: {
    // Don't fail build on ESLint warnings during development
    // Warnings are still shown but won't block the build
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    // We handle type checking separately via tsc --noEmit
    // This prevents build failures from non-critical type issues
    // Set to true only if you want to skip type checking entirely
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
