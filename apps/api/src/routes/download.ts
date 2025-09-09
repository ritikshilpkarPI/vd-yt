import { Router, Request, Response, NextFunction } from 'express';
import { validateDownloadRequest } from '../utils/validation';
import { youtubeService } from '../services/youtubeService';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

const router = Router();

/**
 * OPTIONS /v1/download
 * Handle preflight requests
 */
router.options('/v1/download', (req: Request, res: Response) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

/**
 * POST /v1/download
 * Download YouTube video
 */
router.post('/v1/download', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const { error, value: downloadRequest } = validateDownloadRequest(req.body);
    if (error) {
      throw new AppError(error, 400);
    }

    if (!downloadRequest) {
      throw new AppError('Invalid request data', 400);
    }

    const { url, format = 'mp4' } = downloadRequest;

    logger.info({ url, format }, 'Download request received');

    // Check if download is allowed
    const { allowed, reason } = await youtubeService.isDownloadAllowed(url);
    if (!allowed) {
      throw new AppError(reason || 'Download not allowed', 403);
    }

    // Start download process
    const { processId, process } = await youtubeService.downloadVideo(url, format);

    // Set response headers for file download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="download.${format}"`);
    res.setHeader('Transfer-Encoding', 'chunked');

    // Set longer timeout for downloads (10 minutes)
    req.setTimeout(6000000); // 10 minutes

    // Handle client disconnect - kill the download process
    req.on('close', () => {
      if (!res.headersSent) {
        logger.info({ processId }, 'Client disconnected, killing download process');
        youtubeService.killProcess(processId);
      }
    });

    req.on('aborted', () => {
      logger.info({ processId }, 'Request aborted, killing download process');
      youtubeService.killProcess(processId);
    });

    req.on('timeout', () => {
      logger.warn({ processId }, 'Request timeout, killing download process');
      youtubeService.killProcess(processId);
      if (!res.headersSent) {
        res.status(408).json({
          error: 'RequestTimeout',
          message: 'Download timeout - video may be too large',
          statusCode: 408,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Pipe the download stream to response
    // yt-dlp outputs video data to stdout, so we pipe that directly
    process.stdout?.pipe(res);
    
    // Also handle stderr for logging but don't pipe it to response
    process.stderr?.on('data', (data) => {
      const message = data.toString();
      // Only log non-progress messages to avoid spam
      if (!message.includes('[download]') && !message.includes('%')) {
        logger.debug({ processId, message: message.trim() }, 'yt-dlp output');
      }
    });

    // Handle process errors (this is now handled above)

    process.on('close', (code) => {
      if (code === 0) {
        logger.info({ processId, url, format }, 'Download completed successfully');
      } else {
        logger.error({ processId, code, url, format }, 'Download failed');
        if (!res.headersSent) {
          res.status(500).json({
            error: 'DownloadFailed',
            message: 'Failed to download video',
            statusCode: 500,
            timestamp: new Date().toISOString(),
          });
        }
      }
    });

    process.on('error', (error) => {
      logger.error({ error, processId }, 'Download process error');
      if (!res.headersSent) {
        res.status(500).json({
          error: 'DownloadError',
          message: 'Download process failed',
          statusCode: 500,
          timestamp: new Date().toISOString(),
        });
      }
    });

  } catch (error) {
    next(error);
  }
});

export default router;
