/**
 * Forecast Hook
 * React Query hook for fetching full surf forecast data
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { swellApi, SurfForecastResponse, CoordinatesParams } from '@/services/api';

export const FORECAST_QUERY_KEY = 'forecast';

export function useForecast(
  params: CoordinatesParams,
  options?: Omit<
    UseQueryOptions<SurfForecastResponse, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<SurfForecastResponse, Error>({
    queryKey: [FORECAST_QUERY_KEY, params.lat, params.lon],
    queryFn: () => swellApi.getForecast(params),
    enabled: Number.isFinite(params.lat) && Number.isFinite(params.lon),
    ...options,
  });
}
