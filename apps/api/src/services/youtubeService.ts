import { spawn, ChildProcess } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import { VideoInfo, AuthInfo } from '../types';
import { extractVideoId } from '../utils/youtube';
import { config } from '../config';
import logger from '../utils/logger';

export class YouTubeService {
  private activeProcesses = new Map<string, ChildProcess>();

  /**
   * Get video information using yt-dlp
   */
  async getVideoInfo(url: string): Promise<VideoInfo> {
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    return new Promise((resolve, reject) => {
      const ytDlp = spawn('yt-dlp', [
        '--dump-json',
        '--no-download',
        url
      ]);

      let output = '';
      let errorOutput = '';

      ytDlp.stdout.on('data', (data) => {
        output += data.toString();
      });

      ytDlp.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      ytDlp.on('close', (code) => {
        if (code === 0) {
          try {
            const info = JSON.parse(output);
            resolve({
              id: info.id,
              title: info.title || 'Unknown',
              description: info.description || '',
              license: info.license,
              channelId: info.channel_id || info.uploader_id,
              channelTitle: info.channel || info.uploader || 'Unknown',
              isCreativeCommons: this.isCreativeCommons(info.license)
            });
          } catch (error) {
            logger.error({ error, output }, 'Failed to parse video info');
            reject(new Error('Failed to parse video information'));
          }
        } else {
          logger.error({ code, errorOutput }, 'yt-dlp failed to get video info');
          reject(new Error('Failed to get video information'));
        }
      });

      ytDlp.on('error', (error) => {
        logger.error({ error }, 'yt-dlp process error');
        reject(new Error('Failed to execute yt-dlp'));
      });
    });
  }

  /**
   * Check if user owns the channel (stub implementation)
   */
  async checkOwnership(channelId: string, accessToken?: string): Promise<AuthInfo> {
    // Stub implementation for OAuth check
    // In a real implementation, this would use YouTube Data API
    if (!accessToken || !config.youtubeApiKey) {
      return { isOwner: false };
    }

    // TODO: Implement actual YouTube API call to check ownership
    logger.info({ channelId }, 'Checking channel ownership (stub)');
    
    return { isOwner: false, channelId };
  }

  /**
   * Download video using yt-dlp
   */
  async downloadVideo(url: string, format: 'mp4' | 'mp3' = 'mp4'): Promise<{ processId: string; process: ChildProcess }> {
    const processId = uuidv4();
    
    const args = [
      '--no-playlist',
      '--no-check-certificate',
      '--ignore-errors',
      '--no-warnings',
      '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      '--referer', 'https://www.youtube.com/',
      '--add-header', 'Accept-Language:en-US,en;q=0.9',
    ];

    if (format === 'mp3') {
      args.push(
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '0'
      );
    } else {
      // Let yt-dlp choose the best available format automatically
      // This handles signature extraction issues better
      args.push(
        '--merge-output-format', 'mp4'
      );
    }

    args.push(
      '--output', `-`,  // Output to stdout instead of file
      '--sleep-interval', '1',
      '--max-sleep-interval', '3',
      '--fragment-retries', '5',
      '--retries', '3',
      '--concurrent-fragments', '4',
      '--buffer-size', '16K',
      url
    );

    const process = spawn('yt-dlp', args, {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    this.activeProcesses.set(processId, process);

    process.on('close', () => {
      this.activeProcesses.delete(processId);
    });

    process.on('error', (error) => {
      logger.error({ error, processId }, 'yt-dlp download process error');
      this.activeProcesses.delete(processId);
    });

    return { processId, process };
  }

  /**
   * Kill a download process
   */
  killProcess(processId: string): boolean {
    const process = this.activeProcesses.get(processId);
    if (process && !process.killed) {
      process.kill('SIGTERM');
      this.activeProcesses.delete(processId);
      logger.info({ processId }, 'Killed download process');
      return true;
    }
    return false;
  }

  /**
   * Check if license is Creative Commons
   */
  private isCreativeCommons(license?: string): boolean {
    if (!license) return false;
    const ccPatterns = [
      /creative\s*commons/i,
      /cc\s*by/i,
      /cc\s*0/i,
      /public\s*domain/i
    ];
    return ccPatterns.some(pattern => pattern.test(license));
  }

  /**
   * Check if download is allowed based on compliance rules
   */
  async isDownloadAllowed(url: string, accessToken?: string): Promise<{ allowed: boolean; reason?: string }> {
    // If ALLOW_ALL is enabled, skip compliance checks
    if (config.allowAll) {
      return { allowed: true };
    }

    try {
      const videoInfo = await this.getVideoInfo(url);
      
      // Check if video is Creative Commons
      if (videoInfo.isCreativeCommons) {
        return { allowed: true };
      }

      // Check if user owns the channel
      const authInfo = await this.checkOwnership(videoInfo.channelId, accessToken);
      if (authInfo.isOwner) {
        return { allowed: true };
      }

      return { 
        allowed: false, 
        reason: 'Download not allowed. Video must be Creative Commons licensed or you must own the channel.' 
      };
    } catch (error) {
      logger.error({ error, url }, 'Failed to check download permissions');
      return { 
        allowed: false, 
        reason: 'Unable to verify download permissions' 
      };
    }
  }
}

export const youtubeService = new YouTubeService();
