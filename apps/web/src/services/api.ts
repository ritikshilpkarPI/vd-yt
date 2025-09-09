import { DownloadRequest, ApiError } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export class ApiService {
  private static instance: ApiService;

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  async healthCheck(): Promise<{ ok: boolean; timestamp: string; version: string }> {
    const response = await fetch(`${API_BASE}/health`);
    
    if (!response.ok) {
      throw new Error('Health check failed');
    }
    
    return response.json();
  }

  async downloadVideo(
    request: DownloadRequest,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<Blob> {
    const response = await fetch(`${API_BASE}/v1/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal,
      // Increase timeout for large downloads
      // Note: This is handled by the browser's default timeout
    });

    if (!response.ok) {
      let errorData: ApiError;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          error: 'NetworkError',
          message: `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
          timestamp: new Date().toISOString(),
        };
      }
      throw new Error(errorData.message);
    }

    // Handle streaming download
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const contentLength = response.headers.get('Content-Length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    let loaded = 0;

    const chunks: Uint8Array[] = [];

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        
        if (onProgress && total > 0) {
          onProgress(Math.round((loaded / total) * 100));
        }
      }
    } finally {
      reader.releaseLock();
    }

    // Combine chunks into a single blob
    const blob = new Blob(chunks as BlobPart[], {
      type: request.format === 'mp3' ? 'audio/mpeg' : 'video/mp4'
    });

    return blob;
  }

}

export const apiService = ApiService.getInstance();
