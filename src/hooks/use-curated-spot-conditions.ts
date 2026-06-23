/**
 * Fetch current conditions + ratings for all curated spots (single API call).
 */

import { useQuery } from '@tanstack/react-query';

import { swellApi, type SpotWithConditions } from '@/services/api';

export const SPOT_CONDITIONS_QUERY_KEY = 'spot-conditions';

export function useCuratedSpotConditions() {
  return useQuery<SpotWithConditions[]>({
    queryKey: [SPOT_CONDITIONS_QUERY_KEY],
    queryFn: () => swellApi.getSpotConditions(),
    staleTime: 5 * 60 * 1000,
  });
}
