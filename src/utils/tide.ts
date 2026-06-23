/**
 * Tide helpers — sea level from Open-Meteo (sea_level_height_msl)
 */

import { metersToFeet } from '@/utils/units';

export interface TidePoint {
  timestamp: string;
  seaLevelHeightM: number;
}

export interface TideExtreme {
  type: 'high' | 'low';
  timestamp: string;
  heightFt: number;
}

export function formatTideHeightFt(meters: number, decimals = 1): string {
  return `${metersToFeet(meters).toFixed(decimals)} ft`;
}

export function seaLevelToFeet(meters: number): number {
  return metersToFeet(meters);
}

export function findTideExtremes(
  points: TidePoint[],
  withinHours = 24,
  maxExtremes = 4
): TideExtreme[] {
  const slice = points.slice(0, withinHours);
  if (slice.length < 3) return [];

  const extremes: TideExtreme[] = [];

  for (let i = 1; i < slice.length - 1; i++) {
    const prev = slice[i - 1].seaLevelHeightM;
    const curr = slice[i].seaLevelHeightM;
    const next = slice[i + 1].seaLevelHeightM;

    if (curr > prev && curr > next) {
      extremes.push({
        type: 'high',
        timestamp: slice[i].timestamp,
        heightFt: seaLevelToFeet(curr),
      });
    } else if (curr < prev && curr < next) {
      extremes.push({
        type: 'low',
        timestamp: slice[i].timestamp,
        heightFt: seaLevelToFeet(curr),
      });
    }
  }

  return extremes.slice(0, maxExtremes);
}

export function formatTideTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatTideExtremeLabel(extreme: TideExtreme): string {
  const label = extreme.type === 'high' ? 'High' : 'Low';
  return `${label} ${formatTideTime(extreme.timestamp)} · ${extreme.heightFt.toFixed(1)} ft`;
}
