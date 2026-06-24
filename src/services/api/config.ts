/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

import Constants from 'expo-constants';
import * as Device from 'expo-device';

const API_PORT = 5213;
const DEFAULT_METRO_PORT = 8081;

function getMetroHostAndPort(): { host: string; port: number } | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.linkingUri ??
    Constants.expoGoConfig?.debuggerHost;

  if (!hostUri) return null;

  const stripped = hostUri.replace(/^https?:\/\//, '');
  const [host, portStr] = stripped.split(':');
  if (!host || host === 'localhost' || host === '127.0.0.1') return null;

  const port = portStr ? Number.parseInt(portStr, 10) : DEFAULT_METRO_PORT;
  return { host, port: Number.isNaN(port) ? DEFAULT_METRO_PORT : port };
}

function getDevBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  if (envUrl) return envUrl;

  // Simulator/emulator shares the host loopback.
  if (!Device.isDevice) {
    return `http://localhost:${API_PORT}`;
  }

  // Physical device: route API calls through Metro (same host:port as Expo Go).
  // Metro proxies /api/* to localhost:5213 — avoids macOS blocking direct :5213.
  const metro = getMetroHostAndPort();
  if (metro) {
    return `http://${metro.host}:${metro.port}`;
  }

  return `http://localhost:${API_PORT}`;
}

export const API_CONFIG = {
  BASE_URL: __DEV__ ? getDevBaseUrl() : 'https://your-production-api.com',
  TIMEOUT: 10000,
  /** Cold map load fetches ~28 spots sequentially; allow time for first warmup. */
  SPOT_CONDITIONS_TIMEOUT: 120000,
  ENDPOINTS: {
    FORECAST: '/api/swell/forecast',
    CURRENT: '/api/swell/current',
    HOURLY: '/api/swell/hourly',
    DAILY: '/api/swell/daily',
    PLACES_SEARCH: '/api/places/search',
    PLACES_SPOTS: '/api/places/spots',
    PLACES_SPOT_CONDITIONS: '/api/places/spots/conditions',
    VIDEOS_ACTIVE: '/api/videos/active',
    VIDEOS_AT: '/api/videos/at',
    VIDEOS_UPLOAD: '/api/videos',
  },
  UPLOAD_TIMEOUT: 120000,
} as const;

if (__DEV__) {
  console.log('API base URL:', API_CONFIG.BASE_URL);
}
