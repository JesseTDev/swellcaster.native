/**
 * Tide helpers — sea level from forecast API (sea_level_height_msl)
 */

import type { ForecastHour } from '@/services/api/types';

export interface TidePoint {
  timestamp: string;
  seaLevelHeightM: number;
}

export interface TideExtreme {
  type: 'high' | 'low';
  timestamp: string;
  heightM: number;
}

export function formatTideHeightM(meters: number, decimals = 2): string {
  return `${meters.toFixed(decimals)} m`;
}

export function hasTideMeasurements(
  values: Array<number | undefined | null>
): boolean {
  return values.some((v) => v != null && v !== 0);
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
        heightM: curr,
      });
    } else if (curr < prev && curr < next) {
      extremes.push({
        type: 'low',
        timestamp: slice[i].timestamp,
        heightM: curr,
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
  return `${label} ${formatTideTime(extreme.timestamp)} · ${extreme.heightM.toFixed(2)} m`;
}

export function tidePointsFromForecastHours(hours: ForecastHour[]): TidePoint[] {
  return hours.flatMap((hour) =>
    hour.seaLevelHeightM == null
      ? []
      : [{ timestamp: hour.timestamp, seaLevelHeightM: hour.seaLevelHeightM }]
  );
}

export function formatUpcomingTideHighlights(
  tidePoints: TidePoint[],
  referenceTime: Date = new Date(),
  maxHighlights = 2
): string[] {
  const nowMs = referenceTime.getTime();
  const remaining = tidePoints.filter(
    (point) => new Date(point.timestamp).getTime() >= nowMs
  );
  const extremes = findTideExtremes(remaining, remaining.length, maxHighlights);

  return extremes.map((extreme) => {
    const label = extreme.type === 'high' ? 'High tide' : 'Low tide';
    return `${label} around ${formatTideTime(extreme.timestamp)} (${extreme.heightM.toFixed(1)} m)`;
  });
}
