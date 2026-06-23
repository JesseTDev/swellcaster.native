/**
 * Recent location searches — persisted for quick re-selection
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { CoordinatesParams } from '@/services/api';
import type { LocationSearchResult } from '@/utils/location-search';

const MAX_RECENT = 8;

export interface RecentLocationSearch {
  id: string;
  label: string;
  subtitle?: string;
  coords: CoordinatesParams;
  searchedAt: number;
}

interface RecentLocationSearchState {
  recent: RecentLocationSearch[];
  addRecent: (result: LocationSearchResult) => void;
  removeRecent: (id: string) => void;
  clearRecent: () => void;
}

function buildRecentEntry(result: LocationSearchResult): RecentLocationSearch {
  return {
    id: `recent-${result.coords.lat.toFixed(4)}-${result.coords.lon.toFixed(4)}`,
    label: result.label,
    subtitle: result.subtitle,
    coords: result.coords,
    searchedAt: Date.now(),
  };
}

export const useRecentLocationSearchStore = create<RecentLocationSearchState>()(
  persist(
    (set, get) => ({
      recent: [],
      addRecent: (result) => {
        const entry = buildRecentEntry(result);
        const withoutDuplicate = get().recent.filter((item) => item.id !== entry.id);
        set({
          recent: [entry, ...withoutDuplicate].slice(0, MAX_RECENT),
        });
      },
      removeRecent: (id) =>
        set({
          recent: get().recent.filter((item) => item.id !== id),
        }),
      clearRecent: () => set({ recent: [] }),
    }),
    {
      name: 'swell-caster-recent-locations',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
