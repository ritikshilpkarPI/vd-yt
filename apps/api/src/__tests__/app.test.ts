import request from 'supertest';
import { createApp } from '../app';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';

// Mock child_process
const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

describe('YouTube Downloader API', () => {
  const app = createApp();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment
    process.env.ALLOW_ALL = 'false';
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        ok: true,
        version: expect.any(String),
        timestamp: expect.any(String),
      });
    });
  });

  describe('POST /v1/download', () => {
    it('should validate YouTube URL', async () => {
      const response = await request(app)
        .post('/v1/download')
        .send({ url: 'https://example.com' })
        .expect(400);

      expect(response.body).toMatchObject({
        error: expect.any(String),
        message: expect.stringContaining('YouTube URL'),
        statusCode: 400,
      });
    });

    it('should reject invalid format', async () => {
      const response = await request(app)
        .post('/v1/download')
        .send({ 
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          format: 'invalid'
        })
        .expect(400);

      expect(response.body).toMatchObject({
        error: expect.any(String),
        message: expect.stringContaining('mp4 or mp3'),
        statusCode: 400,
      });
    });

    it('should return 403 when ALLOW_ALL is false and video is not CC', async () => {
      // Mock yt-dlp to return video info without CC license
      const mockProcess = new EventEmitter() as any;
      mockProcess.stdout = new EventEmitter();
      mockProcess.stderr = new EventEmitter();
      
      mockSpawn.mockReturnValue(mockProcess);

      const request_promise = request(app)
        .post('/v1/download')
        .send({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' });

      // Simulate yt-dlp returning video info
      setTimeout(() => {
        const videoInfo = {
          id: 'dQw4w9WgXcQ',
          title: 'Test Video',
          description: 'Test description',
          license: 'Standard YouTube License',
          channel_id: 'UC123',
          channel: 'Test Channel'
        };
        mockProcess.stdout.emit('data', JSON.stringify(videoInfo));
        mockProcess.emit('close', 0);
      }, 100);

      const response = await request_promise.expect(403);

      expect(response.body).toMatchObject({
        statusCode: 403,
        message: expect.stringContaining('not allowed'),
      });
    });

    it('should allow download when ALLOW_ALL is true', async () => {
      process.env.ALLOW_ALL = 'true';
      
      // Mock yt-dlp download process
      const mockProcess = new EventEmitter() as any;
      mockProcess.stdout = new EventEmitter();
      mockProcess.stderr = new EventEmitter();
      mockProcess.killed = false;
      mockProcess.kill = jest.fn();
      
      mockSpawn.mockReturnValue(mockProcess);

      const request_promise = request(app)
        .post('/v1/download')
        .send({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' });

      // Simulate download completion
      setTimeout(() => {
        mockProcess.stdout.emit('data', Buffer.from('fake video data'));
        mockProcess.emit('close', 0);
      }, 100);

      await request_promise.expect(200);
    });

    it('should allow CC licensed videos', async () => {
      // Mock yt-dlp to return CC licensed video
      const mockInfoProcess = new EventEmitter() as any;
      mockInfoProcess.stdout = new EventEmitter();
      mockInfoProcess.stderr = new EventEmitter();
      
      const mockDownloadProcess = new EventEmitter() as any;
      mockDownloadProcess.stdout = new EventEmitter();
      mockDownloadProcess.stderr = new EventEmitter();
      mockDownloadProcess.killed = false;
      mockDownloadProcess.kill = jest.fn();
      
      mockSpawn
        .mockReturnValueOnce(mockInfoProcess) // First call for video info
        .mockReturnValueOnce(mockDownloadProcess); // Second call for download

      const request_promise = request(app)
        .post('/v1/download')
        .send({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' });

      // Simulate video info response
      setTimeout(() => {
        const videoInfo = {
          id: 'dQw4w9WgXcQ',
          title: 'CC Licensed Video',
          description: 'Test description',
          license: 'Creative Commons Attribution',
          channel_id: 'UC123',
          channel: 'Test Channel'
        };
        mockInfoProcess.stdout.emit('data', JSON.stringify(videoInfo));
        mockInfoProcess.emit('close', 0);
      }, 50);

      // Simulate download
      setTimeout(() => {
        mockDownloadProcess.stdout.emit('data', Buffer.from('fake video data'));
        mockDownloadProcess.emit('close', 0);
      }, 150);

      await request_promise.expect(200);
    });

    it('should handle download errors', async () => {
      process.env.ALLOW_ALL = 'true';
      
      const mockProcess = new EventEmitter() as any;
      mockProcess.stdout = new EventEmitter();
      mockProcess.stderr = new EventEmitter();
      mockProcess.killed = false;
      mockProcess.kill = jest.fn();
      
      mockSpawn.mockReturnValue(mockProcess);

      const request_promise = request(app)
        .post('/v1/download')
        .send({ url: 'https://www.youtube.com/watch?v=invalid' });

      // Simulate download error
      setTimeout(() => {
        mockProcess.emit('close', 1);
      }, 100);

      await request_promise.expect(500);
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting', async () => {
      // This test would need to be adjusted based on rate limit config
      // For now, just test that the middleware is applied
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['x-ratelimit-limit']).toBeDefined();
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown')
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'NotFound',
        statusCode: 404,
        message: expect.stringContaining('not found'),
      });
    });
  });
});
