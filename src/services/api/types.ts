/**
 * API Types - Generated from SwellCaster.API models
 */

export interface Location {
  latitude: number;
  longitude: number;
}

export interface WaveData {
  height: number;
  direction?: number;
  period?: number;
}

export interface SwellData {
  height: number;
  direction: number;
  period: number;
}

export interface WindWaveData {
  height: number;
  direction: number;
}

export interface WindData {
  speedKnots: number;
  direction: number;
}

export interface CurrentConditions {
  timestamp: string;
  wave: WaveData;
  swell: SwellData;
  windWave: WindWaveData;
  wind: WindData;
  waterTemperature: number;
  seaLevelHeightM?: number;
  /** bad | good | very good | amazing — from API when coords match a curated spot */
  rating?: SurfRating;
}

export type SurfRating = 'bad' | 'good' | 'very good' | 'amazing';

export interface ForecastHour {
  timestamp: string;
  wave: WaveData;
  swell: SwellData;
  windWave: WindWaveData;
  wind: WindData;
  waterTemperature: number;
  seaLevelHeightM?: number;
}

export interface DailyWaveSummary {
  maxHeight: number;
  dominantDirection: number;
  maxPeriod: number;
}

export interface DailySwellSummary {
  maxHeight: number;
  dominantDirection: number;
  maxPeriod: number;
}

export interface DailyWindSummary {
  maxSpeedKnots: number;
  dominantDirection: number;
}

export interface DailySummary {
  date: string;
  wave: DailyWaveSummary;
  swell: DailySwellSummary;
  wind?: DailyWindSummary;
  rating?: SurfRating;
}

export interface SurfForecastResponse {
  location: Location;
  current: CurrentConditions;
  hourlyForecast: ForecastHour[];
  dailySummary: DailySummary[];
  timezone: string;
}

export interface CoordinatesParams {
  lat: number;
  lon: number;
}

export interface HourlyParams extends CoordinatesParams {
  hours?: number;
}

export interface DailyParams extends CoordinatesParams {
  days?: number;
}

export interface ForecastParams extends CoordinatesParams {
  days?: number;
}

export interface PlaceSearchParams {
  q: string;
  limit?: number;
}

export interface PlaceSearchResultDto {
  id: string;
  label: string;
  subtitle?: string;
  lat: number;
  lon: number;
  source: 'spot' | 'geocode';
}

export interface CuratedSpot {
  id: string;
  name: string;
  lat: number;
  lon: number;
  region?: string;
  aliases?: string[];
  /** Compass bearing the break faces toward open ocean (degrees). */
  shoreBearing?: number;
  swellToleranceDeg?: number;
  breakType?: 'beach' | 'point' | 'reef';
}

export interface SpotWithConditions {
  spot: CuratedSpot;
  conditions: CurrentConditions | null;
}
