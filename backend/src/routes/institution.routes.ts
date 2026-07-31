import { Router } from 'express';
import * as institutionController from '../controllers/institution.controller.js';

export const institutionRouter = Router();

institutionRouter.get('/', institutionController.listInstitutions);
institutionRouter.get('/:slug', institutionController.getInstitutionBySlug);
