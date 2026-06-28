/**
 * PrimaryConditionsCard — hero surf height + wind snapshot
 */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DirectionArrow } from '@/components/ui/direction-arrow';
import { ForecastCard } from '@/components/ui/forecast-card';
import {
  ForecastColors,
  ForecastSpacing,
  ForecastTypography,
} from '@/constants/forecast-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDirection } from '@/utils/forecast';

interface PrimaryConditionsCardProps {
  surfHeightFt: string;
  swellDirection?: number;
  windDirection: number;
  windSpeedKnots: number;
  windGustKnots?: number | null;
  testID?: string;
}

export function PrimaryConditionsCard({
  surfHeightFt,
  swellDirection,
  windDirection,
  windSpeedKnots,
  testID,
}: PrimaryConditionsCardProps) {
  const scheme = useColorScheme();
  const palette = ForecastColors[scheme];

  const windSpeedLabel = String(Math.round(windSpeedKnots));

  return (
    <ForecastCard variant="featured" testID={testID} style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.column, styles.columnBorder, { borderColor: `${palette.outlineVariant}4D` }]}>
          <ThemedText themeColor="textSecondary" style={styles.metricLabel}>
            Swell height
          </ThemedText>
          <View style={styles.valueRow}>
            <ThemedText style={[styles.value, { color: palette.onSurface }]}>{surfHeightFt}</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.unit}>
              ft
            </ThemedText>
          </View>
          {swellDirection != null ? (
            <View style={styles.directionRow}>
              <DirectionArrow
                fromDegrees={swellDirection}
                color={palette.secondary}
                size={16}
                showLabel={false}
              />
              <ThemedText style={[styles.directionText, { color: palette.secondary }]}>
                {formatDirection(swellDirection).toUpperCase()} {Math.round(swellDirection)}°
              </ThemedText>
            </View>
          ) : null}
        </View>

        <View style={styles.column}>
          <ThemedText themeColor="textSecondary" style={styles.metricLabel}>
            Wind
          </ThemedText>
          <View style={styles.valueRow}>
            <ThemedText style={[styles.value, { color: palette.onSurface }]}>
              {windSpeedLabel || '—'}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.unit}>
              kt
            </ThemedText>
          </View>
          <View style={styles.directionRow}>
            <DirectionArrow
              fromDegrees={windDirection}
              color={palette.tertiary}
              size={14}
              showLabel={false}
            />
            <ThemedText style={[styles.directionText, { color: palette.tertiary }]}>
              {formatDirection(windDirection).toUpperCase()}
            </ThemedText>
          </View>
        </View>
      </View>
    </ForecastCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: ForecastSpacing.gutter,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  column: {
    flex: 1,
    gap: 4,
  },
  columnBorder: {
    borderRightWidth: 1,
    paddingRight: ForecastSpacing.cardPadding,
    marginRight: ForecastSpacing.cardPadding,
  },
  metricLabel: {
    ...ForecastTypography.sectionTitle,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    ...ForecastTypography.display,
  },
  unit: {
    ...ForecastTypography.displayUnit,
  },
  directionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  directionText: {
    ...ForecastTypography.metric,
    letterSpacing: 0.4,
  },
});
