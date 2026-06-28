/**
 * LocationForecastSections — shared home / map forecast detail blocks
 */

import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { TideChart } from '@/components/charts/tide-chart';
import { WaveHeightChart } from '@/components/charts/wave-height-chart';
import { DayOverviewCard } from './day-overview-card';
import { DailyForecastCard } from './daily-forecast-card';
import { DailyHourlyPreview } from './daily-hourly-preview';
import { LocationHeader } from '@/components/location-header';
import { ThemedText } from '@/components/themed-text';
import { CollapsibleForecastCard } from '@/components/ui/collapsible-forecast-card';
import { DirectionCard } from '@/components/ui/direction-card';
import { PrimaryConditionsCard } from '@/components/ui/primary-conditions-card';
import { OutlookDayPicker } from '@/components/ui/outlook-day-picker';
import { ForecastColors, ForecastTypography } from '@/constants/forecast-theme';
import { type OutlookDays } from '@/constants/outlook-days';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDayOverview } from '@/hooks/use-day-overview';
import type { CoordinatesParams, CuratedSpot, SurfForecastResponse } from '@/services/api';
import { groupHourlyByDay, toForecastDayKey, buildHourlySnapshots, pickAnchorSnapshots, sliceHourlyFromNow } from '@/utils/daily-hourly-forecast';
import { formatSurfHeightRangeFromConditions, surfContextForHour, surfContextFromSpot } from '@/utils/surf-height';

interface LocationForecastSectionsProps {
  data: SurfForecastResponse;
  coords: CoordinatesParams;
  placeName: string;
  placeRegion?: string | null;
  locationLabel: string;
  spot?: Pick<CuratedSpot, 'shoreBearing' | 'breakType'> | null;
  outlookDays?: OutlookDays;
  onOutlookDaysChange?: (days: OutlookDays) => void;
  defaultOutlookExpanded?: boolean;
  isOutlookRefreshing?: boolean;
  testIDPrefix?: string;
}

