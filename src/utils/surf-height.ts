/**
 * Surf height estimates — foot bins (0-1, 1-2 ft…).
 *
 * Uses total significant wave height (wave_height) when available, not swell alone.
 * Open-Meteo swell_wave_height excludes wind chop; total wave_height matches
 * nearshore surf reports more closely.
 */

import { metersToFeet } from '@/utils/units';

export interface SurfHeightComponents {
  height?: number;
  period?: number | null;
}

/** Prefer total wave height; fall back to swell component. */
export function pickSurfEstimateSource(
  wave: SurfHeightComponents,
  swell: { height: number; period: number }
): { heightM: number; periodS: number } {
  const waveH = wave.height ?? 0;
  const swellH = swell.height ?? 0;

  if (waveH >= swellH && waveH > 0) {
    return {
      heightM: waveH,
      periodS: wave.period ?? swell.period,
    };
  }

  return { heightM: swellH, periodS: swell.period };
}

/**
 * Fraction of offshore Hs → breaking surf face (calibrated to forecast bins).
 */
function surfFactor(swellPeriodS: number): number {
  if (swellPeriodS < 6) return 0.55;
  if (swellPeriodS < 8) return 0.62;
  if (swellPeriodS < 10) return 0.68;
  if (swellPeriodS < 12) return 0.74;
  return 0.8;
}

export function estimateSurfHeightM(
  heightM: number,
  periodS: number
): number {
  return heightM * surfFactor(periodS);
}

export function estimateSurfHeightFt(
  heightM: number,
  periodS: number
): number {
  return metersToFeet(estimateSurfHeightM(heightM, periodS));
}

export function estimateSurfHeightFtFromConditions(
  wave: SurfHeightComponents,
  swell: { height: number; period: number }
): number {
  const { heightM, periodS } = pickSurfEstimateSource(wave, swell);
  return estimateSurfHeightFt(heightM, periodS);
}

/** Display range e.g. "0-1 ft", "1-2 ft" */
export function formatSurfHeightRange(
  heightM: number,
  periodS: number
): string {
  const estFt = estimateSurfHeightFt(heightM, periodS);
  if (estFt < 1) return '0-1 ft';
  const low = Math.floor(estFt);
  return `${low}-${low + 1} ft`;
}

export function formatSurfHeightRangeFromConditions(
  wave: SurfHeightComponents,
  swell: { height: number; period: number }
): string {
  const { heightM, periodS } = pickSurfEstimateSource(wave, swell);
  return formatSurfHeightRange(heightM, periodS);
}

export function formatSurfHeightFeet(
  heightM: number,
  periodS: number,
  decimals = 1
): string {
  return `${estimateSurfHeightFt(heightM, periodS).toFixed(decimals)} ft`;
}
