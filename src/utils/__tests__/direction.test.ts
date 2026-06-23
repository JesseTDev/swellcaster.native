import { directionToArrowRotation } from '@/utils/direction';

describe('directionToArrowRotation', () => {
  it('points north for 0° from direction', () => {
    expect(directionToArrowRotation(0)).toBe(0);
  });

  it('points east for 90° from direction', () => {
    expect(directionToArrowRotation(90)).toBe(90);
  });

  it('points south for 180° from direction', () => {
    expect(directionToArrowRotation(180)).toBe(180);
  });

  it('normalizes negative bearings', () => {
    expect(directionToArrowRotation(-90)).toBe(270);
  });
});