export function LocationForecastSections({
  data,
  coords,
  placeName,
  placeRegion,
  locationLabel,
  spot,
  outlookDays: outlookDaysProp,
  onOutlookDaysChange,
  defaultOutlookExpanded = false,
  isOutlookRefreshing = false,
  testIDPrefix = 'forecast',
}: LocationForecastSectionsProps) {
  const scheme = useColorScheme();
  const palette = scheme === 'dark' ? ForecastColors.dark : ForecastColors.light;

  const [outlookDaysInternal, setOutlookDaysInternal] = useState<OutlookDays>(7);
  const [outlookExpanded, setOutlookExpanded] = useState(defaultOutlookExpanded);

  const outlookDays = outlookDaysProp ?? outlookDaysInternal;
  const setOutlookDays = onOutlookDaysChange ?? setOutlookDaysInternal;

  const { current, hourlyForecast, dailySummary } = data;
  const lastUpdated = new Date(current.timestamp);
  const visibleDaily = dailySummary.slice(0, outlookDays);
  const hourlyByDay = useMemo(() => groupHourlyByDay(hourlyForecast), [hourlyForecast]);
  const spotSurfContext = useMemo(() => surfContextFromSpot(spot), [spot]);
  const currentSurfContext = useMemo(
    () =>
      spotSurfContext
        ? surfContextForHour(current, spotSurfContext)
        : undefined,
    [current, spotSurfContext]
  );
  const surfHeight = formatSurfHeightRangeFromConditions(
    current.wave,
    current.swell,
    currentSurfContext
  ).replace(' ft', '');

  const todayKey = visibleDaily[0]?.date
    ? toForecastDayKey(visibleDaily[0].date)
    : toForecastDayKey(current.timestamp);
  const todayHours = useMemo(
    () => hourlyByDay.get(todayKey) ?? hourlyForecast.slice(0, 24),
    [hourlyByDay, todayKey, hourlyForecast]
  );
  const todayHoursFromNow = useMemo(
    () => sliceHourlyFromNow(todayHours, current.timestamp),
    [todayHours, current.timestamp]
  );
  const hourlyFromNow = useMemo(
    () => sliceHourlyFromNow(hourlyForecast, current.timestamp),
    [hourlyForecast, current.timestamp]
  );
  const todayHourlySnapshots = useMemo(
    () => buildHourlySnapshots(todayHoursFromNow, spotSurfContext),
    [todayHoursFromNow, spotSurfContext]
  );
  const todayAnchorSnapshots = useMemo(() => {
    const minHour = todayHourlySnapshots[0]?.hour ?? 0;
    return pickAnchorSnapshots(todayHourlySnapshots, minHour);
  }, [todayHourlySnapshots]);
  const dayOverview = useDayOverview(todayHoursFromNow, todayHourlySnapshots);

  return (
    <View style={styles.stack}>
      <LocationHeader
        locationLabel={locationLabel}
        placeName={placeName}
        placeRegion={placeRegion}
        swellHeightM={current.swell.height}
        swellPeriodS={current.swell.period}
        swellDirection={current.swell.direction}
        waveHeightM={current.wave.height}
        wavePeriodS={current.wave.period}
        windDirection={current.wind.direction}
        windSpeedKnots={current.wind.speedKnots}
        rating={current.rating}
        waterTemperatureC={current.waterTemperature}
        seaLevelHeightM={current.seaLevelHeightM}
        lastUpdated={lastUpdated}
        testID={`${testIDPrefix}-location-header`}
      />

      <PrimaryConditionsCard
        surfHeightFt={surfHeight}
        swellDirection={current.swell.direction}
        windDirection={current.wind.direction}
        windSpeedKnots={current.wind.speedKnots}
        windGustKnots={current.wind.gustKnots}
        testID={`${testIDPrefix}-primary-conditions`}
      />

      <DayOverviewCard
        overview={dayOverview}
        testID={`${testIDPrefix}-day-overview`}
      />

      {todayHourlySnapshots.length > 0 ? (
        <DailyHourlyPreview
          hourly={todayHourlySnapshots}
          anchors={todayAnchorSnapshots}
          presentation="card"
          testID={`${testIDPrefix}-today-hourly-preview`}
        />
      ) : null}

      <DirectionCard
        swellDirection={current.swell.direction}
        swellHeightM={current.swell.height}
        swellPeriodS={current.swell.period}
        windDirection={current.wind.direction}
        windSpeedKnots={current.wind.speedKnots}
        windSeaHeightM={current.windWave.height}
        testID={`${testIDPrefix}-directions`}
      />

      {hourlyFromNow.length > 0 ? (
        <WaveHeightChart
          data={hourlyFromNow}
          surfContext={spotSurfContext}
          testID={`${testIDPrefix}-wave-chart`}
        />
      ) : null}

      {hourlyFromNow.length > 0 ? (
        <TideChart
          data={hourlyFromNow}
          testID={`${testIDPrefix}-tide-chart`}
        />
      ) : null}

      {visibleDaily.length > 0 || isOutlookRefreshing ? (
        <CollapsibleForecastCard
          title="Extended outlook"
          action={`${visibleDaily.length} days`}
          style={styles.outlookCard}
          expanded={outlookExpanded}
          onExpandedChange={setOutlookExpanded}
          testID={`${testIDPrefix}-extended-outlook`}
        >
          <OutlookDayPicker
            value={outlookDays}
            onChange={setOutlookDays}
            testID={`${testIDPrefix}-outlook-day-picker`}
          />
          {visibleDaily.length > 0 && visibleDaily.length < outlookDays ? (
            <ThemedText themeColor="textSecondary" style={styles.dailyHint}>
              Showing {visibleDaily.length} of {outlookDays} days from forecast.
            </ThemedText>
          ) : null}
          {isOutlookRefreshing ? (
            <ActivityIndicator
              size="small"
              color={palette.accent}
              style={styles.dailyLoader}
            />
          ) : (
            <View style={styles.dailyList}>
              {visibleDaily.map((day, index) => {
                const dayKey = toForecastDayKey(day.date);
                const dayHours = hourlyByDay.get(dayKey) ?? [];
                const hoursForCard =
                  index === 0
                    ? sliceHourlyFromNow(dayHours, current.timestamp)
                    : dayHours;

                return (
                <DailyForecastCard
                  key={day.date}
                  data={day}
                  dayHours={hoursForCard}
                  isToday={index === 0}
                  surfContext={spotSurfContext}
                  testID={`${testIDPrefix}-daily-card-${index}`}
                />
                );
              })}
            </View>
          )}
        </CollapsibleForecastCard>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 0,
  },
  outlookCard: {
    marginTop: 4,
  },
  dailyList: {
    marginTop: 8,
    gap: 0,
  },
  dailyHint: {
    ...ForecastTypography.caption,
    marginTop: 6,
    marginBottom: 4,
  },
  dailyLoader: {
    paddingVertical: 8,
  },
});
