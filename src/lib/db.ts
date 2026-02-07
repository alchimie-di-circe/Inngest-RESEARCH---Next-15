
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // During build time, return a proxy that throws on actual usage
    // This allows the build to succeed while preventing runtime misuse
    console.warn('DATABASE_URL not set - database operations will fail at runtime');
    return new Proxy({} as PrismaClient, {
      get(_target, prop) {
        // Allow these properties to prevent Promise-related errors during build
        if (prop === 'then' || prop === '$connect' || prop === '$disconnect') {
          return undefined;
        }
        throw new Error('DATABASE_URL is required to use the database. Please set it in your environment variables.');
      },
    });
  }
  // PrismaNeon adapter takes connectionString directly
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
};

export const db = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db;
