/**
 * Landing Page — surf forecast for your GPS location
 */

import { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TideChart } from '@/components/charts/tide-chart';
import { WaveHeightChart } from '@/components/charts/wave-height-chart';
import { DailyForecastCard } from '@/components/daily-forecast-card';
import { LocationHeader } from '@/components/location-header';
import { LocationSearchBar } from '@/components/location-search-bar';
import { Logo } from '@/components/logo';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DirectionCard } from '@/components/ui/direction-card';
import { ForecastCard } from '@/components/ui/forecast-card';
import { MetricCell } from '@/components/ui/metric-cell';
import { OutlookDayPicker } from '@/components/ui/outlook-day-picker';
import { SectionHeader } from '@/components/ui/section-header';
import { ThemeToggleButton } from '@/components/ui/theme-toggle-button';
import { ForecastColors } from '@/constants/forecast-theme';
import { type OutlookDays } from '@/constants/outlook-days';
import { Spacing } from '@/constants/theme';
import { useForecast, useDaily } from '@/hooks/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDeviceLocation } from '@/hooks/use-device-location';
import { useSelectedLocationStore } from '@/stores/selected-location-store';
import { formatCoordinates } from '@/utils/coordinates';
import { formatDirection, formatDirectionFull } from '@/utils/forecast';
import { formatSurfHeightRangeFromConditions } from '@/utils/surf-height';
import {
  formatWaveHeightFeet,
  formatWaveHeightValueFeet,
  formatWindSpeedKnots,
  WAVE_HEIGHT_UNIT,
} from '@/utils/units';

