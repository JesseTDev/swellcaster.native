/**
 * LocationHeader — place name with current-location label
 */

import { StyleSheet, View } from 'react-native';

import type { SurfRating } from '@/services/api/types';
import { ThemedText } from '@/components/themed-text';
import { ConditionBadge } from '@/components/ui/condition-badge';
import { PlatformSymbol } from '@/components/ui/platform-symbol';
import { ForecastTypography } from '@/constants/forecast-theme';
import { useTheme } from '@/hooks/use-theme';
import { formatWaveHeightValueFeet, WAVE_HEIGHT_UNIT } from '@/utils/units';

interface LocationHeaderProps {
  /** e.g. "Current location" or "Selected location" */
  locationLabel: string;
  /** Reverse-geocoded place name, e.g. "Maroochydore" */
  placeName: string;
  /** Area / state / country, e.g. "Sunshine Coast, Queensland" */
  placeRegion?: string | null;
  swellHeightM: number;
  swellPeriodS?: number;
  rating?: SurfRating | null;
  waterTemperatureC?: number;
  seaLevelHeightM?: number | null;
  lastUpdated?: Date;
  testID?: string;
}

function EnvStat({
  icon,
  value,
  unit,
}: {
  icon: { ios: 'drop.fill' | 'water.waves'; android: 'water-drop' | 'waves'; web: 'water-drop' | 'waves' };
  value: string;
  unit: string;
}) {
  const theme = useTheme();

  return (
    <View style={styles.envStat}>
      <PlatformSymbol name={icon} size={11} tintColor={theme.textSecondary} />
      <ThemedText style={styles.envValue}>{value}</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.envUnit}>
        {unit}
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
  rating,
  waterTemperatureC,
  seaLevelHeightM,
  lastUpdated,
  testID,
}: LocationHeaderProps) {
  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-AU', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const showEnvStats = waterTemperatureC != null || seaLevelHeightM != null;

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.topRow}>
        <View style={styles.locationBlock}>
          <ThemedText themeColor="textSecondary" style={styles.currentLabel}>
            {locationLabel}
          </ThemedText>
          <ThemedText style={styles.placeName}>{placeName}</ThemedText>
          {placeRegion ? (
            <ThemedText themeColor="textSecondary" style={styles.region}>
              {placeRegion}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.badgeColumn}>
          <ConditionBadge
            swellHeightM={swellHeightM}
            swellPeriodS={swellPeriodS}
            rating={rating}
          />
          {showEnvStats ? (
            <View style={styles.envStats}>
              {waterTemperatureC != null ? (
                <EnvStat
                  icon={{ ios: 'drop.fill', android: 'water-drop', web: 'water-drop' }}
                  value={waterTemperatureC.toFixed(1)}
                  unit="°C"
                />
              ) : null}
              {seaLevelHeightM != null ? (
                <EnvStat
                  icon={{ ios: 'water.waves', android: 'waves', web: 'waves' }}
                  value={formatWaveHeightValueFeet(seaLevelHeightM)}
                  unit={WAVE_HEIGHT_UNIT}
                />
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
      {lastUpdated ? (
        <ThemedText themeColor="textSecondary" style={styles.time}>
          Observed {formattedTime} local
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  locationBlock: {
    flex: 1,
  },
  badgeColumn: {
    alignItems: 'flex-end',
    gap: 6,
  },
  envStats: {
    alignItems: 'flex-end',
    gap: 3,
  },
  envStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  envValue: {
    ...ForecastTypography.caption,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  envUnit: {
    ...ForecastTypography.caption,
  },
  currentLabel: {
    ...ForecastTypography.label,
    marginBottom: 2,
  },
  placeName: {
    ...ForecastTypography.placeName,
  },
  region: {
    ...ForecastTypography.body,
    marginTop: 1,
  },
  time: {
    ...ForecastTypography.caption,
    marginTop: 6,
  },
});
