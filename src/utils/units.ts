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

export function formatWindSpeedKnots(knots: number): string {
  return `${Math.round(knots)} kt`;
}

export const WAVE_HEIGHT_UNIT = 'ft';
export const WIND_SPEED_UNIT = 'kt';
