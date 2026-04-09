import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
}

// In development, do not reuse globalThis.prisma: after `prisma generate`, the old
// cached client can miss new models (e.g. reviewDraft) until the process restarts.
export const prisma =
  process.env.NODE_ENV === 'production'
    ? (globalForPrisma.prisma ?? createPrismaClient())
    : createPrismaClient();

if (process.env.NODE_ENV === 'production') {
  globalForPrisma.prisma = prisma;
}

if (
  process.env.NODE_ENV !== 'production' &&
  (
    !(prisma as unknown as { reviewDraft?: unknown }).reviewDraft ||
    !(prisma as unknown as { passwordResetToken?: unknown }).passwordResetToken
  )
) {
  console.error(
    '[prisma] Client is missing ReviewDraft or PasswordResetToken. Run `npx prisma generate`, then restart `next dev`.'
  );
}

// This file exports a singleton Prisma client instance for use throughout the app.
// Import from here instead of creating new PrismaClient instances in API routes or elsewhere.