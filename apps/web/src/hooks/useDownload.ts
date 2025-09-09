import { useState, useCallback, useRef } from 'react';
import { DownloadRequest, DownloadState } from '../types';
import { apiService } from '../services/api';
import { downloadBlob, extractVideoTitle } from '../utils/download';

export const useDownload = () => {
  const [state, setState] = useState<DownloadState>({
    isDownloading: false,
    progress: 0,
    error: null,
    success: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const download = useCallback(async (request: DownloadRequest) => {
    // Reset state
    setState({
      isDownloading: true,
      progress: 0,
      error: null,
      success: false,
    });

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const blob = await apiService.downloadVideo(
        request,
        (progress) => {
          setState(prev => ({ ...prev, progress }));
        },
        abortControllerRef.current.signal
      );

      // Generate filename
      const title = extractVideoTitle(request.url);
      const extension = request.format || 'mp4';
      const filename = `${title}.${extension}`;

      // Trigger download
      downloadBlob(blob, filename);

      setState(prev => ({
        ...prev,
        isDownloading: false,
        progress: 100,
        success: true,
      }));
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Download was cancelled
        setState({
          isDownloading: false,
          progress: 0,
          error: null,
          success: false,
        });
      } else {
        setState(prev => ({
          ...prev,
          isDownloading: false,
          error: error instanceof Error ? error.message : 'Download failed',
        }));
      }
    } finally {
      abortControllerRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isDownloading: false,
      progress: 0,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    download,
    cancel,
    reset,
  };
};
