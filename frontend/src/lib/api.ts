import type {
  ApiErrorResponse,
  InstitutionDetailDto,
  InstitutionSummaryDto,
} from '@shared/types';

/** Thrown by `request` for any non-2xx response. Carries the backend's error body. */
export class ApiError extends Error {
  readonly code: string;
  readonly details?: unknown;

  constructor(message: string, code: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`);

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorResponse | null;
    throw new ApiError(
      body?.error.message ?? 'Beklenmeyen bir hata oluştu.',
      body?.error.code ?? 'UNKNOWN',
      body?.error.details,
    );
  }

  return res.json() as Promise<T>;
}

export function getInstitutions(): Promise<InstitutionSummaryDto[]> {
  return request<InstitutionSummaryDto[]>('/institutions');
}

export function getInstitutionBySlug(slug: string): Promise<InstitutionDetailDto> {
  return request<InstitutionDetailDto>(`/institutions/${encodeURIComponent(slug)}`);
}
