/**
 * Application errors carry an HTTP status and a machine-readable code alongside
 * a Turkish message that is safe to show the user directly.
 *
 * Anything thrown that is *not* an AppError is treated as a bug by the error
 * handler: it gets logged in full and the client sees a generic message, so we
 * never leak stack traces or SQL through the API.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, new.target);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Aradığınız kayıt bulunamadı.') {
    super(404, 'NOT_FOUND', message);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Gönderilen veriler geçersiz.', details?: unknown) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Bu işlem için giriş yapmanız gerekiyor.') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Bu servis şu anda kullanılamıyor.') {
    super(503, 'SERVICE_UNAVAILABLE', message);
  }
}
