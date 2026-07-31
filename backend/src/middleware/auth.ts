import type { RequestHandler } from 'express';
import type { CurrentUserDto } from '@shared/types';
import { isAuthAvailable, verifyIdToken } from '../lib/firebase-admin.js';
import { ServiceUnavailableError, UnauthorizedError } from '../lib/errors.js';

function extractBearerToken(header: string | undefined): string | null {
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

function toCurrentUser(decoded: {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
}): CurrentUserDto {
  return {
    uid: decoded.uid,
    email: decoded.email ?? null,
    displayName: decoded.name ?? null,
    photoUrl: decoded.picture ?? null,
  };
}

/**
 * Attaches `req.user` when a valid token is present, and does nothing otherwise.
 * Never rejects. Use this on public routes that render differently for signed-in
 * users.
 */
export const optionalAuth: RequestHandler = async (req, _res, next) => {
  const token = extractBearerToken(req.headers.authorization);
  if (!token || !isAuthAvailable()) {
    next();
    return;
  }

  const decoded = await verifyIdToken(token);
  if (decoded) {
    req.user = toCurrentUser(decoded);
  }
  next();
};

/**
 * Requires a valid Firebase ID token, or rejects with 401.
 *
 * No v1 route uses this yet — it exists so that adding a protected endpoint in
 * v2 (writing a review, favourites) is a one-line change at the route.
 */
export const authenticate: RequestHandler = async (req, _res, next) => {
  if (!isAuthAvailable()) {
    throw new ServiceUnavailableError(
      'Giriş sistemi bu ortamda yapılandırılmamış. Yöneticinize başvurun.',
    );
  }

  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    throw new UnauthorizedError();
  }

  const decoded = await verifyIdToken(token);
  if (!decoded) {
    throw new UnauthorizedError('Oturumunuz geçersiz veya süresi dolmuş. Lütfen tekrar giriş yapın.');
  }

  req.user = toCurrentUser(decoded);
  next();
};
