/**
 * Current Conditions Hook
 * React Query hook for fetching current surf conditions
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { swellApi, CurrentConditions, CoordinatesParams } from '@/services/api';

export const CURRENT_QUERY_KEY = 'current';

export function useCurrent(
  params: CoordinatesParams,
  options?: Omit<
    UseQueryOptions<CurrentConditions, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<CurrentConditions, Error>({
    queryKey: [CURRENT_QUERY_KEY, params],
    queryFn: () => swellApi.getCurrent(params),
    enabled: Number.isFinite(params.lat) && Number.isFinite(params.lon),
    // Current conditions are more time-sensitive
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}
