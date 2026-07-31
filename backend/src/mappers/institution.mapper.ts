import type {
  BranchDto,
  ExamType,
  InstitutionDetailDto,
  InstitutionSummaryDto,
  PerformanceRecordDto,
  PriceRecordDto,
  ProgramDto,
  RatingSummaryDto,
  ReviewDto,
} from '@shared/types';
import type {
  InstitutionDetailRow,
  InstitutionSummaryRow,
  RatingAggregate,
} from '../repositories/institution.repository.js';

/**
 * Prisma row → wire DTO. Kept separate from the service so the shape the
 * frontend sees is defined in one readable place.
 */

/** One decimal place is all the precision a 1–5 star average can honestly claim. */
function roundToOneDecimal(value: number | null): number | null {
  if (value === null) return null;
  return Math.round(value * 10) / 10;
}

/**
 * Absent ratings stay null rather than collapsing to 0 — "no reviews yet" and
 * "rated zero" must not look the same on screen.
 */
export function toRatingSummaryDto(aggregate: RatingAggregate | undefined): RatingSummaryDto {
  if (!aggregate || aggregate.count === 0) {
    return { average: null, count: 0, teaching: null, facility: null, guidance: null, value: null };
  }

  return {
    average: roundToOneDecimal(aggregate.average),
    count: aggregate.count,
    teaching: roundToOneDecimal(aggregate.teaching),
    facility: roundToOneDecimal(aggregate.facility),
    guidance: roundToOneDecimal(aggregate.guidance),
    value: roundToOneDecimal(aggregate.value),
  };
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

/**
 * Cheapest currently advertised price across all programs, in whole TRY.
 * Uses the discounted price when one exists, since that is what a family
 * would actually pay.
 */
function calculateMinPrice(
  programs: { priceRecords: { listPrice: number; discountedPrice: number | null }[] }[],
): number | null {
  const currentPrices = programs
    .map((program) => program.priceRecords[0])
    .filter((record) => record !== undefined)
    .map((record) => record.discountedPrice ?? record.listPrice);

  if (currentPrices.length === 0) return null;
  return Math.min(...currentPrices);
}

export function toInstitutionSummaryDto(
  row: InstitutionSummaryRow,
  rating: RatingAggregate | undefined,
): InstitutionSummaryDto {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    type: row.type,
    description: row.description,
    logoUrl: row.logoUrl,
    isVerified: row.isVerified,
    rating: toRatingSummaryDto(rating),
    cities: unique(row.branches.map((branch) => branch.city)).sort((a, b) =>
      a.localeCompare(b, 'tr'),
    ),
    examTypes: unique(row.programs.map((program) => program.examType)) as ExamType[],
    minPrice: calculateMinPrice(row.programs),
    branchCount: row._count.branches,
    programCount: row._count.programs,
  };
}

function toBranchDto(branch: InstitutionDetailRow['branches'][number]): BranchDto {
  return {
    id: branch.id,
    name: branch.name,
    city: branch.city,
    district: branch.district,
    address: branch.address,
    lat: branch.lat,
    lng: branch.lng,
    capacity: branch.capacity,
  };
}

function toPriceRecordDto(
  record: InstitutionDetailRow['programs'][number]['priceRecords'][number],
): PriceRecordDto {
  return {
    id: record.id,
    academicYear: record.academicYear,
    listPrice: record.listPrice,
    discountedPrice: record.discountedPrice,
    installmentCount: record.installmentCount,
    currency: record.currency,
    source: record.source,
    sourceNote: record.sourceNote,
    recordedAt: record.recordedAt.toISOString(),
  };
}

function toProgramDto(program: InstitutionDetailRow['programs'][number]): ProgramDto {
  return {
    id: program.id,
    name: program.name,
    examType: program.examType,
    targetGrade: program.targetGrade,
    weeklyHours: program.weeklyHours,
    classSize: program.classSize,
    durationMonths: program.durationMonths,
    includesMaterials: program.includesMaterials,
    includesEtut: program.includesEtut,
    priceRecords: program.priceRecords.map(toPriceRecordDto),
  };
}

function toPerformanceRecordDto(
  record: InstitutionDetailRow['performanceRecords'][number],
): PerformanceRecordDto {
  return {
    id: record.id,
    academicYear: record.academicYear,
    examType: record.examType,
    studentCount: record.studentCount,
    avgNetIncrease: record.avgNetIncrease,
    top1000Count: record.top1000Count,
    placementRate: record.placementRate,
    source: record.source,
    sourceNote: record.sourceNote,
    verifiedAt: record.verifiedAt ? record.verifiedAt.toISOString() : null,
  };
}

function toReviewDto(review: InstitutionDetailRow['reviews'][number]): ReviewDto {
  return {
    id: review.id,
    authorAlias: review.authorAlias,
    rating: review.rating,
    teachingScore: review.teachingScore,
    facilityScore: review.facilityScore,
    guidanceScore: review.guidanceScore,
    valueScore: review.valueScore,
    body: review.body,
    attendedYear: review.attendedYear,
    createdAt: review.createdAt.toISOString(),
  };
}

export function toInstitutionDetailDto(
  row: InstitutionDetailRow,
  rating: RatingAggregate | undefined,
): InstitutionDetailDto {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    type: row.type,
    description: row.description,
    logoUrl: row.logoUrl,
    isVerified: row.isVerified,
    rating: toRatingSummaryDto(rating),
    cities: unique(row.branches.map((branch) => branch.city)).sort((a, b) =>
      a.localeCompare(b, 'tr'),
    ),
    examTypes: unique(row.programs.map((program) => program.examType)) as ExamType[],
    minPrice: calculateMinPrice(row.programs),
    branchCount: row._count.branches,
    programCount: row._count.programs,

    foundedYear: row.foundedYear,
    website: row.website,
    phone: row.phone,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    branches: row.branches.map(toBranchDto),
    programs: row.programs.map(toProgramDto),
    performanceRecords: row.performanceRecords.map(toPerformanceRecordDto),
    reviews: row.reviews.map(toReviewDto),
  };
}
