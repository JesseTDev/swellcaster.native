/**
 * DailyHourlyDetail — expanded 24-hour breakdown for one outlook day
 */

import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ForecastColors, ForecastRadii, ForecastTypography } from '@/constants/forecast-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatWindBrief } from '@/utils/forecast';
import type { HourlySurfSnapshot } from '@/utils/daily-hourly-forecast';

interface DailyHourlyDetailProps {
  hourly: HourlySurfSnapshot[];
  testID?: string;
}

export function DailyHourlyDetail({ hourly, testID }: DailyHourlyDetailProps) {
  const scheme = useColorScheme();
  const palette = ForecastColors[scheme];

  if (hourly.length === 0) return null;

  return (
    <View style={styles.wrap} testID={testID}>
      <ThemedText themeColor="textSecondary" style={styles.title}>
        24-hour breakdown
      </ThemedText>
      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.list}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {hourly.map((slot) => (
          <View
            key={slot.timestamp}
            style={[styles.row, { borderBottomColor: palette.border }]}
          >
            <View style={[styles.ratingDot, { backgroundColor: slot.color }]} />
            <ThemedText style={styles.time}>{slot.hourLabel}</ThemedText>
            <ThemedText style={styles.surf}>{slot.surfFt.toFixed(1)} ft</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.wind}>
              {formatWindBrief(slot.windDirection, slot.windSpeedKnots)}
            </ThemedText>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    gap: 4,
  },
  title: {
    ...ForecastTypography.label,
    fontWeight: '700',
  },
  listScroll: {
    maxHeight: 168,
  },
  list: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  ratingDot: {
    width: 6,
    height: 6,
    borderRadius: ForecastRadii.chip,
  },
  time: {
    fontSize: 10,
    lineHeight: 13,
    width: 46,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  surf: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    width: 42,
    fontVariant: ['tabular-nums'],
  },
  wind: {
    fontSize: 10,
    lineHeight: 13,
    flex: 1,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});
