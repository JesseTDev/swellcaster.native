import { rateCoastal, rateGenericCoastal } from '@/utils/spot-quality';

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

  it('rates offshore wind better than onshore at a curated east-facing reef', () => {
    const wave = { height: 2.0, period: 13 };
    const swell = { height: 2.0, period: 13, direction: 90 };
    // shoreBearing 90 faces east → offshore wind arrives from the west (270).
    const offshore = rateCoastal(wave, swell, { speedKnots: 12, direction: 270 }, {
      shoreBearing: 90,
      breakType: 'reef',
    });
    const onshore = rateCoastal(wave, swell, { speedKnots: 12, direction: 90 }, {
      shoreBearing: 90,
      breakType: 'reef',
    });

    expect(onshore).toBe('bad');
    expect(offshore).not.toBe('bad');
  });

  it('marks a point break bad when the swell is outside its window', () => {
    // Solid swell but arriving 90° off the break — offshore wind cannot save it.
    const rating = rateCoastal(
      { height: 4.0, period: 14 },
      { height: 4.0, period: 14, direction: 200 },
      { speedKnots: 8, direction: 290 },
      { shoreBearing: 110, breakType: 'point' }
    );

    expect(rating).toBe('bad');
  });

  it('treats glassy light wind as clean regardless of direction', () => {
    const rating = rateCoastal(
      { height: 2.0, period: 13 },
      { height: 2.0, period: 13, direction: 90 },
      { speedKnots: 3, direction: 90 },
      { shoreBearing: 90, breakType: 'reef' }
    );

    expect(rating).not.toBe('bad');
  });
});
