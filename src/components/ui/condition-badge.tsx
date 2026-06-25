/**
 * ConditionBadge — surf rating pill (no emojis)
 */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
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
        { backgroundColor: `${color}22`, borderColor: `${color}55` },
      ]}
    >
      <ThemedText style={[styles.text, compact && styles.textCompact, { color }]}>
        {formatRatingLabel(resolved)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeCompact: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  textCompact: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
});
