export interface DownloadRequest {
  url: string;
  format?: 'mp4' | 'mp3';
}

export interface DownloadState {
  isDownloading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}
