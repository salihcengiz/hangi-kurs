import type { RequestHandler } from 'express';
import { prisma } from '../lib/prisma.js';
import { isAuthAvailable } from '../lib/firebase-admin.js';

/**
 * Liveness + dependency check. Also reports whether auth is configured, which
 * the frontend uses to decide between a working and a disabled sign-in button.
 */
export const getHealth: RequestHandler = async (_req, res) => {
  let databaseOk = true;
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    databaseOk = false;
    console.error('[health] Database check failed:', error);
  }

  res.status(databaseOk ? 200 : 503).json({
    status: databaseOk ? 'ok' : 'degraded',
    database: databaseOk ? 'up' : 'down',
    authConfigured: isAuthAvailable(),
    timestamp: new Date().toISOString(),
  });
};
