/**
 * Theme preference — system, light, or dark (persisted)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, type ColorSchemeName } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeState {
  preference: ThemePreference;
  /** Flip the active light/dark appearance in one tap. */
  cyclePreference: () => void;
}

export function resolveColorScheme(
  preference: ThemePreference,
  systemScheme: ColorSchemeName | null | undefined
): 'light' | 'dark' {
  if (preference === 'light') return 'light';
  if (preference === 'dark') return 'dark';
  return systemScheme === 'dark' ? 'dark' : 'light';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      preference: 'system',
      cyclePreference: () => {
        const { preference } = get();
        const resolved = resolveColorScheme(preference, Appearance.getColorScheme());
        set({ preference: resolved === 'dark' ? 'light' : 'dark' });
      },
    }),
    {
      name: 'swell-caster-theme',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function themePreferenceLabel(preference: ThemePreference): string {
  switch (preference) {
    case 'system':
      return 'System';
    case 'light':
      return 'Light';
    case 'dark':
      return 'Dark';
  }
}
