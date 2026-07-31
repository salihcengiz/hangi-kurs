import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';
import { getCurrentUser } from '../controllers/me.controller.js';
import { authenticate } from '../middleware/auth.js';
import { institutionRouter } from './institution.routes.js';

/** Every route in the API is mounted here, under /api. */
export const apiRouter = Router();

apiRouter.get('/health', getHealth);
apiRouter.get('/me', authenticate, getCurrentUser);
apiRouter.use('/institutions', institutionRouter);
