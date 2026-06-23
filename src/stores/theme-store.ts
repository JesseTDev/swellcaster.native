/**
 * Theme preference — system, light, or dark (persisted)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemePreference = 'system' | 'light' | 'dark';

const CYCLE_ORDER: ThemePreference[] = ['system', 'light', 'dark'];

interface ThemeState {
  preference: ThemePreference;
  cyclePreference: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      preference: 'system',
      cyclePreference: () => {
        const current = get().preference;
        const next = CYCLE_ORDER[(CYCLE_ORDER.indexOf(current) + 1) % CYCLE_ORDER.length];
        set({ preference: next });
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
