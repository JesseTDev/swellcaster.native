/**
 * PrimaryConditionsCard — hero surf height + wind snapshot
 */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DirectionArrow } from '@/components/ui/direction-arrow';
import { ForecastCard } from '@/components/ui/forecast-card';
import {
  ForecastColors,
  ForecastTypography,
  getForecastInsetStyle,
} from '@/constants/forecast-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDirection } from '@/utils/forecast';
import { formatWindSpeedKnots } from '@/utils/units';

interface PrimaryConditionsCardProps {
  surfHeightFt: string;
  windDirection: number;
  windSpeedKnots: number;
  windGustKnots?: number | null;
  testID?: string;
}

export function PrimaryConditionsCard({
  surfHeightFt,
  windDirection,
  windSpeedKnots,
  windGustKnots,
  testID,
}: PrimaryConditionsCardProps) {
  const scheme = useColorScheme();
  const palette = ForecastColors[scheme];

  return (
    <ForecastCard variant="featured" padded={false} style={styles.card} testID={testID}>
      <View style={styles.row}>
        <View style={[getForecastInsetStyle(scheme), styles.surfInset]}>
          <ThemedText themeColor="textSecondary" style={styles.surfLabel}>
            Est. surf height
          </ThemedText>
          <View style={styles.surfValueRow}>
            <ThemedText style={[styles.surfValue, { color: palette.accent }]}>
              {surfHeightFt}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.surfUnit}>
              ft
            </ThemedText>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: palette.borderStrong }]} />

        <View style={styles.windBlock}>
          <ThemedText themeColor="textSecondary" style={styles.windLabel}>
            Wind
          </ThemedText>
          <DirectionArrow
            fromDegrees={windDirection}
            color="#EAB308"
            size={26}
            showLabel={false}
          />
          <ThemedText style={styles.windDirection}>
            {formatDirection(windDirection)}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.windSpeed}>
            {formatWindSpeedKnots(windSpeedKnots, windGustKnots)}
          </ThemedText>
        </View>
      </View>
    </ForecastCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 6,
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  surfInset: {
    flex: 1.35,
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    gap: 4,
  },
  surfLabel: {
    ...ForecastTypography.sectionTitle,
    fontWeight: '600',
  },
  surfValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  surfValue: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  surfUnit: {
    ...ForecastTypography.bodyBold,
    fontWeight: '500',
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
  windBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  windLabel: {
    ...ForecastTypography.sectionTitle,
    fontWeight: '600',
  },
  windDirection: {
    ...ForecastTypography.bodyBold,
    fontVariant: ['tabular-nums'],
  },
  windSpeed: {
    ...ForecastTypography.caption,
    fontVariant: ['tabular-nums'],
  },
});
