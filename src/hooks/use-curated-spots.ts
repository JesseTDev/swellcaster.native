/**
 * Curated surf breaks (DB only — fast, used for map marker positions).
 */

import { useQuery } from '@tanstack/react-query';

import { swellApi } from '@/services/api';

export const CURATED_SPOTS_QUERY_KEY = 'curated-spots';

export function useCuratedSpots() {
  return useQuery({
    queryKey: [CURATED_SPOTS_QUERY_KEY],
    queryFn: () => swellApi.getCuratedSpots(),
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
