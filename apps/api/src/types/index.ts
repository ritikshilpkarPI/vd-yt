export interface DownloadRequest {
  url: string;
  format?: 'mp4' | 'mp3';
}

export interface HealthResponse {
  ok: boolean;
  timestamp: string;
  version: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface DownloadResponse {
  success: boolean;
  message: string;
  filename?: string;
  size?: number;
}

export interface VideoInfo {
  id: string;
  title: string;
  description: string;
  license?: string;
  channelId: string;
  channelTitle: string;
  isCreativeCommons: boolean;
}

export interface AuthInfo {
  isOwner: boolean;
  channelId?: string;
}
