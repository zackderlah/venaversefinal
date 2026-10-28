import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    // Logging every query is noisy and slows production; keep it for local debugging.
    log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['query', 'error', 'warn'],
  });
}

function hasCurrentModels(client: PrismaClient | undefined): client is PrismaClient {
  const c = client as unknown as { reviewDraft?: unknown; passwordResetToken?: unknown } | undefined;
  return Boolean(c?.reviewDraft && c?.passwordResetToken);
}

// Reuse one client (and its connection pool) across hot reloads and route bundles.
// Opening a fresh connection to the database costs over a second, so creating a client
// per module made every route's first request slow. After `prisma generate`, a cached
// client can miss new models, so it is replaced when that happens.
export const prisma = hasCurrentModels(globalForPrisma.prisma)
  ? globalForPrisma.prisma
  : createPrismaClient();

globalForPrisma.prisma = prisma;

if (process.env.NODE_ENV !== 'production' && !hasCurrentModels(prisma)) {
  console.error(
    '[prisma] Client is missing ReviewDraft or PasswordResetToken. Run `npx prisma generate`, then restart `next dev`.'
  );
}

// This file exports a singleton Prisma client instance for use throughout the app.
// Import from here instead of creating new PrismaClient instances in API routes or elsewhere.