/**
 * OverviewBulletList — compact bullet lines for forecast summaries
 */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ForecastColors, ForecastTypography } from '@/constants/forecast-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface OverviewBulletListProps {
  items: string[];
  testID?: string;
}

export function OverviewBulletList({ items, testID }: OverviewBulletListProps) {
  const scheme = useColorScheme();
  const palette = ForecastColors[scheme];

  if (items.length === 0) return null;

  return (
    <View style={styles.list} testID={testID}>
      {items.map((item) => (
        <View key={item} style={styles.row}>
          <View style={[styles.bullet, { backgroundColor: palette.accent }]} />
          <ThemedText themeColor="textSecondary" style={styles.text}>
            {item}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    marginTop: 12,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 999,
    marginTop: 7,
  },
  text: {
    ...ForecastTypography.caption,
    flex: 1,
    lineHeight: 18,
  },
});
