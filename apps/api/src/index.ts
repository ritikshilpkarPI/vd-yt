import { createApp } from './app';
import { config } from './config';
import logger from './utils/logger';

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info({
    port: config.port,
    nodeEnv: config.nodeEnv,
    allowAll: config.allowAll,
  }, 'Server started successfully');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

export default app;
