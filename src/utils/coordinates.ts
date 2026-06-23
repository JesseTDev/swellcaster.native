/**
 * Format latitude/longitude for display
 */

export function formatCoordinates(lat: number, lon: number): string {
  const latLabel = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`;
  const lonLabel = `${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? 'E' : 'W'}`;
  return `${latLabel}, ${lonLabel}`;
}
