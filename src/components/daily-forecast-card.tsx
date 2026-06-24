/**
 * DailyForecastCard — collapsible day row for extended outlook
 */

import { PlatformSymbol } from '@/components/ui/platform-symbol';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { ConditionBadge } from '@/components/ui/condition-badge';
import { DirectionArrow } from '@/components/ui/direction-arrow';
import { ForecastCard } from '@/components/ui/forecast-card';
import { StatRow } from '@/components/ui/stat-row';
import { ThemedText } from '@/components/themed-text';
import { ForecastColors, ForecastTypography } from '@/constants/forecast-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { DailySummary } from '@/services/api';
import { formatDirection } from '@/utils/forecast';
import { formatSurfHeightRangeFromConditions } from '@/utils/surf-height';
import { formatWaveHeightValueFeet, WAVE_HEIGHT_UNIT } from '@/utils/units';

interface DailyForecastCardProps {
  data: DailySummary;
  isToday?: boolean;
  testID?: string;
}

export function DailyForecastCard({ data, isToday, testID }: DailyForecastCardProps) {
  const scheme = useColorScheme();
  const palette = ForecastColors[scheme];
  const [expanded, setExpanded] = useState(isToday ?? false);

  const date = new Date(data.date);
  const dayName = isToday ? 'Today' : date.toLocaleDateString('en-AU', { weekday: 'short' });
  const dateLabel = date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  const wind = data.wind;
  const rating = data.rating;
  const surfRange = formatSurfHeightRangeFromConditions(
    { height: data.wave.maxHeight, period: data.wave.maxPeriod },
    { height: data.swell.maxHeight, period: data.swell.maxPeriod }
  );

  return (
    <ForecastCard
      variant={isToday ? 'accent' : 'default'}
      style={styles.card}
      testID={testID}
    >
      <Pressable
        style={({ pressed }) => [styles.header, pressed && styles.headerPressed]}
        onPress={() => setExpanded((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <PlatformSymbol
          name={{ ios: 'chevron.right', android: 'chevron-right', web: 'chevron-right' }}
          size={10}
          weight="semibold"
          tintColor={palette.muted}
          style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }}
        />

        <View style={styles.headerBody}>
          <View style={styles.headerTop}>
            <View style={styles.dayBlock}>
              <ThemedText style={[styles.dayName, isToday && { color: palette.accent }]}>
                {dayName}
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.dateLabel}>
                {dateLabel}
              </ThemedText>
            </View>

            <ConditionBadge
              swellHeightM={data.swell.maxHeight}
              swellPeriodS={data.swell.maxPeriod}
              rating={rating}
              compact
            />
          </View>

          {!expanded ? (
            <ThemedText style={styles.collapsedSurf}>{surfRange}</ThemedText>
          ) : null}
        </View>
      </Pressable>

      {expanded ? (
        <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(100)}>
          <View style={[styles.details, { borderTopColor: palette.border }]}>
            <StatRow label="Est. surf" value={surfRange} />
            <StatRow
              label="Offshore swell"
              value={formatWaveHeightValueFeet(data.swell.maxHeight)}
              unit={WAVE_HEIGHT_UNIT}
            />
            <StatRow label="Swell period" value={data.swell.maxPeriod.toFixed(0)} unit="s" />
            <StatRow
              label="Swell direction"
              value={formatDirection(data.swell.dominantDirection)}
              unit={`${Math.round(data.swell.dominantDirection)}°`}
            />
            <StatRow
              label="Wave height"
              value={formatWaveHeightValueFeet(data.wave.maxHeight)}
              unit={WAVE_HEIGHT_UNIT}
            />
            <StatRow label="Wave period" value={data.wave.maxPeriod.toFixed(0)} unit="s" />
            {wind ? (
              <>
                <View style={styles.windRow}>
                  <ThemedText themeColor="textSecondary" style={styles.windLabel}>
                    Wind
                  </ThemedText>
                  <DirectionArrow
                    fromDegrees={wind.dominantDirection}
                    color="#EAB308"
                    size={24}
                    showLabel={false}
                  />
                </View>
                <StatRow
                  label="Wind direction"
                  value={formatDirection(wind.dominantDirection)}
                  unit={`${Math.round(wind.dominantDirection)}°`}
                />
                <StatRow
                  label="Wind speed"
                  value={Math.round(wind.maxSpeedKnots).toString()}
                  unit="kt"
                />
              </>
            ) : null}
          </View>
        </Animated.View>
      ) : null}
    </ForecastCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  headerPressed: {
    opacity: 0.75,
  },
  headerBody: {
    flex: 1,
    gap: 4,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayBlock: {
    flex: 1,
    minWidth: 64,
  },
  dayName: {
    ...ForecastTypography.bodyBold,
  },
  dateLabel: {
    ...ForecastTypography.caption,
    marginTop: 1,
  },
  collapsedSurf: {
    ...ForecastTypography.metric,
    fontVariant: ['tabular-nums'],
  },
  details: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  windRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  windLabel: {
    ...ForecastTypography.label,
  },
});
