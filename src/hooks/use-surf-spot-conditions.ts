/**
 * Fetch current conditions for multiple surf spots (for map markers)
 */

import { useQueries } from '@tanstack/react-query';

import { CURRENT_QUERY_KEY } from '@/hooks/api/use-current';
import { swellApi, type CuratedSpot, type CurrentConditions } from '@/services/api';

export interface SpotCondition {
  spot: CuratedSpot;
  conditions: CurrentConditions | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function useSurfSpotConditions(spots: CuratedSpot[]): SpotCondition[] {
  const queries = useQueries({
    queries: spots.map((spot) => ({
      queryKey: [CURRENT_QUERY_KEY, { lat: spot.lat, lon: spot.lon }],
      queryFn: () => swellApi.getCurrent({ lat: spot.lat, lon: spot.lon }),
      staleTime: 5 * 60 * 1000,
      enabled: spots.length > 0,
    })),
  });

  return spots.map((spot, index) => ({
    spot,
    conditions: queries[index].data,
    isLoading: queries[index].isLoading,
    error: queries[index].error,
  }));
}
