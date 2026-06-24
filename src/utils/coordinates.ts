/**
 * Format latitude/longitude for display
 */

/** Matches SwellCaster.API CuratedSpotConditionsService.CoordTolerance */
export const CURATED_SPOT_COORD_TOLERANCE = 0.02;

export function formatCoordinates(lat: number, lon: number): string {
  const latLabel = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`;
  const lonLabel = `${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? 'E' : 'W'}`;
  return `${latLabel}, ${lonLabel}`;
}

export function isWithinCoordTolerance(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
  tolerance = CURATED_SPOT_COORD_TOLERANCE
): boolean {
  return (
    Math.abs(a.lat - b.lat) < tolerance && Math.abs(a.lon - b.lon) < tolerance
  );
}

export function findCuratedSpotAtCoords<
  T extends { id: string; lat: number; lon: number; name: string },
>(coords: { lat: number; lon: number }, spots: T[]): T | null {
  return spots.find((spot) => isWithinCoordTolerance(coords, spot)) ?? null;
}
