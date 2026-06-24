/**
 * Fetch tide / sea level directly from Open-Meteo (fallback when API omits tide)
 */

export interface TideHourlyResponse {
  timestamps: string[];
  seaLevelHeightM: number[];
}

const TIDE_CACHE_TTL_MS = 15 * 60 * 1000;
const tideCache = new Map<string, { expiresAt: number; value: TideHourlyResponse }>();

export function buildTideCacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(2)}:${lon.toFixed(2)}`;
}

export async function fetchOpenMeteoTide(
  lat: number,
  lon: number
): Promise<TideHourlyResponse> {
  const cacheKey = buildTideCacheKey(lat, lon);
  const cached = tideCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const url =
    `https://marine-api.open-meteo.com/v1/marine` +
    `?latitude=${lat}&longitude=${lon}` +
    `&hourly=sea_level_height_msl&forecast_days=2&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Tide fetch failed (${response.status})`);
  }

  const json = await response.json();
  const value = {
    timestamps: json.hourly.time as string[],
    seaLevelHeightM: json.hourly.sea_level_height_msl as number[],
  };

  tideCache.set(cacheKey, { expiresAt: Date.now() + TIDE_CACHE_TTL_MS, value });
  return value;
}

/** @internal test helper */
export function clearOpenMeteoTideCache(): void {
  tideCache.clear();
}

export function hasTideMeasurements(
  values: Array<number | undefined | null>
): boolean {
  return values.some((v) => v != null && v !== 0);
}
