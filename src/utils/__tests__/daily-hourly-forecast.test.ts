import type { ForecastHour } from '@/services/api/types';
import {
  buildHourlySnapshots,
  findCurrentHourIndex,
  getHoursForDay,
  groupHourlyByDay,
  pickAnchorSnapshots,
  sliceHourlyFromNow,
  toForecastDayKey,
} from '@/utils/daily-hourly-forecast';
import {
  estimateSurfHeightFtFromConditions,
  formatSurfFtRangeFromValues,
  surfContextForHour,
} from '@/utils/surf-height';

function sampleHour(isoLocal: string): ForecastHour {
  const h = new Date(isoLocal).getHours();
  return {
    timestamp: isoLocal,
    wave: { height: 0.5 + h * 0.02, period: 8 },
    swell: { height: 0.4 + h * 0.02, direction: 90, period: 9 },
    windWave: { height: 0.2, direction: 180 },
    wind: { speedKnots: 10 + h, direction: 200 },
    waterTemperature: 22,
    seaLevelHeightM: 0.5,
  };
}

describe('daily-hourly-forecast', () => {
  const hours = [
    sampleHour('2026-06-24T06:00:00'),
    sampleHour('2026-06-24T09:00:00'),
    sampleHour('2026-06-24T12:00:00'),
    sampleHour('2026-06-24T15:00:00'),
    sampleHour('2026-06-24T18:00:00'),
  ];

  it('groups hours by forecast day key', () => {
    const grouped = groupHourlyByDay(hours);
    expect(grouped.get('2026-06-24')?.length).toBe(5);
  });

  it('filters hours for a daily summary date', () => {
    const filtered = getHoursForDay(hours, '2026-06-24');
    expect(filtered).toHaveLength(5);
  });

  it('normalizes day keys from ISO dates', () => {
    expect(toForecastDayKey('2026-06-24T00:00:00')).toBe('2026-06-24');
  });

  it('picks five anchor snapshots', () => {
    const snapshots = buildHourlySnapshots(hours);
    const anchors = pickAnchorSnapshots(snapshots);
    expect(anchors).toHaveLength(5);
    expect(anchors[0].anchorLabel).toBe('6 am');
    expect(anchors[2].anchorLabel).toBe('12 pm');
    expect(anchors[4].anchorLabel).toBe('6 pm');
  });

  it('slices hourly rows from the current hour onward', () => {
    const dayHours = [
      sampleHour('2026-06-24T06:00:00'),
      sampleHour('2026-06-24T09:00:00'),
      sampleHour('2026-06-24T12:00:00'),
    ];

    expect(findCurrentHourIndex(dayHours, '2026-06-24T10:30:00')).toBe(1);
    expect(sliceHourlyFromNow(dayHours, '2026-06-24T10:30:00')).toHaveLength(2);
  });

  it('skips past anchor times when minHour is set', () => {
    const snapshots = buildHourlySnapshots(hours);
    const anchors = pickAnchorSnapshots(snapshots, 12);
    expect(anchors.map((anchor) => anchor.anchorLabel)).toEqual(['12 pm', '3 pm', '6 pm']);
  });

  it('derives outlook surf from the same per-hour math as the top reading', () => {
    const spotContext = { shoreBearing: 90, breakType: 'point' as const };
    const snapshots = buildHourlySnapshots(hours, spotContext);

    // Each snapshot must equal the headline estimate for that exact hour, so the
    // extended outlook can never disagree with the top reading / chart.
    const first = hours[0];
    const topFt = estimateSurfHeightFtFromConditions(
      first.wave,
      first.swell,
      surfContextForHour(first, spotContext)
    );
    expect(snapshots[0].surfFt).toBeCloseTo(topFt, 5);

    const range = formatSurfFtRangeFromValues(snapshots.map((s) => s.surfFt));
    expect(range).toMatch(/ft$/);
  });

  it('attenuates a sheltered point relative to a generic estimate', () => {
    const withSpot = buildHourlySnapshots(hours, {
      shoreBearing: 90,
      breakType: 'point',
    });
    const generic = buildHourlySnapshots(hours);

    // Swell here arrives from 90° (aligned), so a point should not exceed the
    // generic exposed estimate.
    expect(withSpot[0].surfFt).toBeLessThanOrEqual(generic[0].surfFt + 1e-9);
  });
});
