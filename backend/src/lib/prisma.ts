import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { env } from './env.js';

/**
 * Prisma 7 requires an explicit driver adapter — `new PrismaClient()` with no
 * adapter throws. We use the node-postgres adapter.
 *
 * The client is a module-level singleton so `tsx watch` reloads don't open a
 * new connection pool on every file save.
 */
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma = new PrismaClient({
  adapter,
  log: env.isProduction ? ['warn', 'error'] : ['warn', 'error'],
});

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
