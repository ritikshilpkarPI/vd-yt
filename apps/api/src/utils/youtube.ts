import { URL } from 'url';

/**
 * Extract YouTube video ID from URL
 */
export const extractVideoId = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    
    // Handle youtube.com URLs
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return videoId;
    }
    
    // Handle youtu.be URLs
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.slice(1);
      if (videoId) return videoId;
    }
    
    return null;
  } catch {
    return null;
  }
};

/**
 * Check if URL is a valid YouTube URL
 */
export const isValidYouTubeUrl = (url: string): boolean => {
  const videoId = extractVideoId(url);
  return videoId !== null && videoId.length === 11;
};
