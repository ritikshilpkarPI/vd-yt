import express from 'express';
import { setupMiddleware } from './middleware';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import logger from './utils/logger';

export const createApp = (): express.Application => {
  const app = express();

  // Setup middleware
  setupMiddleware(app);

  // Mount routes
  app.use('/', routes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};

// Export the YouTube service for external use
export { youtubeService } from './services/youtubeService';
export { config } from './config';
export { logger };
export * from './types';
