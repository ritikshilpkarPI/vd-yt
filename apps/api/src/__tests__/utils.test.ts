import { extractVideoId, isValidYouTubeUrl } from '../utils/youtube';
import { validateDownloadRequest } from '../utils/validation';

describe('YouTube Utils', () => {
  describe('extractVideoId', () => {
    it('should extract video ID from youtube.com URLs', () => {
      expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(extractVideoId('https://youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s')).toBe('dQw4w9WgXcQ');
    });

    it('should extract video ID from youtu.be URLs', () => {
      expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ?t=10s')).toBe('dQw4w9WgXcQ');
    });

    it('should return null for invalid URLs', () => {
      expect(extractVideoId('https://example.com')).toBeNull();
      expect(extractVideoId('invalid-url')).toBeNull();
      expect(extractVideoId('https://youtube.com/watch')).toBeNull();
    });
  });

  describe('isValidYouTubeUrl', () => {
    it('should validate YouTube URLs', () => {
      expect(isValidYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
      expect(isValidYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
      expect(isValidYouTubeUrl('https://example.com')).toBe(false);
      expect(isValidYouTubeUrl('invalid')).toBe(false);
    });
  });
});

describe('Validation Utils', () => {
  describe('validateDownloadRequest', () => {
    it('should validate valid requests', () => {
      const result = validateDownloadRequest({
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        format: 'mp4'
      });

      expect(result.error).toBeUndefined();
      expect(result.value).toEqual({
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        format: 'mp4'
      });
    });

    it('should default format to mp4', () => {
      const result = validateDownloadRequest({
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      });

      expect(result.error).toBeUndefined();
      expect(result.value?.format).toBe('mp4');
    });

    it('should reject invalid URLs', () => {
      const result = validateDownloadRequest({
        url: 'https://example.com'
      });

      expect(result.error).toBeDefined();
      expect(result.error).toContain('YouTube URL');
    });

    it('should reject invalid formats', () => {
      const result = validateDownloadRequest({
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        format: 'invalid'
      });

      expect(result.error).toBeDefined();
      expect(result.error).toContain('mp4 or mp3');
    });

    it('should require URL', () => {
      const result = validateDownloadRequest({});

      expect(result.error).toBeDefined();
      expect(result.error).toContain('required');
    });
  });
});
