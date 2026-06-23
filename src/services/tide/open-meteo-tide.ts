/**
 * Fetch tide / sea level directly from Open-Meteo (fallback when API omits tide)
 */

export interface TideHourlyResponse {
  timestamps: string[];
  seaLevelHeightM: number[];
}

export async function fetchOpenMeteoTide(
  lat: number,
  lon: number
): Promise<TideHourlyResponse> {
  const url =
    `https://marine-api.open-meteo.com/v1/marine` +
    `?latitude=${lat}&longitude=${lon}` +
    `&hourly=sea_level_height_msl&forecast_days=2&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Tide fetch failed (${response.status})`);
  }

  const json = await response.json();
  return {
    timestamps: json.hourly.time as string[],
    seaLevelHeightM: json.hourly.sea_level_height_msl as number[],
  };
}

export function hasTideMeasurements(
  values: Array<number | undefined | null>
): boolean {
  return values.some((v) => v != null && v !== 0);
}
