/**
 * DailyHourlyPreview — collapsed outlook: hourly colour strip + 5 anchor bars
 */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ForecastCard } from '@/components/ui/forecast-card';
import {
  ForecastColors,
  ForecastRadii,
  ForecastSpacing,
  ForecastTypography,
  getForecastInsetStyle,
} from '@/constants/forecast-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { AnchorSurfSnapshot, HourlySurfSnapshot } from '@/utils/daily-hourly-forecast';
import { maxSurfFt } from '@/utils/daily-hourly-forecast';
import { formatDirection } from '@/utils/forecast';

interface DailyHourlyPreviewProps {
  hourly: HourlySurfSnapshot[];
  anchors: AnchorSurfSnapshot[];
  /** Card wrapper for home screen; inset for nested daily rows */
  presentation?: 'card' | 'inset';
  testID?: string;
}

const STRIP_HEIGHT = 8;
const BAR_MAX_HEIGHT = 48;
const BAR_WIDTH = 6;

export function DailyHourlyPreview({
  hourly,
  anchors,
  presentation = 'inset',
  testID,
}: DailyHourlyPreviewProps) {
  const scheme = useColorScheme();
  const palette = ForecastColors[scheme];

  if (hourly.length === 0) return null;

  const peakFt = maxSurfFt(hourly);

  const content = (
    <>
      {presentation === 'card' ? (
        <View style={styles.cardHeader}>
          <ThemedText themeColor="textSecondary" style={styles.sectionTitle}>
            Hourly quality
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.dateLabel}>
            {hourly[0]?.hourLabel ?? 'Today'}
          </ThemedText>
        </View>
      ) : null}

      <View style={styles.stripBlock}>
        <View style={styles.strip} accessibilityLabel="Hourly surf quality through the day">
          {hourly.map((slot) => (
            <View
              key={slot.timestamp}
              style={[styles.stripSegment, { backgroundColor: slot.color }]}
            />
          ))}
        </View>
        <View style={styles.stripTimes}>
          <ThemedText themeColor="textSecondary" style={styles.microLabel}>
            {hourly[0]?.hourLabel}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.microLabel}>
            Mid
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.microLabel}>
            {hourly[hourly.length - 1]?.hourLabel}
          </ThemedText>
        </View>
      </View>

      {anchors.length > 0 ? (
        <View
          style={[
            styles.barsRow,
            presentation === 'card' && styles.barsRowCard,
            { borderTopColor: palette.outlineVariant },
          ]}
        >
          {anchors.map((anchor) => {
            const barHeight = Math.max(4, (anchor.surfFt / peakFt) * BAR_MAX_HEIGHT);
            const windKts = Math.round(anchor.windSpeedKnots);
            const windDir = formatDirection(anchor.windDirection);

            return (
              <View
                key={anchor.anchorLabel}
                style={styles.barCol}
                accessibilityLabel={`${anchor.anchorLabel}, ${anchor.surfFt.toFixed(1)} feet surf, ${windDir} ${windKts} knot wind`}
              >
                <View style={[styles.barTrack, { backgroundColor: `${palette.accent}33` }]}>
                  <View
                    style={[
                      styles.barFill,
                      { height: barHeight, backgroundColor: palette.accent },
                    ]}
                  />
                </View>
                <ThemedText themeColor="textSecondary" style={styles.microLabel}>
                  {anchor.anchorLabel.replace(' ', '')}
                </ThemedText>
              </View>
            );
          })}
        </View>
      ) : null}
    </>
  );

  if (presentation === 'card') {
    return (
      <ForecastCard style={styles.cardWrap} testID={testID}>
        {content}
      </ForecastCard>
    );
  }

  return (
    <View
      style={[
        styles.wrap,
        getForecastInsetStyle(scheme),
        { borderColor: palette.borderStrong, backgroundColor: palette.surfaceContainer },
      ]}
      testID={testID}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    marginBottom: ForecastSpacing.gutter,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...ForecastTypography.sectionTitle,
  },
  dateLabel: {
    ...ForecastTypography.metric,
  },
  wrap: {
    marginTop: 6,
    borderRadius: ForecastRadii.inner,
    overflow: 'hidden',
  },
  stripBlock: {
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 4,
    gap: 3,
  },
  strip: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: STRIP_HEIGHT,
    borderRadius: ForecastRadii.chip,
    overflow: 'hidden',
    gap: 0,
  },
  stripSegment: {
    flex: 1,
    minWidth: 2,
    borderRadius: 1,
  },
  stripTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  microLabel: {
    ...ForecastTypography.microData,
    opacity: 0.6,
  },
  barsRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 16,
    paddingBottom: 4,
    paddingHorizontal: 2,
    gap: 0,
  },
  barsRowCard: {
    borderTopWidth: 0,
    paddingTop: 8,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 1,
  },
  barTrack: {
    width: BAR_WIDTH,
    height: BAR_MAX_HEIGHT,
    borderRadius: ForecastRadii.chip,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: ForecastRadii.chip,
  },
});
