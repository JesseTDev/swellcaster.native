/**
 * API Endpoints Tests
 */

import axios, { AxiosInstance } from 'axios';
import { swellApi } from '../endpoints';
import { apiClient } from '../client';

// Get the mocked axios instance from apiClient
const mockedApiClient = apiClient as jest.Mocked<AxiosInstance>;

describe('Swell API Endpoints', () => {
  const mockParams = { lat: -33.8568, lon: 151.2153 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getForecast', () => {
    it('should call the forecast endpoint with correct params', async () => {
      const mockResponse = {
        location: { latitude: -33.8568, longitude: 151.2153 },
        current: {
          wind: { speedKnots: 0, direction: 0 },
          seaLevelHeightM: 0,
        } as any,
        hourlyForecast: [],
        dailySummary: [],
        timezone: 'Australia/Sydney',
      };

      (mockedApiClient.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await swellApi.getForecast(mockParams);

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/api/swell/forecast',
        { params: mockParams }
      );
      expect(result.current.seaLevelHeightM).toBe(0);
    });

    it('should handle errors', async () => {
      const mockError = new Error('Network error');
      (mockedApiClient.get as jest.Mock).mockRejectedValue(mockError);

      await expect(swellApi.getForecast(mockParams)).rejects.toThrow('Network error');
    });
  });

  describe('getCurrent', () => {
    it('should call the current endpoint with correct params', async () => {
      const mockResponse = {
        timestamp: '2026-06-22T00:00:00Z',
        wave: { height: 1.5, direction: 180, period: 10 },
        swell: { height: 1.2, direction: 175, period: 12 },
        windWave: { height: 0.3, direction: 190 },
        wind: { speedKnots: 12, direction: 195 },
        waterTemperature: 18.5,
      };

      (mockedApiClient.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await swellApi.getCurrent(mockParams);

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/api/swell/current',
        { params: mockParams }
      );
      expect(result.seaLevelHeightM).toBe(0);
      expect(result.wind).toEqual({ speedKnots: 12, direction: 195 });
    });
  });

  describe('getHourly', () => {
    it('should call the hourly endpoint with hours param', async () => {
      const mockResponse = [
        {
          timestamp: '2026-06-22T00:00:00Z',
          wave: { height: 1.5 },
          swell: { height: 1.2, direction: 175, period: 12 },
          windWave: { height: 0.3, direction: 190 },
          wind: { speedKnots: 12, direction: 195 },
          waterTemperature: 18.5,
        },
      ];

      (mockedApiClient.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const params = { ...mockParams, hours: 24 };
      const result = await swellApi.getHourly(params);

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/api/swell/hourly',
        { params }
      );
      expect(result[0].seaLevelHeightM).toBe(0);
    });
  });

  describe('getDaily', () => {
    it('should call the daily endpoint with correct params', async () => {
      const mockResponse = [
        {
          date: '2026-06-22',
          wave: { maxHeight: 2.0, dominantDirection: 180, maxPeriod: 12 },
          swell: { maxHeight: 1.8, dominantDirection: 175, maxPeriod: 14 },
          wind: { maxSpeedKnots: 18, dominantDirection: 210 },
        },
      ];

      (mockedApiClient.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await swellApi.getDaily({ ...mockParams, days: 14 });

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/api/swell/daily',
        { params: { ...mockParams, days: 14 } }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('searchPlaces', () => {
    it('should call the places search endpoint with query params', async () => {
      const mockResponse = [
        {
          id: 'spot-byron-bay',
          label: 'Byron Bay',
          subtitle: 'New South Wales, Australia · surf break',
          lat: -28.643,
          lon: 153.615,
          source: 'spot',
        },
      ];

      (mockedApiClient.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await swellApi.searchPlaces({ q: 'Byron Bay', limit: 8 });

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/places/search', {
        params: { q: 'Byron Bay', limit: 8 },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getSpotConditions', () => {
    it('should call the curated spot conditions endpoint', async () => {
      const mockResponse = [
        {
          spot: {
            id: 'noosa',
            name: 'Noosa Heads',
            lat: -26.3844,
            lon: 153.0911,
            region: 'Sunshine Coast, Australia',
            shoreBearing: 75,
            breakType: 'point',
          },
          conditions: {
            timestamp: '2026-06-23T00:00:00Z',
            wave: { height: 1.2 },
            swell: { height: 1.5, direction: 90, period: 10 },
            windWave: { height: 0.5, direction: 90 },
            wind: { speedKnots: 8, direction: 270 },
            waterTemperature: 22,
            rating: 'good',
          },
        },
      ];

      (mockedApiClient.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await swellApi.getSpotConditions();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/places/spots/conditions');
      expect(result[0].conditions?.rating).toBe('good');
    });
  });
});
