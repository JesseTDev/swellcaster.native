/**
 * OutlookDayPicker — 7 / 14 / 16 day extended outlook selector
 */

import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  MAX_OUTLOOK_DAYS,
  OUTLOOK_DAY_OPTIONS,
  type OutlookDays,
} from '@/constants/outlook-days';
import { ForecastColors } from '@/constants/forecast-theme';
import { Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface OutlookDayPickerProps {
  value: OutlookDays;
  onChange: (days: OutlookDays) => void;
  testID?: string;
}

export function OutlookDayPicker({ value, onChange, testID }: OutlookDayPickerProps) {
  const scheme = useColorScheme();
  const palette = ForecastColors[scheme];

  return (
    <View style={styles.container} testID={testID}>
      <View style={[styles.segmented, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        {OUTLOOK_DAY_OPTIONS.map((days) => {
          const selected = value === days;
          return (
            <Pressable
              key={days}
              style={({ pressed }) => [
                styles.segment,
                selected && {
                  backgroundColor: palette.accentSoft,
                  borderColor: palette.accent,
                },
                pressed && styles.pressed,
              ]}
              onPress={() => onChange(days)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              testID={`${testID}-${days}`}
            >
              <ThemedText
                style={[
                  styles.segmentLabel,
                  { color: selected ? palette.accent : palette.muted },
                ]}
              >
                {days}d
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
      <ThemedText themeColor="textSecondary" style={styles.hint}>
        Max {MAX_OUTLOOK_DAYS} days from forecast model
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
    marginBottom: Spacing.two,
  },
  segmented: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 3,
    gap: 4,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
  hint: {
    fontSize: 11,
  },
});
