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
  CurrentConditions,
  DailyParams,
  DailySummary,
  ForecastHour,
  ForecastParams,
  HourlyParams,
  PlaceSearchParams,
  PlaceSearchResultDto,
  SpotWithConditions,
  SurfForecastResponse,
  ConditionVideo,
  CuratedSpot,
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

  getSpotConditions: async (): Promise<SpotWithConditions[]> => {
    const { data } = await apiClient.get<SpotWithConditions[]>(
      API_CONFIG.ENDPOINTS.PLACES_SPOT_CONDITIONS,
      { timeout: API_CONFIG.SPOT_CONDITIONS_TIMEOUT }
    );
    return data.map((item) => ({
      spot: item.spot,
      conditions: item.conditions
        ? normalizeCurrentConditions(item.conditions)
        : null,
    }));
  },
};

export const videosApi = {
  getActive: async (): Promise<ConditionVideo[]> => {
    const { data } = await apiClient.get<ConditionVideo[]>(API_CONFIG.ENDPOINTS.VIDEOS_ACTIVE);
    return data;
  },

  getAt: async (params: CoordinatesParams): Promise<ConditionVideo | null> => {
    const { data, status } = await apiClient.get<ConditionVideo>(
      API_CONFIG.ENDPOINTS.VIDEOS_AT,
      {
        params,
        validateStatus: (code) => code === 200 || code === 404,
      }
    );
    if (status === 404) return null;
    return data;
  },

  upload: async (
    coords: CoordinatesParams,
    file: { uri: string; name: string; type: string }
  ): Promise<ConditionVideo> => {
    const form = new FormData();
    form.append('lat', String(coords.lat));
    form.append('lon', String(coords.lon));
    form.append('file', file as unknown as Blob);

    const { data } = await apiClient.post<ConditionVideo>(
      API_CONFIG.ENDPOINTS.VIDEOS_UPLOAD,
      form,
      {
        timeout: API_CONFIG.UPLOAD_TIMEOUT,
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (data) => data,
      }
    );
    return data;
  },
};
