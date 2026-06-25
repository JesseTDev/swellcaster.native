import {
  averageSnapshotSurfFt,
  findLongestSnapshotWindow,
  formatSnapshotHourRange,
  type HourlySurfSnapshot,
  type HourlyTimeWindow,
} from '@/utils/daily-hourly-forecast';
import {
  buildWindOverviewPhrase,
  dominantCompassDirection,
  formatRatingLabel,
  formatWindBrief,
  isGoodSurfRating,
} from '@/utils/forecast';
import { formatSurfFtRangeFromValues } from '@/utils/surf-height';
import { formatUpcomingTideHighlights, type TidePoint } from '@/utils/tide';

export interface DayOverview {
  summary: string;
  highlights: string[];
}

export interface DayOverviewInput {
  snapshots: HourlySurfSnapshot[];
  tidePoints?: TidePoint[];
  referenceTime?: Date;
}

const MOSTLY_GOOD_RATIO = 0.65;
const MOSTLY_BAD_RATIO = 0.35;
const MAX_HIGHLIGHTS = 4;

function buildSummary(
  surfRange: string,
  goodRatio: number,
  avgWind: number,
  maxWind: number,
  dominantDir: string
): string {
  const windPhrase = buildWindOverviewPhrase(avgWind, maxWind, dominantDir);

  if (goodRatio >= MOSTLY_GOOD_RATIO) {
    return `Looking surfable today (${surfRange}). ${windPhrase}.`;
  }

  if (goodRatio <= MOSTLY_BAD_RATIO) {
    return `${surfRange} but conditions stay messy for most of the rest of the day. ${windPhrase}.`;
  }

  return `${surfRange} with mixed conditions — cleaner windows between windier spells. ${windPhrase}.`;
}

function buildBestHighlight(window: HourlyTimeWindow, snapshots: HourlySurfSnapshot[]): string {
  const range = formatSnapshotHourRange(window.start, window.end);
  const surfFt = Math.round(averageSnapshotSurfFt(window, snapshots));
  const rating = formatRatingLabel(window.start.rating);
  const wind = formatWindBrief(window.start.windDirection, window.start.windSpeedKnots);

  if (window.length === 1) {
    return `${range}: ${rating} · ~${surfFt} ft · ${wind}`;
  }

  return `${range}: best window · ~${surfFt} ft · ${wind}`;
}

function buildWorstHighlight(window: HourlyTimeWindow): string {
  const range = formatSnapshotHourRange(window.start, window.end);
  const wind = formatWindBrief(window.end.windDirection, window.end.windSpeedKnots);
  return `${range}: choppy · ${wind} · poor`;
}

/** Rule-based narrative for the rest of today from hourly snapshots. */
export function buildDayOverview({
  snapshots,
  tidePoints = [],
  referenceTime = new Date(),
}: DayOverviewInput): DayOverview | null {
  if (snapshots.length === 0) return null;

  const surfRange = formatSurfFtRangeFromValues(snapshots.map((s) => s.surfFt));
  const goodCount = snapshots.filter((s) => isGoodSurfRating(s.rating)).length;
  const goodRatio = goodCount / snapshots.length;
  const avgWind =
    snapshots.reduce((sum, s) => sum + s.windSpeedKnots, 0) / snapshots.length;
  const maxWind = Math.max(...snapshots.map((s) => s.windSpeedKnots));
  const dominantDir = dominantCompassDirection(snapshots.map((s) => s.windDirection));

  const summary = buildSummary(surfRange, goodRatio, avgWind, maxWind, dominantDir);

  const highlights: string[] = [];
  const bestWindow = findLongestSnapshotWindow(snapshots, (s) => isGoodSurfRating(s.rating));
  const worstWindow = findLongestSnapshotWindow(snapshots, (s) => s.rating === 'bad');

  const mostlyGood = goodRatio >= MOSTLY_GOOD_RATIO;
  const mostlyBad = goodRatio <= MOSTLY_BAD_RATIO;

  if (bestWindow && !mostlyGood && (bestWindow.length >= 2 || mostlyBad)) {
    highlights.push(buildBestHighlight(bestWindow, snapshots));
  }

  if (worstWindow && worstWindow.length >= 2 && !mostlyBad) {
    highlights.push(buildWorstHighlight(worstWindow));
  }

  highlights.push(...formatUpcomingTideHighlights(tidePoints, referenceTime));

  return {
    summary,
    highlights: highlights.slice(0, MAX_HIGHLIGHTS),
  };
}
