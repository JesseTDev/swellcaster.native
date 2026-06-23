/**
 * Logo — minimal wordmark mark for Swell Caster
 */

import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { ForecastColors } from '@/constants/forecast-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface LogoProps {
  size?: number;
}

export function Logo({ size = 40 }: LogoProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? ForecastColors.dark : ForecastColors.light;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 48 48">
        <Defs>
          <LinearGradient id="swellGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={theme.accent} stopOpacity="1" />
            <Stop offset="100%" stopColor={theme.accent} stopOpacity="0.55" />
          </LinearGradient>
        </Defs>
        <Path
          d="M4 30 C12 22, 18 38, 26 28 S 40 22, 44 30"
          fill="none"
          stroke="url(#swellGradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <Path
          d="M4 38 C14 30, 20 42, 30 34 S 38 30, 44 38"
          fill="none"
          stroke={theme.accent}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.45"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
