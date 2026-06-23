import type { LocationGeocodedAddress } from 'expo-location';

import { formatCoordinates } from '@/utils/coordinates';

export interface PlaceInfo {
  name: string;
  region: string | null;
}

/**
 * Build a display name from reverse-geocode results.
 * Falls back to formatted coordinates when no place name is available.
 */
export function formatPlaceFromGeocode(
  results: LocationGeocodedAddress[],
  coords: { lat: number; lon: number }
): PlaceInfo {
  const place = results[0];
  if (!place) {
    return {
      name: formatCoordinates(coords.lat, coords.lon),
      region: null,
    };
  }

  const label = pickPlaceName(place) ?? formatCoordinates(coords.lat, coords.lon);

  const regionParts = [
    place.city && place.city !== label ? place.city : null,
    place.subregion && place.subregion !== label ? place.subregion : null,
    place.region && place.region !== label ? place.region : null,
    place.country,
  ].filter((part): part is string => Boolean(part));

  return {
    name: label,
    region: [...new Set(regionParts)].join(', ') || null,
  };
}

function pickPlaceName(place: LocationGeocodedAddress): string | null {
  const candidates = [
    place.name,
    place.street,
    place.district,
    place.subregion,
    place.city,
  ];

  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (trimmed) return trimmed;
  }

  return null;
}
