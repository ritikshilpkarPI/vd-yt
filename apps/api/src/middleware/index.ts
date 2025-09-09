import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { config } from '../config';
import logger from '../utils/logger';

export const setupMiddleware = (app: Application): void => {
  // Security middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Disable for development
  }));

  // CORS configuration - Allow all origins for production
  app.use(cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));

  // Request parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging middleware
  if (config.isDevelopment) {
    app.use(morgan('dev'));
  }
  
  app.use(pinoHttp({ logger }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMaxRequests,
    message: {
      error: 'TooManyRequests',
      message: 'Too many requests from this IP, please try again later.',
      statusCode: 429,
      timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks in development
      return config.isDevelopment && req.path === '/health';
    },
  });

  app.use(limiter);

  // Request timeout (5 minutes for general, downloads handle their own timeout)
  app.use((req, res, next) => {
    // Skip timeout for download endpoints - they handle their own timeouts
    if (req.path.startsWith('/v1/download')) {
      next();
      return;
    }
    
    req.setTimeout(3000000, () => { // 5 minutes for other endpoints
      res.status(408).json({
        error: 'RequestTimeout',
        message: 'Request timeout',
        statusCode: 408,
        timestamp: new Date().toISOString(),
      });
    });
    next();
  });
};
