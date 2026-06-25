/**
 * Coastal surf quality — mirrors API generic rating when wind/swell are known.
 */

import type { SurfRating } from '@/services/api/types';
import { getSurfRating } from '@/utils/forecast';
import {
  estimateSurfHeightFtFromConditions,
  type SurfHeightComponents,
} from '@/utils/surf-height';

const GLASSY_WIND_KNOTS = 5;
const MIN_PERIOD_FOR_QUALITY = 8;

function angularDiff(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function isOffshoreWind(
  windFromDeg: number,
  windSpeedKnots: number,
  shoreBearing: number
): boolean {
  if (windSpeedKnots < GLASSY_WIND_KNOTS) return true;
  const offshoreFromDeg = (shoreBearing + 180) % 360;
  return angularDiff(windFromDeg, offshoreFromDeg) <= 45;
}

function capBySurfHeight(estFt: number, rating: SurfRating): SurfRating {
  if (estFt < 1) return 'bad';
  if (estFt < 2 && (rating === 'very good' || rating === 'amazing')) return 'good';
  return rating;
}

/** Wind-aware rating for locations without curated break geometry. */
export function rateGenericCoastal(
  wave: SurfHeightComponents,
  swell: { height: number; period: number; direction: number },
  wind: { speedKnots: number; direction: number }
): SurfRating {
  const estFt = estimateSurfHeightFtFromConditions(wave, swell);
  if (estFt < 1) return 'bad';

  const shoreBearing = swell.direction;
  if (shoreBearing <= 0 || shoreBearing > 360) {
    return getSurfRating(swell.height, swell.period);
  }

  if (!isOffshoreWind(wind.direction, wind.speedKnots, shoreBearing) && wind.speedKnots >= GLASSY_WIND_KNOTS) {
    return 'bad';
  }

  const period = wave.period ?? swell.period;
  let rating = getSurfRating(swell.height, swell.period);

  if (period < MIN_PERIOD_FOR_QUALITY) {
    if (rating === 'amazing') rating = 'very good';
    else if (rating === 'very good') rating = 'good';
    else if (rating === 'good') rating = 'bad';
  }

  return capBySurfHeight(estFt, rating);
}
