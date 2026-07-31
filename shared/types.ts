/**
 * Shared API contract between backend and frontend.
 *
 * This is the single source of truth for the shape of data crossing the wire.
 * Both workspaces import from `@shared/types` — when you change a DTO here,
 * both sides fail to compile until they agree again. That is the point.
 *
 * Dates are ISO 8601 strings, not Date objects: they have already been through
 * JSON.stringify by the time the frontend sees them.
 */

// ---------------------------------------------------------------------------
// Enums — kept as const objects + union types rather than TS `enum` so they are
// usable in the browser bundle without importing Prisma's generated client.
// The string values must stay identical to the Prisma enum members.
// ---------------------------------------------------------------------------

export const INSTITUTION_TYPES = ['DERSHANE', 'KURS_MERKEZI', 'ETUT', 'ONLINE'] as const;
export type InstitutionType = (typeof INSTITUTION_TYPES)[number];

export const EXAM_TYPES = ['YKS', 'LGS', 'KPSS', 'DIL', 'DIGER'] as const;
export type ExamType = (typeof EXAM_TYPES)[number];

/** Where a price figure came from. Never render a price without showing this. */
export const PRICE_SOURCES = ['OFFICIAL', 'USER_REPORTED', 'ESTIMATED'] as const;
export type PriceSource = (typeof PRICE_SOURCES)[number];

/** Where a performance figure came from. Never render one without showing this. */
export const PERFORMANCE_SOURCES = ['INSTITUTION_CLAIM', 'OSYM_PUBLIC', 'USER_REPORTED'] as const;
export type PerformanceSource = (typeof PERFORMANCE_SOURCES)[number];

export const REVIEW_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

// ---------------------------------------------------------------------------
// Turkish display labels — the UI is Turkish, the code is English.
// Every enum that reaches the screen needs a label map here.
// ---------------------------------------------------------------------------

export const INSTITUTION_TYPE_LABELS: Record<InstitutionType, string> = {
  DERSHANE: 'Dershane',
  KURS_MERKEZI: 'Kurs Merkezi',
  ETUT: 'Etüt Merkezi',
  ONLINE: 'Online',
};

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  YKS: 'YKS',
  LGS: 'LGS',
  KPSS: 'KPSS',
  DIL: 'Dil Sınavı',
  DIGER: 'Diğer',
};

export const PRICE_SOURCE_LABELS: Record<PriceSource, string> = {
  OFFICIAL: 'Kurum açıklaması',
  USER_REPORTED: 'Kullanıcı beyanı',
  ESTIMATED: 'Tahmini',
};

export const PERFORMANCE_SOURCE_LABELS: Record<PerformanceSource, string> = {
  INSTITUTION_CLAIM: 'Kurum beyanı',
  OSYM_PUBLIC: 'ÖSYM açık verisi',
  USER_REPORTED: 'Kullanıcı beyanı',
};

// ---------------------------------------------------------------------------
// Entity DTOs
// ---------------------------------------------------------------------------

export interface BranchDto {
  id: string;
  name: string;
  city: string;
  district: string;
  address: string;
  lat: number | null;
  lng: number | null;
  capacity: number | null;
}

export interface PriceRecordDto {
  id: string;
  academicYear: string;
  listPrice: number;
  discountedPrice: number | null;
  installmentCount: number;
  currency: string;
  /** Mandatory. The UI must render this next to every figure above. */
  source: PriceSource;
  sourceNote: string | null;
  recordedAt: string;
}

export interface ProgramDto {
  id: string;
  name: string;
  examType: ExamType;
  targetGrade: string | null;
  weeklyHours: number;
  classSize: number;
  durationMonths: number;
  includesMaterials: boolean;
  includesEtut: boolean;
  /** Price history, newest first. `[0]` is the current price. */
  priceRecords: PriceRecordDto[];
}

export interface PerformanceRecordDto {
  id: string;
  academicYear: string;
  examType: ExamType;
  studentCount: number | null;
  avgNetIncrease: number | null;
  top1000Count: number | null;
  placementRate: number | null;
  /** Mandatory. The UI must render this next to every figure above. */
  source: PerformanceSource;
  sourceNote: string | null;
  verifiedAt: string | null;
}

export interface ReviewDto {
  id: string;
  authorAlias: string;
  rating: number;
  teachingScore: number | null;
  facilityScore: number | null;
  guidanceScore: number | null;
  valueScore: number | null;
  body: string;
  attendedYear: number | null;
  createdAt: string;
}

/**
 * Aggregated review scores. Computed at read time over APPROVED reviews only.
 * `average` is null when there are no approved reviews — render "Henüz puan yok",
 * never 0, which would read as a bad score rather than absent data.
 */
export interface RatingSummaryDto {
  average: number | null;
  count: number;
  teaching: number | null;
  facility: number | null;
  guidance: number | null;
  value: number | null;
}

/** Trimmed shape for list/card views — no nested programs or reviews. */
export interface InstitutionSummaryDto {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  type: InstitutionType;
  description: string;
  logoUrl: string | null;
  isVerified: boolean;
  rating: RatingSummaryDto;
  /** Distinct cities across this institution's branches, for list badges. */
  cities: string[];
  /** Distinct exam types across this institution's programs. */
  examTypes: ExamType[];
  /** Cheapest current list price across programs, in TRY. Null when unpriced. */
  minPrice: number | null;
  branchCount: number;
  programCount: number;
}

/** Full shape for the detail page. */
export interface InstitutionDetailDto extends InstitutionSummaryDto {
  foundedYear: number | null;
  website: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  branches: BranchDto[];
  programs: ProgramDto[];
  performanceRecords: PerformanceRecordDto[];
  reviews: ReviewDto[];
}

// ---------------------------------------------------------------------------
// Envelopes
// ---------------------------------------------------------------------------

export interface PaginationDto {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationDto;
}

/** Uniform error body emitted by the backend error handler. */
export interface ApiErrorResponse {
  error: {
    /** Machine-readable, e.g. NOT_FOUND, VALIDATION_ERROR, INTERNAL_ERROR. */
    code: string;
    /** Turkish, safe to show the user. */
    message: string;
    details?: unknown;
  };
}

export interface CurrentUserDto {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;
}
