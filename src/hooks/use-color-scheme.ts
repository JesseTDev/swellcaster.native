import { useColorScheme as useRNColorScheme } from 'react-native';

import { useThemeStore } from '@/stores/theme-store';

export function useColorScheme(): 'light' | 'dark' {
  const systemScheme = useRNColorScheme();
  const preference = useThemeStore((state) => state.preference);

  if (preference === 'light') return 'light';
  if (preference === 'dark') return 'dark';
  return systemScheme === 'dark' ? 'dark' : 'light';
}

export function useThemePreference() {
  return useThemeStore((state) => state.preference);
}
