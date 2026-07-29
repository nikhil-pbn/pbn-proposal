import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma client singleton.
 *
 * Two things this has to get right:
 *
 *  1. In dev, Next.js hot-reloads modules on every edit. Constructing a client
 *     per reload exhausts the Postgres connection pool within a few minutes, so
 *     the instance is cached on globalThis.
 *  2. Construction is LAZY. `next build` imports server modules while
 *     prerendering, and DATABASE_URL is not necessarily present at build time —
 *     eager construction would fail the build. The client is created on first
 *     query instead, with a readable error if the URL is missing.
 */

const globalForPrisma = globalThis as unknown as {
  __pbnPrisma?: PrismaClient;
};

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and fill in your " +
        "Postgres connection string, then run `npm run db:migrate`.",
    );
  }

  return new PrismaClient({
    // Prisma 7 requires an explicit driver adapter.
    adapter: new PrismaPg({ connectionString }),
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });
}

function getClient(): PrismaClient {
  if (!globalForPrisma.__pbnPrisma) {
    globalForPrisma.__pbnPrisma = createClient();
  }
  return globalForPrisma.__pbnPrisma;
}

/**
 * Use exactly as a normal Prisma client — `await prisma.proposal.findMany()`.
 * The proxy only defers construction until the first property access.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, property) {
    return Reflect.get(getClient(), property);
  },
});
