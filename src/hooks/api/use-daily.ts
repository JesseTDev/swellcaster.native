/**
 * Daily Summary Hook
 * React Query hook for fetching daily surf summary
 */

import { DailyParams, DailySummary, swellApi } from '@/services/api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const DAILY_QUERY_KEY = 'daily';

export function useDaily(
  params: DailyParams,
  options?: Omit<
    UseQueryOptions<DailySummary[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  const { lat, lon, days = 7 } = params;

  return useQuery<DailySummary[], Error>({
    queryKey: [DAILY_QUERY_KEY, lat, lon, days],
    queryFn: () => swellApi.getDaily({ lat, lon, days }),
    enabled: Number.isFinite(lat) && Number.isFinite(lon),
    ...options,
  });
}
