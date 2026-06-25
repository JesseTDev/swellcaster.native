import { buildDayOverview } from '@/utils/day-overview';
import type { HourlySurfSnapshot } from '@/utils/daily-hourly-forecast';

function snapshot(
  hour: number,
  hourLabel: string,
  surfFt: number,
  rating: HourlySurfSnapshot['rating'],
  windSpeedKnots: number,
  windDirection: number,
  day = '2099-01-15'
): HourlySurfSnapshot {
  return {
    timestamp: `${day}T${String(hour).padStart(2, '0')}:00:00`,
    hour,
    hourLabel,
    surfFt,
    rating,
    color: '#000',
    windSpeedKnots,
    windDirection,
  };
}

describe('buildDayOverview', () => {
  it('returns null when there are no hourly snapshots', () => {
    expect(buildDayOverview({ snapshots: [] })).toBeNull();
  });

  it('describes a mostly poor day with a short best window', () => {
    const snapshots = [
      snapshot(6, '6 am', 2.1, 'good', 6, 270),
      snapshot(7, '7 am', 2.2, 'good', 7, 270),
      snapshot(8, '8 am', 2.0, 'good', 8, 270),
      snapshot(9, '9 am', 2.1, 'bad', 14, 150),
      snapshot(10, '10 am', 2.0, 'bad', 16, 150),
      snapshot(11, '11 am', 1.9, 'bad', 18, 140),
      snapshot(12, '12 pm', 2.0, 'bad', 17, 140),
      snapshot(13, '1 pm', 2.0, 'bad', 16, 140),
      snapshot(14, '2 pm', 1.9, 'bad', 15, 140),
    ];

    const overview = buildDayOverview({ snapshots });

    expect(overview?.summary).toMatch(/messy for most of the rest of the day/i);
    expect(overview?.highlights.some((line) => line.includes('best window'))).toBe(true);
    expect(overview?.highlights.some((line) => line.includes('choppy'))).toBe(false);
  });

  it('calls out a choppy spell on mixed days', () => {
    const snapshots = [
      snapshot(8, '8 am', 2.1, 'good', 6, 270),
      snapshot(9, '9 am', 2.2, 'good', 7, 270),
      snapshot(10, '10 am', 2.0, 'bad', 16, 150),
      snapshot(11, '11 am', 1.9, 'bad', 18, 140),
      snapshot(12, '12 pm', 2.0, 'bad', 17, 140),
      snapshot(13, '1 pm', 2.1, 'good', 8, 270),
      snapshot(14, '2 pm', 2.0, 'good', 9, 280),
    ];

    const overview = buildDayOverview({ snapshots });

    expect(overview?.summary).toMatch(/mixed conditions/i);
    expect(overview?.highlights.some((line) => line.includes('choppy'))).toBe(true);
  });

  it('describes a mostly surfable day without worst-window highlight', () => {
    const snapshots = [
      snapshot(8, '8 am', 2.5, 'good', 7, 270),
      snapshot(9, '9 am', 2.6, 'very good', 6, 270),
      snapshot(10, '10 am', 2.7, 'good', 8, 280),
      snapshot(11, '11 am', 2.8, 'good', 9, 280),
    ];

    const overview = buildDayOverview({ snapshots });

    expect(overview?.summary).toMatch(/Looking surfable today/i);
    expect(overview?.highlights.some((line) => line.includes('choppy'))).toBe(false);
    expect(overview?.highlights.some((line) => line.includes('best window'))).toBe(false);
  });

  it('includes upcoming tide extremes in highlights', () => {
    const snapshots = [snapshot(8, '8 am', 2.0, 'good', 6, 270)];

    const overview = buildDayOverview({
      snapshots,
      tidePoints: [
        { timestamp: '2099-01-15T08:00:00', seaLevelHeightM: 0.4 },
        { timestamp: '2099-01-15T09:00:00', seaLevelHeightM: 0.8 },
        { timestamp: '2099-01-15T10:00:00', seaLevelHeightM: 1.1 },
        { timestamp: '2099-01-15T11:00:00', seaLevelHeightM: 0.9 },
        { timestamp: '2099-01-15T12:00:00', seaLevelHeightM: 0.5 },
      ],
      referenceTime: new Date('2099-01-15T07:00:00'),
    });

    expect(overview?.highlights.some((line) => line.includes('High tide'))).toBe(true);
  });
});
