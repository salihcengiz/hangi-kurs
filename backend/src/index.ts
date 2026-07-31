import { createApp } from './app.js';
import { env } from './lib/env.js';
import { disconnectPrisma } from './lib/prisma.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`[api] HangiKurs API listening on http://localhost:${env.PORT}`);
  console.log(`[api] Environment: ${env.NODE_ENV}`);
  console.log(
    `[api] Auth: ${env.isFirebaseConfigured ? 'Firebase configured' : 'disabled (no Firebase credentials)'}`,
  );
});

/** Close the HTTP server and the database pool before exiting. */
async function shutdown(signal: string): Promise<void> {
  console.log(`\n[api] ${signal} received, shutting down...`);
  server.close(() => {
    console.log('[api] HTTP server closed.');
  });
  await disconnectPrisma();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
