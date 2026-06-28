/**
 * Coastal surf quality — mirrors API generic rating when wind/swell are known.
 */

import type { SurfRating } from '@/services/api/types';
import { getSurfRating } from '@/utils/forecast';
import {
  estimateSurfHeightFtFromConditions,
  type SurfEstimateContext,
  type SurfHeightComponents,
} from '@/utils/surf-height';

const GLASSY_WIND_KNOTS = 5;
const MIN_PERIOD_FOR_QUALITY = 8;
/** Above this, even offshore wind makes the wave hard to catch/drop in. */
const STRONG_WIND_KNOTS = 25;

function angularDiff(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

/**
 * Wind direction is the bearing the wind blows *from*. A break facing
 * `shoreBearing` (toward open ocean) sees offshore wind when it arrives from
 * the opposite side — i.e. from over the land at `shoreBearing + 180`.
 */
function isOffshoreWind(
  windFromDeg: number,
  windSpeedKnots: number,
  shoreBearing: number
): boolean {
  if (windSpeedKnots < GLASSY_WIND_KNOTS) return true;
  const offshoreFromDeg = (shoreBearing + 180) % 360;
  return angularDiff(windFromDeg, offshoreFromDeg) <= 45;
}

/** Max swell/shore offset (deg) before a break stops working — by break type. */
function swellToleranceDeg(breakType?: SurfEstimateContext['breakType']): number {
  switch (breakType) {
    case 'point':
      return 28;
    case 'reef':
      return 22;
    default:
      return 40;
  }
}

function capBySurfHeight(estFt: number, rating: SurfRating): SurfRating {
  if (estFt < 1) return 'bad';
  if (estFt < 2 && (rating === 'very good' || rating === 'amazing')) return 'good';
  return rating;
}

/** Knock a rating down one notch (used for short period and gale offshore). */
function downgrade(rating: SurfRating): SurfRating {
  if (rating === 'amazing') return 'very good';
  if (rating === 'very good') return 'good';
  if (rating === 'good') return 'bad';
  return rating;
}

export interface CoastalRatingOptions {
  /** Compass bearing the break faces toward open water. */
  shoreBearing?: number;
  breakType?: SurfEstimateContext['breakType'];
  /** Local wind-chop height (m), used to discount junk swell. */
  windWaveHeight?: number;
}

/**
 * Wind- and direction-aware rating. When a curated `shoreBearing` is supplied
 * the break's real orientation drives both swell-window alignment and the
 * offshore-wind check; otherwise we assume the break faces straight into the
 * swell (generic coastal behaviour).
 */
export function rateCoastal(
  wave: SurfHeightComponents,
  swell: { height: number; period: number; direction: number },
  wind: { speedKnots: number; direction: number },
  options?: CoastalRatingOptions
): SurfRating {
  const rawBearing = options?.shoreBearing;
  const hasRealBearing = rawBearing != null && rawBearing > 0 && rawBearing <= 360;
  const shoreBearing = hasRealBearing && rawBearing != null ? rawBearing : swell.direction;

  const context: SurfEstimateContext | undefined = hasRealBearing
    ? {
        shoreBearing,
        breakType: options?.breakType,
        swellDirection: swell.direction,
        windWaveHeight: options?.windWaveHeight,
      }
    : undefined;

  const estFt = estimateSurfHeightFtFromConditions(wave, swell, context);
  if (estFt < 1) return 'bad';

  if (shoreBearing <= 0 || shoreBearing > 360) {
    return getSurfRating(swell.height, swell.period);
  }

  // Swell well outside the break's window only matters when we know the real
  // orientation — a generic point assumes it faces the swell.
  const swellOffWindow =
    hasRealBearing &&
    swell.direction > 0 &&
    swell.direction <= 360 &&
    angularDiff(swell.direction, shoreBearing) > swellToleranceDeg(options?.breakType) * 1.4;
  if (swellOffWindow) return 'bad';

  const onshoreBlown =
    !isOffshoreWind(wind.direction, wind.speedKnots, shoreBearing) &&
    wind.speedKnots >= GLASSY_WIND_KNOTS;
  if (onshoreBlown) return 'bad';

  const period = wave.period ?? swell.period;
  let rating = getSurfRating(swell.height, swell.period);

  if (period < MIN_PERIOD_FOR_QUALITY) rating = downgrade(rating);
  // Even clean offshore can be too strong to surf comfortably.
  if (wind.speedKnots >= STRONG_WIND_KNOTS && rating !== 'good') rating = downgrade(rating);

  return capBySurfHeight(estFt, rating);
}

/** Wind-aware rating for locations without curated break geometry. */
export function rateGenericCoastal(
  wave: SurfHeightComponents,
  swell: { height: number; period: number; direction: number },
  wind: { speedKnots: number; direction: number }
): SurfRating {
  return rateCoastal(wave, swell, wind);
}
