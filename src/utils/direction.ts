/**
 * Direction helpers — meteorological "from" degrees to compass arrow rotation
 *
 * 0° = north, 90° = east (clockwise). SVG arrow default points up (= north).
 */

export function directionToArrowRotation(fromDegrees: number): number {
  return ((fromDegrees % 360) + 360) % 360;
}

/** @deprecated Use directionToArrowRotation — swell/wind labels are "from" direction */
export function directionToTravelRotation(fromDegrees: number): number {
  return (fromDegrees + 180) % 360;
}
