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
import { CollapsibleForecastCard } from '@/components/ui/collapsible-forecast-card';
import { DirectionCard } from '@/components/ui/direction-card';
import { PrimaryConditionsCard } from '@/components/ui/primary-conditions-card';
import { OutlookDayPicker } from '@/components/ui/outlook-day-picker';
import { ThemeToggleButton } from '@/components/ui/theme-toggle-button';
import { ForecastColors, ForecastRadii, ForecastTypography } from '@/constants/forecast-theme';
import { type OutlookDays } from '@/constants/outlook-days';
import { Spacing } from '@/constants/theme';
import { useForecast } from '@/hooks/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDeviceLocation } from '@/hooks/use-device-location';
import { useSelectedLocationStore } from '@/stores/selected-location-store';
import { formatCoordinates } from '@/utils/coordinates';
import { formatSurfHeightRangeFromConditions } from '@/utils/surf-height';

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
  const [outlookExpanded, setOutlookExpanded] = useState(false);

  const {
    data,
    isLoading: isForecastLoading,
    isFetching: isForecastFetching,
    error: forecastError,
    refetch,
  } = useForecast(
    { ...(activeCoords ?? { lat: 0, lon: 0 }), days: outlookDays },
    { enabled: activeCoords != null }
  );

  const dailySummary = data?.dailySummary ?? [];
  const visibleDaily = dailySummary.slice(0, outlookDays);
  const isInitialForecastLoad = isForecastLoading && !data;
  const isOutlookRefreshing = isForecastFetching && data != null;

  const onRefresh = async () => {
    setRefreshing(true);
    if (!isManualLocation) {
      await refreshLocation();
    }
    await refetch();
    setRefreshing(false);
  };

  if (!isManualLocation && isLocationLoading) {
    return (
      <ThemedView style={[styles.centered, { paddingTop: insets.top }]}>
        <Logo size={40} />
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
        <Logo size={40} />
        <ThemedText style={styles.errorTitle}>Location required</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.stateText}>
          {locationError}
        </ThemedText>
        <View style={styles.searchFallback}>
          <LocationSearchBar testID="home-location-search-error" />
        </View>
        {permissionDenied ? (
          <Pressable
            style={[styles.actionButton, { borderColor: palette.borderStrong }]}
            onPress={() => Linking.openSettings()}
          >
            <ThemedText style={styles.actionButtonText}>Open settings</ThemedText>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.actionButton, { borderColor: palette.borderStrong }]}
            onPress={() => refreshLocation()}
          >
            <ThemedText style={styles.actionButtonText}>Try again</ThemedText>
          </Pressable>
        )}
      </ThemedView>
    );
  }

  if (isInitialForecastLoad) {
    return (
      <ThemedView style={[styles.centered, { paddingTop: insets.top }]}>
        <Logo size={40} />
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
        <Logo size={40} />
        <ThemedText style={styles.errorTitle}>Forecast unavailable</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.stateText}>
          {forecastError.message}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.errorHint}>
          Ensure the API is running at http://localhost:5213
        </ThemedText>
        <Pressable
          style={[styles.actionButton, { borderColor: palette.borderStrong }]}
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
  const surfHeight = formatSurfHeightRangeFromConditions(current.wave, swell).replace(' ft', '');

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + Spacing.two,
            paddingBottom: insets.bottom + Spacing.five,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.appBar}>
          <Logo size={28} />
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
          waterTemperatureC={current.waterTemperature}
          seaLevelHeightM={current.seaLevelHeightM}
          lastUpdated={lastUpdated}
          testID="location-header"
        />

        {isManualLocation ? (
          <Pressable
            style={[styles.useGpsButton, { borderColor: palette.borderStrong }]}
            onPress={clearManualLocation}
          >
            <ThemedText style={styles.useGpsButtonText}>Use GPS location instead</ThemedText>
          </Pressable>
        ) : null}

        <PrimaryConditionsCard
          surfHeightFt={surfHeight}
          windDirection={current.wind.direction}
          windSpeedKnots={current.wind.speedKnots}
          testID="primary-conditions"
        />

        <DirectionCard
          swellDirection={current.swell.direction}
          swellHeightM={current.swell.height}
          swellPeriodS={current.swell.period}
          windDirection={current.wind.direction}
          windSpeedKnots={current.wind.speedKnots}
          windSeaHeightM={current.windWave.height}
          testID="directions-card"
        />

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

        {visibleDaily.length > 0 || isOutlookRefreshing ? (
          <CollapsibleForecastCard
            title="Extended outlook"
            action={`${visibleDaily.length} days`}
            style={styles.outlookCard}
            expanded={outlookExpanded}
            onExpandedChange={setOutlookExpanded}
            testID="extended-outlook"
          >
            <OutlookDayPicker
              value={outlookDays}
              onChange={setOutlookDays}
              testID="outlook-day-picker"
            />
            {visibleDaily.length > 0 && visibleDaily.length < outlookDays ? (
              <ThemedText themeColor="textSecondary" style={styles.dailyHint}>
                Showing {visibleDaily.length} of {outlookDays} days from forecast.
              </ThemedText>
            ) : null}
            {isOutlookRefreshing ? (
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
          </CollapsibleForecastCard>
        ) : null}

        <ThemedText themeColor="textSecondary" style={styles.footer}>
          Pull to refresh · {data.timezone}
        </ThemedText>
      </ScrollView>
    </ThemedView>
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
    gap: 8,
    marginBottom: Spacing.three,
  },
  brand: {
    flex: 1,
  },
  brandName: {
    ...ForecastTypography.bodyBold,
    letterSpacing: -0.2,
  },
  brandTag: {
    ...ForecastTypography.label,
    marginTop: 1,
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
    paddingVertical: Spacing.two,
  },
  loader: {
    marginTop: Spacing.two,
  },
  stateText: {
    marginTop: Spacing.two,
    ...ForecastTypography.body,
    textAlign: 'center',
  },
  searchFallback: {
    width: '100%',
    maxWidth: 360,
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  errorTitle: {
    marginTop: Spacing.two,
    ...ForecastTypography.metricLg,
  },
  errorHint: {
    marginTop: Spacing.one,
    ...ForecastTypography.caption,
    textAlign: 'center',
  },
  coordsHint: {
    marginTop: Spacing.one,
    ...ForecastTypography.caption,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  actionButton: {
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: ForecastRadii.inner,
    borderWidth: 1,
  },
  actionButtonText: {
    ...ForecastTypography.bodyBold,
  },
  useGpsButton: {
    marginBottom: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: ForecastRadii.inner,
    borderWidth: 1,
    alignItems: 'center',
  },
  useGpsButtonText: {
    ...ForecastTypography.bodyBold,
  },
  footer: {
    ...ForecastTypography.caption,
    textAlign: 'center',
    marginTop: Spacing.three,
  },
});