export default function LandingPage() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const palette = scheme === 'dark' ? ForecastColors.dark : ForecastColors.light;

  const manualCoords = useSelectedLocationStore((s) => s.manualCoords);
  const manualLabel = useSelectedLocationStore((s) => s.manualLabel);
  const clearManualLocation = useSelectedLocationStore((s) => s.clearManualLocation);
  const isManualLocation = manualCoords != null;

  const {
    coords: gpsCoords,
    place,
    isLoading: isLocationLoading,
    error: locationError,
    permissionDenied,
    refresh: refreshLocation,
  } = useDeviceLocation();

  const activeCoords = manualCoords ?? gpsCoords;

  const [refreshing, setRefreshing] = useState(false);
  const [outlookDays, setOutlookDays] = useState<OutlookDays>(7);

  const {
    data,
    isLoading: isForecastLoading,
    error: forecastError,
    refetch,
  } = useForecast(activeCoords ?? { lat: 0, lon: 0 }, {
    enabled: activeCoords != null,
  });

  const {
    data: dailySummary = [],
    isLoading: isDailyLoading,
    refetch: refetchDaily,
  } = useDaily(
    { ...(activeCoords ?? { lat: 0, lon: 0 }), days: outlookDays },
    { enabled: activeCoords != null }
  );

  const visibleDaily = dailySummary.slice(0, outlookDays);

  const onRefresh = async () => {
    setRefreshing(true);
    if (!isManualLocation) {
      await refreshLocation();
    }
    await refetch();
    await refetchDaily();
    setRefreshing(false);
  };

  if (!isManualLocation && isLocationLoading) {
    return (
      <ThemedView style={[styles.centered, { paddingTop: insets.top }]}>
        <Logo size={48} />
        <ActivityIndicator size="small" color={palette.accent} style={styles.loader} />
        <ThemedText themeColor="textSecondary" style={styles.stateText}>
          Getting your location
        </ThemedText>
        <View style={styles.searchFallback}>
          <LocationSearchBar testID="home-location-search-loading" />
        </View>
      </ThemedView>
    );
  }

  if (!isManualLocation && locationError) {
    return (
      <ThemedView style={[styles.centered, { paddingTop: insets.top }]}>
        <Logo size={48} />
        <ThemedText style={styles.errorTitle}>Location required</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.stateText}>
          {locationError}
        </ThemedText>
        <View style={styles.searchFallback}>
          <LocationSearchBar testID="home-location-search-error" />
        </View>
        {permissionDenied ? (
          <Pressable
            style={[styles.actionButton, { borderColor: palette.border }]}
            onPress={() => Linking.openSettings()}
          >
            <ThemedText style={styles.actionButtonText}>Open settings</ThemedText>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.actionButton, { borderColor: palette.border }]}
            onPress={() => refreshLocation()}
          >
            <ThemedText style={styles.actionButtonText}>Try again</ThemedText>
          </Pressable>
        )}
      </ThemedView>
    );
  }

  if (isForecastLoading) {
    return (
      <ThemedView style={[styles.centered, { paddingTop: insets.top }]}>
        <Logo size={48} />
        <ActivityIndicator size="small" color={palette.accent} style={styles.loader} />
        <ThemedText themeColor="textSecondary" style={styles.stateText}>
          Loading forecast
        </ThemedText>
        {activeCoords ? (
          <ThemedText themeColor="textSecondary" style={styles.coordsHint}>
            {manualLabel ?? place?.name ?? formatCoordinates(activeCoords.lat, activeCoords.lon)}
          </ThemedText>
        ) : null}
      </ThemedView>
    );
  }

  if (forecastError) {
    return (
      <ThemedView style={[styles.centered, { paddingTop: insets.top }]}>
        <Logo size={48} />
        <ThemedText style={styles.errorTitle}>Forecast unavailable</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.stateText}>
          {forecastError.message}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.errorHint}>
          Ensure the API is running at http://localhost:5213
        </ThemedText>
        <Pressable
          style={[styles.actionButton, { borderColor: palette.border }]}
          onPress={() => onRefresh()}
        >
          <ThemedText style={styles.actionButtonText}>Retry</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  if (!data || !activeCoords) return null;

  const placeName =
    manualLabel ??
    place?.name ??
    formatCoordinates(activeCoords.lat, activeCoords.lon);
  const placeRegion = isManualLocation
    ? formatCoordinates(activeCoords.lat, activeCoords.lon)
    : place?.region;

  const { current, hourlyForecast } = data;
  const lastUpdated = new Date(current.timestamp);
  const { swell } = current;

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + Spacing.three,
            paddingBottom: insets.bottom + Spacing.five,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.appBar}>
          <Logo size={32} />
          <View style={styles.brand}>
            <ThemedText style={styles.brandName}>Swell Caster</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.brandTag}>
              Marine forecast
            </ThemedText>
          </View>
          <ThemeToggleButton />
        </View>

        <LocationSearchBar testID="home-location-search" />

        <LocationHeader
          locationLabel={isManualLocation ? 'Selected location' : 'Current location'}
          placeName={placeName}
          placeRegion={placeRegion}
          swellHeightM={swell.height}
          swellPeriodS={swell.period}
          rating={current.rating}
          lastUpdated={lastUpdated}
          testID="location-header"
        />

        {isManualLocation ? (
          <Pressable
            style={[styles.useGpsButton, { borderColor: palette.border }]}
            onPress={clearManualLocation}
          >
            <ThemedText style={styles.useGpsButtonText}>Use GPS location instead</ThemedText>
          </Pressable>
        ) : null}

        {/* Hero — primary observation */}
        <ForecastCard style={[styles.hero, { borderColor: palette.border }]}>
          <ThemedText themeColor="textSecondary" style={styles.heroLabel}>
            Est. surf height
          </ThemedText>
          <View style={styles.heroRow}>
            <ThemedText style={styles.heroValue}>
              {formatSurfHeightRangeFromConditions(current.wave, swell).replace(' ft', '')}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.heroUnit}>
              ft
            </ThemedText>
          </View>
          <View style={styles.heroMeta}>
            <ThemedText themeColor="textSecondary" style={styles.heroMetaText}>
              {swell.period.toFixed(1)} s swell · {formatDirectionFull(swell.direction)}
            </ThemedText>
          </View>
        </ForecastCard>

        <DirectionCard
          swellDirection={current.swell.direction}
          windDirection={current.wind.direction}
          windSpeedKnots={current.wind.speedKnots}
          testID="directions-card"
        />

        {/* Key metrics */}
        <ForecastCard style={styles.metricsCard}>
          <SectionHeader title="At a glance" />
          <View style={styles.metricGrid}>
            <MetricCell
              label="Offshore swell"
              value={formatWaveHeightValueFeet(current.swell.height)}
              unit={WAVE_HEIGHT_UNIT}
              testID="swell-stat"
            />
            <MetricCell
              label="Swell period"
              value={current.swell.period.toFixed(1)}
              unit="s"
            />
            <MetricCell
              label="Swell dir."
              value={formatDirection(current.swell.direction)}
              unit={`${Math.round(current.swell.direction)}°`}
            />
            <MetricCell
              label="Wind dir."
              value={formatDirection(current.wind.direction)}
              unit={`${Math.round(current.wind.direction)}°`}
            />
            <MetricCell
              label="Wind speed"
              value={Math.round(current.wind.speedKnots).toString()}
              unit="kt"
            />
            <MetricCell
              label="Wind sea"
              value={formatWaveHeightValueFeet(current.windWave.height)}
              unit={WAVE_HEIGHT_UNIT}
            />
            <MetricCell
              label="Tide level"
              value={formatWaveHeightValueFeet(current.seaLevelHeightM ?? 0)}
              unit="ft"
            />
            <MetricCell
              label="Water temp"
              value={current.waterTemperature.toFixed(1)}
              unit="°C"
              testID="temp-stat"
            />
          </View>
        </ForecastCard>

        {/* Detailed breakdown */}
        <ForecastCard style={styles.metricsCard}>
          <SectionHeader title="Wave components" subtitle="Current observation" />
          <View style={styles.detailGrid}>
            <DetailRow
              label="Combined wave"
              value={formatWaveHeightFeet(current.wave.height)}
              detail={
                current.wave.direction != null && current.wave.period != null
                  ? `${formatDirectionFull(current.wave.direction)} · ${current.wave.period.toFixed(1)} s`
                  : undefined
              }
            />
            <DetailRow
              label="Primary swell"
              value={formatWaveHeightFeet(current.swell.height)}
              detail={`${formatDirectionFull(current.swell.direction)} · ${current.swell.period.toFixed(1)} s`}
            />
            <DetailRow
              label="Wind sea"
              value={formatWaveHeightFeet(current.windWave.height)}
              detail={`${formatDirectionFull(current.windWave.direction)} · ${formatWindSpeedKnots(current.wind.speedKnots)} wind`}
            />
          </View>
        </ForecastCard>

        {hourlyForecast.length > 0 ? (
          <WaveHeightChart data={hourlyForecast} testID="wave-chart" />
        ) : null}

        {hourlyForecast.length > 0 ? (
          <TideChart
            data={hourlyForecast}
            lat={activeCoords.lat}
            lon={activeCoords.lon}
            testID="tide-chart"
          />
        ) : null}

        {visibleDaily.length > 0 || isDailyLoading ? (
          <View style={styles.dailySection}>
            <SectionHeader
              title="Extended outlook"
              subtitle={
                isDailyLoading
                  ? `Loading ${outlookDays}-day summary…`
                  : `${visibleDaily.length}-day summary`
              }
            />
            <OutlookDayPicker
              value={outlookDays}
              onChange={setOutlookDays}
              testID="outlook-day-picker"
            />
            {visibleDaily.length > 0 && visibleDaily.length < outlookDays ? (
              <ThemedText themeColor="textSecondary" style={styles.dailyHint}>
                Restart the API to load up to {outlookDays} days — showing{' '}
                {visibleDaily.length} from forecast.
              </ThemedText>
            ) : null}
            {isDailyLoading ? (
              <ActivityIndicator size="small" color={palette.accent} style={styles.dailyLoader} />
            ) : (
              <View style={styles.dailyList}>
                {visibleDaily.map((day, index) => (
                  <DailyForecastCard
                    key={day.date}
                    data={day}
                    isToday={index === 0}
                    testID={`daily-card-${index}`}
                  />
                ))}
              </View>
            )}
          </View>
        ) : null}

        <ThemedText themeColor="textSecondary" style={styles.footer}>
          Pull to refresh · Updates every 5 min · {data.timezone}
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

function DetailRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <View style={styles.detailRow}>
      <ThemedText themeColor="textSecondary" style={styles.detailLabel}>
        {label}
      </ThemedText>
      <ThemedText style={styles.detailValue}>{value}</ThemedText>
      {detail ? (
        <ThemedText themeColor="textSecondary" style={styles.detailSub}>
          {detail}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: Spacing.three,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.five,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Spacing.four,
  },
  brand: {
    flex: 1,
  },
  brandName: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  brandTag: {
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  hero: {
    marginBottom: Spacing.two,
    padding: Spacing.three,
  },
  heroLabel: {
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  heroValue: {
    fontSize: 56,
    fontWeight: '700',
    letterSpacing: -2,
    lineHeight: 60,
    fontVariant: ['tabular-nums'],
  },
  heroUnit: {
    fontSize: 22,
    fontWeight: '500',
    marginBottom: 10,
  },
  heroMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  heroMetaText: {
    fontSize: 13,
  },
  metricsCard: {
    marginVertical: Spacing.one,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  detailGrid: {
    gap: 14,
  },
  detailRow: {
    gap: 2,
  },
  detailLabel: {
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  detailSub: {
    fontSize: 12,
  },
  dailySection: {
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
  },
  dailyList: {
    gap: 0,
  },
  dailyHint: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: Spacing.two,
  },
  dailyLoader: {
    paddingVertical: Spacing.three,
  },
  loader: {
    marginTop: Spacing.three,
  },
  stateText: {
    marginTop: Spacing.two,
    fontSize: 14,
    textAlign: 'center',
  },
  searchFallback: {
    width: '100%',
    maxWidth: 360,
    marginTop: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  errorTitle: {
    marginTop: Spacing.three,
    fontSize: 18,
    fontWeight: '600',
  },
  errorHint: {
    marginTop: Spacing.one,
    fontSize: 12,
    textAlign: 'center',
  },
  coordsHint: {
    marginTop: Spacing.one,
    fontSize: 12,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  actionButton: {
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  useGpsButton: {
    marginBottom: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  useGpsButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: Spacing.four,
    lineHeight: 16,
  },
});
