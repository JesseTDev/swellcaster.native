/**
 * Fetch current conditions + ratings for all curated spots (single API call).
 */

import { useQuery } from '@tanstack/react-query';

import { swellApi, type SpotWithConditions } from '@/services/api';

export const SPOT_CONDITIONS_QUERY_KEY = 'spot-conditions';

export const spotConditionsQueryOptions = {
  queryKey: [SPOT_CONDITIONS_QUERY_KEY] as const,
  queryFn: () => swellApi.getSpotConditions(),
  staleTime: 15 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
  retry: 1,
};

export function useCuratedSpotConditions() {
  return useQuery<SpotWithConditions[]>(spotConditionsQueryOptions);
}
