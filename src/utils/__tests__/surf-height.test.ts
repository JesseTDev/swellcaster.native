import {
  estimateSurfHeightFt,
  formatSurfHeightRange,
  pickSurfEstimateSource,
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

  it('reports 1-2 ft for Alex-like conditions', () => {
    const range = formatSurfHeightRange(0.82, 5.85);
    expect(range).toBe('1-2 ft');
  });

  it('does not over-report small swell-only chop as 1-2 ft', () => {
    const range = formatSurfHeightRange(0.36, 5.95);
    expect(range).toBe('0-1 ft');
  });

  it('estimates ~1.5 ft face from 0.82 m @ 5.85 s', () => {
    expect(estimateSurfHeightFt(0.82, 5.85)).toBeCloseTo(1.48, 1);
  });
});
