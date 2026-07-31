import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import type { ApiErrorResponse } from '@shared/types';
import { AppError } from '../lib/errors.js';
import { env } from '../lib/env.js';

/** Terminal 404 for unmatched routes. Registered after all other routes. */
export const notFoundHandler: RequestHandler = (req, res) => {
  const body: ApiErrorResponse = {
    error: {
      code: 'NOT_FOUND',
      message: `İstenen adres bulunamadı: ${req.method} ${req.originalUrl}`,
    },
  };
  res.status(404).json(body);
};

/**
 * Single exit point for every error in the API.
 *
 * Express 5 forwards rejected promises from async handlers here automatically,
 * so route handlers don't need try/catch just to report failures.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    const body: ApiErrorResponse = {
      error: { code: err.code, message: err.message, details: err.details },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  if (err instanceof ZodError) {
    const body: ApiErrorResponse = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Gönderilen veriler geçersiz.',
        details: err.issues,
      },
    };
    res.status(400).json(body);
    return;
  }

  // Anything reaching here is an unhandled bug: log it in full, tell the user
  // nothing specific.
  console.error('[error] Unhandled exception:', err);

  const body: ApiErrorResponse = {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
      details: env.isProduction ? undefined : String(err),
    },
  };
  res.status(500).json(body);
};
