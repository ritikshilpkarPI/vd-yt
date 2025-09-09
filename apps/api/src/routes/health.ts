import { Router, Request, Response } from 'express';
import { HealthResponse } from '../types';
import packageJson from '../../package.json';

const router = Router();

/**
 * GET /health
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response) => {
  const healthResponse: HealthResponse = {
    ok: true,
    timestamp: new Date().toISOString(),
    version: packageJson.version,
  };

  res.json(healthResponse);
});

export default router;
