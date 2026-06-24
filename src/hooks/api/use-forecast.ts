/**
 * Forecast Hook
 * React Query hook for fetching full surf forecast data
 */

import { useQuery, UseQueryOptions, keepPreviousData } from '@tanstack/react-query';
import { swellApi, SurfForecastResponse, CoordinatesParams } from '@/services/api';

export const FORECAST_QUERY_KEY = 'forecast';

export function useForecast(
  params: CoordinatesParams & { days?: number },
  options?: Omit<
    UseQueryOptions<SurfForecastResponse, Error>,
    'queryKey' | 'queryFn'
  >
) {
  const days = params.days ?? 7;

  return useQuery<SurfForecastResponse, Error>({
    queryKey: [FORECAST_QUERY_KEY, params.lat, params.lon, days],
    queryFn: () => swellApi.getForecast({ lat: params.lat, lon: params.lon, days }),
    enabled: Number.isFinite(params.lat) && Number.isFinite(params.lon),
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    ...options,
  });
}
