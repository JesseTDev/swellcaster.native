/**
 * MetricCell — single forecast metric in a grid
 */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

interface MetricCellProps {
  label: string;
  value: string;
  unit?: string;
  testID?: string;
}

export function MetricCell({ label, value, unit, testID }: MetricCellProps) {
  return (
    <View style={styles.cell} testID={testID}>
      <ThemedText themeColor="textSecondary" style={styles.label}>
        {label}
      </ThemedText>
      <View style={styles.valueRow}>
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
  cell: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 10,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  value: {
    fontSize: 20,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  unit: {
    fontSize: 13,
    fontWeight: '500',
  },
});
