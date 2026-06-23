/**
 * ForecastCard — elevated surface for forecast sections
 */

import { StyleSheet, View, type ViewProps } from 'react-native';

import { ForecastColors } from '@/constants/forecast-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ForecastCardProps extends ViewProps {
  children: React.ReactNode;
  padded?: boolean;
}

export function ForecastCard({ children, style, padded = true, ...props }: ForecastCardProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? ForecastColors.dark : ForecastColors.light;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surfaceElevated,
          borderColor: theme.border,
        },
        padded && styles.padded,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  padded: {
    padding: 16,
  },
});
