/**
 * Location search — all place lookups go through SwellCaster.API
 */

import type { CoordinatesParams, PlaceSearchResultDto } from '@/services/api';
import { swellApi } from '@/services/api';

export type LocationSearchSource = PlaceSearchResultDto['source'] | 'recent';

export interface LocationSearchResult {
  id: string;
  label: string;
  subtitle?: string;
  coords: CoordinatesParams;
  source: LocationSearchSource;
}

export class LocationSearchError extends Error {
  constructor(
    message: string,
    readonly code: 'search_failed' = 'search_failed'
  ) {
    super(message);
    this.name = 'LocationSearchError';
  }
}

export const SEARCH_EXAMPLES = [
  'Bondi Beach',
  'Uluwatu',
  'Byron Bay',
  'Pipeline',
  'Narrabeen',
  'Jeffreys Bay',
] as const;

const MIN_SEARCH_LENGTH = 2;
const MAX_RESULTS = 8;

function toLocationResult(place: PlaceSearchResultDto): LocationSearchResult {
  return {
    id: place.id,
    label: place.label,
    subtitle: place.subtitle,
    coords: { lat: place.lat, lon: place.lon },
    source: place.source,
  };
}

export async function searchPlaces(
  query: string,
  limit = MAX_RESULTS
): Promise<LocationSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < MIN_SEARCH_LENGTH) return [];

  try {
    const results = await swellApi.searchPlaces({ q: trimmed, limit });
    return results.map(toLocationResult);
  } catch (error) {
    throw new LocationSearchError(
      error instanceof Error ? error.message : 'Place search failed. Is the API running?'
    );
  }
}
