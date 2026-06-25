/**
 * DailyHourlyPreview — collapsed outlook: hourly colour strip + 5 anchor bars
 */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DirectionArrow } from '@/components/ui/direction-arrow';
import {
  ForecastColors,
  ForecastRadii,
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
  testID?: string;
}

const STRIP_HEIGHT = 5;
const BAR_MAX_HEIGHT = 22;
const WIND_ARROW_SIZE = 13;

export function DailyHourlyPreview({ hourly, anchors, testID }: DailyHourlyPreviewProps) {
  const scheme = useColorScheme();
  const palette = ForecastColors[scheme];

  if (hourly.length === 0) return null;

  const peakFt = maxSurfFt(hourly);

  return (
    <View
      style={[
        styles.wrap,
        getForecastInsetStyle(scheme),
        { borderColor: palette.borderStrong, backgroundColor: palette.surface },
      ]}
      testID={testID}
    >
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
        <View style={[styles.barsRow, { borderTopColor: palette.border }]}>
          {anchors.map((anchor) => {
            const barHeight = Math.max(3, (anchor.surfFt / peakFt) * BAR_MAX_HEIGHT);
            const windKts = Math.round(anchor.windSpeedKnots);
            const windDir = formatDirection(anchor.windDirection);

            return (
              <View
                key={anchor.anchorLabel}
                style={styles.barCol}
                accessibilityLabel={`${anchor.anchorLabel}, ${anchor.surfFt.toFixed(1)} feet surf, ${windDir} ${windKts} knot wind`}
              >
                <ThemedText themeColor="textSecondary" style={styles.microLabel}>
                  {anchor.anchorLabel.replace(' ', '')}
                </ThemedText>
                <View style={[styles.barTrack, { backgroundColor: palette.border }]}>
                  <View
                    style={[styles.barFill, { height: barHeight, backgroundColor: anchor.color }]}
                  />
                </View>
                <View style={styles.barValueRow}>
                  <ThemedText style={styles.barValue}>{anchor.surfFt.toFixed(1)}</ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.barUnit}>
                    ft
                  </ThemedText>
                </View>
                <View style={styles.windBlock}>
                  <DirectionArrow
                    fromDegrees={anchor.windDirection}
                    color="#EAB308"
                    size={WIND_ARROW_SIZE}
                    showLabel={false}
                  />
                  <ThemedText themeColor="textSecondary" style={styles.windDir}>
                    {windDir}
                  </ThemedText>
                  <View style={styles.windSpeedRow}>
                    <ThemedText style={styles.windSpeed}>{windKts}</ThemedText>
                    <ThemedText themeColor="textSecondary" style={styles.windUnit}>
                      kt
                    </ThemedText>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: 3,
    overflow: 'hidden',
    gap: 1,
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
    fontSize: 9,
    lineHeight: 11,
    letterSpacing: 0.2,
    fontVariant: ['tabular-nums'],
  },
  barsRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 5,
    paddingBottom: 4,
    paddingHorizontal: 2,
    gap: 0,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 1,
  },
  barTrack: {
    width: '80%',
    maxWidth: 22,
    height: BAR_MAX_HEIGHT,
    borderRadius: 3,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 3,
  },
  barValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  barValue: {
    ...ForecastTypography.caption,
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  barUnit: {
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '500',
  },
  windBlock: {
    alignItems: 'center',
    gap: 0,
    marginTop: 1,
  },
  windDir: {
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginTop: -1,
  },
  windSpeedRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 1,
  },
  windSpeed: {
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  windUnit: {
    fontSize: 7,
    lineHeight: 9,
    fontWeight: '500',
  },
});
