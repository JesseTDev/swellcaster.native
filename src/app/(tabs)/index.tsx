/**
 * Landing Page — surf forecast for your GPS location
 */

import { useMemo, useState } from 'react';
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

import { UserAccountButton } from '@/components/auth';
import { LocationForecastSections } from '@/components/forecast';
import { LocationSearchBar } from '@/components/location-search-bar';
import { Logo } from '@/components/logo';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemeToggleButton } from '@/components/ui/theme-toggle-button';
import { ForecastColors, ForecastRadii, ForecastSpacing, ForecastTypography } from '@/constants/forecast-theme';
import { type OutlookDays } from '@/constants/outlook-days';
import { Spacing } from '@/constants/theme';
import { useForecast } from '@/hooks/api';
import { useCuratedSpots } from '@/hooks/use-curated-spots';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDeviceLocation } from '@/hooks/use-device-location';
import { useSelectedLocationStore } from '@/stores/selected-location-store';
import { findCuratedSpotAtCoords, formatCoordinates } from '@/utils/coordinates';

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

  const { data: curatedSpots = [] } = useCuratedSpots();
  const activeSpot = useMemo(
    () => (activeCoords ? findCuratedSpotAtCoords(activeCoords, curatedSpots) : null),
    [activeCoords, curatedSpots]
  );

  const [refreshing, setRefreshing] = useState(false);
  const [outlookDays, setOutlookDays] = useState<OutlookDays>(7);

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
          <Logo size={32} />
          <ThemedText style={[styles.brandName, { color: palette.accent }]}>
            Swell Caster
          </ThemedText>
          <View style={styles.appBarActions}>
            <ThemeToggleButton />
            <UserAccountButton />
          </View>
        </View>

        <LocationSearchBar testID="home-location-search" />

        {isManualLocation ? (
          <Pressable
            style={[styles.useGpsButton, { borderColor: palette.borderStrong }]}
            onPress={clearManualLocation}
          >
            <ThemedText style={styles.useGpsButtonText}>Use GPS location instead</ThemedText>
          </Pressable>
        ) : null}

        <LocationForecastSections
          data={data}
          coords={activeCoords}
          placeName={placeName}
          placeRegion={placeRegion}
          locationLabel={isManualLocation ? 'Selected location' : 'Current location'}
          spot={activeSpot}
          outlookDays={outlookDays}
          onOutlookDaysChange={setOutlookDays}
          isOutlookRefreshing={isOutlookRefreshing}
          testIDPrefix="home"
        />

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
    paddingHorizontal: ForecastSpacing.containerMargin,
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
    gap: 12,
    marginBottom: ForecastSpacing.gutter,
  },
  appBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginLeft: 'auto',
  },
  brandName: {
    ...ForecastTypography.headline,
    flex: 1,
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
