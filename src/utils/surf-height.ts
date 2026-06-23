/**
 * Surf height estimates from offshore swell — Open-Meteo reports significant
 * wave height in open water, which reads higher than breaking surf at the beach.
 * We derive a conservative surf estimate from swell height + period.
 */

import { metersToFeet } from '@/utils/units';

/** Period-based factor: short-period swell produces less rideable surf at the beach. */
function surfFactor(swellPeriodS: number): number {
  if (swellPeriodS < 6) return 0.35;
  if (swellPeriodS < 8) return 0.45;
  if (swellPeriodS < 10) return 0.55;
  if (swellPeriodS < 12) return 0.65;
  return 0.75;
}

export function estimateSurfHeightM(
  swellHeightM: number,
  swellPeriodS: number
): number {
  return swellHeightM * surfFactor(swellPeriodS);
}

export function estimateSurfHeightFt(
  swellHeightM: number,
  swellPeriodS: number
): number {
  return metersToFeet(estimateSurfHeightM(swellHeightM, swellPeriodS));
}

/** Surfline-style range e.g. "0-1 ft", "1-2 ft" */
export function formatSurfHeightRange(
  swellHeightM: number,
  swellPeriodS: number
): string {
  const estFt = estimateSurfHeightFt(swellHeightM, swellPeriodS);
  if (estFt < 0.5) return '0-1 ft';
  const low = Math.floor(estFt);
  return `${low}-${low + 1} ft`;
}

export function formatSurfHeightFeet(
  swellHeightM: number,
  swellPeriodS: number,
  decimals = 1
): string {
  return `${estimateSurfHeightFt(swellHeightM, swellPeriodS).toFixed(decimals)} ft`;
}
