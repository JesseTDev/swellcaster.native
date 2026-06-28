/**
 * ConditionBadge — surf rating pill (solid fill, Stitch style)
 */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  ForecastColors,
  ForecastRadii,
  ForecastTypography,
} from '@/constants/forecast-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  formatRatingLabel,
  getRatingColor,
  getSurfRating,
  type SurfRating,
} from '@/utils/forecast';
import { rateGenericCoastal } from '@/utils/spot-quality';
import type { SurfHeightComponents } from '@/utils/surf-height';

interface ConditionBadgeProps {
  swellHeightM: number;
  swellPeriodS?: number;
  swellDirection?: number;
  wave?: SurfHeightComponents;
  windDirection?: number;
  windSpeedKnots?: number;
  /** Pre-computed rating from API (preferred for curated spots). */
  rating?: SurfRating | null;
  compact?: boolean;
}

export function ConditionBadge({
  swellHeightM,
  swellPeriodS = 8,
  swellDirection,
  wave,
  windDirection,
  windSpeedKnots,
  rating,
  compact = false,
}: ConditionBadgeProps) {
  const scheme = useColorScheme();
  const palette = ForecastColors[scheme];
  const resolved =
    rating ??
    (swellDirection != null && windDirection != null && windSpeedKnots != null
      ? rateGenericCoastal(
          wave ?? { height: swellHeightM, period: swellPeriodS },
          { height: swellHeightM, period: swellPeriodS, direction: swellDirection },
          { direction: windDirection, speedKnots: windSpeedKnots }
        )
      : getSurfRating(swellHeightM, swellPeriodS));
  const color = getRatingColor(resolved);

  return (
    <View
      style={[
        styles.badge,
        compact && styles.badgeCompact,
        { backgroundColor: color },
      ]}
    >
      <ThemedText
        style={[
          styles.text,
          compact && styles.textCompact,
          { color: palette.ratingText },
        ]}
      >
        {formatRatingLabel(resolved).toUpperCase()}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: ForecastRadii.chip,
  },
  badgeCompact: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    ...ForecastTypography.label,
    fontSize: 11,
  },
  textCompact: {
    fontSize: 10,
    letterSpacing: 0.6,
  },
});
