/**
 * ThemeToggleButton — toggle light / dark in one tap
 */

import { PlatformSymbol, type PlatformSymbolName } from '@/components/ui/platform-symbol';
import { Pressable, StyleSheet } from 'react-native';

import { ForecastColors, getForecastCardStyle } from '@/constants/forecast-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeStore } from '@/stores/theme-store';

function iconForScheme(scheme: 'light' | 'dark'): PlatformSymbolName {
  return scheme === 'dark'
    ? {
        ios: 'moon.fill',
        android: 'dark-mode',
        web: 'dark-mode',
      }
    : {
        ios: 'sun.max.fill',
        android: 'light-mode',
        web: 'light-mode',
      };
}

export function ThemeToggleButton() {
  const scheme = useColorScheme();
  const cyclePreference = useThemeStore((state) => state.cyclePreference);
  const palette = scheme === 'dark' ? ForecastColors.dark : ForecastColors.light;
  const nextScheme = scheme === 'dark' ? 'light' : 'dark';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        getForecastCardStyle(scheme),
        pressed && styles.pressed,
      ]}
      onPress={cyclePreference}
      accessibilityRole="button"
      accessibilityLabel={`Theme: ${scheme}. Tap for ${nextScheme}.`}
      hitSlop={8}
    >
      <PlatformSymbol
        name={iconForScheme(scheme)}
        size={18}
        weight="medium"
        tintColor={palette.accent}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
