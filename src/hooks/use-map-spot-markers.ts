/**
 * Map markers: always show curated spot positions; merge in conditions when loaded.
 */

import { useMemo } from 'react';

import type { SpotWithConditions } from '@/services/api';

import { useCuratedSpots } from './use-curated-spots';
import { useCuratedSpotConditions } from './use-curated-spot-conditions';

export function useMapSpotMarkers() {
  const {
    data: spots = [],
    isLoading: isSpotsLoading,
    isError: isSpotsError,
  } = useCuratedSpots();
  const {
    data: spotConditions = [],
    isLoading: isConditionsLoading,
    isError: isConditionsError,
    refetch: refetchConditions,
  } = useCuratedSpotConditions();

  const markers = useMemo((): SpotWithConditions[] => {
    if (spotConditions.length > 0) return spotConditions;

    return spots.map((spot) => ({ spot, conditions: null }));
  }, [spots, spotConditions]);

  return {
    markers,
    isLoading: isSpotsLoading,
    isConditionsLoading,
    hasConditions: spotConditions.length > 0,
    isError: isSpotsError && markers.length === 0,
    isConditionsError,
    refetchConditions,
  };
}
