/** API wave heights are in metres; display in feet. Wind speed from API is in knots. */

const METERS_TO_FEET = 3.28084;

export function metersToFeet(meters: number): number {
  return meters * METERS_TO_FEET;
}

export function formatWaveHeightFeet(meters: number, decimals = 1): string {
  return `${metersToFeet(meters).toFixed(decimals)} ft`;
}

export function formatWaveHeightValueFeet(meters: number, decimals = 1): string {
  return metersToFeet(meters).toFixed(decimals);
}

export function formatWindSpeedKnots(knots: number, gustKnots?: number | null): string {
  const base = `${Math.round(knots)} kt`;
  if (gustKnots != null && gustKnots > knots + 1) {
    return `${base} (gusts ${Math.round(gustKnots)})`;
  }
  return base;
}

export const WAVE_HEIGHT_UNIT = 'ft';
export const WIND_SPEED_UNIT = 'kt';
