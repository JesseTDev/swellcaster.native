import { useColorScheme as useRNColorScheme } from 'react-native';

import { resolveColorScheme, useThemeStore } from '@/stores/theme-store';

export function useColorScheme(): 'light' | 'dark' {
  const systemScheme = useRNColorScheme();
  const preference = useThemeStore((state) => state.preference);

  return resolveColorScheme(preference, systemScheme);
}

export function useThemePreference() {
  return useThemeStore((state) => state.preference);
}
