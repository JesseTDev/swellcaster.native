/**
 * ForecastCard — elevated surface for forecast sections
 */

import { StyleSheet, View, type ViewProps } from 'react-native';

import {
  type ForecastCardVariant,
  getForecastCardStyle,
} from '@/constants/forecast-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ForecastCardProps extends ViewProps {
  children: React.ReactNode;
  padded?: boolean;
  variant?: ForecastCardVariant;
}

export function ForecastCard({
  children,
  style,
  padded = true,
  variant = 'default',
  ...props
}: ForecastCardProps) {
  const scheme = useColorScheme();

  return (
    <View
      style={[
        getForecastCardStyle(scheme, variant),
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
  padded: {
    padding: 14,
  },
});
