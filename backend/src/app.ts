import express from 'express';
import cors from 'cors';
import { env } from './lib/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { optionalAuth } from './middleware/auth.js';

/**
 * Assembles the Express application. Kept separate from index.ts so tests can
 * import the app without binding a port.
 */
export function createApp() {
  const app = express();

  // Behind a reverse proxy in production, trust it for protocol and client IP.
  if (env.isProduction) {
    app.set('trust proxy', 1);
  }

  app.use(cors({ origin: env.corsOrigins, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  // Populates req.user when a token happens to be present. No route requires
  // it yet; `authenticate` is applied per-route where a user is mandatory.
  app.use(optionalAuth);

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
