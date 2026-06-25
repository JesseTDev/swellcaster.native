import type { SurfRating } from '@/services/api/types';
import { estimateSurfHeightM } from '@/utils/surf-height';
import { metersToFeet } from '@/utils/units';

export type { SurfRating };

export function formatDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

export function formatDirectionFull(degrees: number): string {
  return `${formatDirection(degrees)} ${Math.round(degrees)}°`;
}

export const RATING_COLORS: Record<SurfRating, string> = {
  bad: '#EF4444',
  good: '#EAB308',
  'very good': '#A855F7',
  amazing: '#22C55E',
};

/** Height-only rating for generic locations without break geometry. */
export function getSurfRating(swellHeightM: number, swellPeriodS = 8): SurfRating {
  const ft = metersToFeet(estimateSurfHeightM(swellHeightM, swellPeriodS));
  if (ft < 1) return 'bad';
  if (ft < 2) return 'good';
  if (ft < 4) return 'very good';
  return 'amazing';
}

export function getRatingColor(rating: SurfRating): string {
  return RATING_COLORS[rating];
}

export function formatRatingLabel(rating: SurfRating): string {
  if (rating === 'very good') return 'Very good';
  return rating.charAt(0).toUpperCase() + rating.slice(1);
}

export const SURF_RATINGS: SurfRating[] = ['bad', 'good', 'very good', 'amazing'];

export function isGoodSurfRating(rating: SurfRating): boolean {
  return rating !== 'bad';
}

export function formatWindBrief(directionDeg: number, speedKnots: number): string {
  return `${formatDirection(directionDeg)} ${Math.round(speedKnots)} kt`;
}

export function dominantCompassDirection(degrees: number[]): string {
  if (degrees.length === 0) return 'N';

  const counts = new Map<string, number>();
  for (const deg of degrees) {
    const dir = formatDirection(deg);
    counts.set(dir, (counts.get(dir) ?? 0) + 1);
  }

  let bestDir = formatDirection(degrees[0]);
  let bestCount = 0;
  for (const [dir, count] of counts) {
    if (count > bestCount) {
      bestDir = dir;
      bestCount = count;
    }
  }

  return bestDir;
}

const STRONG_WIND_KNOTS = 15;
const LIGHT_WIND_KNOTS = 8;

/** Short wind phrase for day-level overview copy. */
export function buildWindOverviewPhrase(
  avgKnots: number,
  maxKnots: number,
  dominantDir: string
): string {
  if (avgKnots >= STRONG_WIND_KNOTS) {
    return `${dominantDir} wind averaging ${Math.round(avgKnots)} kt, gusting to ${Math.round(maxKnots)} kt`;
  }
  if (avgKnots >= LIGHT_WIND_KNOTS) {
    return `${dominantDir} wind around ${Math.round(avgKnots)} kt`;
  }
  return `light ${dominantDir} wind`;
}
