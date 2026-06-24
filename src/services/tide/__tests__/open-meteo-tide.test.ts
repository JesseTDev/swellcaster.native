import {
  buildTideCacheKey,
  clearOpenMeteoTideCache,
  fetchOpenMeteoTide,
} from '@/services/tide/open-meteo-tide';

describe('fetchOpenMeteoTide rate limiting', () => {
  beforeEach(() => {
    clearOpenMeteoTideCache();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        hourly: {
          time: ['2026-06-22T00:00'],
          sea_level_height_msl: [0.5],
        },
      }),
    }) as jest.Mock;
  });

  it('buildTideCacheKey rounds coordinates', () => {
    expect(buildTideCacheKey(-33.856789, 151.215312)).toBe('-33.86:151.22');
  });

  it('caches identical coordinate requests', async () => {
    await fetchOpenMeteoTide(-33.86, 151.21);
    await fetchOpenMeteoTide(-33.86, 151.21);

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
