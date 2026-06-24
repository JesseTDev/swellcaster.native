import { API_CONFIG } from '@/services/api/config';
import type { ConditionVideo } from '@/services/api/types';

/** Resolve relative local video paths against the API base URL. */
export function resolveVideoEmbedUrl(video: ConditionVideo): string {
  if (video.embedUrl.startsWith('http://') || video.embedUrl.startsWith('https://')) {
    return video.embedUrl;
  }
  return `${API_CONFIG.BASE_URL}${video.embedUrl.startsWith('/') ? '' : '/'}${video.embedUrl}`;
}

export function isYouTubeVideo(video: ConditionVideo): boolean {
  return video.provider === 'youtube';
}
