import type { ForecastHour, SurfRating } from '@/services/api/types';
import { getRatingColor, getSurfRating } from '@/utils/forecast';
import { rateGenericCoastal } from '@/utils/spot-quality';
import { estimateSurfHeightFtFromConditions, type SurfEstimateContext } from '@/utils/surf-height';

export interface HourlySurfSnapshot {
  timestamp: string;
  hour: number;
  hourLabel: string;
  surfFt: number;
  rating: SurfRating;
  color: string;
  windSpeedKnots: number;
  windDirection: number;
}

export interface AnchorSurfSnapshot extends HourlySurfSnapshot {
  anchorLabel: string;
}

const ANCHOR_TARGETS = [
  { hour: 6, label: '6 am' },
  { hour: 9, label: '9 am' },
  { hour: 12, label: '12 pm' },
  { hour: 15, label: '3 pm' },
  { hour: 18, label: '6 pm' },
] as const;

/** Stable YYYY-MM-DD key for grouping hourly rows onto outlook days. */
export function toForecastDayKey(input: string | Date): string {
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}/.test(input)) {
    return input.slice(0, 10);
  }

  const date = input instanceof Date ? input : new Date(input);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function groupHourlyByDay(hours: ForecastHour[]): Map<string, ForecastHour[]> {
  const grouped = new Map<string, ForecastHour[]>();

  for (const hour of hours) {
    const key = toForecastDayKey(hour.timestamp);
    const bucket = grouped.get(key);
    if (bucket) {
      bucket.push(hour);
    } else {
      grouped.set(key, [hour]);
    }
  }

  for (const bucket of grouped.values()) {
    bucket.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  return grouped;
}

export function getHoursForDay(hours: ForecastHour[], dayDate: string): ForecastHour[] {
  const key = toForecastDayKey(dayDate);
  return hours.filter((hour) => toForecastDayKey(hour.timestamp) === key);
}

export function findCurrentHourIndex(
  hours: ForecastHour[],
  referenceTime: string | Date
): number {
  if (hours.length === 0) return 0;

  const refMs = new Date(referenceTime).getTime();
  let index = 0;

  for (let i = 0; i < hours.length; i++) {
    if (new Date(hours[i].timestamp).getTime() <= refMs) {
      index = i;
    } else {
      break;
    }
  }

  return index;
}

/** Hourly rows from the current hour onward (matches API current selection). */
export function sliceHourlyFromNow(
  hours: ForecastHour[],
  referenceTime: string | Date
): ForecastHour[] {
  if (hours.length === 0) return [];
  return hours.slice(findCurrentHourIndex(hours, referenceTime));
}

export function buildHourlySnapshot(
  hour: ForecastHour,
  surfContext?: SurfEstimateContext
): HourlySurfSnapshot {
  const date = new Date(hour.timestamp);
  const hourContext: SurfEstimateContext | undefined = surfContext
    ? {
        ...surfContext,
        swellDirection: hour.swell.direction,
        windWaveHeight: hour.windWave.height,
      }
    : undefined;
  const surfFt = estimateSurfHeightFtFromConditions(hour.wave, hour.swell, hourContext);
  const periodS = hour.swell.period ?? hour.wave.period ?? 8;
  const rating =
    hour.swell.direction > 0
      ? rateGenericCoastal(hour.wave, hour.swell, hour.wind)
      : getSurfRating(hour.swell.height, periodS);

  return {
    timestamp: hour.timestamp,
    hour: date.getHours(),
    hourLabel: date.toLocaleTimeString('en-AU', { hour: 'numeric', hour12: true }),
    surfFt: Number.isFinite(surfFt) ? surfFt : 0,
    rating,
    color: getRatingColor(rating),
    windSpeedKnots: hour.wind.speedKnots,
    windDirection: hour.wind.direction,
  };
}

export function buildHourlySnapshots(
  hours: ForecastHour[],
  surfContext?: SurfEstimateContext
): HourlySurfSnapshot[] {
  return hours.map((hour) => buildHourlySnapshot(hour, surfContext));
}

export interface HourlyTimeWindow {
  start: HourlySurfSnapshot;
  end: HourlySurfSnapshot;
  length: number;
}

export function formatSnapshotHourRange(
  start: HourlySurfSnapshot,
  end: HourlySurfSnapshot
): string {
  if (start.timestamp === end.timestamp) return start.hourLabel;
  return `${start.hourLabel} – ${end.hourLabel}`;
}

export function findLongestSnapshotWindow(
  snapshots: HourlySurfSnapshot[],
  predicate: (snapshot: HourlySurfSnapshot) => boolean
): HourlyTimeWindow | null {
  let best: HourlyTimeWindow | null = null;
  let currentStart: HourlySurfSnapshot | null = null;
  let currentLength = 0;

  for (const snapshot of snapshots) {
    if (predicate(snapshot)) {
      if (!currentStart) currentStart = snapshot;
      currentLength += 1;
      const window = { start: currentStart, end: snapshot, length: currentLength };
      if (!best || window.length > best.length) best = window;
    } else {
      currentStart = null;
      currentLength = 0;
    }
  }

  return best;
}

export function averageSnapshotSurfFt(
  window: HourlyTimeWindow,
  snapshots: HourlySurfSnapshot[]
): number {
  const startIdx = snapshots.findIndex((s) => s.timestamp === window.start.timestamp);
  const endIdx = snapshots.findIndex((s) => s.timestamp === window.end.timestamp);
  if (startIdx < 0 || endIdx < 0) return window.start.surfFt;

  const slice = snapshots.slice(startIdx, endIdx + 1);
  const total = slice.reduce((sum, s) => sum + s.surfFt, 0);
  return total / slice.length;
}

/** Closest unused hour to each anchor time (dawn → evening). */
function findClosestSnapshot(
  snapshots: HourlySurfSnapshot[],
  targetHour: number,
  used: Set<string>,
  allowReuse: boolean
): HourlySurfSnapshot | null {
  let best: HourlySurfSnapshot | null = null;
  let bestDistance = Infinity;

  for (const snapshot of snapshots) {
    if (!allowReuse && used.has(snapshot.timestamp)) continue;

    const distance = Math.abs(snapshot.hour - targetHour);
    if (distance < bestDistance) {
      best = snapshot;
      bestDistance = distance;
    }
  }

  return best;
}

export function pickAnchorSnapshots(
  snapshots: HourlySurfSnapshot[],
  minHour = 0
): AnchorSurfSnapshot[] {
  if (snapshots.length === 0) return [];

  const targets = ANCHOR_TARGETS.filter(({ hour }) => hour >= minHour);
  if (targets.length === 0) return [];

  const used = new Set<string>();
  const results: AnchorSurfSnapshot[] = [];

  for (const { hour: targetHour, label } of targets) {
    const best =
      findClosestSnapshot(snapshots, targetHour, used, false) ??
      findClosestSnapshot(snapshots, targetHour, used, true);

    if (!best) continue;

    used.add(best.timestamp);
    results.push({ ...best, anchorLabel: label });
  }

  return results;
}

export function maxSurfFt(snapshots: HourlySurfSnapshot[]): number {
  if (snapshots.length === 0) return 1;
  return Math.max(...snapshots.map((s) => s.surfFt), 0.5);
}
