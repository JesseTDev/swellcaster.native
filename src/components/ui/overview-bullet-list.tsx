/**
 * OverviewBulletList — check-mark highlights for forecast summaries
 */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PlatformSymbol } from '@/components/ui/platform-symbol';
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
          <PlatformSymbol
            name={{
              ios: 'checkmark.circle.fill',
              android: 'check-circle',
              web: 'check-circle',
            }}
            size={16}
            tintColor={palette.accent}
          />
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
    marginTop: 16,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  text: {
    ...ForecastTypography.body,
    flex: 1,
  },
});
