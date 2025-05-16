import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// This file exports a singleton Prisma client instance for use throughout the app.
// Import from here instead of creating new PrismaClient instances in API routes or elsewhere.

export { prisma }; 