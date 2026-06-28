/**
 * LocationHeader — place name with condition badge and env stats
 */

import { StyleSheet, View } from 'react-native';

import type { SurfRating } from '@/services/api/types';
import { ThemedText } from '@/components/themed-text';
import { ConditionBadge } from '@/components/ui/condition-badge';
import { PlatformSymbol } from '@/components/ui/platform-symbol';
import { ForecastColors, ForecastSpacing, ForecastTypography } from '@/constants/forecast-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface LocationHeaderProps {
  /** e.g. "Current location" or "Selected location" */
  locationLabel: string;
  /** Reverse-geocoded place name, e.g. "Maroochydore" */
  placeName: string;
  /** Area / state / country, e.g. "Sunshine Coast, Queensland" */
  placeRegion?: string | null;
  swellHeightM: number;
  swellPeriodS?: number;
  swellDirection?: number;
  waveHeightM?: number;
  wavePeriodS?: number | null;
  windDirection?: number;
  windSpeedKnots?: number;
  rating?: SurfRating | null;
  waterTemperatureC?: number;
  seaLevelHeightM?: number | null;
  lastUpdated?: Date;
  testID?: string;
}

function EnvStat({
  icon,
  label,
  value,
  unit,
}: {
  icon: { ios: 'drop.fill' | 'water.waves'; android: 'water-drop' | 'waves'; web: 'water-drop' | 'waves' };
  label: string;
  value: string;
  unit: string;
}) {
  const scheme = useColorScheme();
  const palette = ForecastColors[scheme];

  return (
    <View style={styles.envStat}>
      <PlatformSymbol name={icon} size={14} tintColor={palette.onSurfaceVariant} />
      <ThemedText themeColor="textSecondary" style={styles.envLabel}>
        {value}
        {unit}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.envLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

export function LocationHeader({
  locationLabel,
  placeName,
  placeRegion,
  swellHeightM,
  swellPeriodS = 8,
  swellDirection,
  waveHeightM,
  wavePeriodS,
  windDirection,
  windSpeedKnots,
  rating,
  waterTemperatureC,
  seaLevelHeightM,
  lastUpdated,
  testID,
}: LocationHeaderProps) {
  const scheme = useColorScheme();
  const palette = ForecastColors[scheme];

  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-AU', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const showEnvStats = waterTemperatureC != null || seaLevelHeightM != null;

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <PlatformSymbol
            name={{ ios: 'location.fill', android: 'location-on', web: 'location-on' }}
            size={22}
            tintColor={palette.accent}
          />
          <ThemedText style={[styles.placeName, { color: palette.onSurface }]}>
            {placeName}
          </ThemedText>
        </View>
        <ConditionBadge
          swellHeightM={swellHeightM}
          swellPeriodS={swellPeriodS}
          swellDirection={swellDirection}
          wave={
            waveHeightM != null
              ? { height: waveHeightM, period: wavePeriodS ?? swellPeriodS }
              : undefined
          }
          windDirection={windDirection}
          windSpeedKnots={windSpeedKnots}
          rating={rating}
        />
      </View>

      {placeRegion ? (
        <ThemedText themeColor="textSecondary" style={styles.region}>
          {placeRegion}
        </ThemedText>
      ) : null}

      {showEnvStats || lastUpdated ? (
        <View style={styles.metaRow}>
          {waterTemperatureC != null ? (
            <EnvStat
              icon={{ ios: 'drop.fill', android: 'water-drop', web: 'water-drop' }}
              label="water"
              value={waterTemperatureC.toFixed(0)}
              unit="°C"
            />
          ) : null}
          {seaLevelHeightM != null ? (
            <EnvStat
              icon={{ ios: 'water.waves', android: 'waves', web: 'waves' }}
              label="tide"
              value={seaLevelHeightM.toFixed(1)}
              unit="m"
            />
          ) : null}
          {lastUpdated ? (
            <ThemedText themeColor="textSecondary" style={styles.updated}>
              Updated {formattedTime}
            </ThemedText>
          ) : null}
        </View>
      ) : null}

      <ThemedText themeColor="textSecondary" style={styles.locationLabel}>
        {locationLabel}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: ForecastSpacing.gutter,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  titleBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  placeName: {
    ...ForecastTypography.displayLg,
    flexShrink: 1,
  },
  region: {
    ...ForecastTypography.body,
    marginLeft: 30,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 16,
    marginLeft: 30,
    marginTop: 2,
  },
  envStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  envLabel: {
    ...ForecastTypography.metric,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  updated: {
    ...ForecastTypography.body,
    opacity: 0.6,
  },
  locationLabel: {
    ...ForecastTypography.label,
    marginLeft: 30,
    marginTop: 2,
    opacity: 0.7,
  },
});
