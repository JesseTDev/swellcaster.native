import { useQuery } from '@tanstack/react-query';

import { videosApi } from '@/services/api/endpoints';
import type { CoordinatesParams } from '@/services/api/types';

export function useActiveConditionVideos() {
  return useQuery({
    queryKey: ['videos', 'active'],
    queryFn: () => videosApi.getActive(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });
}

export function useConditionVideoAt(coords: CoordinatesParams | null) {
  return useQuery({
    queryKey: ['videos', 'at', coords?.lat, coords?.lon],
    queryFn: () => videosApi.getAt(coords!),
    enabled: coords != null,
  });
}
