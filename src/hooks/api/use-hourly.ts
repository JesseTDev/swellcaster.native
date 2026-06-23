/**
 * Hourly Forecast Hook
 * React Query hook for fetching hourly surf forecast
 */

import { ForecastHour, HourlyParams, swellApi } from '@/services/api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const HOURLY_QUERY_KEY = 'hourly';

export function useHourly(
  params: HourlyParams,
  options?: Omit<
    UseQueryOptions<ForecastHour[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<ForecastHour[], Error>({
    queryKey: [HOURLY_QUERY_KEY, params],
    queryFn: () => swellApi.getHourly(params),
    enabled: Number.isFinite(params.lat) && Number.isFinite(params.lon),
    ...options,
  });
}
