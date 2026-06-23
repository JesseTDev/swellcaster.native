/**
 * Map — tap to pick a location, view surf conditions by spot
 */

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LocationSearchBar } from '@/components/location-search-bar';
import { SurfMap } from '@/components/map/surf-map';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ConditionBadge } from '@/components/ui/condition-badge';
import { DirectionCard } from '@/components/ui/direction-card';
import { ForecastCard } from '@/components/ui/forecast-card';
import { SectionHeader } from '@/components/ui/section-header';
import { ThemeToggleButton } from '@/components/ui/theme-toggle-button';
import { ForecastColors } from '@/constants/forecast-theme';
import { Spacing } from '@/constants/theme';
import { useCurrent } from '@/hooks/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDeviceLocation } from '@/hooks/use-device-location';
import type { CoordinatesParams } from '@/services/api';
import { useSelectedLocationStore } from '@/stores/selected-location-store';
import { formatCoordinates } from '@/utils/coordinates';
import { formatRatingLabel, RATING_COLORS, SURF_RATINGS } from '@/utils/forecast';
import { formatSurfHeightRangeFromConditions } from '@/utils/surf-height';
import { formatWindSpeedKnots } from '@/utils/units';

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scheme = useColorScheme();
  const palette = scheme === 'dark' ? ForecastColors.dark : ForecastColors.light;

  const { coords: userCoords } = useDeviceLocation();
  const setManualLocation = useSelectedLocationStore((s) => s.setManualLocation);

  const [selectedCoords, setSelectedCoords] = useState<CoordinatesParams | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [selectedIsSpot, setSelectedIsSpot] = useState(false);

  const { data: selectedConditions, isLoading } = useCurrent(
    selectedCoords ?? { lat: 0, lon: 0 },
    { enabled: selectedCoords != null }
  );

  const handleSelect = (coords: CoordinatesParams, label?: string) => {
    setSelectedCoords(coords);
    setSelectedLabel(label ?? null);
    setSelectedIsSpot(label != null);
  };

  const handleUseLocation = () => {
    if (!selectedCoords) return;
    setManualLocation(
      selectedCoords,
      selectedLabel ?? formatCoordinates(selectedCoords.lat, selectedCoords.lon)
    );
    router.push('/');
  };

  return (
    <ThemedView style={[styles.screen, { paddingTop: insets.top + Spacing.two }]}>
      <View style={styles.headerBlock}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <SectionHeader
              title="Surf map"
              subtitle="Tap a glowing dot or anywhere on the map"
            />
          </View>
          <ThemeToggleButton />
        </View>

        <LocationSearchBar
          testID="map-location-search"
          onSelect={(result) => handleSelect(result.coords, result.label)}
        />

        <View style={styles.legend}>
          {SURF_RATINGS.map((rating) => (
            <LegendDot
              key={rating}
              color={RATING_COLORS[rating]}
              label={formatRatingLabel(rating)}
            />
          ))}
        </View>
      </View>

      <View style={styles.mapWrap}>
        <SurfMap
          userCoords={userCoords}
          selectedCoords={selectedCoords}
          selectedIsSpot={selectedIsSpot}
          onSelectCoords={handleSelect}
        />
      </View>

      <View style={[styles.panelWrap, { paddingBottom: insets.bottom + Spacing.two }]}>
        <ForecastCard style={styles.panel}>
          {!selectedCoords ? (
            <ThemedText themeColor="textSecondary" style={styles.hint}>
              Tap a coloured dot on the map to load conditions for that surf spot.
            </ThemedText>
          ) : isLoading ? (
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
              <ThemedText style={styles.wave}>
                {formatSurfHeightRangeFromConditions(
                  selectedConditions.wave,
                  selectedConditions.swell
                )}{' '}
                surf · {selectedConditions.swell.period.toFixed(0)} s swell ·{' '}
                {formatWindSpeedKnots(selectedConditions.wind.speedKnots)} wind
              </ThemedText>
              <DirectionCard
                embedded
                swellDirection={selectedConditions.swell.direction}
                windDirection={selectedConditions.wind.direction}
                windSpeedKnots={selectedConditions.wind.speedKnots}
              />
              <Pressable
                style={[styles.button, { backgroundColor: palette.accent }]}
                onPress={handleUseLocation}
              >
                <ThemedText style={styles.buttonText}>Use for home forecast</ThemedText>
              </Pressable>
            </>
          ) : (
            <ThemedText themeColor="textSecondary">Could not load conditions.</ThemedText>
          )}
        </ForecastCard>
      </View>
    </ThemedView>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
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
    marginBottom: Spacing.one,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  headerText: {
    flex: 1,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: Spacing.one,
    marginBottom: Spacing.one,
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
  legendLabel: {
    fontSize: 10,
  },
  mapWrap: {
    flex: 1,
    minHeight: 160,
  },
  panelWrap: {
    flexShrink: 0,
    marginTop: Spacing.two,
  },
  panel: {
    marginBottom: 0,
    overflow: 'visible',
  },
  loadingWrap: {
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  hint: {
    fontSize: 13,
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
    fontSize: 16,
    fontWeight: '600',
  },
  coords: {
    fontSize: 11,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  wave: {
    fontSize: 14,
    marginBottom: 4,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
