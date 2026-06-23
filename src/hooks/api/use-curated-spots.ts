/**
 * Curated surf spots from SwellCaster.API (map markers)
 */

import { useQuery } from '@tanstack/react-query';

import { swellApi, type CuratedSpot } from '@/services/api';

export const CURATED_SPOTS_QUERY_KEY = 'curated-spots';

export function useCuratedSpots() {
  return useQuery<CuratedSpot[]>({
    queryKey: [CURATED_SPOTS_QUERY_KEY],
    queryFn: () => swellApi.getCuratedSpots(),
    staleTime: 24 * 60 * 60 * 1000,
  });
}
