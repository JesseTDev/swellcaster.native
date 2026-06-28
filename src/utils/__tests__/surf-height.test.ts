import {
  estimateSurfHeightFt,
  estimateSurfHeightFtFromConditions,
  formatSurfHeightRange,
  formatSurfHeightRangeFromConditions,
  pickSurfEstimateSource,
  surfContextForHour,
  swellReachFactor,
} from '@/utils/surf-height';

describe('surf-height', () => {
  it('uses total wave height when higher than swell alone', () => {
    const source = pickSurfEstimateSource(
      { height: 0.82, period: 5.85 },
      { height: 0.62, period: 4.2 }
    );
    expect(source.heightM).toBe(0.82);
    expect(source.periodS).toBe(5.85);
  });

  it('prefers swell when wind chop dominates on short-period days', () => {
    const source = pickSurfEstimateSource(
      { height: 1.34, period: 5.8 },
      { height: 1.12, period: 5.35 },
      { height: 0.66 }
    );
    expect(source.heightM).toBe(1.12);
    expect(source.periodS).toBe(5.35);
  });

  it('prefers swell when it dominates total wave height', () => {
    const source = pickSurfEstimateSource(
      { height: 1.92, period: 10.65 },
      { height: 1.8, period: 9.6 }
    );
    expect(source.heightM).toBe(1.8);
    expect(source.periodS).toBe(9.6);
  });

  it('attenuates misaligned swell at sheltered points', () => {
    const reach = swellReachFactor({
      shoreBearing: 75,
      breakType: 'point',
      swellDirection: 129,
    });
    expect(reach).toBe(0.32);
  });

  it('reports 0-1 ft for Noosa-like junk swell (live Open-Meteo sample)', () => {
    const range = formatSurfHeightRangeFromConditions(
      { height: 1.34, period: 5.8 },
      { height: 1.12, period: 5.35, direction: 129 },
      {
        shoreBearing: 75,
        breakType: 'point',
        swellDirection: 129,
        windWaveHeight: 0.66,
      }
    );
    expect(range).toBe('0-1 ft');
    expect(
      estimateSurfHeightFtFromConditions(
        { height: 1.34, period: 5.8 },
        { height: 1.12, period: 5.35, direction: 129 },
        {
          shoreBearing: 75,
          breakType: 'point',
          swellDirection: 129,
          windWaveHeight: 0.66,
        }
      )
    ).toBeLessThan(1);
  });

  it('reports 1-2 ft for Alex-like conditions on an exposed beach', () => {
    const range = formatSurfHeightRangeFromConditions(
      { height: 1.04, period: 5.4 },
      { height: 0.9, period: 4.85, direction: 129 },
      {
        shoreBearing: 90,
        breakType: 'beach',
        swellDirection: 129,
        windWaveHeight: 0.44,
      }
    );
    expect(range).toBe('1-2 ft');
  });

  it('reports 1-2 ft for Alex-like conditions without spot context', () => {
    const range = formatSurfHeightRange(0.82, 5.85);
    expect(range).toBe('1-2 ft');
  });

  it('does not over-report small swell-only chop as 1-2 ft', () => {
    const range = formatSurfHeightRange(0.36, 5.95);
    expect(range).toBe('0-1 ft');
  });

  it('reports 2-3 ft for Margaret River-like swell-dominant day', () => {
    const range = formatSurfHeightRangeFromConditions(
      { height: 1.92, period: 10.65 },
      { height: 1.8, period: 9.6, direction: 270 },
      {
        shoreBearing: 270,
        breakType: 'reef',
        swellDirection: 270,
      }
    );
    expect(range).toBe('2-3 ft');
  });

  it('estimates ~1.4 ft face from 0.82 m @ 5.85 s', () => {
    expect(estimateSurfHeightFt(0.82, 5.85)).toBeCloseTo(1.4, 1);
  });

  it('estimates ~2.7 ft face from Margaret River swell sample', () => {
    expect(estimateSurfHeightFt(1.8, 9.6)).toBeCloseTo(2.72, 1);
  });

  it('surfContextForHour passes swell direction and wind wave into hourly estimates', () => {
    const context = surfContextForHour(
      {
        swell: { direction: 270 },
        windWave: { height: 0.2 },
      },
      {
        shoreBearing: 270,
        breakType: 'reef',
      }
    );

    expect(context).toEqual({
      shoreBearing: 270,
      breakType: 'reef',
      swellDirection: 270,
      windWaveHeight: 0.2,
    });
  });
});
