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
import { SurfMap } from '@/components/map/surf-map';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ConditionBadge } from '@/components/ui/condition-badge';
import { DirectionCard } from '@/components/ui/direction-card';
import { ForecastCard } from '@/components/ui/forecast-card';
import { ThemeToggleButton } from '@/components/ui/theme-toggle-button';
import { ForecastColors, ForecastTypography } from '@/constants/forecast-theme';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useCurrent } from '@/hooks/api';
import { useConditionVideoAt } from '@/hooks/api/use-condition-videos';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDeviceLocation } from '@/hooks/use-device-location';
import { useMapSpotMarkers } from '@/hooks/use-map-spot-markers';
import type { CoordinatesParams, ConditionVideo } from '@/services/api';
import { useSelectedLocationStore } from '@/stores/selected-location-store';
import { findCuratedSpotAtCoords, formatCoordinates } from '@/utils/coordinates';
import { formatRatingLabel, RATING_COLORS, SURF_RATINGS } from '@/utils/forecast';
import { formatSurfHeightRangeFromConditions } from '@/utils/surf-height';

const PANEL_MAX_HEIGHT = Math.min(Dimensions.get('window').height * 0.38, 320);

function isSameCoords(a: CoordinatesParams, b: CoordinatesParams): boolean {
  return Math.abs(a.lat - b.lat) < 0.0001 && Math.abs(a.lon - b.lon) < 0.0001;
}

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

  const {
    markers: spotMarkers,
    isConditionsLoading: isSpotConditionsLoading,
  } = useMapSpotMarkers();

  const curatedSpots = useMemo(
    () => spotMarkers.map(({ spot }) => spot),
    [spotMarkers]
  );

  const gpsSpot = useMemo(
    () => (userCoords ? findCuratedSpotAtCoords(userCoords, curatedSpots) : null),
    [userCoords, curatedSpots]
  );

  const selectedSpotConditions = useMemo(() => {
    if (!selectedCoords || !selectedIsSpot) return null;
    return (
      spotMarkers.find(({ spot }) =>
        isSameCoords(selectedCoords, { lat: spot.lat, lon: spot.lon })
      )?.conditions ?? null
    );
  }, [selectedCoords, selectedIsSpot, spotMarkers]);

  const needsCurrentFetch =
    selectedCoords != null &&
    (!selectedIsSpot ||
      (selectedSpotConditions == null && !isSpotConditionsLoading));

  const { data: fetchedConditions, isLoading: isFetchingCurrent } = useCurrent(
    selectedCoords ?? { lat: 0, lon: 0 },
    { enabled: needsCurrentFetch }
  );

  const selectedConditions = selectedSpotConditions ?? fetchedConditions;
  const isLoading =
    selectedCoords == null
      ? false
      : selectedIsSpot
        ? isSpotConditionsLoading && selectedSpotConditions == null
        : isFetchingCurrent;

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

  /** Record from GPS — any location, not just curated spots in our database */
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

  const renderRecordSection = () => (
    <RecordConditionVideoButton
      coords={userCoords ?? { lat: 0, lon: 0 }}
      disabled={!canRecord || isUserLocationLoading}
      disabledHint={recordDisabledHint}
      locationLabel={recordLocationLabel}
      onUploaded={handleVideoUploaded}
    />
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
          <ForecastCard style={styles.panel}>
          {!selectedCoords ? (
            <ThemedText themeColor="textSecondary" style={styles.hint}>
              Tap a film icon on the map to watch live surf video and see conditions at that
              spot. Coloured dots show forecast ratings at known breaks.
            </ThemedText>
          ) : (
            <>
              {selectedIsVideo && locationVideo ? (
                <View style={styles.videoBlock}>
                  <ConditionVideoPlayer video={locationVideo} height={160} />
                </View>
              ) : null}

              {isLoading ? (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator color={palette.accent} />
                </View>
              ) : selectedConditions ? (
                <>
                  <View style={styles.panelHeader}>
                    <View style={styles.panelTitle}>
                      <ThemedText style={styles.spotName}>
                        {selectedLabel ?? 'Selected point'}
                      </ThemedText>
                      <ThemedText themeColor="textSecondary" style={styles.coords}>
                        {formatCoordinates(selectedCoords.lat, selectedCoords.lon)}
                      </ThemedText>
                    </View>
                    <ConditionBadge
                      swellHeightM={selectedConditions.swell.height}
                      swellPeriodS={selectedConditions.swell.period}
                      rating={selectedConditions.rating}
                    />
                  </View>

                  <ThemedText style={styles.surfHero}>
                    {formatSurfHeightRangeFromConditions(
                      selectedConditions.wave,
                      selectedConditions.swell
                    )}
                  </ThemedText>

                  <DirectionCard
                    embedded
                    swellDirection={selectedConditions.swell.direction}
                    swellHeightM={selectedConditions.swell.height}
                    swellPeriodS={selectedConditions.swell.period}
                    windDirection={selectedConditions.wind.direction}
                    windSpeedKnots={selectedConditions.wind.speedKnots}
                    windSeaHeightM={selectedConditions.windWave.height}
                  />
                </>
              ) : (
                <ThemedText themeColor="textSecondary">Could not load conditions.</ThemedText>
              )}

              {selectedConditions ? (
                <Pressable
                  style={[styles.button, { backgroundColor: palette.accent }]}
                  onPress={handleUseLocation}
                >
                  <ThemedText style={styles.buttonText}>Use for home forecast</ThemedText>
                </Pressable>
              ) : null}
            </>
          )}

          {renderRecordSection()}
        </ForecastCard>
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
    minHeight: 160,
  },
  panelWrap: {
    flexShrink: 0,
    marginTop: Spacing.one,
  },
  panelScroll: {
    flexGrow: 0,
  },
  panel: {
    marginBottom: 0,
    overflow: 'visible',
  },
  loadingWrap: {
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  videoBlock: {
    marginBottom: 10,
  },
  hint: {
    ...ForecastTypography.body,
    lineHeight: 18,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  panelTitle: {
    flex: 1,
    marginRight: 8,
  },
  spotName: {
    ...ForecastTypography.bodyBold,
    fontSize: 14,
  },
  coords: {
    ...ForecastTypography.caption,
    marginTop: 1,
    fontVariant: ['tabular-nums'],
  },
  surfHero: {
    ...ForecastTypography.metricLg,
    fontVariant: ['tabular-nums'],
    marginBottom: 6,
  },
  button: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    ...ForecastTypography.bodyBold,
  },
});
