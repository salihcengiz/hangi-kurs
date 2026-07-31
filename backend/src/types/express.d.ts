import type { CurrentUserDto } from '@shared/types';

/**
 * Adds the authenticated user to Express's Request.
 *
 * Populated by the `authenticate` / `optionalAuth` middleware. Always optional:
 * v1 has no route that requires a user, so handlers must treat it as absent.
 */
declare global {
  namespace Express {
    interface Request {
      user?: CurrentUserDto;
    }
  }
}

export {};
