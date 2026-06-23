/**
 * Normalize API payloads — fill in wind when missing (pre-API-restart responses)
 */

import type {
  CurrentConditions,
  ForecastHour,
  SurfForecastResponse,
  WindData,
} from './types';

function normalizeWind(
  wind: WindData | undefined,
  windWaveDirection?: number
): WindData {
  return {
    speedKnots: wind?.speedKnots ?? 0,
    direction: wind?.direction ?? windWaveDirection ?? 0,
  };
}

export function normalizeCurrentConditions(
  data: CurrentConditions
): CurrentConditions {
  return {
    ...data,
    wind: normalizeWind(data.wind, data.windWave?.direction),
    seaLevelHeightM: data.seaLevelHeightM ?? 0,
  };
}

export function normalizeForecastHour(hour: ForecastHour): ForecastHour {
  return {
    ...hour,
    wind: normalizeWind(hour.wind, hour.windWave?.direction),
    seaLevelHeightM: hour.seaLevelHeightM ?? 0,
  };
}

export function normalizeForecast(
  data: SurfForecastResponse
): SurfForecastResponse {
  return {
    ...data,
    current: normalizeCurrentConditions(data.current),
    hourlyForecast: data.hourlyForecast.map(normalizeForecastHour),
  };
}
