/**
 * API Endpoints
 * Type-safe API calls using axios
 */

import { apiClient } from './client';
import { API_CONFIG } from './config';
import {
  normalizeCurrentConditions,
  normalizeForecast,
  normalizeForecastHour,
} from './normalize';
import type {
  CoordinatesParams,
  CuratedSpot,
  CurrentConditions,
  DailyParams,
  DailySummary,
  ForecastHour,
  ForecastParams,
  HourlyParams,
  PlaceSearchParams,
  PlaceSearchResultDto,
  SurfForecastResponse,
} from './types';

export const swellApi = {
  /**
   * Get full surf forecast including current conditions, hourly, and daily data
   */
  getForecast: async (params: ForecastParams): Promise<SurfForecastResponse> => {
    const { data } = await apiClient.get<SurfForecastResponse>(
      API_CONFIG.ENDPOINTS.FORECAST,
      { params }
    );
    return normalizeForecast(data);
  },

  /**
   * Get current surf conditions only
   */
  getCurrent: async (params: CoordinatesParams): Promise<CurrentConditions> => {
    const { data } = await apiClient.get<CurrentConditions>(
      API_CONFIG.ENDPOINTS.CURRENT,
      { params }
    );
    return normalizeCurrentConditions(data);
  },

  /**
   * Get hourly surf forecast
   * @param hours - Optional number of hours to fetch (default: all)
   */
  getHourly: async (params: HourlyParams): Promise<ForecastHour[]> => {
    const { data } = await apiClient.get<ForecastHour[]>(
      API_CONFIG.ENDPOINTS.HOURLY,
      { params }
    );
    return data.map(normalizeForecastHour);
  },

  /**
   * Get daily surf summary
   */
  getDaily: async (params: DailyParams): Promise<DailySummary[]> => {
    const { data } = await apiClient.get<DailySummary[]>(
      API_CONFIG.ENDPOINTS.DAILY,
      { params }
    );
    return data;
  },

  /**
   * Search beaches and surf breaks worldwide
   */
  searchPlaces: async (params: PlaceSearchParams): Promise<PlaceSearchResultDto[]> => {
    const { data } = await apiClient.get<PlaceSearchResultDto[]>(
      API_CONFIG.ENDPOINTS.PLACES_SEARCH,
      { params }
    );
    return data;
  },

  getCuratedSpots: async (): Promise<CuratedSpot[]> => {
    const { data } = await apiClient.get<CuratedSpot[]>(API_CONFIG.ENDPOINTS.PLACES_SPOTS);
    return data;
  },
};
