/**
 * Selected map location — shared between Map tab and Home forecast
 */

import { create } from "zustand";

import type { CoordinatesParams } from "@/services/api";

interface SelectedLocationState {
  /** Manual pick from map; null = use device GPS on Home */
  manualCoords: CoordinatesParams | null;
  manualLabel: string | null;
  setManualLocation: (coords: CoordinatesParams, label?: string) => void;
  clearManualLocation: () => void;
}

export const useSelectedLocationStore = create<SelectedLocationState>(
  (set) => ({
    manualCoords: null,
    manualLabel: null,
    setManualLocation: (coords, label) =>
      set({ manualCoords: coords, manualLabel: label ?? null }),
    clearManualLocation: () => set({ manualCoords: null, manualLabel: null }),
  }),
);
