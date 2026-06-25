/**
 * Map — tap spots for conditions; record video from your GPS location at the break
 */

import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LocationSearchBar } from '@/components/location-search-bar';
import {
  ConditionVideoPlayer,
  RecordConditionVideoButton,
} from '@/components/condition-video';
import { LocationForecastSections } from '@/components/forecast';
import { SurfMap } from '@/components/map/surf-map';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ForecastCard } from '@/components/ui/forecast-card';
import { ThemeToggleButton } from '@/components/ui/theme-toggle-button';
import { ForecastColors, ForecastRadii, ForecastTypography } from '@/constants/forecast-theme';
import { type OutlookDays } from '@/constants/outlook-days';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useForecast } from '@/hooks/api';
import { useConditionVideoAt } from '@/hooks/api/use-condition-videos';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDeviceLocation } from '@/hooks/use-device-location';
import { useMapSpotMarkers } from '@/hooks/use-map-spot-markers';
import type { CoordinatesParams, ConditionVideo } from '@/services/api';
import { useSelectedLocationStore } from '@/stores/selected-location-store';
import { findCuratedSpotAtCoords, formatCoordinates } from '@/utils/coordinates';
import { formatRatingLabel, RATING_COLORS, SURF_RATINGS } from '@/utils/forecast';

const PANEL_MAX_HEIGHT = Math.min(Dimensions.get('window').height * 0.55, 480);

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scheme = useColorScheme();
  const palette = scheme === 'dark' ? ForecastColors.dark : ForecastColors.light;

  const {
    coords: userCoords,
    isLoading: isUserLocationLoading,
    permissionDenied,
  } = useDeviceLocation();
  const setManualLocation = useSelectedLocationStore((s) => s.setManualLocation);

  const [selectedCoords, setSelectedCoords] = useState<CoordinatesParams | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [selectedIsSpot, setSelectedIsSpot] = useState(false);
  const [selectedIsVideo, setSelectedIsVideo] = useState(false);
  const [outlookDays, setOutlookDays] = useState<OutlookDays>(7);

  const { markers: spotMarkers } = useMapSpotMarkers();

  const curatedSpots = useMemo(
    () => spotMarkers.map(({ spot }) => spot),
    [spotMarkers]
  );

  const gpsSpot = useMemo(
    () => (userCoords ? findCuratedSpotAtCoords(userCoords, curatedSpots) : null),
    [userCoords, curatedSpots]
  );

  const selectedCuratedSpot = useMemo(
    () => (selectedCoords ? findCuratedSpotAtCoords(selectedCoords, curatedSpots) : null),
    [selectedCoords, curatedSpots]
  );

  const {
    data: forecastData,
    isLoading: isForecastLoading,
    isFetching: isForecastFetching,
    error: forecastError,
  } = useForecast(
    {
      lat: selectedCoords?.lat ?? 0,
      lon: selectedCoords?.lon ?? 0,
      days: outlookDays,
    },
    { enabled: selectedCoords != null }
  );

  const isOutlookRefreshing = isForecastFetching && forecastData != null;

  const { data: locationVideo, refetch: refetchLocationVideo } = useConditionVideoAt(
    selectedCoords
  );

  const recordLocationLabel = useMemo(() => {
    if (!userCoords) return undefined;
    return gpsSpot?.name ?? formatCoordinates(userCoords.lat, userCoords.lon);
  }, [userCoords, gpsSpot]);

  const handleSelect = (coords: CoordinatesParams, label?: string) => {
    setSelectedCoords(coords);
    setSelectedLabel(label ?? null);
    setSelectedIsSpot(label != null);
    setSelectedIsVideo(false);
  };

  const handleSelectVideo = (video: ConditionVideo) => {
    setSelectedCoords({ lat: video.lat, lon: video.lon });
    setSelectedLabel(video.spotName ?? 'Live surf video');
    setSelectedIsSpot(false);
    setSelectedIsVideo(true);
  };

  const handleUseLocation = () => {
    if (!selectedCoords) return;
    setManualLocation(
      selectedCoords,
      selectedLabel ?? formatCoordinates(selectedCoords.lat, selectedCoords.lon)
    );
    router.push('/');
  };

  const canRecord = userCoords != null;

  const recordDisabledHint = (() => {
    if (isUserLocationLoading) return 'Checking your location…';
    if (permissionDenied || !userCoords) {
      return 'Enable location to pin your video on the map.';
    }
    return undefined;
  })();

  const handleVideoUploaded = () => {
    refetchLocationVideo();
  };

  const forecastPlaceName =
    selectedLabel ??
    selectedCuratedSpot?.name ??
    (selectedCoords ? formatCoordinates(selectedCoords.lat, selectedCoords.lon) : '');

  const forecastPlaceRegion =
    selectedCuratedSpot?.region ??
    (selectedIsSpot ? null : selectedCoords ? formatCoordinates(selectedCoords.lat, selectedCoords.lon) : null);

  const forecastLocationLabel = selectedIsVideo
    ? 'Live video'
    : selectedIsSpot
      ? 'Surf spot'
      : 'Selected location';

  const renderRecordSection = () => (
    <ForecastCard style={styles.recordCard}>
      <RecordConditionVideoButton
        coords={userCoords ?? { lat: 0, lon: 0 }}
        disabled={!canRecord || isUserLocationLoading}
        disabledHint={recordDisabledHint}
        locationLabel={recordLocationLabel}
        onUploaded={handleVideoUploaded}
      />
    </ForecastCard>
  );

  return (
    <ThemedView style={[styles.screen, { paddingTop: insets.top + Spacing.one }]}>
      <View style={styles.headerBlock}>
        <View style={styles.headerRow}>
          <ThemedText type="smallBold" style={styles.compactTitle}>
            Surf map
          </ThemedText>
          <ThemeToggleButton />
        </View>

        <LocationSearchBar
          testID="map-location-search"
          onSelect={(result) => handleSelect(result.coords, result.label)}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.legend}
        >
          {SURF_RATINGS.map((rating) => (
            <LegendDot
              key={rating}
              color={RATING_COLORS[rating]}
              label={formatRatingLabel(rating)}
            />
          ))}
          <LegendDot color="#0F172A" label="Video" icon="videocam" />
        </ScrollView>
      </View>

      <View style={styles.mapWrap}>
        <SurfMap
          userCoords={userCoords}
          selectedCoords={selectedCoords}
          selectedIsSpot={selectedIsSpot}
          selectedIsVideo={selectedIsVideo}
          spotConditions={spotMarkers}
          onSelectCoords={handleSelect}
          onSelectVideo={handleSelectVideo}
        />
      </View>

      <View
        style={[
          styles.panelWrap,
          { paddingBottom: insets.bottom + BottomTabInset + Spacing.one },
        ]}
      >
        <ScrollView
          style={{ maxHeight: PANEL_MAX_HEIGHT }}
          contentContainerStyle={styles.panelScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {!selectedCoords ? (
            <ForecastCard style={styles.panelHint}>
              <ThemedText themeColor="textSecondary" style={styles.hint}>
                Tap a coloured dot or film icon on the map to see the full forecast for that
                spot — same details as the home screen.
              </ThemedText>
            </ForecastCard>
          ) : (
            <View style={styles.forecastPanel}>
              {selectedIsVideo && locationVideo ? (
                <ForecastCard style={styles.videoCard}>
                  <ConditionVideoPlayer video={locationVideo} height={160} />
                </ForecastCard>
              ) : null}

              {isForecastLoading && !forecastData ? (
                <ForecastCard style={styles.loadingCard}>
                  <View style={styles.loadingWrap}>
                    <ActivityIndicator color={palette.accent} />
                    <ThemedText themeColor="textSecondary" style={styles.loadingText}>
                      Loading forecast
                    </ThemedText>
                  </View>
                </ForecastCard>
              ) : forecastError ? (
                <ForecastCard style={styles.loadingCard}>
                  <ThemedText themeColor="textSecondary">{forecastError.message}</ThemedText>
                </ForecastCard>
              ) : forecastData && selectedCoords ? (
                <>
                  <LocationForecastSections
                    data={forecastData}
                    coords={selectedCoords}
                    placeName={forecastPlaceName}
                    placeRegion={forecastPlaceRegion}
                    locationLabel={forecastLocationLabel}
                    spot={selectedCuratedSpot}
                    outlookDays={outlookDays}
                    onOutlookDaysChange={setOutlookDays}
                    defaultOutlookExpanded={false}
                    isOutlookRefreshing={isOutlookRefreshing}
                    testIDPrefix="map"
                  />

                  <Pressable
                    style={[styles.button, { backgroundColor: palette.accent }]}
                    onPress={handleUseLocation}
                  >
                    <ThemedText style={styles.buttonText}>Use for home forecast</ThemedText>
                  </Pressable>
                </>
              ) : (
                <ForecastCard>
                  <ThemedText themeColor="textSecondary">Could not load forecast.</ThemedText>
                </ForecastCard>
              )}
            </View>
          )}

          {renderRecordSection()}
        </ScrollView>
      </View>
    </ThemedView>
  );
}

