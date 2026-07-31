import type { RequestHandler } from 'express';
import { z } from 'zod';
import * as institutionService from '../services/institution.service.js';

/**
 * Controllers translate between HTTP and the service layer and do nothing else:
 * validate input, call one service function, send the result. No Prisma, no
 * business rules.
 */

const slugParamSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'Geçersiz kurum adresi.'),
});

export const listInstitutions: RequestHandler = async (_req, res) => {
  const institutions = await institutionService.listInstitutions();
  res.json(institutions);
};

export const getInstitutionBySlug: RequestHandler = async (req, res) => {
  const { slug } = slugParamSchema.parse(req.params);
  const institution = await institutionService.getInstitutionBySlug(slug);
  res.json(institution);
};
