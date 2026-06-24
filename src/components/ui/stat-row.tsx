/**
 * StatRow — single metric line (label + value + optional unit)
 */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ForecastTypography } from '@/constants/forecast-theme';

interface StatRowProps {
  label: string;
  value: string;
  unit?: string;
  testID?: string;
}

export function StatRow({ label, value, unit, testID }: StatRowProps) {
  return (
    <View style={styles.row} testID={testID}>
      <ThemedText themeColor="textSecondary" style={styles.label}>
        {label}
      </ThemedText>
      <View style={styles.valueGroup}>
        <ThemedText style={styles.value}>{value}</ThemedText>
        {unit ? (
          <ThemedText themeColor="textSecondary" style={styles.unit}>
            {unit}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 6,
  },
  label: {
    ...ForecastTypography.label,
    flex: 1,
  },
  valueGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    flexShrink: 1,
  },
  value: {
    ...ForecastTypography.bodyBold,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },
  unit: {
    ...ForecastTypography.caption,
    fontWeight: '500',
  },
});
