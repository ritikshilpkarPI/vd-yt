import { Router } from 'express';
import healthRouter from './health';
import downloadRouter from './download';

const router = Router();

// Mount routes
router.use('/', healthRouter);
router.use('/', downloadRouter);

export default router;
