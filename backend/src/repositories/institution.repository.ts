import { Prisma } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';

/**
 * The only module in the backend allowed to import Prisma. Everything above it
 * (services, controllers, routes) works with the shapes defined here or with
 * DTOs from @shared/types.
 */

/**
 * List view needs just enough of each relation to build a card: cities from
 * branches, exam types from programs, and the *current* price only — hence
 * `take: 1` on the price history, which Prisma applies per parent row.
 */
const summaryInclude = {
  branches: { select: { city: true } },
  programs: {
    select: {
      examType: true,
      priceRecords: {
        orderBy: { recordedAt: 'desc' },
        take: 1,
        select: { listPrice: true, discountedPrice: true },
      },
    },
  },
  _count: { select: { branches: true, programs: true } },
} satisfies Prisma.InstitutionInclude;

const detailInclude = {
  branches: { orderBy: { name: 'asc' } },
  programs: {
    orderBy: { name: 'asc' },
    include: {
      // Full history, newest first. Never truncated: the audit trail is the
      // point of keeping price records append-only.
      priceRecords: { orderBy: { recordedAt: 'desc' } },
    },
  },
  performanceRecords: { orderBy: [{ academicYear: 'desc' }, { examType: 'asc' }] },
  reviews: {
    // Only moderated reviews ever leave the database.
    where: { status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
  },
  _count: { select: { branches: true, programs: true } },
} satisfies Prisma.InstitutionInclude;

export type InstitutionSummaryRow = Prisma.InstitutionGetPayload<{
  include: typeof summaryInclude;
}>;

export type InstitutionDetailRow = Prisma.InstitutionGetPayload<{
  include: typeof detailInclude;
}>;

/** Aggregated review scores for one institution, keyed by institutionId. */
export interface RatingAggregate {
  institutionId: string;
  count: number;
  average: number | null;
  teaching: number | null;
  facility: number | null;
  guidance: number | null;
  value: number | null;
}

export async function findAllInstitutions(): Promise<InstitutionSummaryRow[]> {
  return prisma.institution.findMany({
    include: summaryInclude,
    orderBy: { name: 'asc' },
  });
}

export async function findInstitutionBySlug(
  slug: string,
): Promise<InstitutionDetailRow | null> {
  return prisma.institution.findUnique({
    where: { slug },
    include: detailInclude,
  });
}

/**
 * Review score averages over APPROVED reviews only.
 *
 * Computed at read time rather than denormalised onto Institution — with the
 * data volumes v1 deals with this is a single grouped query, and it removes a
 * whole class of "the cached average is stale" bugs. Revisit if it ever shows
 * up in a profile.
 *
 * Pass `institutionIds` to scope the aggregation, or omit it for all rows.
 */
export async function aggregateRatings(
  institutionIds?: string[],
): Promise<Map<string, RatingAggregate>> {
  if (institutionIds && institutionIds.length === 0) {
    return new Map();
  }

  const grouped = await prisma.review.groupBy({
    by: ['institutionId'],
    where: {
      status: 'APPROVED',
      ...(institutionIds ? { institutionId: { in: institutionIds } } : {}),
    },
    _count: { _all: true },
    _avg: {
      rating: true,
      teachingScore: true,
      facilityScore: true,
      guidanceScore: true,
      valueScore: true,
    },
  });

  return new Map(
    grouped.map((row) => [
      row.institutionId,
      {
        institutionId: row.institutionId,
        count: row._count._all,
        average: row._avg.rating,
        teaching: row._avg.teachingScore,
        facility: row._avg.facilityScore,
        guidance: row._avg.guidanceScore,
        value: row._avg.valueScore,
      },
    ]),
  );
}
