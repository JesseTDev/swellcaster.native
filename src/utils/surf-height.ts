/**
 * Surf height estimates — foot bins (0-1, 1-2 ft…).
 *
 * Uses total significant wave height (wave_height) when available, not swell alone.
 * Open-Meteo swell_wave_height excludes wind chop; total wave_height matches
 * nearshore surf reports more closely on exposed beaches.
 *
 * Sheltered points (e.g. Noosa) need swell reach attenuation — offshore Hs is
 * much larger than what wraps into the break.
 */

import { metersToFeet } from '@/utils/units';

export interface SurfHeightComponents {
  height?: number;
  period?: number | null;
}

export interface SurfEstimateContext {
  shoreBearing?: number;
  breakType?: 'beach' | 'point' | 'reef';
  swellDirection?: number;
  windWaveHeight?: number;
}

export type SpotSurfContext = Pick<SurfEstimateContext, 'shoreBearing' | 'breakType'>;

function angularDiff(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

/**
 * Fraction of offshore swell energy that reaches the break.
 * Points/reefs attenuate heavily when swell isn't aligned with the break.
 */
export function swellReachFactor(context?: SurfEstimateContext): number {
  const shoreBearing = context?.shoreBearing;
  const swellDirection = context?.swellDirection;
  const breakType = context?.breakType ?? 'beach';

  if (
    shoreBearing == null ||
    swellDirection == null ||
    swellDirection <= 0 ||
    swellDirection > 360
  ) {
    return 1;
  }

  const diff = angularDiff(swellDirection, shoreBearing);

  if (breakType === 'beach') {
    if (diff <= 25) return 1;
    if (diff <= 45) return 0.92;
    if (diff <= 70) return 0.85;
    return 0.78;
  }

  if (breakType === 'reef') {
    if (diff <= 20) return 1;
    if (diff <= 35) return 0.82;
    if (diff <= 50) return 0.65;
    if (diff <= 70) return 0.5;
    return 0.38;
  }

  // point — strongest attenuation when swell doesn't wrap in
  if (diff <= 15) return 1;
  if (diff <= 30) return 0.72;
  if (diff <= 45) return 0.52;
  if (diff <= 60) return 0.32;
  return 0.22;
}

/** Prefer total wave height; fall back to swell; discount wind chop on junk days. */
export function pickSurfEstimateSource(
  wave: SurfHeightComponents,
  swell: { height: number; period: number },
  windWave?: Pick<SurfHeightComponents, 'height'>
): { heightM: number; periodS: number } {
  const waveH = wave.height ?? 0;
  const swellH = swell.height ?? 0;
  const windH = windWave?.height ?? 0;
  const wavePeriod = wave.period ?? swell.period ?? 8;

  if (waveH <= 0 && swellH > 0) {
    return { heightM: swellH, periodS: swell.period };
  }

  if (swellH <= 0 && waveH > 0) {
    return {
      heightM: waveH,
      periodS: wave.period ?? swell.period,
    };
  }

  // Short-period chop inflates total Hs offshore — swell component is a better base.
  if (waveH > 0 && swellH > 0 && wavePeriod < 7 && windH > 0 && windH / waveH >= 0.35) {
    return { heightM: swellH, periodS: swell.period };
  }

  if (swellH > 0 && waveH > 0 && swellH / waveH >= 0.88) {
    return { heightM: swellH, periodS: swell.period };
  }

  if (waveH >= swellH) {
    return {
      heightM: waveH,
      periodS: wave.period ?? swell.period,
    };
  }

  return { heightM: swellH, periodS: swell.period };
}

/**
 * Offshore significant height → reported surf face (ft bins).
 * Long-period energy is already in Hs — do not amplify further with period.
 */
function surfFactor(periodS: number, heightM: number): number {
  const periodFactor =
    periodS < 6 ? 0.52 : periodS < 8 ? 0.5 : periodS < 10 ? 0.46 : periodS < 12 ? 0.43 : 0.4;

  const sizeBoost = heightM >= 2.5 ? 1.12 : heightM >= 2.0 ? 1.06 : 1;

  return periodFactor * sizeBoost;
}

export function estimateSurfHeightM(
  heightM: number,
  periodS: number,
  context?: SurfEstimateContext
): number {
  const base = heightM * surfFactor(periodS, heightM);
  return base * swellReachFactor(context);
}

export function estimateSurfHeightFt(
  heightM: number,
  periodS: number,
  context?: SurfEstimateContext
): number {
  return metersToFeet(estimateSurfHeightM(heightM, periodS, context));
}

export function estimateSurfHeightFtFromConditions(
  wave: SurfHeightComponents,
  swell: { height: number; period: number; direction?: number },
  context?: SurfEstimateContext
): number {
  const reachContext: SurfEstimateContext = {
    ...context,
    swellDirection: swell.direction ?? context?.swellDirection,
  };
  const { heightM, periodS } = pickSurfEstimateSource(wave, swell, {
    height: context?.windWaveHeight,
  });
  return estimateSurfHeightFt(heightM, periodS, reachContext);
}

/** Display range e.g. "0-1 ft", "1-2 ft" */
export function formatSurfHeightRange(
  heightM: number,
  periodS: number,
  context?: SurfEstimateContext
): string {
  const estFt = estimateSurfHeightFt(heightM, periodS, context);
  if (estFt < 1) return '0-1 ft';
  const low = Math.floor(estFt);
  return `${low}-${low + 1} ft`;
}

export function formatSurfHeightRangeFromConditions(
  wave: SurfHeightComponents,
  swell: { height: number; period: number; direction?: number },
  context?: SurfEstimateContext
): string {
  const estFt = estimateSurfHeightFtFromConditions(wave, swell, context);
  if (estFt < 1) return '0-1 ft';
  const low = Math.floor(estFt);
  return `${low}-${low + 1} ft`;
}

export function formatSurfHeightFeet(
  heightM: number,
  periodS: number,
  decimals = 1,
  context?: SurfEstimateContext
): string {
  return `${estimateSurfHeightFt(heightM, periodS, context).toFixed(decimals)} ft`;
}

/** Day-level surf range from hourly foot estimates e.g. "2–3 ft". */
export function formatSurfFtRangeFromValues(surfFtValues: number[]): string {
  if (surfFtValues.length === 0) return '0 ft';

  const minFt = Math.min(...surfFtValues);
  const maxFt = Math.max(...surfFtValues);
  const minRounded = Math.max(0, Math.floor(minFt));
  const maxRounded = Math.max(minRounded, Math.ceil(maxFt));

  if (minRounded === maxRounded) return `${minRounded} ft`;
  return `${minRounded}–${maxRounded} ft`;
}

export function surfContextFromSpot(
  spot?: Pick<
    { shoreBearing?: number; breakType?: 'beach' | 'point' | 'reef' },
    'shoreBearing' | 'breakType'
  > | null
): SpotSurfContext | undefined {
  if (!spot?.shoreBearing) return undefined;
  return {
    shoreBearing: spot.shoreBearing,
    breakType: spot.breakType ?? 'beach',
  };
}

export function surfContextForHour(
  hour: {
    swell: { direction: number };
    windWave: { height: number };
  },
  spotContext?: SpotSurfContext
): SurfEstimateContext | undefined {
  if (!spotContext?.shoreBearing) return undefined;
  return {
    ...spotContext,
    swellDirection: hour.swell.direction,
    windWaveHeight: hour.windWave.height,
  };
}
