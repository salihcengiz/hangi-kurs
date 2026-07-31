import type { RequestHandler } from 'express';
import { UnauthorizedError } from '../lib/errors.js';

/**
 * Echoes the verified identity back to the client.
 *
 * The only endpoint behind `authenticate` in v1 — it exists so the auth wiring
 * is provably working end to end before any feature depends on it.
 */
export const getCurrentUser: RequestHandler = (req, res) => {
  if (!req.user) {
    // Unreachable behind `authenticate`; guards against the middleware being
    // dropped from the route by accident.
    throw new UnauthorizedError();
  }

  res.json(req.user);
};
