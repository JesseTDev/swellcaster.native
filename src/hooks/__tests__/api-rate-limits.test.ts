/**
 * Ensures the client does not refetch aggressively from our API (which proxies Open-Meteo, etc.).
 */

import { QueryClient } from '@tanstack/react-query';

import { SPOT_CONDITIONS_QUERY_KEY, spotConditionsQueryOptions } from '@/hooks/use-curated-spot-conditions';

describe('API rate-limit client settings', () => {
  it('QueryProvider defaults disable refetch on window focus', () => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,
          gcTime: 15 * 60 * 1000,
          retry: 1,
          refetchOnWindowFocus: false,
          refetchOnMount: false,
        },
        mutations: {
          retry: 1,
        },
      },
    });

    const defaults = client.getDefaultOptions().queries;
    expect(defaults?.refetchOnWindowFocus).toBe(false);
    expect(defaults?.refetchOnMount).toBe(false);
    expect(defaults?.staleTime).toBeGreaterThanOrEqual(5 * 60 * 1000);
  });

  it('spot conditions query keeps a 15 minute stale window', () => {
    expect(spotConditionsQueryOptions.queryKey).toEqual([SPOT_CONDITIONS_QUERY_KEY]);
    expect(spotConditionsQueryOptions.staleTime).toBe(15 * 60 * 1000);
    expect(spotConditionsQueryOptions.refetchOnWindowFocus).toBe(false);
    expect(spotConditionsQueryOptions.retry).toBe(1);
  });
});
