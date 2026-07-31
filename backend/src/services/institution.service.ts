import type { InstitutionDetailDto, InstitutionSummaryDto } from '@shared/types';
import { NotFoundError } from '../lib/errors.js';
import {
  aggregateRatings,
  findAllInstitutions,
  findInstitutionBySlug,
} from '../repositories/institution.repository.js';
import {
  toInstitutionDetailDto,
  toInstitutionSummaryDto,
} from '../mappers/institution.mapper.js';

/**
 * Business logic for institutions. Knows nothing about HTTP — it takes plain
 * arguments and returns DTOs or throws AppErrors.
 *
 * Filtering, sorting and pagination land here in Phase 2; for now the list is
 * returned whole and sorted by name.
 */

export async function listInstitutions(): Promise<InstitutionSummaryDto[]> {
  const rows = await findAllInstitutions();

  // One grouped query for every institution's ratings, rather than N queries
  // inside the map below.
  const ratings = await aggregateRatings(rows.map((row) => row.id));

  return rows.map((row) => toInstitutionSummaryDto(row, ratings.get(row.id)));
}

export async function getInstitutionBySlug(slug: string): Promise<InstitutionDetailDto> {
  const row = await findInstitutionBySlug(slug);

  if (!row) {
    throw new NotFoundError('Bu adrese ait bir kurum bulunamadı.');
  }

  // Re-uses the same aggregation as the list so a card and its detail page can
  // never disagree about the score.
  const ratings = await aggregateRatings([row.id]);

  return toInstitutionDetailDto(row, ratings.get(row.id));
}
