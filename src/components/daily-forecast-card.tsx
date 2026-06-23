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
import { ThemedText } from '@/components/themed-text';
import { ForecastColors } from '@/constants/forecast-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { DailySummary } from '@/services/api';
import { formatDirection, formatDirectionFull, getSurfRating } from '@/utils/forecast';
import { formatSurfHeightRange } from '@/utils/surf-height';
import { formatWaveHeightValueFeet, formatWindSpeedKnots, WAVE_HEIGHT_UNIT } from '@/utils/units';

interface DailyForecastCardProps {
  data: DailySummary;
  isToday?: boolean;
  testID?: string;
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailLine}>
      <ThemedText themeColor="textSecondary" style={styles.detailLabel}>
        {label}
      </ThemedText>
      <ThemedText style={styles.detailValue}>{value}</ThemedText>
    </View>
  );
}

function InlineDirection({
  degrees,
  color,
  caption,
}: {
  degrees: number;
  color: string;
  caption: string;
}) {
  return (
    <View style={styles.inlineDirection}>
      <DirectionArrow fromDegrees={degrees} color={color} size={24} showLabel={false} />
      <ThemedText style={styles.inlineDirectionText}>{caption}</ThemedText>
    </View>
  );
}

export function DailyForecastCard({ data, isToday, testID }: DailyForecastCardProps) {
  const scheme = useColorScheme();
  const palette = ForecastColors[scheme];
  const [expanded, setExpanded] = useState(isToday ?? false);

  const date = new Date(data.date);
  const dayName = isToday ? 'Today' : date.toLocaleDateString('en-AU', { weekday: 'short' });
  const dateLabel = date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  const rating = getSurfRating(data.swell.maxHeight, data.swell.maxPeriod);
  const surfRange = formatSurfHeightRange(data.swell.maxHeight, data.swell.maxPeriod);
  const swellPeriod = `${data.swell.maxPeriod.toFixed(0)} s`;
  const swellDirLabel = formatDirection(data.swell.dominantDirection);
  const wind = data.wind;

  return (
    <ForecastCard
      style={[
        styles.card,
        isToday && {
          borderColor: palette.accent,
          borderWidth: 2,
          backgroundColor: palette.accentSoft,
        },
      ]}
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
          size={11}
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

          <View style={styles.headerMetrics}>
            <View style={styles.metricBlock}>
              <ThemedText themeColor="textSecondary" style={styles.metricLabel}>
                Surf
              </ThemedText>
              <ThemedText style={styles.metricValue}>{surfRange}</ThemedText>
            </View>

            <View style={styles.metricBlock}>
              <ThemedText themeColor="textSecondary" style={styles.metricLabel}>
                Period
              </ThemedText>
              <ThemedText style={styles.metricValue}>{swellPeriod}</ThemedText>
            </View>

            <View style={styles.metricBlock}>
              <ThemedText themeColor="textSecondary" style={styles.metricLabel}>
                Swell
              </ThemedText>
              <InlineDirection
                degrees={data.swell.dominantDirection}
                color="#A855F7"
                caption={swellDirLabel}
              />
            </View>

            {wind ? (
              <View style={styles.metricBlock}>
                <ThemedText themeColor="textSecondary" style={styles.metricLabel}>
                  Wind
                </ThemedText>
                <InlineDirection
                  degrees={wind.dominantDirection}
                  color="#EAB308"
                  caption={`${formatDirection(wind.dominantDirection)} · ${formatWindSpeedKnots(wind.maxSpeedKnots)}`}
                />
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>

      {expanded ? (
        <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(100)}>
          <View style={[styles.details, { borderTopColor: palette.border }]}>
            <DetailLine label="Est. surf" value={surfRange} />
            <DetailLine
              label="Offshore swell"
              value={`${formatWaveHeightValueFeet(data.swell.maxHeight)} ${WAVE_HEIGHT_UNIT}`}
            />
            <DetailLine
              label="Combined wave max"
              value={`${formatWaveHeightValueFeet(data.wave.maxHeight)} ${WAVE_HEIGHT_UNIT}`}
            />
            <DetailLine label="Swell period" value={swellPeriod} />
            <DetailLine label="Wave period" value={`${data.wave.maxPeriod.toFixed(0)} s`} />
            <DetailLine
              label="Swell direction"
              value={formatDirectionFull(data.swell.dominantDirection)}
            />
            <DetailLine
              label="Wave direction"
              value={formatDirectionFull(data.wave.dominantDirection)}
            />
            {wind ? (
              <DetailLine
                label="Wind max"
                value={`${formatDirectionFull(wind.dominantDirection)} · ${formatWindSpeedKnots(wind.maxSpeedKnots)}`}
              />
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
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  headerPressed: {
    opacity: 0.75,
  },
  headerBody: {
    flex: 1,
    gap: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayBlock: {
    flex: 1,
    minWidth: 72,
  },
  dayName: {
    fontSize: 13,
    fontWeight: '600',
  },
  dateLabel: {
    fontSize: 11,
    marginTop: 1,
  },
  headerMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricBlock: {
    minWidth: 56,
    gap: 2,
  },
  metricLabel: {
    fontSize: 9,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  inlineDirection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  inlineDirectionText: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  details: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  detailLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    fontSize: 11,
  },
  detailValue: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
    flexShrink: 1,
  },
});
