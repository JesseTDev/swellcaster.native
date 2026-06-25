import { useMemo } from 'react';

import type { ForecastHour } from '@/services/api/types';
import type { HourlySurfSnapshot } from '@/utils/daily-hourly-forecast';
import { buildDayOverview, type DayOverview } from '@/utils/day-overview';
import { tidePointsFromForecastHours } from '@/utils/tide';

/** Rule-based today overview from remaining hourly forecast rows. */
export function useDayOverview(
  hoursFromNow: ForecastHour[],
  snapshots: HourlySurfSnapshot[]
): DayOverview | null {
  return useMemo(
    () =>
      buildDayOverview({
        snapshots,
        tidePoints: tidePointsFromForecastHours(hoursFromNow),
      }),
    [hoursFromNow, snapshots]
  );
}
