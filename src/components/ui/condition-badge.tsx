/**
 * ConditionBadge — surf rating pill (no emojis)
 */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { formatRatingLabel, getRatingColor, getSurfRating, type SurfRating } from '@/utils/forecast';

interface ConditionBadgeProps {
  swellHeightM: number;
  swellPeriodS?: number;
  rating?: SurfRating;
  compact?: boolean;
}

export function ConditionBadge({
  swellHeightM,
  swellPeriodS = 8,
  rating,
  compact = false,
}: ConditionBadgeProps) {
  const resolved = rating ?? getSurfRating(swellHeightM, swellPeriodS);
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
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  badgeCompact: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
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