function LegendDot({
  color,
  label,
  icon,
}: {
  color: string;
  label: string;
  icon?: 'videocam';
}) {
  return (
    <View style={styles.legendItem}>
      {icon === 'videocam' ? (
        <View style={[styles.legendFilm, { backgroundColor: color }]}>
          <ThemedText style={styles.legendFilmIcon}>▶</ThemedText>
        </View>
      ) : (
        <View style={[styles.legendDot, { backgroundColor: color }]} />
      )}
      <ThemedText themeColor="textSecondary" style={styles.legendLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: Spacing.three,
  },
  headerBlock: {
    flexShrink: 0,
    marginBottom: Spacing.half,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.one,
  },
  compactTitle: {
    ...ForecastTypography.sectionTitle,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: Spacing.one,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendFilm: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  legendFilmIcon: {
    color: '#FFFFFF',
    fontSize: 6,
    lineHeight: 8,
    marginLeft: 1,
  },
  legendLabel: {
    fontSize: 10,
  },
  mapWrap: {
    flex: 1,
    minHeight: 140,
  },
  panelWrap: {
    flexShrink: 0,
    marginTop: Spacing.one,
  },
  panelScroll: {
    flexGrow: 0,
    gap: 8,
    paddingBottom: 4,
  },
  panelHint: {
    marginBottom: 0,
  },
  forecastPanel: {
    gap: 0,
  },
  videoCard: {
    marginBottom: 6,
  },
  loadingCard: {
    marginBottom: 6,
  },
  loadingWrap: {
    paddingVertical: Spacing.three,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    ...ForecastTypography.caption,
  },
  recordCard: {
    marginTop: 4,
    marginBottom: 0,
  },
  hint: {
    ...ForecastTypography.body,
    lineHeight: 18,
  },
  button: {
    paddingVertical: 11,
    borderRadius: ForecastRadii.inner,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    ...ForecastTypography.bodyBold,
  },
});
