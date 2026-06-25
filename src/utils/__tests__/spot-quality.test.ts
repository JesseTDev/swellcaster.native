import { rateGenericCoastal } from '@/utils/spot-quality';

describe('spot-quality', () => {
  it('returns bad for strong non-offshore wind at an east swell beach', () => {
    const rating = rateGenericCoastal(
      { height: 1.06, period: 5.4 },
      { height: 0.88, period: 4.9, direction: 124 },
      { speedKnots: 13, direction: 150 }
    );

    expect(rating).toBe('bad');
  });

  it('returns bad for flat surf regardless of wind', () => {
    const rating = rateGenericCoastal(
      { height: 0.2, period: 5 },
      { height: 0.2, period: 5, direction: 90 },
      { speedKnots: 3, direction: 270 }
    );

    expect(rating).toBe('bad');
  });
});
