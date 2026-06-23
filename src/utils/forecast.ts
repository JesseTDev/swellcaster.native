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
