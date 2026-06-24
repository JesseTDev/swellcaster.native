/**
 * ThemeToggleButton — cycle System → Light → Dark
 */

import { PlatformSymbol, type PlatformSymbolName } from '@/components/ui/platform-symbol';
import { Pressable, StyleSheet } from 'react-native';

import { ForecastColors, getForecastCardStyle } from '@/constants/forecast-theme';
import { useColorScheme, useThemePreference } from '@/hooks/use-color-scheme';
import { useThemeStore, themePreferenceLabel, type ThemePreference } from '@/stores/theme-store';

function iconForPreference(preference: ThemePreference): PlatformSymbolName {
  switch (preference) {
    case 'system':
      return {
        ios: 'circle.lefthalf.filled',
        android: 'brightness-auto',
        web: 'brightness-auto',
      };
    case 'light':
      return {
        ios: 'sun.max.fill',
        android: 'light-mode',
        web: 'light-mode',
      };
    case 'dark':
      return {
        ios: 'moon.fill',
        android: 'dark-mode',
        web: 'dark-mode',
      };
  }
}

export function ThemeToggleButton() {
  const preference = useThemePreference();
  const scheme = useColorScheme();
  const cyclePreference = useThemeStore((state) => state.cyclePreference);
  const palette = scheme === 'dark' ? ForecastColors.dark : ForecastColors.light;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        getForecastCardStyle(scheme),
        pressed && styles.pressed,
      ]}
      onPress={cyclePreference}
      accessibilityRole="button"
      accessibilityLabel={`Theme: ${themePreferenceLabel(preference)}. Tap to change.`}
      hitSlop={8}
    >
      <PlatformSymbol
        name={iconForPreference(preference)}
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
